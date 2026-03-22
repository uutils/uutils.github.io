#!/bin/bash
# Patch mdbook theme to add language selector and utility links
# Usage: patch-mdbook-theme.sh <coreutils-docs-dir> <coreutils-l10n-dir>

set -euo pipefail

DOCS_DIR="${1:?Usage: $0 <coreutils-docs-dir> <coreutils-l10n-dir>}"
L10N_DIR="${2:?Usage: $0 <coreutils-docs-dir> <coreutils-l10n-dir>}"

HEAD_HBS="$DOCS_DIR/theme/head.hbs"

# Language display names (ftl filename -> display name)
declare -A LANG_NAMES=(
  [en-US]="English"
  [ar]="العربية" [ast]="Asturianu" [ca]="Català" [cs]="Čeština"
  [da]="Dansk" [de]="Deutsch" [eo]="Esperanto" [es-ES]="Español"
  [fi]="Suomi" [fr-FR]="Français" [he]="עברית" [id]="Bahasa Indonesia"
  [it]="Italiano" [ja]="日本語" [kab]="Taqbaylit" [ko]="한국어"
  [nb-NO]="Norsk Bokmål" [ne]="नेपाली" [pl]="Polski" [pt]="Português"
  [pt-BR]="Português (Brasil)" [ru]="Русский" [sv]="Svenska"
  [tr]="Türkçe" [uk]="Українська" [vi]="Tiếng Việt"
  [zh-Hans]="中文 (简体)" [zh-Hant]="中文 (繁體)"
)

# ftl filename -> URL lang code (used in /coreutils/docs-{code}/)
declare -A FTL_TO_URL=(
  [en-US]="en" [fr-FR]="fr" [es-ES]="es" [zh-Hans]="zh" [zh-Hant]="zh-Hant"
  [pt-BR]="pt-BR" [nb-NO]="nb-NO"
)
# For others, the ftl name IS the URL code (ar, de, it, ja, etc.)

# Scan l10n repo to find which locales have translations
# Use a representative utility (ls) to find available locales
LANGS_JSON="['en', 'English']"
for ftl in "$L10N_DIR"/src/uu/ls/locales/*.ftl; do
  [ -f "$ftl" ] || continue
  ftl_name=$(basename "$ftl" .ftl)
  [ "$ftl_name" = "en-US" ] && continue

  display="${LANG_NAMES[$ftl_name]:-$ftl_name}"
  url_code="${FTL_TO_URL[$ftl_name]:-$ftl_name}"
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
});
</script>
ENDSCRIPT

# Inject the dynamically-built language list
sed -i "s|LANGS_PLACEHOLDER|[${LANGS_JSON}]|" "$HEAD_HBS"

echo "Patched $HEAD_HBS with language selector and utility links"
