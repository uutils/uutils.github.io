+++
title = "Playground"
template = "page.html"
+++

<p>Try <a href="https://github.com/uutils/coreutils">uutils coreutils</a> directly in your browser! This interactive terminal runs Rust coreutils via WebAssembly — no installation needed.</p>

<!-- Language selector hidden until l10n is embedded in the WASM binary
<div class="playground-toolbar">
  <label for="locale-select">Language:</label>
  <select id="locale-select" onchange="setLocale(this.value)">
    <option value="en-US">English</option>
    <option value="fr-FR">French</option>
  </select>
</div>
-->

<div id="wasm-playground"></div>

<script src="/js/wasm-terminal.js" defer></script>
<script defer>
  document.addEventListener("DOMContentLoaded", function() {
    initPlayground("wasm-playground");
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
  <button class="playground-example">seq 1 15 | fmt -w 40</button>
  <button class="playground-example">echo '🍎,🍌,🍒,🥝' | cut -d🍌 -f2</button>
  <button class="playground-example">printf '🍒 cherry\n🍎 apple\n🍌 banana\n' | sort -k2</button>
  <button class="playground-example">date</button>
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

- `help` — list available commands and examples
- `clear` — clear the terminal screen

Some commands are not yet available in the WASM build because they
depend on platform-specific syscalls not fully supported by
WebAssembly/WASI.<br />
`chcon` and `runcon` are excluded as they require
SELinux, which is not relevant in a browser environment.<br />
We are actively working on adding more commands as we improve WASI
compatibility in uutils coreutils.
