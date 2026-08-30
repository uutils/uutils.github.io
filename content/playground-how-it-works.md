+++
title = "Playground: How It Works"
template = "page.html"
+++

<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>

The [uutils playground](/playground) lets you run real Rust coreutils directly in your browser, with no server and no installation. This page explains the architecture behind it.

## High-Level Overview

<pre class="mermaid">
flowchart LR
    A["Browser"] -->|"1. Load page"| B["Zola static site"]
    B -->|"2. Fetch core binary"| C["uutils.wasm<br/>(coreutils multicall)"]
    A -->|"3. User types command"| D["JavaScript shell"]
    D -->|"4a. On-demand fetch<br/>(grep, find, diff, sed…)"| F["Standalone<br/>WASM modules"]
    D -->|"4b. Execute via WASI"| E["WebAssembly runtime"]
    F --> E
    E -->|"5. Output"| A
</pre>

Everything runs **client-side**. The page loads only the **coreutils multicall binary** up front; the optional standalone modules (`grep`, `find`/`locate`/`updatedb`, `diff`/`cmp`, `sed`) are fetched **on demand** the first time you use them — either by clicking their "Load" button or simply by running the command. Once a module is downloaded, it works entirely offline.

## Architecture

<pre class="mermaid">
flowchart TB
    subgraph Browser
        direction TB
        UI["xterm.js terminal emulator"]
        Shell["JavaScript shell layer<br/>(parseCommandLine, builtins)"]
        WASI["WASI shim<br/>(@bjorn3/browser_wasi_shim)"]
        WASM["uutils coreutils<br/>compiled to WebAssembly"]
        VFS["Virtual filesystem<br/>(in-memory)"]

        UI -->|"user input"| Shell
        Shell -->|"argv + stdin"| WASI
        WASI -->|"WASI syscalls"| WASM
        WASM -->|"fd_write stdout/stderr"| WASI
        WASI -->|"output text"| UI
        WASM <-->|"fd_read / fd_write"| VFS
        Shell <-->|"builtins: cd, help, clear, locale"| UI
    end
</pre>

### Components

