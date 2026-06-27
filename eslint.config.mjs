// Flat ESLint config for the playground's browser-side JavaScript.
//
// These files run in the browser (no bundler, no module system) and lean on a
// handful of globals provided by the page or by third-party scripts loaded via
// <script> tags (xterm.js, the WASI shim) and by build-generated files
// (/wasm/commands.js, /wasm/version.js). They are declared below so that
// no-undef stays useful without flagging those.
//
// Run locally with:  npm run lint   (or: npx eslint static/js)
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    // Shared settings for every playground script.
    files: ["static/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser environment
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        CustomEvent: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        WebAssembly: "readonly",
        SharedArrayBuffer: "readonly",
        // Third-party globals loaded via <script> on the playground page
        Terminal: "readonly",
        FitAddon: "readonly",
        WebLinksAddon: "readonly",
        // Generated at build time and injected before these scripts: command
        // list from /wasm/commands.js, locale and version strings from
        // /wasm/version.js. Absent in local dev (the code guards with typeof).
        WASM_COMMANDS: "readonly",
        WASM_LOCALES: "readonly",
        UUTILS_WASM_VERSION: "readonly",
        UUTILS_GREP_VERSION: "readonly",
        UUTILS_FINDUTILS_VERSION: "readonly",
        UUTILS_DIFFUTILS_VERSION: "readonly",
        UUTILS_SED_VERSION: "readonly",
        SITE_VERSION: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // playground.js drives the page and calls into the terminal API that
    // wasm-terminal.js exposes on `window` (loaded as a separate <script>).
    // These live here rather than in the shared block so they don't clash with
    // their own definitions in wasm-terminal.js (no-redeclare).
    files: ["static/js/playground.js"],
    languageOptions: {
      globals: {
        initPlayground: "readonly",
        runInTerminal: "readonly",
        loadProgram: "readonly",
        isProgramLoaded: "readonly",
        programSize: "readonly",
        uutilsPrograms: "readonly",
        getLastCommand: "readonly",
        setLocale: "readonly",
        uutilsExecute: "readonly",
      },
    },
  },
];
