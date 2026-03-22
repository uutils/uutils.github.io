#!/bin/bash
# Patch mdbook theme to add language selector and utility links
# Usage: patch-mdbook-theme.sh <coreutils-docs-dir> [current-lang]

set -euo pipefail

DOCS_DIR="${1:?Usage: $0 <coreutils-docs-dir> [current-lang]}"
CURRENT_LANG="${2:-en}"

HEAD_HBS="$DOCS_DIR/theme/head.hbs"

# Append language selector and utility links to head.hbs
cat >> "$HEAD_HBS" << 'ENDSTYLE'
<style>
    .util-bar {
        display: flex;
        justify-content: flex-end;
        gap: 15px;
        align-items: center;
        font-size: 0.85em;
        margin-bottom: 10px;
    }
    .util-bar a {
        color: var(--links);
        text-decoration: none;
    }
    .util-bar a:hover {
        text-decoration: underline;
    }
    .lang-selector {
        position: relative;
    }
    .lang-selector select {
        appearance: none;
        background: var(--bg);
        color: var(--fg);
        border: 1px solid var(--table-border-color);
        border-radius: 4px;
        padding: 4px 24px 4px 8px;
        font-size: 0.85em;
        cursor: pointer;
    }
    .lang-selector::after {
        content: "▾";
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--fg);
    }
</style>
ENDSTYLE

# Add JavaScript for language switching and utility bar injection
cat >> "$HEAD_HBS" << ENDSCRIPT
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Only add util-bar on utility pages
    var path = window.location.pathname;
    var match = path.match(/\/coreutils\/docs(?:-([a-z]{2}(?:-[A-Z]{2})?))?\/utils\/(\w+)\.html/);
    if (!match) return;

    var currentLang = match[1] || 'en';
    var utilName = match[2];

    var bar = document.createElement('div');
    bar.className = 'util-bar';

    // Source code link
    var srcLink = document.createElement('a');
    srcLink.href = 'https://github.com/uutils/coreutils/tree/main/src/uu/' + utilName;
    srcLink.textContent = 'Source code';
    srcLink.target = '_blank';
    bar.appendChild(srcLink);

    // Report issue link
    var issueLink = document.createElement('a');
    issueLink.href = 'https://github.com/uutils/coreutils/issues/new?title=' + utilName + ':%20&labels=bug';
    issueLink.textContent = 'Report an issue';
    issueLink.target = '_blank';
    bar.appendChild(issueLink);

    // Language selector
    var langDiv = document.createElement('div');
    langDiv.className = 'lang-selector';
    var select = document.createElement('select');
    var langs = {
        'en': 'English', 'fr': 'Français', 'de': 'Deutsch', 'es': 'Español',
        'it': 'Italiano', 'pt': 'Português', 'pt-BR': 'Português (BR)',
        'ja': '日本語', 'ko': '한국어', 'ru': 'Русский', 'zh': '中文',
        'uk': 'Українська', 'sv': 'Svenska', 'pl': 'Polski', 'tr': 'Türkçe'
    };
    for (var code in langs) {
        var opt = document.createElement('option');
        opt.value = code;
        opt.textContent = langs[code];
        if (code === currentLang) opt.selected = true;
        select.appendChild(opt);
    }
    select.addEventListener('change', function() {
        var newLang = this.value;
        var suffix = newLang === 'en' ? '' : '-' + newLang;
        window.location.href = '/coreutils/docs' + suffix + '/utils/' + utilName + '.html';
    });
    langDiv.appendChild(select);
    bar.appendChild(langDiv);

    // Insert bar at the top of the content
    var main = document.querySelector('main');
    if (main) main.insertBefore(bar, main.firstChild);
});
</script>
ENDSCRIPT

echo "Patched $HEAD_HBS with language selector and utility links"
