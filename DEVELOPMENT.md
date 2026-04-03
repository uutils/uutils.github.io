# Development

## Prerequisites

- [Zola](https://www.getzola.org/) (static site generator)
- [Rust toolchain](https://rustup.rs/) with `wasm32-wasip1` target
- [mdbook](https://rust-lang.github.io/mdBook/) and mdbook-toc
- Node.js (for running tests)
- Python 3 (for `babel`, used in l10n)

## Building the site locally

```sh
zola build
```

The output is in `public/`.

To run a local dev server with live reload:

```sh
zola serve
```

## Documentation generation

The coreutils man pages and documentation are generated from the coreutils source code, not maintained in this repository. The CI workflow handles this automatically, but here is how it works:

1. **uudoc** generates the mdbook source from the coreutils Rust source:
   ```sh
   cd coreutils
   cargo run --bin uudoc --all-features
   ```

2. **TLDR examples** are downloaded and bundled into the docs:
   ```sh
   curl -sfL https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.zip -o tldr.zip
   ```

3. **mdbook** builds the HTML documentation:
   ```sh
   cd coreutils/docs
   mdbook build
   ```

4. **Translations** are built by `scripts/build-docs-l10n.sh`, which swaps locale `.ftl` files and rebuilds uudoc + mdbook for each language.

5. **Language selector** is patched into the mdbook theme by `scripts/patch-mdbook-theme.sh`.

The generated docs are deployed at `/coreutils/docs/` and `/findutils/docs/` on the site.

## WASM Playground

The playground lets visitors run uutils coreutils commands in the browser via WebAssembly.

### Building the WASM binary

```sh
rustup target add wasm32-wasip1
cd /path/to/coreutils
cargo build --release --target wasm32-wasip1 -p coreutils --no-default-features --features feat_wasm
cp target/wasm32-wasip1/release/coreutils.wasm /path/to/uutils.github.io/static/wasm/uutils.wasm
```

Not all coreutils compile to WASI — the `feat_wasm` feature set includes the compatible subset. Commands like `ls`, `sort`, `head`, `tail`, and `tr` are excluded because they depend on platform-specific syscalls.

### How it works

- `static/js/wasm-terminal.js` — main playground runtime (xterm.js + `@bjorn3/browser_wasi_shim`)
- `static/js/wasm-example.js` — inline "Run" button handler for shortcodes
- `templates/shortcodes/wasm_example.html` — Zola shortcode for embedding runnable examples
- `content/playground.md` — the playground page

When the WASM binary is not available, the playground falls back to JavaScript implementations of common commands.

### Running the tests

The playground has unit tests in `static/js/wasm-terminal.test.html`. To run them:

```sh
npm install puppeteer   # one-time setup
node scripts/run-tests.js --dir static
```

Or after a full site build:

```sh
node scripts/run-tests.js --dir public
```

The test runner starts a local HTTP server, opens the test page in headless Chrome via Puppeteer, and reports pass/fail counts. This is the same script used in CI.

## CI workflow

The GitHub Actions workflow (`.github/workflows/website.yml`) does the following:

1. Checks out `uutils.github.io`, `coreutils`, `coreutils-l10n`, and `findutils`
2. Copies l10n locale files into the coreutils tree
3. Builds coreutils documentation (English + translations) with uudoc + mdbook
4. Builds findutils documentation with mdbook
5. Builds the WASM binary (`feat_wasm` feature set)
6. Builds the Zola site
7. Runs the playground JS tests
8. Deploys to GitHub Pages (on push to main or scheduled builds)
