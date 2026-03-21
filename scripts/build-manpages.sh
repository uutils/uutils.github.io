#!/bin/bash
# Build styled HTML manpages from man files
# Usage: build-manpages.sh <manpages-dir> <tldr-dir> <output-dir> <templates-dir> [lang] [fallback-tldr-dir]

set -euo pipefail

MANPAGES_DIR="${1:?Usage: $0 <manpages-dir> <tldr-dir> <output-dir> <templates-dir> [lang] [fallback-tldr-dir]}"
TLDR_DIR="${2:?}"
OUTPUT_DIR="${3:?}"
TEMPLATES_DIR="${4:?}"
LANG_CODE="${5:-en}"
FALLBACK_TLDR_DIR="${6:-}"

mkdir -p "$OUTPUT_DIR"

MANPAGE_TEMPLATE="$TEMPLATES_DIR/manpage.html"
INDEX_TEMPLATE="$TEMPLATES_DIR/manpage-index.html"

# Language display names
declare -A LANG_NAMES=(
  [en]="English" [fr]="Français" [de]="Deutsch" [es]="Español"
  [it]="Italiano" [pt]="Português" [pt-BR]="Português (Brasil)"
  [ja]="日本語" [ko]="한국어" [ru]="Русский" [zh]="中文"
  [uk]="Українська" [sv]="Svenska" [pl]="Polski" [tr]="Türkçe"
  [ar]="العربية" [cs]="Čeština" [da]="Dansk" [id]="Bahasa Indonesia"
)

LANG_NAME="${LANG_NAMES[$LANG_CODE]:-$LANG_CODE}"

# Determine manpages base path
if [ "$LANG_CODE" = "en" ]; then
  MANPAGES_PATH="manpages"
else
  MANPAGES_PATH="manpages-${LANG_CODE}"
fi

# Helper: parse a tldr markdown file into HTML
parse_tldr() {
  local file="$1"
  local html=""
  while IFS= read -r line; do
    case "$line" in
      "# "* | "> "* | "---" | "") ;;
      "- "*)
        desc="${line#- }"
        html="$html<div class=\"tldr-example\"><p class=\"tldr-desc\">$desc</p>"
        ;;
      '`'*'`')
        cmd="${line#\`}"
        cmd="${cmd%\`}"
        cmd=$(echo "$cmd" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
        html="$html<pre><code>$cmd</code></pre></div>"
        ;;
    esac
  done < "$file"
  echo "$html"
}

manpage_names=""

for man in "$MANPAGES_DIR"/usr/local/share/man/man*/*.1; do
  [ -f "$man" ] || continue
  name=$(basename "$man" .1)

  # Convert manpage, strip man2html header and footer
  man_content=$(man2html -r "$man" | sed '1,/^$/d' | sed '/This document was created by/,/<\/BODY>/d; /<\/HTML>/d')

  # Build tldr examples section
  tldr_html=""
  tldr_file="$TLDR_DIR/${name}.md"
  fallback_file="${FALLBACK_TLDR_DIR:+$FALLBACK_TLDR_DIR/${name}.md}"

  if [ -f "$tldr_file" ]; then
    # Translated tldr available
    tldr_html="<div class=\"tldr-section\"><h2>Examples (from tldr)</h2>"
    tldr_html="$tldr_html$(parse_tldr "$tldr_file")"
    tldr_html="$tldr_html</div>"
  elif [ -n "$FALLBACK_TLDR_DIR" ] && [ -f "$fallback_file" ] && [ "$LANG_CODE" != "en" ]; then
    # Fall back to English
    tldr_html="<div class=\"tldr-section\"><h2>Examples (from tldr)</h2>"
    tldr_html="$tldr_html<p class=\"tldr-untranslated\">These examples are not yet translated. <a href=\"https://github.com/tldr-pages/tldr/blob/main/CONTRIBUTING.md#translations\">Help translate them</a>.</p>"
    tldr_html="$tldr_html$(parse_tldr "$fallback_file")"
    tldr_html="$tldr_html</div>"
  fi

  # Apply template: split at placeholders, concatenate with content
  content_line=$(grep -n '{{CONTENT}}' "$MANPAGE_TEMPLATE" | cut -d: -f1)
  tldr_line=$(grep -n '{{TLDR}}' "$MANPAGE_TEMPLATE" | cut -d: -f1)

  {
    head -n $((content_line - 1)) "$MANPAGE_TEMPLATE" \
      | sed "s|{{NAME}}|${name}|g" \
      | sed "s|{{LANG_CODE}}|${LANG_CODE}|g" \
      | sed "s|{{LANG_NAME}}|${LANG_NAME}|g" \
      | sed "s|{{MANPAGES_PATH}}|${MANPAGES_PATH}|g"
    echo "$man_content"
    sed -n "$((content_line + 1)),$((tldr_line - 1))p" "$MANPAGE_TEMPLATE" \
      | sed "s|{{NAME}}|${name}|g" \
      | sed "s|{{LANG_CODE}}|${LANG_CODE}|g" \
      | sed "s|{{LANG_NAME}}|${LANG_NAME}|g" \
      | sed "s|{{MANPAGES_PATH}}|${MANPAGES_PATH}|g"
    echo "$tldr_html"
    tail -n +$((tldr_line + 1)) "$MANPAGE_TEMPLATE" \
      | sed "s|{{NAME}}|${name}|g" \
      | sed "s|{{LANG_CODE}}|${LANG_CODE}|g" \
      | sed "s|{{LANG_NAME}}|${LANG_NAME}|g" \
      | sed "s|{{MANPAGES_PATH}}|${MANPAGES_PATH}|g"
  } > "$OUTPUT_DIR/${name}.html"

  manpage_names="$manpage_names $name"
done

# Build index page
content_line=$(grep -n '{{LINKS}}' "$INDEX_TEMPLATE" | cut -d: -f1)
{
  head -n $((content_line - 1)) "$INDEX_TEMPLATE" \
    | sed "s|{{LANG_CODE}}|${LANG_CODE}|g" \
    | sed "s|{{LANG_NAME}}|${LANG_NAME}|g" \
    | sed "s|{{MANPAGES_PATH}}|${MANPAGES_PATH}|g"
  for name in $(echo $manpage_names | tr ' ' '\n' | sort); do
    echo "    <a href=\"${name}.html\" class=\"manpage-link\">${name}</a>"
  done
  tail -n +$((content_line + 1)) "$INDEX_TEMPLATE" \
    | sed "s|{{LANG_CODE}}|${LANG_CODE}|g" \
    | sed "s|{{LANG_NAME}}|${LANG_NAME}|g" \
    | sed "s|{{MANPAGES_PATH}}|${MANPAGES_PATH}|g"
} > "$OUTPUT_DIR/index.html"

echo "Built $(echo $manpage_names | wc -w) manpages ($LANG_NAME) in $OUTPUT_DIR"
