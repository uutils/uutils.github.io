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

<div id="wasm-playground"></div>

<p class="playground-version" id="playground-version"></p>

<script src="/wasm/locales.js" defer></script>
<script src="/wasm/version.js" defer></script>
<script src="/js/wasm-terminal.js" defer></script>
<script defer>
  document.addEventListener("DOMContentLoaded", function() {
    initPlayground("wasm-playground");
    // Populate the locale dropdown from the build-generated list
    if (typeof WASM_LOCALES !== "undefined") {
      var sel = document.getElementById("locale-select");
      WASM_LOCALES.forEach(function(loc) {
        if (loc === "en-US") return; // already the default option
        var opt = document.createElement("option");
        opt.value = loc;
        opt.textContent = loc;
        sel.appendChild(opt);
      });
    }
    // Show the uutils commit that was used to build the WASM binary
    if (typeof UUTILS_WASM_VERSION !== "undefined") {
      var el = document.getElementById("playground-version");
      var date = UUTILS_WASM_VERSION.date.split("T")[0];
      var url = "https://github.com/uutils/coreutils/commit/" + UUTILS_WASM_VERSION.commit;
      el.innerHTML = 'Built from uutils/coreutils <a href="' + url + '"><code>' +
        UUTILS_WASM_VERSION.short + '</code></a> (' + date + ')';
    }
  });
</script>

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
  <button class="playground-example">sort -n < numbers.txt | head -3</button>
  <button class="playground-example">date</button>
  <button class="playground-example">uname -a</button>
</div>

<script>
document.querySelectorAll('.playground-example').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var cmd = btn.textContent;
    document.getElementById('wasm-playground').scrollIntoView({ behavior: 'smooth' });
    if (window.runInTerminal) {
      window.runInTerminal(cmd);
    }
  });
});
</script>

## Sharing commands via URL

You can pre-fill the terminal with a command using the `?cmd=` URL parameter. The command runs automatically when the page loads - great for sharing examples or linking from documentation.

**Examples:**

- [`?cmd=date`](/playground?cmd=date) - show the current date
- [`?cmd=seq 1 10 | factor`](/playground?cmd=seq%201%2010%20|%20factor) - factorize numbers 1–10
- [`?cmd=echo 'Hello, world!' | sha256sum`](/playground?cmd=echo%20%27Hello%2C%20world!%27%20|%20sha256sum) - hash a string
- [`?cmd=sort fruits.txt | uniq -c | sort -rn`](/playground?cmd=sort%20fruits.txt%20|%20uniq%20-c%20|%20sort%20-rn) - count and rank fruit

Multiple commands can be separated by newlines (`%0A` in the URL):

- [`?cmd=echo hello%0Aecho world`](/playground?cmd=echo%20hello%0Aecho%20world) - run two commands in sequence

## Available commands

The following commands run as **real Rust coreutils compiled to WebAssembly**:

`arch` `b2sum` `base32` `base64` `basenc` `basename` `cat` `cksum`
`comm` `cp` `csplit` `cut` `date` `dir` `dircolors` `dirname`
`echo` `expand` `expr` `factor` `false` `fmt` `fold` `head`
`join` `link` `ln` `ls` `md5sum` `mkdir` `mv` `nl` `nproc` `numfmt`
`od` `paste` `pathchk` `printenv` `printf` `pr` `ptx` `pwd`
`readlink` `realpath` `rm` `rmdir`
`seq` `sort` `split` `tail` `touch` `tr` `tsort`
`sha1sum` `sha224sum` `sha256sum` `sha384sum` `sha512sum`
`shred` `shuf` `sleep` `sum` `tee` `true` `truncate`
`uname` `unexpand` `uniq` `unlink` `vdir` `wc`

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
