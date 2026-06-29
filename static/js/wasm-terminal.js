/**
 * WASM Terminal Playground for uutils coreutils.
 *
 * Lazy-loads xterm.js and @bjorn3/browser_wasi_shim, then provides an
 * interactive terminal where visitors can run uutils commands in the browser.
 */

// The WASI shim checks `instanceof SharedArrayBuffer` in random_get.
// Without cross-origin isolation headers, SharedArrayBuffer is undefined
// in most browsers. Define a stub so the instanceof check returns false
// instead of throwing a ReferenceError.
if (typeof SharedArrayBuffer === "undefined") {
  globalThis.SharedArrayBuffer = /** @type {any} */ (function () {});
}

const WASM_URL = "/wasm/uutils.wasm";
// Some utilities ship as their own standalone WASM modules rather than as part
// of the coreutils multicall binary (grep lives in uutils/grep, find/locate/
// updatedb in uutils/findutils, diff and cmp in uutils/diffutils, sed in
// uutils/sed). Each module is loaded on demand and is optional — see
// loadStandalone. A single module can provide several commands (diffutils →
// diff, cmp), which the binary dispatches on argv[0], so each command is invoked
// directly by its own name. findutils ships separate binaries, so each is its
// own module. (xargs is intentionally absent: it must spawn child processes,
// which the browser WASI sandbox can't do.)
const STANDALONE_MODULES = {
  grep: { url: "/wasm/grep.wasm", commands: ["grep"] },
  find: { url: "/wasm/find.wasm", commands: ["find"] },
  locate: { url: "/wasm/locate.wasm", commands: ["locate"] },
  updatedb: { url: "/wasm/updatedb.wasm", commands: ["updatedb"] },
  diffutils: { url: "/wasm/diffutils.wasm", commands: ["diff", "cmp"] },
  sed: { url: "/wasm/sed.wasm", commands: ["sed"] },
};
// "Load" buttons present standalone modules under one label. findutils ships
// find, locate and updatedb as separate binaries but loads them together as a
// single "find" entry, so one click brings up all of findutils.
const STANDALONE_GROUPS = {
  grep: ["grep"],
  find: ["find", "locate", "updatedb"],
  diffutils: ["diffutils"],
  sed: ["sed"],
};
// Shared locate database path inside the virtual FS (see the updatedb/locate
// handling in executeCommandLine).
const LOCATE_DB = "locatedb";
// Map each command to the module that provides it (e.g. diff -> "diffutils").
const STANDALONE_COMMAND_MODULE = Object.fromEntries(
  Object.entries(STANDALONE_MODULES).flatMap(
    ([mod, def]) => def.commands.map(cmd => [cmd, mod])
  )
);
const XTERM_CSS = "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css";
const XTERM_CSS_INTEGRITY = "sha384-tStR1zLfWgsiXCF3IgfB3lBa8KmBe/lG287CL9WCeKgQYcp1bjb4/+mwN6oti4Co";
const XTERM_JS = "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.min.js";
const XTERM_JS_INTEGRITY = "sha384-J4qzUjBl1FxyLsl/kQPQIOeINsmp17OHYXDOMpMxlKX53ZfYsL+aWHpgArvOuof9";
const XTERM_FIT_JS = "https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.11.0/lib/addon-fit.min.js";
const XTERM_FIT_JS_INTEGRITY = "sha384-UwMkGaBqfOcrTjPjXdAPWrGQkhpxTJ21vKtTwLb6wBpBM8HQXKAiUuwVJfgY0Yw6";
// NOTE: dynamic import() does not support SRI integrity checks.
// Pin the exact version to reduce supply-chain risk.
const WASI_SHIM_URL = "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.4.0/+esm";

// Sample files for the virtual filesystem
const SAMPLE_FILES = {
  "names.txt": "Alice\nBob\nCharlie\nDiana\nEve\nFrank\nGrace\nHeidi\n",
  "numbers.txt": "42\n7\n13\n99\n1\n56\n23\n8\n100\n3\n",
  "fruits.txt": "banana\napple\ncherry\ndate\napple\nbanana\ncherry\napple\n",
  "csv.txt": "name,age,city\nAlice,30,Paris\nBob,25,London\nCharlie,35,Berlin\nDiana,28,Tokyo\n",
  "words.txt": "hello world\nfoo bar baz\nthe quick brown fox\njumps over the lazy dog\n",
  // Emoji-named files so `find` has something fun (and Unicode!) to match.
  "🍎.md": "# Apple\n",
  "🍌.md": "# Banana\n",
  "🍒.md": "# Cherry\n",
  "🥝.md": "# Kiwi\n",
  // Two near-identical lists so `diff`/`cmp` have a small, readable change to show.
  "shopping-old.txt": "milk\neggs\nbread\nbutter\napples\n",
  "shopping-new.txt": "milk\neggs\nyogurt\nbread\nhoney\napples\n",
};

// Commands available in the feat_wasm build.
// The workflow generates /wasm/commands.js from coreutils' Cargo.toml feat_wasm
// list and exposes it as `WASM_COMMANDS`. The hardcoded list below is a fallback
// for local dev or when the generated file isn't available.
const FALLBACK_COMMANDS = [
  "arch", "b2sum", "base32", "base64", "basenc", "basename", "cat", "cksum",
  "comm", "cp", "csplit", "cut", "date", "dd", "dir", "dircolors", "dirname",
  "echo", "expand", "expr", "factor", "false", "fmt", "fold", "head",
  "join", "link", "ln", "ls", "md5sum", "mkdir", "mv", "nl", "numfmt",
  "nproc", "od", "paste", "pathchk", "printenv", "printf", "pr", "ptx", "pwd",
  "readlink", "realpath", "rm", "rmdir",
  "seq", "sort", "split", "tail", "touch", "tr", "tsort",
  "sha1sum", "sha224sum", "sha256sum", "sha384sum", "sha512sum",
  "shred", "shuf", "sleep", "sum", "tee", "true", "truncate",
  "uname", "unexpand", "uniq", "unlink", "vdir", "wc",
  "grep", "find", "locate", "updatedb", "diff", "cmp", "sed",
];
const AVAILABLE_COMMANDS =
  (typeof WASM_COMMANDS !== "undefined" && Array.isArray(WASM_COMMANDS) && WASM_COMMANDS.length > 0)
    ? WASM_COMMANDS
    : FALLBACK_COMMANDS;

