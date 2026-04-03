/**
 * Inline "Run" button handler for uutils code examples.
 * Lightweight alternative to the full terminal playground.
 */

(function () {
  let runtimeLoaded = false;

  async function ensureRuntime() {
    if (runtimeLoaded) return;
    // Load the terminal runtime which provides uutilsExecute
    const script = document.createElement("script");
    script.src = "/js/wasm-terminal.js";
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    runtimeLoaded = true;
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

  // Expose globally
  window.runWasmExample = runExample;
})();
