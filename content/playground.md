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

<div id="wasm-playground"></div>

<p class="playground-version" id="playground-version"></p>

<script src="/wasm/locales.js" defer></script>
<script src="/wasm/version.js" defer></script>
<script src="/wasm/commands.js" defer></script>
<script src="/js/wasm-terminal.js" defer></script>
<script defer>
  document.addEventListener("DOMContentLoaded", function() {
    initPlayground("wasm-playground");
    // Build a "Load" button per optional standalone group (grep, find,
    // diffutils, sed). These ship as their own WASM modules and load on demand
    // to keep the initial page download light; running a command auto-loads its
    // module too (e.g. diff/cmp both come from the diffutils module, and find
    // loads find/locate/updatedb together).
    var loaderBar = document.getElementById("playground-loaders");
    if (loaderBar && Array.isArray(window.uutilsPrograms)) {
      window.uutilsPrograms.forEach(function(prog) {
        var btn = document.createElement("button");
        btn.className = "playground-loader";
        var markLoaded = function() {
          btn.disabled = true;
          btn.classList.add("loaded");
          btn.textContent = "✓ " + prog + " loaded";
        };
        var setIdleLabel = function(size) {
          btn.textContent = "Load " + prog + (size ? " (" + (size / 1024 / 1024).toFixed(1) + " MB)" : "");
        };
        setIdleLabel(0);
        window.programSize(prog).then(function(size) {
          if (!btn.classList.contains("loaded") && !btn.disabled) setIdleLabel(size);
        });
        btn.addEventListener("click", function() {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.textContent = "Loading " + prog + "…";
          window.loadProgram(prog).then(function(mod) {
            if (mod) {
              markLoaded();
            } else {
              btn.disabled = false;
              btn.textContent = prog + " unavailable";
            }
          });
        });
        // Keep the button in sync once every module it covers is loaded by
        // running a command (a group like "find" backs find/locate/updatedb).
        document.addEventListener("uutils:program-loaded", function(e) {
          if (e.detail && window.isProgramLoaded(prog)) markLoaded();
        });
        if (window.isProgramLoaded(prog)) markLoaded();
        loaderBar.appendChild(btn);
      });
    }
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
    // Populate the "Available commands" list from the build-generated list
    if (typeof WASM_COMMANDS !== "undefined" && Array.isArray(WASM_COMMANDS)) {
      var listEl = document.getElementById("wasm-commands-list");
      if (listEl) {
        listEl.innerHTML = WASM_COMMANDS.slice().sort().map(function(c) {
          return "<code>" + c + "</code>";
        }).join(" ");
      }
    }
    // Show the uutils commit that was used to build the WASM binary,
    // and the uutils.github.io commit the site itself was built from.
    var el = document.getElementById("playground-version");
    if (el) {
      var parts = [];
      if (typeof UUTILS_WASM_VERSION !== "undefined") {
        var date = UUTILS_WASM_VERSION.date.split("T")[0];
        var url = "https://github.com/uutils/coreutils/commit/" + UUTILS_WASM_VERSION.commit;
        parts.push('Built from uutils/coreutils <a href="' + url + '"><code>' +
          UUTILS_WASM_VERSION.short + '</code></a> (' + date + ')');
      }
      if (typeof UUTILS_GREP_VERSION !== "undefined") {
        var grepDate = UUTILS_GREP_VERSION.date.split("T")[0];
        var grepUrl = "https://github.com/uutils/grep/commit/" + UUTILS_GREP_VERSION.commit;
        parts.push('grep <a href="' + grepUrl + '"><code>' +
          UUTILS_GREP_VERSION.short + '</code></a> (' + grepDate + ')');
      }
      if (typeof UUTILS_FINDUTILS_VERSION !== "undefined") {
        var findDate = UUTILS_FINDUTILS_VERSION.date.split("T")[0];
        var findUrl = "https://github.com/uutils/findutils/commit/" + UUTILS_FINDUTILS_VERSION.commit;
        parts.push('findutils <a href="' + findUrl + '"><code>' +
          UUTILS_FINDUTILS_VERSION.short + '</code></a> (' + findDate + ')');
      }
      if (typeof UUTILS_DIFFUTILS_VERSION !== "undefined") {
        var diffDate = UUTILS_DIFFUTILS_VERSION.date.split("T")[0];
        var diffUrl = "https://github.com/uutils/diffutils/commit/" + UUTILS_DIFFUTILS_VERSION.commit;
        parts.push('diffutils <a href="' + diffUrl + '"><code>' +
          UUTILS_DIFFUTILS_VERSION.short + '</code></a> (' + diffDate + ')');
      }
      if (typeof UUTILS_SED_VERSION !== "undefined") {
        var sedDate = UUTILS_SED_VERSION.date.split("T")[0];
        var sedUrl = "https://github.com/uutils/sed/commit/" + UUTILS_SED_VERSION.commit;
        parts.push('sed <a href="' + sedUrl + '"><code>' +
          UUTILS_SED_VERSION.short + '</code></a> (' + sedDate + ')');
      }
      if (typeof SITE_VERSION !== "undefined") {
        var siteDate = SITE_VERSION.date.split("T")[0];
        var siteUrl = "https://github.com/uutils/uutils.github.io/commit/" + SITE_VERSION.commit;
        parts.push('site <a href="' + siteUrl + '"><code>' +
          SITE_VERSION.short + '</code></a> (' + siteDate + ')');
      }
      el.innerHTML = parts.join(' &middot; ');
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
  <button class="playground-example">printf '🍎 apple\n🍌 banana\n🍒 cherry\n🥝 kiwi\n' | grep 🍌</button>
  <button class="playground-example">find . -name '*.md'</button>
  <button class="playground-example">diff -u shopping-old.txt shopping-new.txt</button>
  <button class="playground-example">sed -e 's/banana/🍌/g' -e 's/date/🌴/g' fruits.txt</button>
  <button class="playground-example">sort -n < numbers.txt | head -3</button>
  <button class="playground-example">date</button>
  <button class="playground-example">uname -a</button>
</div>

<script>
document.querySelectorAll('.playground-example').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var cmd = btn.textContent;
    // Reflect the clicked example in the URL so it can be shared/bookmarked.
    var url = new URL(window.location.href);
    url.searchParams.set('cmd', cmd);
    window.history.replaceState(null, '', url);
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