// Shortcut mappings for locale command (e.g. "fr" -> "fr-FR")
const LOCALE_SHORTCUTS = {
  en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES", it: "it-IT",
  pt: "pt-BR", ja: "ja-JP", zh: "zh-CN", ko: "ko-KR", ru: "ru-RU",
  pl: "pl-PL", nl: "nl-NL", sv: "sv-SE", da: "da-DK", fi: "fi-FI",
  nb: "nb-NO", uk: "uk-UA", cs: "cs-CZ", ro: "ro-RO", hu: "hu-HU",
};

let wasmModule = null;
// Compiled standalone modules, keyed by module name (e.g. "grep", "diffutils").
// A key is present only once its module has loaded successfully.
const standaloneModules = {};
// In-flight loads, keyed by module name, so a button click and a command that
// both trigger a load (or two rapid clicks) share one fetch instead of racing.
const standaloneLoading = {};
let wasiShim = null;
let terminal = null;
let inputBuffer = "";
let cursorPos = 0;
let history = [];
let historyIndex = -1;
let wasmReady = false;
let wasmSize = 0; // downloaded binary size in bytes
let persistentDir = null;
let cwd = ""; // virtual current working directory (relative to preopened root)
let currentLocale = "en-US"; // current locale for l10n
let lastCommand = ""; // most recent command line run, for the "Share" button

function loadScript(src, integrity) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    if (integrity) {
      s.integrity = integrity;
      s.crossOrigin = "anonymous";
    }
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function loadCSS(href, integrity) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  if (integrity) {
    link.integrity = integrity;
    link.crossOrigin = "anonymous";
  }
  link.href = href;
  document.head.appendChild(link);
}

async function loadWasiShim() {
  if (wasiShim) return wasiShim;
  wasiShim = await import(WASI_SHIM_URL);
  return wasiShim;
}

/**
 * Fetch and compile a WASM module from the given URL.
 * Returns { module, size } where size is the downloaded byte length (0 if the
 * server didn't send a content-length header).
 */
