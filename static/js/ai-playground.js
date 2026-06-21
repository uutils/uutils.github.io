/**
 * AI Playground for uutils coreutils.
 *
 * Wraps the WASM terminal with a natural-language interface: the user types
 * what they want to do, an LLM (OpenAI-compatible) translates it into uutils
 * shell commands, and they run in the browser WASM terminal.
 */

const AI_STORAGE_KEY = "uutils_ai_settings";
const AI_HISTORY_KEY = "uutils_ai_history";
const MAX_HISTORY = 20;

// System prompt sent to the LLM on every request.
const SYSTEM_PROMPT = `You are an expert in Unix command-line tools and uutils coreutils.
Your job is to translate natural language descriptions into shell commands using uutils tools.

Available commands: cat, cut, comm, date, echo, expr, factor, find, fmt, fold, grep, head, join, ls, md5sum, nl, od, paste, printf, seq, sha256sum, shuf, sort, split, tail, tr, uniq, wc, diff, sed, and more standard coreutils.

Available sample files in the virtual filesystem:
- names.txt  (Alice, Bob, Charlie, Diana, Eve, Frank, Grace, Heidi)
- numbers.txt (42, 7, 13, 99, 1, 56, 23, 8, 100, 3)
- fruits.txt  (banana, apple, cherry, date, apple, banana, cherry, apple)
- csv.txt     (name,age,city - 4 rows)
- words.txt   (a few lines of English text)
- shopping-old.txt / shopping-new.txt (for diff examples)
- 🍎.md, 🍌.md, 🍒.md, 🥝.md (emoji filenames for find/ls)

Rules:
1. Reply with ONLY the shell command(s), nothing else.
2. Use pipes and redirections freely.
3. Prefer uutils tools over shell builtins when possible.
4. If multiple commands are needed, join them with newlines.
5. Never use sudo, curl, wget, or network access.
6. Keep it concise and idiomatic.
7. If the request is impossible with available tools, reply with: # Not possible: <reason>`;

