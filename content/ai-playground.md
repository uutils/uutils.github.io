+++
title = "AI Playground"
template = "page.html"
+++

<link rel="stylesheet" href="/ai-playground.css" />

<p>
  Describe what you want to do in plain English (or French, or any language).
  An LLM will turn it into a <strong>uutils</strong> shell command and run it
  right in your browser — no installation, no server-side execution.
</p>

<div id="ai-playground-root"></div>

<hr />

<h2>Classic terminal</h2>

<p>The full interactive playground is below. Commands generated above run here automatically.</p>

<div class="playground-loaders" id="playground-loaders">
  <span class="playground-loaders-label">Extra programs:</span>
</div>

<div id="wasm-playground"></div>

<p class="playground-version" id="playground-version"></p>

<script src="/wasm/locales.js" defer></script>
<script src="/wasm/version.js" defer></script>
<script src="/wasm/commands.js" defer></script>
<script src="/js/wasm-terminal.js" defer></script>
<script src="/js/ai-playground.js" defer></script>
<script defer>
  document.addEventListener("DOMContentLoaded", function() {
    // Init WASM terminal
    initPlayground("wasm-playground");

    // Init AI playground
    initAIPlayground("ai-playground-root");

    // Extra loaders bar
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
            if (mod) { markLoaded(); }
            else { btn.disabled = false; btn.textContent = prog + " unavailable"; }
          });
        });
        document.addEventListener("uutils:program-loaded", function(e) {
          if (e.detail && e.detail.module === prog) markLoaded();
        });
        if (window.isProgramLoaded(prog)) markLoaded();
        loaderBar.appendChild(btn);
      });
    }

    // Version footer
    var el = document.getElementById("playground-version");
    if (el) {
      var parts = [];
      if (typeof UUTILS_WASM_VERSION !== "undefined") {
        var date = UUTILS_WASM_VERSION.date.split("T")[0];
        var url = "https://github.com/uutils/coreutils/commit/" + UUTILS_WASM_VERSION.commit;
        parts.push('Built from uutils/coreutils <a href="' + url + '"><code>' + UUTILS_WASM_VERSION.short + '</code></a> (' + date + ')');
      }
      if (typeof SITE_VERSION !== "undefined") {
        var siteDate = SITE_VERSION.date.split("T")[0];
        var siteUrl = "https://github.com/uutils/uutils.github.io/commit/" + SITE_VERSION.commit;
        parts.push('site <a href="' + siteUrl + '"><code>' + SITE_VERSION.short + '</code></a> (' + siteDate + ')');
      }
      el.innerHTML = parts.join(' &middot; ');
    }
  });
</script>

<noscript>
  <p>JavaScript is required to run the interactive playground.</p>
</noscript>

## How it works

1. **Type a description** — e.g. *"find the 3 most common words in words.txt"*
2. **Click "Generate &amp; run"** — the LLM (via your own API key) translates it to a uutils command
3. **The command runs in WebAssembly** — inside your browser, nothing sent to our servers

Your API key is stored only in `localStorage` and is sent directly from your browser to the LLM provider you choose. It never passes through uutils servers.

Works with any OpenAI-compatible API: **OpenAI**, **Mistral**, **Groq**, **Ollama** (local), and more.

## Privacy

- The command generation request goes from your browser → your chosen LLM provider.
- The command execution happens entirely in-browser via WebAssembly.
- uutils servers receive nothing beyond normal static file requests.