async function compileWasmModule(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch WASM binary: ${response.status}`);
  }
  const contentLength = response.headers.get("content-length");
  const size = contentLength ? parseInt(contentLength, 10) : 0;
  // compileStreaming requires application/wasm content-type; fall back if not set.
  // Clone the response so the fallback path can read the body without re-fetching.
  const cloned = response.clone();
  let module;
  try {
    if (WebAssembly.compileStreaming) {
      module = await WebAssembly.compileStreaming(response);
    } else {
      module = await WebAssembly.compile(await response.arrayBuffer());
    }
  } catch (e) {
    // Some servers don't set proper MIME type, compile from the cloned response
    console.warn("WASM compileStreaming failed, falling back to arrayBuffer:", e.message);
    module = await WebAssembly.compile(await cloned.arrayBuffer());
  }
  return { module, size };
}

async function loadWasm() {
  if (wasmModule) return wasmModule;
  const { module, size } = await compileWasmModule(WASM_URL);
  wasmModule = module;
  wasmSize = size;
  return wasmModule;
}

/**
 * Load one optional standalone module (grep, find, …) on demand. These are not
 * part of the eager startup download — they're fetched the first time the user
 * runs the command or clicks its "Load" button, keeping the initial page load
 * to just the coreutils multicall binary.
 *
 * Concurrent callers share a single in-flight fetch. Returns the compiled
 * module, or null if it's unknown or its binary isn't present (e.g. local dev
 * without a CI build) — in which case the command reports it's unavailable
 * rather than breaking the terminal.
 *
 * When `announce` is set and a terminal exists, a "loading <module>… done"
 * notice is printed live; the button UI instead reacts to the
 * `uutils:program-loaded` event dispatched on success.
 *
 * Keyed by module name (e.g. "diffutils"), so commands that share a module
 * (diff, cmp) trigger a single fetch.
 */
function loadStandalone(mod, { announce = false } = {}) {
  if (standaloneModules[mod]) return Promise.resolve(standaloneModules[mod]);
  if (standaloneLoading[mod]) return standaloneLoading[mod];
  const url = STANDALONE_MODULES[mod] && STANDALONE_MODULES[mod].url;
  if (!url) return Promise.resolve(null);
  const notify = announce && terminal;
  if (notify) terminal.write(`loading ${mod}… `);
  standaloneLoading[mod] = (async () => {
    try {
      const { module, size } = await compileWasmModule(url);
      standaloneModules[mod] = module;
      wasmSize += size;
      if (notify) terminal.write(`done (${(size / 1024 / 1024).toFixed(1)} MB)\r\n`);
      if (typeof document !== "undefined") {
        document.dispatchEvent(new CustomEvent("uutils:program-loaded", { detail: { module: mod, size } }));
      }
      return module;
    } catch (e) {
      console.warn(`${mod} WASM unavailable:`, e.message);
      if (notify) terminal.write("unavailable\r\n");
      return null;
    } finally {
      delete standaloneLoading[mod];
    }
  })();
  return standaloneLoading[mod];
}

async function initWasm() {
  if (wasmReady) return;
  try {
    // Only the coreutils multicall binary loads eagerly; the standalone
    // modules (grep, find, locate, updatedb, diffutils, sed) are fetched
    // on demand — see loadStandalone.
    await Promise.all([loadWasiShim(), loadWasm()]);
    wasmReady = true;
  } catch (e) {
    // Will fall back to JS implementations
    console.warn("WASM init failed:", e);
  }
}

/**
 * Get or create the persistent virtual filesystem directory.
 * This directory is shared across all command invocations so that
 * files created by one command (e.g. mkdir, cp) are visible to the next.
 */
function getPersistentDir() {
  if (persistentDir) return persistentDir;
  const encoder = new TextEncoder();
  // WASI nanosecond timestamp for "now"
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  const fileEntries = Object.entries(SAMPLE_FILES).map(
    ([name, content]) => {
      const file = new wasiShim.File(encoder.encode(content));
      // browser_wasi_shim leaves timestamps at 0 (epoch 1970);
      // patch them so ls shows a realistic date.
      const origStat = file.stat.bind(file);
      file.stat = () => { const s = origStat(); s.atim = nowNs; s.mtim = nowNs; s.ctim = nowNs; return s; };
      return [name, file];
    }
  );
  persistentDir = new wasiShim.PreopenDirectory(".", fileEntries);
  // Also patch the root directory stat
  const origDirStat = persistentDir.dir.stat.bind(persistentDir.dir);
  persistentDir.dir.stat = () => { const s = origDirStat(); s.atim = nowNs; s.mtim = nowNs; s.ctim = nowNs; return s; };
  return persistentDir;
}

/**
 * Resolve a path relative to cwd. Returns a normalized path relative to the
 * preopened root directory.
 */
function resolvePath(p) {
  if (!p || p.startsWith("-")) return p;
  // Absolute paths (starting with /) stay as-is - WASI preopened dir is "."
  // so absolute paths won't resolve anyway, but don't mangle them.
  if (p.startsWith("/")) return p;
  const base = cwd ? cwd.split("/") : [];
  const parts = [...base, ...p.split("/")];
  const resolved = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") { resolved.pop(); continue; }
    resolved.push(part);
  }
  return resolved.join("/") || ".";
}

/**
 * Look up a directory in the virtual filesystem.
 * Returns the Directory object if found, or null.
 */
function lookupDir(path) {
  if (!wasiShim) return null;
  const dir = getPersistentDir();
  if (!path || path === ".") return dir.dir;
  const parts = path.split("/").filter(Boolean);
  let current = dir.dir; // the Directory inside PreopenDirectory
  for (const part of parts) {
    if (part === ".") continue;
    if (part === "..") return null; // can't go above root
    const entry = current.contents.get(part);
    if (!entry || !entry.contents) return null; // not a directory
    current = entry;
  }
  return current;
}

/**
 * Run a single uutils command via the WASM module using browser_wasi_shim.
 * Returns { stdout: string, stderr: string, exitCode: number }
 */
async function runCommand(argv, stdinData = "", module = wasmModule) {
  if (!wasmReady) throw new Error("WASM not loaded");
  if (!module) throw new Error("WASM module not loaded");

  const encoder = new TextEncoder();

  // Collect raw bytes for stdout/stderr to avoid mid-character UTF-8 splits.
  // ConsoleStdout.lineBuffered uses TextDecoder in streaming mode which can
  // split multibyte UTF-8 characters across fd_write calls. Instead, we
  // use ConsoleStdout with a raw byte callback and decode once at the end.
  let stdoutBytes = [];
  let stderrBytes = [];

  const stdoutFd = new wasiShim.ConsoleStdout((bytes) => {
    stdoutBytes.push(new Uint8Array(bytes));
  });

  const stderrFd = new wasiShim.ConsoleStdout((bytes) => {
    stderrBytes.push(new Uint8Array(bytes));
  });

  // stdin as an OpenFile wrapping a File
  const stdinFile = new wasiShim.OpenFile(
    new wasiShim.File(encoder.encode(stdinData))
  );

  const preopenDir = getPersistentDir();

  const fds = [
    stdinFile,   // fd 0: stdin
    stdoutFd,    // fd 1: stdout
    stderrFd,    // fd 2: stderr
    preopenDir,  // fd 3: preopened directory
  ];

  const env = [`LANG=${currentLocale}.UTF-8`, "TERM=xterm-256color"];
  const wasi = new wasiShim.WASI(argv, env, fds);

  // Workaround for https://github.com/bjorn3/browser_wasi_shim/issues/109
  // @bjorn3/browser_wasi_shim args_sizes_get and environ_sizes_get use
  // JavaScript's String.length (UTF-16 code units) to report the buffer
  // size needed for argv/environ strings. However, WASI expects UTF-8
  // byte lengths. For ASCII this is identical, but for multibyte characters
  // (CJK, emoji, Arabic, etc.) the UTF-8 encoding is longer than the
  // UTF-16 code unit count, causing the WASM runtime to allocate a buffer
  // that is too small. The result is truncated arguments and garbled output
  // (e.g. "こんにちは世界" → "こんにち�3").
  // Fix: override both functions to use TextEncoder for correct byte counts.
  wasi.wasiImport.args_sizes_get = function(argcPtr, argvBufSizePtr) {
    const mem = () => new DataView(wasi.inst.exports.memory.buffer);
    mem().setUint32(argcPtr, argv.length, true);
    let bufSize = 0;
    for (const arg of argv) bufSize += encoder.encode(arg).length + 1;
    mem().setUint32(argvBufSizePtr, bufSize, true);
    return 0;
  };

  wasi.wasiImport.environ_sizes_get = function(countPtr, sizePtr) {
    const mem = () => new DataView(wasi.inst.exports.memory.buffer);
    mem().setUint32(countPtr, env.length, true);
    let bufSize = 0;
    for (const e of env) bufSize += encoder.encode(e).length + 1;
    mem().setUint32(sizePtr, bufSize, true);
    return 0;
  };

  // Workaround: browser_wasi_shim Filestat.write_bytes() only writes the
  // defined fields and skips padding bytes (e.g. bytes 17-23 between the
  // 1-byte filetype and the 8-byte nlink). Rust allocates the stat buffer
  // with MaybeUninit (uninitialized stack memory), so those padding bytes
  // contain garbage that corrupts the struct when Rust reads it back.
  // Fix: patch write_bytes to zero padding before writing fields.
  // Monkey-patch write_bytes to also write the padding/nlink fields that
  // the original skips. The original writes filetype as a single byte at
  // ptr+16 but leaves bytes 17-23 untouched. On WASM those bytes come from
  // uninitialized stack memory (MaybeUninit) and corrupt the struct.
  wasiShim.wasi.Filestat.prototype.write_bytes = function(view, ptr) {
    view.setBigUint64(ptr, this.dev, true);
    view.setBigUint64(ptr + 8, this.ino, true);
    view.setBigUint64(ptr + 16, BigInt(this.filetype), true); // zero-extends, clearing padding
    view.setBigUint64(ptr + 24, this.nlink, true);
    view.setBigUint64(ptr + 32, this.size, true);
    view.setBigUint64(ptr + 40, this.atim, true);
    view.setBigUint64(ptr + 48, this.mtim, true);
    view.setBigUint64(ptr + 56, this.ctim, true);
  };

  let exitCode = 0;
  try {
    const result = await WebAssembly.instantiate(module, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });
    // instantiate(Module) returns Instance; instantiate(Buffer) returns {instance}
    const instance = result.instance || result;
    wasi.start(instance);
  } catch (e) {
    if (e instanceof wasiShim.WASIProcExit) {
      exitCode = e.code;
    } else {
      return { stdout: "", stderr: e.message + "\n", exitCode: 1 };
    }
  }

  const decoder = new TextDecoder();
  const concatBytes = (chunks) => {
    const total = chunks.reduce((s, c) => s + c.length, 0);
    const buf = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { buf.set(chunk, offset); offset += chunk.length; }
    return decoder.decode(buf);
  };

  return {
    stdout: concatBytes(stdoutBytes),
    stderr: concatBytes(stderrBytes),
    exitCode,
  };
}

/**
 * Split a command line into sequentially-run commands on top-level ";".
 * Semicolons inside single/double quotes or escaped are left untouched, so
 * `echo 'a;b'` stays one command. Empty segments (e.g. a trailing ";") are
 * dropped. Returns an array of command strings, each run in turn like a shell.
 */
function splitCommands(line) {
  const commands = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (const ch of line) {
    if (escape) { current += ch; escape = false; continue; }
    if (ch === "\\" && !inSingle) { current += ch; escape = true; continue; }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    if (ch === ";" && !inSingle && !inDouble) {
      if (current.trim()) commands.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) commands.push(current.trim());
  return commands;
}

/**
 * Parse a command line into a pipeline of commands.
 * Supports pipes (|), input redirection (<), and output redirection (>, >>).
 * Returns an array of stages: { args: string[], stdin: string|null, stdout: string|null, append: boolean }
 */
function parseCommandLine(line) {
  // First, tokenize respecting quotes
  const tokens = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (const ch of line) {
    if (escape) { current += ch; escape = false; continue; }
    if (ch === "\\" && !inSingle) { escape = true; continue; }
    if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
    if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
    if (!inSingle && !inDouble && (ch === "|" || ch === "<" || ch === ">" || ch === " ")) {
      if (current) { tokens.push(current); current = ""; }
      if (ch !== " ") tokens.push(ch);
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);

  // Merge >> into a single token
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === ">" && tokens[i + 1] === ">") {
      tokens.splice(i, 2, ">>");
    }
  }

  // Split into pipeline stages and extract redirections
  const pipeline = [];
  let stage = { args: [], stdin: null, stdout: null, append: false };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok === "|") {
      pipeline.push(stage);
      stage = { args: [], stdin: null, stdout: null, append: false };
    } else if (tok === "<" && i + 1 < tokens.length) {
      stage.stdin = tokens[++i];
    } else if ((tok === ">" || tok === ">>") && i + 1 < tokens.length) {
      stage.append = tok === ">>";
      stage.stdout = tokens[++i];
    } else {
      stage.args.push(tok);
    }
  }
  pipeline.push(stage);
  return pipeline;
}

// Upper bound on the length of a command supplied via the ?cmd= URL parameter.
// Long enough for any real example, short enough that a pathological value
// can't be handed to the WASM runtime wholesale (issue #53).
const MAX_URL_COMMAND_LENGTH = 2048;

/**
 * Sanitize a command coming from the ?cmd= URL parameter before it is executed.
 *
 * Strips control / unprintable characters that cannot be typed at the prompt -
 * keeping only newline (used to separate multiple commands) and tab - so that
 * an invisible byte like NUL (%00) no longer reaches the parser and produces a
 * baffling "command not found:" with nothing after it (issue #52). Also caps
 * the length so an oversized value degrades gracefully (issue #53).
 */
function sanitizeUrlCommand(raw) {
  if (!raw) return "";
  // Remove C0 controls (0x00-0x1F) except tab (0x09) and newline (0x0A), plus DEL (0x7F).
  // eslint-disable-next-line no-control-regex -- stripping control chars is the whole point
  let cmd = raw.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
  if (cmd.length > MAX_URL_COMMAND_LENGTH) cmd = cmd.slice(0, MAX_URL_COMMAND_LENGTH);
  return cmd;
}

/**
 * Read a file from the virtual filesystem. Returns its content as a string,
 * or null if not found.
 */
function readVirtualFile(name) {
  const dir = getPersistentDir();
  const resolved = resolvePath(name);
  const parts = resolved.split("/").filter(Boolean);
  let current = dir.dir;
  for (let i = 0; i < parts.length - 1; i++) {
    const entry = current.contents.get(parts[i]);
    if (!entry || !entry.contents) return null;
    current = entry;
  }
  const file = current.contents.get(parts[parts.length - 1] || name);
  if (!file || !file.data) return null;
  return new TextDecoder().decode(file.data);
}

/**
 * Stamp a virtual file's timestamps with "now". browser_wasi_shim creates
 * files written by a WASM command (e.g. updatedb's database) with epoch (1970)
 * timestamps; this patches stat() the same way getPersistentDir does for the
 * sample files, so age-sensitive readers (locate) don't see a decades-old file.
 */
function touchVirtualFileNow(name) {
  const dir = getPersistentDir();
  const file = dir.dir.contents.get(resolvePath(name));
  if (!file || typeof file.stat !== "function") return;
  const nowNs = BigInt(Date.now()) * 1_000_000n;
  const orig = file.stat.bind(file);
  file.stat = () => { const s = orig(); s.atim = nowNs; s.mtim = nowNs; s.ctim = nowNs; return s; };
}

/**
 * Write a file to the virtual filesystem.
 */
function writeVirtualFile(name, content, append) {
  const dir = getPersistentDir();
  const resolved = resolvePath(name);
  const encoder = new TextEncoder();
  const existing = dir.dir.contents.get(resolved);
  let data;
  if (append && existing && existing.data) {
    const prev = existing.data;
    const added = encoder.encode(content);
    data = new Uint8Array(prev.length + added.length);
    data.set(prev);
    data.set(added, prev.length);
  } else {
    data = encoder.encode(content);
  }
  const file = new wasiShim.File(data);
  dir.dir.contents.set(resolved, file);
}

/**
 * Execute a command line, splitting on top-level ";" so several commands run
 * in sequence (like a shell), e.g. `updatedb; locate names`. Each segment is
 * executed in turn and their outputs are concatenated. State changes from one
 * segment (cwd via cd, the locate db built by updatedb, files written via >)
 * carry into the next, since they share the module-global virtual FS and cwd.
 */
async function executeCommandLine(line) {
  const commands = splitCommands(line);
  if (commands.length <= 1) return executeSingleCommandLine(line);
  let output = "";
  for (const cmd of commands) {
    output += await executeSingleCommandLine(cmd);
  }
  return output;
}

/**
 * Execute a single command line, handling pipes and builtins.
 */
async function executeSingleCommandLine(line) {
  line = line.trim();
  if (!line) return "";

  // Builtin: help
  if (line === "help") {
    return (
      "Available commands:\n" +
      AVAILABLE_COMMANDS.join(", ") +
      "\n\nBuiltins: help, clear, cd, locale\n" +
      "Sample files: names.txt, numbers.txt, fruits.txt, csv.txt, words.txt\n" +
      "\nExamples:\n" +
      "  echo 'hello world'\n" +
      "  cat numbers.txt\n" +
      "  echo '5 3 1 4 2' | fmt -w1 | sort -n\n" +
      "  wc -l fruits.txt\n" +
      "  seq 1 10 | factor\n" +
      "  grep -i alice names.txt\n" +
      "  find . -name '*.md'\n" +
      "  diff -u shopping-old.txt shopping-new.txt\n" +
      "  echo 'hello world' | sed 's/world/there/'\n" +
      "  basename /usr/local/bin/rustc\n" +
      "  date\n" +
      "  uname -a\n"
    );
  }

  // Builtin: clear
  if (line === "clear") {
    if (terminal) terminal.clear();
    return "";
  }

  // Builtin: cd
  if (line === "cd" || line.startsWith("cd ")) {
    const target = line === "cd" ? "" : line.slice(3).trim();
    if (!target || target === "/" || target === "~") {
      cwd = "";
      return "";
    }
    const resolved = resolvePath(target);
    if (resolved === ".") {
      cwd = "";
      return "";
    }
    const dir = lookupDir(resolved);
    if (!dir) {
      return `cd: ${target}: No such directory\n`;
    }
    cwd = resolved;
    return "";
  }

  // Builtin: locale - show or set the current locale
  if (line === "locale" || line.startsWith("locale ")) {
    const arg = line === "locale" ? "" : line.slice(7).trim();
    if (!arg) {
      return `LANG=${currentLocale}.UTF-8\n`;
    }
    // Normalize: "fr" -> "fr-FR", "en" -> "en-US", or accept full form
    const normalized = arg.includes("-") ? arg : LOCALE_SHORTCUTS[arg.toLowerCase()] || arg;
    currentLocale = normalized;
    return `Locale set to ${currentLocale}\n`;
  }

  // Builtin: pwd (return virtual cwd)
  if (line === "pwd") {
    return "/" + cwd + "\n";
  }

  const pipeline = parseCommandLine(line);
  let stdinData = "";

  for (const stage of pipeline) {
    const { args, stdin: stdinFile, stdout: stdoutFile, append } = stage;
    if (args.length === 0) continue;

    // Handle input redirection: < file
    if (stdinFile) {
      const content = readVirtualFile(stdinFile);
      if (content === null) return `${stdinFile}: No such file\n`;
      stdinData = content;
    }

    const cmd = args[0];

    if (!wasmReady) {
      return "WASM binary is still loading, please wait...\n";
    }

    if (!AVAILABLE_COMMANDS.includes(cmd)) {
      return `uutils: command not found: ${cmd}\nType 'help' for available commands.\n`;
    }

    // Some utilities (grep, find, locate, updatedb, diff, cmp, sed) are
    // separate WASM modules rather than part of the coreutils multicall binary,
    // and are loaded on demand.
    // Fetch the module the first time one of its commands is used (no-op once
    // cached; diff and cmp share the single diffutils module).
    const moduleName = STANDALONE_COMMAND_MODULE[cmd];
    const isStandalone = !!moduleName;
    if (isStandalone && !standaloneModules[moduleName]) {
      const mod = await loadStandalone(moduleName, { announce: true });
      if (!mod) return `${cmd} is not available in this build.\n`;
    }

    try {
      // sed's script argument is a program, not a path — it must NOT go through
      // resolvePath, which normalizes path segments and would strip a trailing
      // delimiter (e.g. `s/world/there/` -> `s/world/there`, breaking the `s`
      // command). Collect the indices of any sed script arguments to skip.
      const sedScriptIndices = new Set();
      if (cmd === "sed") {
        let scriptFromFlag = false;
        for (let i = 1; i < args.length; i++) {
          const a = args[i];
          if (a === "-e" || a === "-f") { sedScriptIndices.add(i + 1); scriptFromFlag = true; i++; continue; }
          if (a.startsWith("-e") || a.startsWith("-f")) { scriptFromFlag = true; } // combined form, e.g. -e's/a/b/'
        }
        // Without -e/-f, the script is the first non-option argument.
        if (!scriptFromFlag) {
          for (let i = 1; i < args.length; i++) {
            if (!args[i].startsWith("-")) { sedScriptIndices.add(i); break; }
          }
        }
      }
      // Resolve relative paths using the virtual cwd
      const resolvedArgs = args.map((arg, i) => {
        if (i === 0) return arg; // command name
        if (arg.startsWith("-")) return arg; // flag
        if (sedScriptIndices.has(i)) return arg; // sed script, not a path
        return resolvePath(arg);
      });
      // If the command takes a default path (like ls) and no path args
      // were given, add the cwd so it lists the right directory
      const hasPathArg = resolvedArgs.slice(1).some(a => !a.startsWith("-"));
      if (!hasPathArg && cwd && ["ls", "dir"].includes(cmd)) {
        resolvedArgs.push(cwd);
      }
      // find takes its starting paths *before* the expression. When the user
      // gives none (e.g. `find -type f`), GNU find defaults to "."; mirror that
      // but use the virtual cwd so `cd subdir; find` searches the right place.
      if (cmd === "find") {
        const hasStartPath = resolvedArgs.length > 1 && !resolvedArgs[1].startsWith("-");
        if (!hasStartPath) resolvedArgs.splice(1, 0, cwd || ".");
      }
      // updatedb/locate default to /usr/local/var/locatedb and updatedb scans
      // "/", neither of which exists in the browser's WASI filesystem (only the
      // virtual cwd "." is preopened). Point both at a writable db file in the
      // virtual root and have updatedb index the playground's files, so a bare
      // `updatedb` then `locate <pattern>` works out of the box.
      if (cmd === "updatedb") {
        if (!resolvedArgs.some(a => a === "--output" || a.startsWith("--output=")))
          resolvedArgs.push(`--output=${LOCATE_DB}`);
        if (!resolvedArgs.some(a => a === "--localpaths" || a.startsWith("--localpaths=")))
          resolvedArgs.push(`--localpaths=${cwd || "."}`);
      }
      if (cmd === "locate") {
        const hasDb = resolvedArgs.some(a =>
          a === "--database" || a.startsWith("--database=") || a === "-d" || (a.startsWith("-d") && a.length > 2));
        if (!hasDb) resolvedArgs.splice(1, 0, `--database=${LOCATE_DB}`);
      }
      // Standalone utilities are invoked directly (argv[0] = the command name);
      // coreutils utilities go through the multicall dispatcher
      // (argv = ["coreutils", <util>, ...]).
      let dispatchArgs = resolvedArgs;
      if (cmd === "grep") {
        // browser_wasi_shim reports stdout as a TTY, so grep would emit GNU
        // match-highlight escape codes by default. That looks fine in the
        // terminal but corrupts piped/redirected output (e.g. `grep x | wc`),
        // so default to no color unless the user asks for it explicitly.
        const hasColorFlag = resolvedArgs.some(a => a === "--color" || a.startsWith("--color="));
        dispatchArgs = hasColorFlag
          ? resolvedArgs
          : [resolvedArgs[0], "--color=never", ...resolvedArgs.slice(1)];
      }
      const wasmArgs = isStandalone ? dispatchArgs : ["coreutils", ...resolvedArgs];
      const result = await runCommand(wasmArgs, stdinData, isStandalone ? standaloneModules[moduleName] : wasmModule);
      // updatedb writes its database with epoch (1970) timestamps in the virtual
      // FS, so a later `locate` would warn the db is decades old (and that stderr
      // warning would break `locate … | …` pipes). Stamp the freshly-built db
      // with "now" to keep locate quiet.
      if (cmd === "updatedb" && result.exitCode === 0) {
        const outArg = resolvedArgs.find(a => a.startsWith("--output="));
        touchVirtualFileNow(outArg ? outArg.slice("--output=".length) : LOCATE_DB);
      }
      if (result.stderr) {
        return result.stderr + result.stdout;
      }
      stdinData = result.stdout;
    } catch (e) {
      return `Error running '${cmd}': ${e.message}\n`;
    }

    // Handle output redirection: > file or >> file
    if (stdoutFile) {
      writeVirtualFile(stdoutFile, stdinData, append);
      stdinData = "";
    }
  }

  return stdinData;
}


/**
 * Record a command line that was run, whether typed at the prompt or triggered
 * by clicking an example. Adds it to the up-arrow history (skipping consecutive
 * duplicates), remembers it for the page's "Share" button, and notifies any
 * listeners. Builtins that only affect the local view (clear) aren't worth
 * sharing, so they're skipped.
 */
function recordCommand(line) {
  line = (line || "").trim();
  if (!line) return;
  if (history[history.length - 1] !== line) history.push(line);
  historyIndex = -1;
  // clear only wipes the local view, so it isn't worth sharing.
  if (line === "clear") return;
  lastCommand = line;
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent("uutils:command-run", { detail: { command: line } }));
  }
}

function writeToTerminal(text) {
  if (!terminal) return;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    terminal.write(lines[i]);
    if (i < lines.length - 1) terminal.write("\r\n");
  }
}

function promptStr() {
  const dir = cwd ? `\x1b[1;34m${cwd}\x1b[0m ` : "";
  return `\x1b[1;38;5;166muutils\x1b[0m ${dir}\x1b[1;38;5;166m$\x1b[0m `;
}

function prompt() {
  if (!terminal) return;
  terminal.write("\r\n" + promptStr());
}

function redrawInput() {
  terminal.write("\r" + promptStr() + inputBuffer + "\x1b[K");
  const moveBack = inputBuffer.length - cursorPos;
  if (moveBack > 0) terminal.write(`\x1b[${moveBack}D`);
}

/**
 * Compute tab-completion result (pure function, no terminal side-effects).
 * Returns { buffer, cursor, completed, candidates }.
 */
function tabComplete(buffer, cursor) {
  const before = buffer.slice(0, cursor);
  const after = buffer.slice(cursor);
  const parts = before.split(/\s+/);
  const word = parts[parts.length - 1];
  const isCommand = parts.length <= 1;

  const builtins = ["help", "clear", "cd", "locale"];
  const candidates = isCommand
    ? AVAILABLE_COMMANDS.concat(builtins).filter(c => c.startsWith(word))
    : Object.keys(SAMPLE_FILES).filter(f => f.startsWith(word));

  if (candidates.length === 1) {
    const suffix = candidates[0].slice(word.length) + " ";
    return { buffer: before + suffix + after, cursor: cursor + suffix.length, completed: true, candidates };
  }
  if (candidates.length > 1) {
    let common = candidates[0];
    for (const c of candidates) {
      while (!c.startsWith(common)) common = common.slice(0, -1);
    }
    if (common.length > word.length) {
      const suffix = common.slice(word.length);
      return { buffer: before + suffix + after, cursor: cursor + suffix.length, completed: true, candidates };
    }
    return { buffer, cursor, completed: false, candidates };
  }
  return { buffer, cursor, completed: false, candidates: [] };
}

async function handleInput(data) {
  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    const code = ch.charCodeAt(0);

    // Handle escape sequences
    if (ch === "\x1b" && i + 2 < data.length) {
      if (data[i + 1] === "[") {
        const seq = data[i + 2];
        if (seq === "A") { // Up arrow
          if (history.length > 0 && historyIndex < history.length - 1) {
            historyIndex++;
            inputBuffer = history[history.length - 1 - historyIndex];
            cursorPos = inputBuffer.length;
            redrawInput();
          }
          i += 2; continue;
        }
        if (seq === "B") { // Down arrow
          if (historyIndex > 0) {
            historyIndex--;
            inputBuffer = history[history.length - 1 - historyIndex];
            cursorPos = inputBuffer.length;
            redrawInput();
          } else if (historyIndex === 0) {
            historyIndex = -1;
            inputBuffer = "";
            cursorPos = 0;
            redrawInput();
          }
          i += 2; continue;
        }
        if (seq === "C") { // Right arrow
          if (cursorPos < inputBuffer.length) { cursorPos++; terminal.write("\x1b[C"); }
          i += 2; continue;
        }
        if (seq === "D") { // Left arrow
          if (cursorPos > 0) { cursorPos--; terminal.write("\x1b[D"); }
          i += 2; continue;
        }
      }
      continue;
    }

    if (code === 13) { // Enter
      terminal.write("\r\n");
      const line = inputBuffer.trim();
      if (line) {
        recordCommand(line);
        const output = await executeCommandLine(line);
        if (output) writeToTerminal(output);
      }
      inputBuffer = "";
      cursorPos = 0;
      prompt();
      continue;
    }

    if (code === 127 || code === 8) { // Backspace
      if (cursorPos > 0) {
        inputBuffer = inputBuffer.slice(0, cursorPos - 1) + inputBuffer.slice(cursorPos);
        cursorPos--;
        redrawInput();
      }
      continue;
    }

    if (code === 3) { // Ctrl+C
      inputBuffer = "";
      cursorPos = 0;
      terminal.write("^C");
      prompt();
      continue;
    }

    if (code === 12) { // Ctrl+L
      terminal.clear();
      prompt();
      terminal.write(inputBuffer);
      continue;
    }

    if (code === 9) { // Tab - completion
      const result = tabComplete(inputBuffer, cursorPos);
      if (result.completed) {
        inputBuffer = result.buffer;
        cursorPos = result.cursor;
        redrawInput();
      } else if (result.candidates.length > 1) {
        terminal.write("\r\n" + result.candidates.join("  ") + "\r\n");
        prompt();
        terminal.write(inputBuffer);
        const back = inputBuffer.length - cursorPos;
        if (back > 0) terminal.write(`\x1b[${back}D`);
      }
      continue;
    }

    if (code === 21) { // Ctrl+U
      inputBuffer = "";
      cursorPos = 0;
      redrawInput();
      continue;
    }

    if (code >= 32) { // Regular character
      inputBuffer = inputBuffer.slice(0, cursorPos) + ch + inputBuffer.slice(cursorPos);
      cursorPos++;
      redrawInput();
    }
  }
}

/**
 * Initialize the playground terminal in the given container element.
 */
async function initPlayground(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<div class="wasm-loading">Loading terminal...</div>';

  loadCSS(XTERM_CSS, XTERM_CSS_INTEGRITY);
  await loadScript(XTERM_JS, XTERM_JS_INTEGRITY);
  await loadScript(XTERM_FIT_JS, XTERM_FIT_JS_INTEGRITY);

  container.innerHTML = "";

  terminal = new window.Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: '"Fira Code", "Cascadia Code", Menlo, Monaco, monospace',
    theme: {
      background: "#1e1e2e",
      foreground: "#cdd6f4",
      cursor: "#f5e0dc",
      selectionBackground: "#585b7066",
      black: "#45475a",
      red: "#f38ba8",
      green: "#a6e3a1",
      yellow: "#f9e2af",
      blue: "#89b4fa",
      magenta: "#f5c2e7",
      cyan: "#94e2d5",
      white: "#bac2de",
    },
    rows: 24,
    cols: 80,
  });

  const fitAddon = new window.FitAddon.FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.open(container);
  fitAddon.fit();

  window.addEventListener("resize", () => fitAddon.fit());

  terminal.writeln("\x1b[1;38;5;166m  _   _ _   _ _   _ _\x1b[0m");
  terminal.writeln("\x1b[1;38;5;166m | | | | | | | |_(_) |___\x1b[0m");
  terminal.writeln("\x1b[1;38;5;166m | |_| | |_| |  _| | (_-<\x1b[0m");
  terminal.writeln("\x1b[1;38;5;166m  \\___/ \\___/ \\__|_|_/__/\x1b[0m");
  terminal.writeln("");
  terminal.writeln("Welcome to the \x1b[1muutils coreutils\x1b[0m playground!");
  terminal.writeln("Run Rust coreutils directly in your browser via WebAssembly.");
  terminal.writeln("");
  terminal.write("Loading WASM binary...");

  terminal.onData(handleInput);

  // Load WASM in background
  try {
    await initWasm();
    const sizeStr = wasmSize > 0 ? ` (${(wasmSize / 1024 / 1024).toFixed(1)} MB)` : "";
    terminal.writeln(` \x1b[1;32mdone!\x1b[0m${sizeStr}`);
    terminal.writeln("");
    terminal.writeln("Type \x1b[1;32mhelp\x1b[0m for available commands.");
    terminal.writeln("Sample data files: names.txt, numbers.txt, fruits.txt, csv.txt, words.txt");
    terminal.writeln("\x1b[2mgrep, find/locate/updatedb, sed and diff/cmp load on demand - just run them, or use the buttons above.\x1b[0m");
  } catch {
    terminal.writeln(" \x1b[1;31mfailed\x1b[0m");
    terminal.writeln("Failed to load WASM binary. Commands are not available.");
    terminal.writeln("Try reloading the page.");
  }

  // Run command(s) from URL ?cmd= parameter if present
  const urlCmd = sanitizeUrlCommand(new URLSearchParams(window.location.search).get("cmd"));
  if (urlCmd) {
    for (const cmd of urlCmd.split("\n")) {
      if (cmd.trim()) await runInTerminal(cmd.trim());
    }
  } else {
    prompt();
  }
}

/**
 * Run a command in the terminal, displaying it as if the user typed it.
 */
async function runInTerminal(cmd) {
  if (!terminal) return;
  // Show the command on the prompt line
  terminal.write(cmd);
  terminal.write("\r\n");
  recordCommand(cmd);
  const output = await executeCommandLine(cmd);
  if (output) writeToTerminal(output);
  prompt();
}

/**
 * Set the locale and optionally update the terminal.
 */
function setLocale(locale) {
  currentLocale = locale;
  if (terminal) {
    terminal.writeln(`\r\nLocale set to ${currentLocale}`);
    prompt();
  }
}

// Expose globally
window.initPlayground = initPlayground;
window.uutilsExecute = executeCommandLine;
window.runInTerminal = runInTerminal;
window.setLocale = setLocale;
window.getLastCommand = () => lastCommand;

// On-demand loading of the optional standalone modules, used by the "Load"
// buttons on the playground page. Buttons operate on groups (see
// STANDALONE_GROUPS): "find" loads find + locate + updatedb together, while the
// others map one-to-one. A group with an unknown name falls back to a same-named
// single module.
const groupModules = (group) => STANDALONE_GROUPS[group] || [group];
window.uutilsPrograms = Object.keys(STANDALONE_GROUPS);
window.loadProgram = (group) =>
  Promise.all(groupModules(group).map(m => loadStandalone(m)))
    .then(mods => mods.every(Boolean) ? mods : null);
window.isProgramLoaded = (group) =>
  groupModules(group).every(m => !!standaloneModules[m]);
// Best-effort byte size of a group, summed across its modules, for the button
// label (0 if the server doesn't report Content-Length or a binary is missing).
window.programSize = async (group) => {
  const sizes = await Promise.all(groupModules(group).map(async (m) => {
    const url = STANDALONE_MODULES[m] && STANDALONE_MODULES[m].url;
    if (!url) return 0;
    try {
      const r = await fetch(url, { method: "HEAD" });
      const cl = r.ok ? r.headers.get("content-length") : null;
      return cl ? parseInt(cl, 10) : 0;
    } catch {
      return 0;
    }
  }));
  return sizes.reduce((a, b) => a + b, 0);
};

// Expose internals for testing
window._uutilsTestInternals = {
  parseCommandLine,
  splitCommands,
  sanitizeUrlCommand,
  executeCommandLine,
  resolvePath,
  lookupDir,
  getPersistentDir,
  readVirtualFile,
  writeVirtualFile,
  get cwd() { return cwd; },
  set cwd(v) { cwd = v; },
  get locale() { return currentLocale; },
  set locale(v) { currentLocale = v; },
  get wasmReady() { return wasmReady; },
  get grepReady() { return !!standaloneModules.grep; },
  get findReady() { return !!standaloneModules.find; },
  get locateReady() { return !!standaloneModules.locate; },
  get updatedbReady() { return !!standaloneModules.updatedb; },
  get diffutilsReady() { return !!standaloneModules.diffutils; },
  get sedReady() { return !!standaloneModules.sed; },
  initWasm,
  loadStandalone,
  LOCALE_SHORTCUTS,
  SAMPLE_FILES,
  AVAILABLE_COMMANDS,
  tabComplete,
};