| Component | Role |
|-----------|------|
| **[xterm.js](https://xtermjs.org/)** | Terminal emulator rendered in the browser. Handles cursor, colors, input, scrollback. |
| **JavaScript shell** | Parses command lines, manages pipes, handles builtins (`help`, `clear`, `cd`, `locale`), and dispatches to WASM. |
| **[browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim)** | Implements the WASI (WebAssembly System Interface) in JavaScript so that uutils can perform I/O operations. |
| **uutils.wasm** | The Rust coreutils, compiled with the `feat_wasm` feature to a single multicall WASM binary containing 60+ commands. This is the only binary loaded eagerly at page load. |
| **Standalone modules** | Separate uutils projects shipped as their own WASM binaries, **loaded on demand**: `grep.wasm` ([uutils/grep](https://github.com/uutils/grep)), `find.wasm`/`locate.wasm`/`updatedb.wasm` ([uutils/findutils](https://github.com/uutils/findutils)), `diffutils.wasm` providing `diff`/`cmp` ([uutils/diffutils](https://github.com/uutils/diffutils)), and `sed.wasm` ([uutils/sed](https://github.com/uutils/sed)). |
| **Virtual filesystem** | An in-memory filesystem backed by WASI shim `PreopenDirectory`, pre-populated with sample files. Persists across commands within a session. |

## Lifecycle of a Command

Here's what happens when you type `sort fruits.txt | uniq -c | sort -rn` and press Enter:

<pre class="mermaid">
sequenceDiagram
    participant User
    participant Terminal as xterm.js
    participant Shell as JS Shell
    participant WASI as WASI Shim
    participant WASM as uutils.wasm
    participant VFS as Virtual FS

    User->>Terminal: types "sort fruits.txt | uniq -c | sort -rn" + Enter
    Terminal->>Shell: raw input string

    Note over Shell: parseCommandLine() splits<br/>into 3 pipeline stages

    Shell->>WASI: argv=["coreutils","sort","fruits.txt"], stdin=""
    WASI->>WASM: instantiate + start()
    WASM->>VFS: fd_read("fruits.txt")
    VFS-->>WASM: file contents
    WASM->>WASI: fd_write(stdout, sorted data)
    WASI-->>Shell: stdout captured

    Shell->>WASI: argv=["coreutils","uniq","-c"], stdin=sorted data
    WASI->>WASM: instantiate + start()
    WASM->>WASI: fd_write(stdout, counted data)
    WASI-->>Shell: stdout captured

    Shell->>WASI: argv=["coreutils","sort","-rn"], stdin=counted data
    WASI->>WASM: instantiate + start()
    WASM->>WASI: fd_write(stdout, final result)
    WASI-->>Shell: stdout captured

    Shell->>Terminal: display final output
    Terminal->>User: rendered result
</pre>

Key details:

- **Pipeline execution**: each pipe stage is a fresh WASM instantiation. The stdout of one stage becomes the stdin of the next.
- **Command dispatch**: coreutils commands go through `["coreutils", command, ...args]` - the core WASM binary is a multicall binary, similar to BusyBox. Standalone modules (`grep`, `find`, `diff`, `sed`…) are invoked **directly by their own name** as `argv[0]`, since each is its own binary rather than a multicall entry.
- **On-demand loading**: if a command lives in a standalone module that hasn't been fetched yet, the shell loads that module first (printing a `loading <module>… done` notice), then runs the command.
- **Path resolution**: relative paths are resolved against a virtual `cwd` maintained by the JS shell.

## WASM Loading & Initialization

The playground splits its WASM into one eagerly-loaded core binary and several optional modules fetched lazily, keeping the initial page download small.

<pre class="mermaid">
flowchart TB
    A["Page load"] --> B{"SharedArrayBuffer<br/>available?"}
    B -->|No| C["Install polyfill stub"]
    B -->|Yes| D["Continue"]
    C --> D
    D --> E["Load xterm.js + fit addon<br/>(from CDN with SRI)"]
    E --> F["Render terminal + banner"]
    F --> G["Parallel fetch"]
    G --> H["browser_wasi_shim<br/>(dynamic import)"]
    G --> I["uutils.wasm<br/>(compileStreaming)"]
    H --> J["Ready"]
    I --> J
    J --> K{"?cmd= parameter?"}
    K -->|Yes| L["Auto-run commands"]
    K -->|No| M["Show prompt"]
</pre>

- Only the **coreutils multicall binary** loads eagerly. The standalone modules (`grep`, `find`/`locate`/`updatedb`, `diffutils`, `sed`) are **not** part of this startup fetch.
- WASM binaries are compiled with `WebAssembly.compileStreaming()` for best performance, with a fallback to `arrayBuffer()` if the server doesn't set the `application/wasm` content-type.
- Commands are disabled until the core binary finishes loading. The terminal shows a loading message and a prompt appears once it's ready.
- The `SharedArrayBuffer` polyfill stub prevents `ReferenceError` in browsers without cross-origin isolation headers.

### On-Demand Loading of Standalone Modules

<pre class="mermaid">
flowchart TB
    A["User runs grep/find/diff/sed<br/>(or clicks its Load button)"] --> B{"Module already<br/>compiled?"}
    B -->|Yes| F["Run command"]
    B -->|No| C{"Fetch in flight?"}
    C -->|Yes| D["Share the existing<br/>in-flight fetch"]
    C -->|No| E["fetch + compileStreaming<br/>/wasm/&lt;module&gt;.wasm"]
    D --> G["Dispatch<br/>uutils:program-loaded"]
    E --> G
    G --> F
</pre>

- Each module is fetched **once**, the first time it's needed. Concurrent callers share a single in-flight fetch, and the compiled module is cached for the rest of the session.
- A single module can back several commands: `diffutils.wasm` provides both `diff` and `cmp`, and the **"Load" button for `find`** brings in `find`, `locate` and `updatedb` together.
- On success the page dispatches a `uutils:program-loaded` event, which the "Load" buttons listen for so their label flips to `✓ <name> loaded` — whether the module was loaded by the button or by running the command.
- If a module's binary isn't present (e.g. local dev without a CI build), the command reports that it's unavailable instead of breaking the terminal.

## Command Parsing & Pipes

The shell implements a simple but functional parser:

<pre class="mermaid">
flowchart LR
    Input["sort fruits.txt | uniq -c"] --> Tokenizer
    Tokenizer --> |"handles quotes, escapes,<br/>pipes, redirections"| Pipeline

    subgraph Pipeline
        direction LR
        S1["Stage 1<br/>['sort', 'fruits.txt']"]
        S2["Stage 2<br/>['uniq', '-c']"]
        S1 --> |stdout → stdin| S2
    end
</pre>

Supported shell features:
- **Pipes** (`|`) - chain commands together
- **Redirections** (`>`, `>>`, `<`) - write output to files, append, or read input from files
- **Single quotes** (`'...'`) - literal strings, no escaping
- **Double quotes** (`"..."`) - literal strings with backslash escaping
- **Backslash escaping** (`\|`, `\ `) - escape special characters
- **Tab completion** - commands and filenames
- **Keyboard shortcuts** - Ctrl+C (cancel), Ctrl+L (clear), Ctrl+U (clear line), arrows (history/cursor)

**Not** supported (by design, to keep it simple): variables (`$VAR`), subshells, `&&`/`||`, globbing.

### Shell vs. Coreutils: Who Does What?

It's important to understand that **coreutils only provides individual commands** like `sort`, `cat`, `ls`, etc. Features like `if`/`then`/`else`, `while` loops, `for` loops, variable expansion (`$VAR`), and globbing (`*.txt`) are all **shell features** - they are provided by a shell such as Bash or Zsh, not by coreutils.

Since the playground implements only a minimal shell (pipes, redirections, quoting, and a few builtins), these shell constructs are not available. This isn't a limitation of uutils itself - it's simply because the playground's JavaScript shell is intentionally lightweight and doesn't include a full shell language interpreter.

## The Rust Side: Building Coreutils for WebAssembly

### Compilation Target

The uutils coreutils are compiled to **`wasm32-wasip1`** (WebAssembly System Interface Preview 1) using the standard Rust toolchain:

```bash
cargo build --target wasm32-wasip1 --features feat_wasm
```

This produces a single `uutils.wasm` binary - a **multicall binary** similar to BusyBox, where all 60+ utilities are bundled into one executable.

### The `feat_wasm` Feature Gate

Not every coreutil can run in a WASM sandbox. The [`feat_wasm` feature](https://github.com/uutils/coreutils/blob/main/Cargo.toml) in `Cargo.toml` defines the curated set of utilities that are compatible with WASI:

<pre class="mermaid">
flowchart LR
    subgraph "feat_wasm (included)"
        direction LR
        A["Text: cat, head, tail,<br/>sort, uniq, cut, tr, wc, fmt"]
        B["Files: cp, mv, rm, mkdir,<br/>touch, link, ln, ls"]
        C["Math: seq, factor, shuf,<br/>numfmt, expr"]
        D["Checksum: md5sum, sha*sum,<br/>b2sum, cksum"]
        E["Encoding: base32, base64,<br/>basenc"]
        F["Other: date, uname, arch,<br/>nproc, sleep, echo, printf"]
    end

    subgraph "Excluded from WASM"
        direction LR
        X["dd, df, du, env, mktemp,<br/>more, tac, test, stty,<br/>chcon, runcon, chown, kill..."]
    end
</pre>

Utilities are excluded when they depend on OS-level syscalls not available in WASI - for example, `df` needs filesystem stats, `du` needs directory traversal with metadata, and `chown`/`chcon` need permission and SELinux APIs.

> **Note:** `grep`, `find`/`locate`/`updatedb`, `diff`/`cmp` and `sed` are **not** part of the coreutils `feat_wasm` set — they live in separate uutils projects ([grep](https://github.com/uutils/grep), [findutils](https://github.com/uutils/findutils), [diffutils](https://github.com/uutils/diffutils), [sed](https://github.com/uutils/sed)) and are compiled to their own WASM modules, loaded on demand as described above. (`xargs` is intentionally absent: it must spawn child processes, which the browser WASI sandbox can't do.)

### Multicall Binary: How Command Dispatch Works

<pre class="mermaid">
flowchart TB
    A["WASI runtime calls _start()"] --> B["main() in coreutils.rs"]
    B --> C["Read argv[0] = 'coreutils'"]
    C --> D["Read argv[1] = utility name<br/>e.g. 'sort'"]
    D --> E["Look up in util_map()"]
    E --> F["Call sort::uumain(args)"]
    F --> G["Return exit code"]
</pre>

At **build time**, `build.rs` scans all enabled Cargo features and generates a `uutils_map.rs` file containing a [PHF](https://crates.io/crates/phf) (perfect hash function) map:

```rust
// Auto-generated at build time
type UtilityMap<T> = phf::OrderedMap<
    &'static str,
    (fn(T) -> i32, fn() -> Command)
>;
```

Each entry maps a utility name (e.g. `"sort"`) to a pair of functions:
- **`uumain`** - the utility's entry point, taking argument iterators and returning an exit code
- **`uu_app`** - returns the `clap::Command` definition for argument parsing and help

At **runtime**, the multicall binary reads `argv` to determine which utility to invoke. In the browser, the JavaScript shell calls the WASM binary as `["coreutils", "sort", "-rn"]`, so `argv[1]` becomes the dispatch key.

### WASI Platform Adaptations

Individual utilities use conditional compilation to handle WASI's limitations:

```rust
// In cp: symlinks are not supported on WASI
#[cfg(target_os = "wasi")]
return Err(Error::Unsupported);

// In tail: no inotify/kqueue file watching
#[cfg(target_os = "wasi")]
fn follow() { /* no-op stub */ }

// In ls: hostname crate excluded for WASI
#[cfg(not(target_os = "wasi"))]
use hostname::get;
```

These stubs mean the utilities gracefully degrade rather than crash - `tail -f` simply won't follow, `cp` won't create symlinks, and `ls` won't show hostname information.

### Localization: Embedding All Translations

A key difference for the WASM build is how locale files are handled:

<pre class="mermaid">
flowchart TB
    subgraph "Normal build (Linux, macOS...)"
        N1["build.rs detects user's LANG"]
        N1 --> N2["Embed only matching .ftl file<br/>+ English fallback"]
    end

    subgraph "WASI build"
        W1["build.rs detects target_os = wasi"]
        W1 --> W2["Embed ALL .ftl locale files<br/>(30+ languages)"]
        W2 --> W3["Runtime locale switching<br/>via LANG env variable"]
    end
</pre>

On native platforms, `uucore`'s build script embeds only the [Fluent](https://projectfluent.org/) (`.ftl`) translation files matching the user's `LANG` environment variable, to keep the binary small. For WASI builds, **all locale files are embedded**, because the target locale isn't known at compile time - the playground user can switch languages at runtime via the locale dropdown or the `locale` command.

