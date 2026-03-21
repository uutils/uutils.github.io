#!/bin/bash
# Build styled HTML manpages from man files
# Usage: build-manpages.sh <manpages-dir> <tldr-dir> <output-dir> <templates-dir>

set -euo pipefail

MANPAGES_DIR="${1:?Usage: $0 <manpages-dir> <tldr-dir> <output-dir> <templates-dir>}"
TLDR_DIR="${2:?}"
OUTPUT_DIR="${3:?}"
TEMPLATES_DIR="${4:?}"

mkdir -p "$OUTPUT_DIR"

MANPAGE_TEMPLATE="$TEMPLATES_DIR/manpage.html"
INDEX_TEMPLATE="$TEMPLATES_DIR/manpage-index.html"

manpage_names=""

for man in "$MANPAGES_DIR"/usr/local/share/man/man*/*.1; do
  [ -f "$man" ] || continue
  name=$(basename "$man" .1)

  # Convert manpage, strip man2html header and footer
  man_content=$(man2html -r "$man" | sed '1,/^$/d' | sed '/This document was created by/,/<\/BODY>/d; /<\/HTML>/d')

  # Build tldr examples section
  tldr_html=""
  tldr_file="$TLDR_DIR/${name}.md"
  if [ -f "$tldr_file" ]; then
    tldr_html="<div class=\"tldr-section\"><h2>Examples (from tldr)</h2>"
    while IFS= read -r line; do
      case "$line" in
        "# "* | "> "* | "---" | "") ;;
        "- "*)
          desc="${line#- }"
          tldr_html="$tldr_html<div class=\"tldr-example\"><p class=\"tldr-desc\">$desc</p>"
          ;;
        '`'*'`')
          cmd="${line#\`}"
          cmd="${cmd%\`}"
          cmd=$(echo "$cmd" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
          tldr_html="$tldr_html<pre><code>$cmd</code></pre></div>"
          ;;
      esac
    done < "$tldr_file"
    tldr_html="$tldr_html</div>"
  fi

  # Apply template: split at placeholders, concatenate with content
  # Get line numbers of placeholders
  content_line=$(grep -n '{{CONTENT}}' "$MANPAGE_TEMPLATE" | cut -d: -f1)
  tldr_line=$(grep -n '{{TLDR}}' "$MANPAGE_TEMPLATE" | cut -d: -f1)

  {
    # Before {{CONTENT}}
    head -n $((content_line - 1)) "$MANPAGE_TEMPLATE" | sed "s|{{NAME}}|${name}|g"
    # The manpage content
    echo "$man_content"
    # Between {{CONTENT}} and {{TLDR}}
    sed -n "$((content_line + 1)),$((tldr_line - 1))p" "$MANPAGE_TEMPLATE" | sed "s|{{NAME}}|${name}|g"
    # The tldr content
    echo "$tldr_html"
    # After {{TLDR}}
    tail -n +$((tldr_line + 1)) "$MANPAGE_TEMPLATE" | sed "s|{{NAME}}|${name}|g"
  } > "$OUTPUT_DIR/${name}.html"

  manpage_names="$manpage_names $name"
done

# Build index page
content_line=$(grep -n '{{LINKS}}' "$INDEX_TEMPLATE" | cut -d: -f1)
{
  head -n $((content_line - 1)) "$INDEX_TEMPLATE"
  for name in $(echo $manpage_names | tr ' ' '\n' | sort); do
    echo "    <a href=\"${name}.html\" class=\"manpage-link\">${name}</a>"
  done
  tail -n +$((content_line + 1)) "$INDEX_TEMPLATE"
} > "$OUTPUT_DIR/index.html"

echo "Built $(echo $manpage_names | wc -w) manpages in $OUTPUT_DIR"
