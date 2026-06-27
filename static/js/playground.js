/**
 * Page wiring for the playground (/playground).
 *
 * wasm-terminal.js provides the terminal engine and the window.* helpers
 * (initPlayground, runInTerminal, getLastCommand, …); this file connects them
 * to the page chrome: the on-demand "Load" buttons, the "Copy share link"
 * button, the locale dropdown, the available-commands list, the build-version
 * footer and the clickable examples.
 */
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

  // "Copy share link" button: builds a ?cmd= URL to the most recent command
  // so it can be shared - the link reruns that command on page load.
  var shareBtn = document.getElementById("playground-share-btn");
  var shareHint = document.getElementById("playground-share-hint");
  if (shareBtn) {
    var shareResetTimer = null;
    var buildShareUrl = function(cmd) {
      var url = new URL(window.location.href);
      url.search = "";
      url.hash = "";
      url.searchParams.set("cmd", cmd);
      return url.toString();
    };
    // Enable the button as soon as a command has been run.
    document.addEventListener("uutils:command-run", function(e) {
      shareBtn.disabled = false;
      if (shareHint && !shareBtn.classList.contains("copied")) {
        shareHint.textContent = "Shares: " + e.detail.command;
      }
    });
    shareBtn.addEventListener("click", function() {
      var cmd = window.getLastCommand ? window.getLastCommand() : "";
      if (!cmd) return;
      var link = buildShareUrl(cmd);
      navigator.clipboard.writeText(link).then(function() {
        shareBtn.classList.add("copied");
        shareBtn.textContent = "✓ Link copied!";
        if (shareHint) shareHint.textContent = link;
        if (shareResetTimer) clearTimeout(shareResetTimer);
        shareResetTimer = setTimeout(function() {
          shareBtn.classList.remove("copied");
          shareBtn.textContent = "🔗 Copy share link";
          if (shareHint) shareHint.textContent = "Shares: " + cmd;
        }, 2000);
      });
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

  // Clickable examples: just run the command in the terminal. We deliberately
  // leave the address bar alone — running an example shouldn't rewrite ?cmd=
  // out from under the user. The "Copy share link" button is the way to turn
  // the last command into a shareable ?cmd= URL.
  document.querySelectorAll('.playground-example').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cmd = btn.textContent;
      document.getElementById('wasm-playground').scrollIntoView({ behavior: 'smooth' });
      if (window.runInTerminal) {
        window.runInTerminal(cmd);
      }
    });
  });
});