// ─── Settings helpers ────────────────────────────────────────────────────────

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(AI_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveSettings(s) {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(s));
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(AI_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(h) {
  localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(h.slice(-MAX_HISTORY)));
}

// ─── LLM call ────────────────────────────────────────────────────────────────

async function askLLM(userMessage) {
  const s = loadSettings();
  const apiKey = s.apiKey || "";
  const baseUrl = (s.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = s.model || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("NO_KEY");
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 300,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content.trim();
}

// ─── UI builders ─────────────────────────────────────────────────────────────

function buildSettingsModal() {
  const s = loadSettings();
  const modal = document.createElement("div");
  modal.id = "ai-settings-modal";
  modal.innerHTML = `
    <div class="ai-modal-backdrop"></div>
    <div class="ai-modal-box" role="dialog" aria-modal="true" aria-label="AI settings">
      <h3>AI settings</h3>
      <label>
        API key
        <input id="ai-key-input" type="password" placeholder="sk-…" value="${s.apiKey || ""}" autocomplete="off" />
      </label>
      <label>
        Model
        <input id="ai-model-input" type="text" placeholder="gpt-4o-mini" value="${s.model || "gpt-4o-mini"}" />
      </label>
      <label>
        Base URL <span class="ai-hint">(OpenAI-compatible)</span>
        <input id="ai-url-input" type="text" placeholder="https://api.openai.com/v1" value="${s.baseUrl || ""}" />
      </label>
      <p class="ai-hint">
        Your key is stored only in this browser's localStorage and is never sent to our servers.
        Works with OpenAI, Mistral, Groq, Ollama, or any OpenAI-compatible endpoint.
      </p>
      <div class="ai-modal-actions">
        <button id="ai-settings-save" class="ai-btn-primary">Save</button>
        <button id="ai-settings-cancel" class="ai-btn-secondary">Cancel</button>
      </div>
    </div>`;

  modal.querySelector(".ai-modal-backdrop").addEventListener("click", () => modal.remove());
  modal.querySelector("#ai-settings-cancel").addEventListener("click", () => modal.remove());
  modal.querySelector("#ai-settings-save").addEventListener("click", () => {
    saveSettings({
      apiKey: modal.querySelector("#ai-key-input").value.trim(),
      model: modal.querySelector("#ai-model-input").value.trim() || "gpt-4o-mini",
      baseUrl: modal.querySelector("#ai-url-input").value.trim(),
    });
    modal.remove();
    showStatus("Settings saved.", "success");
  });

  return modal;
}

function addHistoryEntry(container, prompt, command, status) {
  const entry = document.createElement("div");
  entry.className = `ai-history-entry ai-status-${status}`;
  entry.innerHTML = `
    <div class="ai-history-prompt">${escHtml(prompt)}</div>
    <div class="ai-history-command">
      <code>${escHtml(command)}</code>
      <button class="ai-run-again" title="Run again" aria-label="Run again">▶</button>
    </div>`;
  entry.querySelector(".ai-run-again").addEventListener("click", () => {
    if (window.runInTerminal) window.runInTerminal(command);
  });
  container.insertBefore(entry, container.firstChild);
}

function showStatus(msg, type) {
  const el = document.getElementById("ai-status");
  if (!el) return;
  el.textContent = msg;
  el.className = `ai-status ai-status-${type}`;
  el.style.display = "block";
  if (type !== "loading") setTimeout(() => { el.style.display = "none"; }, 3000);
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Main init ────────────────────────────────────────────────────────────────

function initAIPlayground(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;

  root.innerHTML = `
    <div class="ai-playground">
      <div class="ai-input-area">
        <textarea
          id="ai-prompt"
          placeholder="Describe what you want to do… e.g. "show the 3 most common fruits" or "find all .md files and count lines""
          rows="2"
          aria-label="Natural language command description"
        ></textarea>
        <div class="ai-input-actions">
          <button id="ai-run-btn" class="ai-btn-primary" aria-label="Generate and run command">
            ✨ Generate &amp; run
          </button>
          <button id="ai-settings-btn" class="ai-btn-icon" aria-label="Open AI settings" title="AI settings">⚙</button>
        </div>
      </div>
      <div id="ai-status" class="ai-status" style="display:none"></div>
      <div id="ai-last-command" class="ai-last-command" style="display:none">
        <span class="ai-last-label">Command:</span>
        <code id="ai-last-code"></code>
        <button id="ai-copy-btn" class="ai-btn-icon" title="Copy to clipboard" aria-label="Copy command">📋</button>
      </div>
      <div id="ai-history" class="ai-history"></div>
    </div>`;

  // Restore history
  const histContainer = root.querySelector("#ai-history");
  const history = loadHistory();
  history.slice().reverse().forEach(({ prompt, command, status }) => {
    addHistoryEntry(histContainer, prompt, command, status || "success");
  });

  // Settings button
  root.querySelector("#ai-settings-btn").addEventListener("click", () => {
    document.body.appendChild(buildSettingsModal());
    document.getElementById("ai-key-input").focus();
  });

  // Copy button
  root.querySelector("#ai-copy-btn").addEventListener("click", () => {
    const code = document.getElementById("ai-last-code").textContent;
    navigator.clipboard.writeText(code).then(() => showStatus("Copied!", "success"));
  });

  // Submit on Ctrl+Enter or button
  const textarea = root.querySelector("#ai-prompt");
  textarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  });
  root.querySelector("#ai-run-btn").addEventListener("click", handleSubmit);

  async function handleSubmit() {
    const prompt = textarea.value.trim();
    if (!prompt) return;

    const btn = root.querySelector("#ai-run-btn");
    btn.disabled = true;
    showStatus("Thinking…", "loading");

    try {
      const command = await askLLM(prompt);

      if (command.startsWith("# Not possible:")) {
        showStatus(command.slice(2), "error");
        btn.disabled = false;
        return;
      }

      // Show last command bar
      const lastBar = document.getElementById("ai-last-command");
      document.getElementById("ai-last-code").textContent = command;
      lastBar.style.display = "flex";

      showStatus("Running…", "loading");

      // Run in terminal
      if (window.runInTerminal) {
        window.runInTerminal(command);
      }

      // Save to history
      const h = loadHistory();
      h.push({ prompt, command, status: "success" });
      saveHistory(h);
      addHistoryEntry(histContainer, prompt, command, "success");

      textarea.value = "";
      showStatus("Done!", "success");
    } catch (err) {
      if (err.message === "NO_KEY") {
        showStatus("No API key set — click ⚙ to add one.", "error");
        document.body.appendChild(buildSettingsModal());
      } else {
        showStatus(`Error: ${err.message}`, "error");
      }
    } finally {
      btn.disabled = false;
    }
  }
}

window.initAIPlayground = initAIPlayground;
