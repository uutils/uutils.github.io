/**
 * Replays the recorded coreutils diagnostics as a terminal animation.
 *
 * Each `.diag-replay` element names a cast under /casts/. The cast holds the
 * command line and the raw ANSI the utility printed when its stderr was a
 * terminal, so the colours come from the escape codes themselves rather than
 * from a palette maintained here.
 *
 * The element ships with a static, already-coloured <pre> inside it. That is
 * what a visitor sees without JavaScript, and it stays on screen until xterm.js
 * has loaded and is ready to draw, so nothing ever flashes empty.
 */

(function () {
  // Same xterm.js as the playground (see wasm-terminal.js) — keep the versions
  // and the integrity hashes in sync with it so both share one cache entry.
  const XTERM_CSS = "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css";
  const XTERM_CSS_INTEGRITY = "sha384-tStR1zLfWgsiXCF3IgfB3lBa8KmBe/lG287CL9WCeKgQYcp1bjb4/+mwN6oti4Co";
  const XTERM_JS = "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.min.js";
  const XTERM_JS_INTEGRITY = "sha384-J4qzUjBl1FxyLsl/kQPQIOeINsmp17OHYXDOMpMxlKX53ZfYsL+aWHpgArvOuof9";

  // Catppuccin Mocha, matching --terminal-bg-color/--terminal-fg-color in
  // style.css and the playground's own theme.
  const THEME = {
    background: "#1e1e2e",
    foreground: "#cdd6f4",
    cursor: "#f5e0dc",
    selectionBackground: "#585b7066",
    black: "#45475a",
    red: "#f38ba8",
    green: "#a6e3a1",
    yellow: "#f9e2af",
    blue: "#89b4fa",
    magenta: "#f5c2e7",
    cyan: "#94e2d5",
    white: "#bac2de",
  };

  const TYPE_MS = 45; // per character of the command line
  const PAUSE_MS = 250; // beat between pressing Enter and the report

  let xtermPromise = null;

  function loadScript(src, integrity) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.integrity = integrity;
      s.crossOrigin = "anonymous";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function loadCSS(href, integrity) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.integrity = integrity;
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadXterm() {
    if (!xtermPromise) {
      loadCSS(XTERM_CSS, XTERM_CSS_INTEGRITY);
      xtermPromise = loadScript(XTERM_JS, XTERM_JS_INTEGRITY);
    }
    return xtermPromise;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Write the recording to `term`: the command typed a character at a time,
   * then the whole report at once, the way the utility itself prints it. With
   * `animate` false the command lands instantly too, which is what
   * reduced-motion wants.
   */
  async function play(term, cast, animate, cancelled) {
    term.reset();
    term.write("\x1b[38;5;209m$\x1b[0m ");

    if (!animate) {
      term.write(cast.command + "\r\n" + cast.output.replace(/\n/g, "\r\n"));
      return;
    }

    for (const ch of Array.from(cast.command)) {
      if (cancelled()) return;
      term.write(ch);
      await sleep(TYPE_MS);
    }
    term.write("\r\n");
    await sleep(PAUSE_MS);
    if (cancelled()) return;
    term.write(cast.output.replace(/\n/g, "\r\n"));
  }

  async function setup(el) {
    const cast = await fetch(el.dataset.cast).then((r) => {
      if (!r.ok) throw new Error(`${el.dataset.cast}: HTTP ${r.status}`);
      return r.json();
    });
    await loadXterm();

    const screen = document.createElement("div");
    screen.className = "diag-screen";
    const term = new window.Terminal({
      cols: cast.cols,
      rows: cast.rows,
      fontSize: 13,
      fontFamily: '"Fira Code", "Cascadia Code", Menlo, Monaco, monospace',
      theme: THEME,
      disableStdin: true,
      cursorBlink: true,
      convertEol: true,
      scrollback: 0,
    });

    // Swap the static fallback out only now that the terminal can be drawn.
    // The fallback holds the prompt line as well as the report, because the
    // animation types the prompt itself and would otherwise repeat it.
    const fallback = el.querySelector(".diag-fallback");
    el.insertBefore(screen, fallback);
    term.open(screen);
    if (fallback) fallback.remove();

    const button = document.createElement("button");
    button.type = "button";
    button.className = "diag-replay-btn";
    button.textContent = "Replay";
    el.appendChild(button);

    // A click while a replay is running supersedes it: the in-flight play() sees
    // its generation go stale and stops writing.
    let generation = 0;
    const replay = () => {
      const mine = ++generation;
      button.disabled = true;
      play(term, cast, !prefersReducedMotion(), () => generation !== mine)
        .finally(() => {
          if (generation === mine) button.disabled = false;
        });
    };
    button.addEventListener("click", replay);

    return replay;
  }

  function init() {
    const elements = Array.from(document.querySelectorAll(".diag-replay"));
    if (elements.length === 0) return;

    for (const el of elements) {
      let started = false;
      const observer = new IntersectionObserver((entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        observer.disconnect();
        setup(el).then(
          (replay) => replay(),
          // Loading or fetching failed: the static <pre> is still in place, so
          // the example is readable — just not animated.
          (err) => console.warn("diagnostics replay unavailable:", err)
        );
      }, { rootMargin: "100px" });
      observer.observe(el);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
