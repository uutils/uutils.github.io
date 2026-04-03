/**
 * Inline "Run" button handler for uutils code examples.
 * Lightweight alternative to the full terminal playground.
 */

(function () {
  let runtimePromise = null;

  function ensureRuntime() {
    if (runtimePromise) return runtimePromise;
    runtimePromise = new Promise((resolve, reject) => {
      if (document.querySelector('script[src="/js/wasm-terminal.js"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "/js/wasm-terminal.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return runtimePromise;
  }

  async function runExample(button) {
    const container = button.closest(".wasm-example");
    if (!container) return;

    const command = container.dataset.command;
    const outputEl = container.querySelector(".wasm-example-output");
    const preEl = outputEl.querySelector("pre");

    // Show loading state
    button.disabled = true;
    button.textContent = "Running...";
    outputEl.style.display = "block";
    preEl.textContent = "Loading...";

    try {
      await ensureRuntime();
      const output = await window.uutilsExecute(command);
      preEl.textContent = output || "(no output)";
    } catch (e) {
      preEl.textContent = "Error: " + e.message;
    }

    button.disabled = false;
    button.textContent = "Run";
  }

  // Use event delegation instead of inline onclick for CSP compatibility
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".wasm-run-btn");
    if (btn) runExample(btn);
  });
})();
