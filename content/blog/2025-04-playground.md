+++
title = "Try Uutils Coreutils directly in your browser"
date = 2025-04-04
page_template = "post.html"
authors = ["Sylvestre Ledru"]
+++

We are happy to announce the [Uutils playground](/playground) - an interactive terminal that lets you run real Rust Uutils Coreutils directly in your browser, with no installation, no server, and no network round-trips after the initial page load.

Just open the page and start typing commands like `ls`, `sort`, `cat`, `head`, `factor`, or any of the 60+ utilities available. You can pipe commands together (`sort fruits.txt | uniq -c | sort -rn`), use redirections (`echo hello > file.txt`, `cat < file.txt`), explore the virtual filesystem, and even switch between 30+ languages using the locale dropdown.

### How it works

The Uutils Coreutils are compiled to WebAssembly (targeting `wasm32-wasip1`) as a single multicall binary - similar to BusyBox. When you type a command, a minimal JavaScript shell parses your input, sets up pipes between stages, and executes each one by instantiating the WASM binary with the right arguments. A virtual in-memory filesystem backed by [browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim) provides file I/O. Everything runs client-side - once loaded, the playground works entirely offline.

An important distinction worth noting: **coreutils only provides individual commands** (`sort`, `cat`, `ls`, etc.). Features like `if`/`then`/`else`, `while` loops, variable expansion (`$VAR`), and globbing (`*.txt`) are shell features provided by Bash, Zsh, or similar - not by coreutils. The playground's JavaScript shell is intentionally minimal, keeping the focus on the coreutils themselves.

For a deeper look at the architecture - including diagrams, the multicall dispatch mechanism, the `feat_wasm` feature gate, and how localization is handled - check out the [full technical deep-dive](/playground-how-it-works).

### Try it, break it, improve it

Give the [playground](/playground) a spin and let us know what you think! Contributions are welcome - whether it is improving WASI compatibility to enable more commands, adding translations via [Weblate](https://hosted.weblate.org/projects/rust-coreutils/), or enhancing the playground shell itself.
