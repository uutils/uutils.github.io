+++
title = "Playground"
template = "page.html"
+++

<p>Try <a href="https://github.com/uutils/coreutils">uutils coreutils</a> directly in your browser! This interactive terminal runs Rust coreutils via WebAssembly - no installation needed.</p>

<div class="playground-toolbar">
  <label for="locale-select">Language:</label>
  <select id="locale-select" onchange="setLocale(this.value)">
    <option value="en-US">English (en-US)</option>
  </select>
  <span class="locale-help">Missing a translation or your language? <a href="https://hosted.weblate.org/projects/rust-coreutils/">Help translate on Weblate</a></span>
</div>

<div class="playground-loaders" id="playground-loaders">
  <span class="playground-loaders-label">Extra programs:</span>
</div>

<div class="term term-playground">
  <div class="term-bar">
    <span class="t">user@uutils: ~</span>
    <span class="win-btn" title="Minimize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 11h8"/></svg></span>
    <span class="win-btn" title="Maximize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4.5" y="4.5" width="7" height="7" rx="1"/></svg></span>
    <span class="win-btn close" title="Close"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></span>
  </div>
  <div id="wasm-playground"></div>
</div>

<div class="playground-share">
  <button type="button" id="playground-share-btn" disabled>🔗 Copy share link</button>
  <span class="playground-share-hint" id="playground-share-hint">Run a command, then copy a link that reruns it for anyone you share it with.</span>
</div>

<p class="playground-version" id="playground-version"></p>

<script src="/wasm/locales.js" defer></script>
<script src="/wasm/version.js" defer></script>
<script src="/wasm/commands.js" defer></script>
<script src="/js/wasm-terminal.js" defer></script>
<script src="/js/playground.js" defer></script>

<noscript>
  <p>JavaScript is required to run the interactive playground.</p>
</noscript>

## Try it out

Click an example to run it in the terminal:

<div class="playground-examples">
  <button class="playground-example">seq 1 20 | factor</button>
  <button class="playground-example">sort fruits.txt | uniq -c | sort -rn</button>
  <button class="playground-example">cut -d, -f2 csv.txt | tail -4 | sort -n</button>
  <button class="playground-example">echo 'rust coreutils in the browser' | tr a-z A-Z</button>
  <button class="playground-example">echo 'こんにちは世界' | base64 | base64 -d</button>
  <button class="playground-example">echo 'Hello, world!' | sha256sum</button>
  <button class="playground-example">shuf -n3 names.txt | nl</button>
  <button class="playground-example">seq 100 | shuf -n5 | sort -n</button>
  <button class="playground-example">paste -d: names.txt numbers.txt | head -5</button>
  <button class="playground-example">echo 'مرحبا بالعالم' | wc -c -w</button>
  <button class="playground-example">printf '🐑\n🐑\n🐑\n🐑\n🐑\n' | nl</button>
  <button class="playground-example">echo '🍎,🍌,🍒,🥝' | cut -d🍌 -f2</button>
  <button class="playground-example">printf '🍒 cherry\n🍎 apple\n🍌 banana\n' | sort -k2</button>
  <button class="playground-example">printf '🍎 apple\n🍌 banana\n🍒 cherry\n🥝 kiwi\n' | grep 🍌</button>
  <button class="playground-example">find . -name '*.md'</button>
  <button class="playground-example">diff -u shopping-old.txt shopping-new.txt</button>
  <button class="playground-example">sed -e 's/banana/🍌/g' -e 's/date/🌴/g' fruits.txt</button>
  <button class="playground-example">sort -n < numbers.txt | head -3</button>
  <button class="playground-example">date</button>
  <button class="playground-example">uname -a</button>
</div>

## Sharing commands via URL

After running a command, click **🔗 Copy share link** below the terminal to copy a link that reruns it. You can also build one by hand with the `?cmd=` URL parameter. The command runs automatically when the page loads - great for sharing examples or linking from documentation.

**Examples:**

- [`?cmd=date`](/playground?cmd=date) - show the current date
- [`?cmd=seq 1 10 | factor`](/playground?cmd=seq%201%2010%20|%20factor) - factorize numbers 1–10
- [`?cmd=echo 'Hello, world!' | sha256sum`](/playground?cmd=echo%20%27Hello%2C%20world!%27%20|%20sha256sum) - hash a string
- [`?cmd=sort fruits.txt | uniq -c | sort -rn`](/playground?cmd=sort%20fruits.txt%20|%20uniq%20-c%20|%20sort%20-rn) - count and rank fruit

Multiple commands can be separated by newlines (`%0A` in the URL):

- [`?cmd=echo hello%0Aecho world`](/playground?cmd=echo%20hello%0Aecho%20world) - run two commands in sequence

## Available commands

The following commands run as **real Rust coreutils compiled to WebAssembly**:

<p id="wasm-commands-list">Loading the list of available commands…</p>

The following are **shell builtins** implemented in JavaScript:

- `help` - list available commands and examples
- `clear` - clear the terminal screen
- `cd` - change the current working directory
- `locale` - show or change the current locale

Some commands (e.g. `chcon`, `runcon`, etc.) are not yet available in the WASM build because they
depend on platform-specific syscalls not fully supported by WebAssembly/WASI.

We are actively working on adding more commands as we improve WASI compatibility in uutils coreutils.

Curious about how this all works under the hood? Read the [technical deep-dive on the playground architecture](/playground-how-it-works).

The source code for this website (including the playground) is available on [GitHub](https://github.com/uutils/uutils.github.io/).
