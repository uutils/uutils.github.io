#!/bin/bash
# Patch mdbook theme to add language selector and utility links
# Usage: patch-mdbook-theme.sh <coreutils-docs-dir> <coreutils-l10n-dir>

set -euo pipefail

DOCS_DIR="${1:?Usage: $0 <coreutils-docs-dir> <coreutils-l10n-dir>}"
L10N_DIR="${2:?Usage: $0 <coreutils-docs-dir> <coreutils-l10n-dir>}"

HEAD_HBS="$DOCS_DIR/theme/head.hbs"

# Convert FTL locale code to URL code: strip region when language == region
# (e.g., fr-FR -> fr, es-ES -> es) but keep distinct ones (zh-Hans, pt-BR, nb-NO)
ftl_to_url() {
  local code="$1"
  local lang="${code%%-*}"
  local region="${code#*-}"
  # If region is the language uppercased (fr-FR, es-ES, etc.), simplify to just the language
  if [ "${region,,}" = "${lang,,}" ]; then
    echo "$lang"
  else
    echo "$code"
  fi
}

# Generate display name for a locale code
# Uses python3+babel if available, otherwise falls back to the code itself
locale_display_name() {
  local code="$1"
  if command -v python3 > /dev/null 2>&1; then
    local name
    name=$(python3 -c "
try:
    from babel import Locale
    print(Locale.parse('${code}'.replace('-', '_')).get_display_name())
except Exception:
    print('${code}')
" 2>/dev/null)
    # Capitalize first letter for consistency
    echo "${name^}"
  else
    echo "$code"
  fi
}

# Scan l10n repo to find which locales have translations
# Use a representative utility (ls) to find available locales
LANGS_JSON="['en', 'English']"
for ftl in "$L10N_DIR"/src/uu/ls/locales/*.ftl; do
  [ -f "$ftl" ] || continue
  ftl_name=$(basename "$ftl" .ftl)
  [ "$ftl_name" = "en-US" ] && continue

  url_code=$(ftl_to_url "$ftl_name")
  display=$(locale_display_name "$ftl_name")
  LANGS_JSON="$LANGS_JSON, ['$url_code', '$display']"
done

# Append styles and JS to head.hbs
cat >> "$HEAD_HBS" << 'ENDSTYLE'
<style>
    .util-links {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 0.75em;
    }
    .util-links a {
        color: var(--links);
        text-decoration: none;
    }
    .util-links a:hover {
        text-decoration: underline;
    }
    .lang-selector {
        position: relative;
        display: inline-block;
    }
    .lang-selector select {
        appearance: none;
        background: var(--bg);
        color: var(--fg);
        border: 1px solid var(--table-border-color);
        border-radius: 4px;
        padding: 2px 20px 2px 6px;
        font-size: 1em;
        cursor: pointer;
    }
    .lang-selector::after {
        content: "▾";
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        color: var(--fg);
        font-size: 0.8em;
    }
</style>
ENDSTYLE
cat >> "$HEAD_HBS" << 'ENDSCRIPT'
<script>
document.addEventListener('DOMContentLoaded', function() {
    var path = window.location.pathname;
    // Match both deployed (/coreutils/docs[-lang]/utils/X.html) and local (book[-lang]/utils/X.html)
    var match = path.match(/\/(?:coreutils\/)?docs(?:-([a-zA-Z]{2}(?:-[a-zA-Z]+)?))?\/utils\/(\w+)\.html/)
             || path.match(/\/book(?:-([a-zA-Z]{2}(?:-[a-zA-Z]+)?))?\/utils\/(\w+)\.html/);
    if (!match) return;

    var currentLang = match[1] || 'en';
    var utilName = match[2];

    // Find the existing .additional div and append our links there
    var additional = document.querySelector('.additional');
    if (!additional) return;

    var links = document.createElement('div');
    links.className = 'util-links';

    // Source code link
    var srcLink = document.createElement('a');
    srcLink.href = 'https://github.com/uutils/coreutils/tree/main/src/uu/' + utilName;
    srcLink.textContent = 'Source';
    srcLink.target = '_blank';
    links.appendChild(srcLink);

    // Report issue link
    var issueLink = document.createElement('a');
    issueLink.href = 'https://github.com/uutils/coreutils/issues/new?title=' + utilName + ':%20&labels=bug';
    issueLink.textContent = 'Report a bug';
    issueLink.target = '_blank';
    links.appendChild(issueLink);

    // Language selector
    var langDiv = document.createElement('div');
    langDiv.className = 'lang-selector';
    var select = document.createElement('select');
    var langs = LANGS_PLACEHOLDER;
    langs.forEach(function(l) {
        var opt = document.createElement('option');
        opt.value = l[0];
        opt.textContent = l[1];
        if (l[0] === currentLang) opt.selected = true;
        select.appendChild(opt);
    });
    select.addEventListener('change', function() {
        var newLang = this.value;
        var curPath = window.location.pathname;
        // Replace the directory segment right before /utils/:
        // .../book[-lang]/utils/X.html or .../docs[-lang]/utils/X.html
        var newPath = curPath.replace(
            /\/(book|docs)(?:-[a-zA-Z]{2}(?:-[a-zA-Z]+)?)?\/utils\//,
            function(m, base) {
                return '/' + base + (newLang === 'en' ? '' : '-' + newLang) + '/utils/';
            }
        );
        window.location.href = newPath;
    });
    langDiv.appendChild(select);
    links.appendChild(langDiv);

    additional.appendChild(links);

    // Generation date (localized) — append at the bottom of <main>
    var main = document.querySelector('#mdbook-content main');
    if (main) {
        var genDate = document.createElement('div');
        genDate.style.fontSize = '0.75em';
        genDate.style.color = 'var(--fg)';
        genDate.style.opacity = '0.6';
        genDate.style.marginTop = '2em';
        genDate.style.textAlign = 'right';
        var locale = currentLang.replace('_', '-');
        var dateStr = new Date(GENDATE_PLACEHOLDER).toLocaleDateString(locale, {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        genDate.textContent = dateStr;
        main.appendChild(genDate);
    }
});
</script>
ENDSCRIPT

# Inject the dynamically-built language list and generation date
GENDATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
sed -i "s|LANGS_PLACEHOLDER|[${LANGS_JSON}]|" "$HEAD_HBS"
sed -i "s|GENDATE_PLACEHOLDER|'${GENDATE}'|" "$HEAD_HBS"

echo "Patched $HEAD_HBS with language selector and utility links"
