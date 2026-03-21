#!/bin/bash
# Build manpages for all languages
# Usage: build-all-manpages.sh <coreutils-dir> <output-dir> <templates-dir>

set -euo pipefail

COREUTILS_DIR="${1:?Usage: $0 <coreutils-dir> <output-dir> <templates-dir>}"
OUTPUT_DIR="${2:?}"
TEMPLATES_DIR="${3:?}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Language config: lang-code -> LANG env value
declare -A LANG_MAP=(
  [en]="en_US.UTF-8"
  [fr]="fr_FR.UTF-8"
  [de]="de_DE.UTF-8"
  [es]="es_ES.UTF-8"
  [it]="it_IT.UTF-8"
  [pt]="pt_PT.UTF-8"
  [pt-BR]="pt_BR.UTF-8"
  [ja]="ja_JP.UTF-8"
  [ko]="ko_KR.UTF-8"
  [ru]="ru_RU.UTF-8"
  [zh]="zh_CN.UTF-8"
  [uk]="uk_UA.UTF-8"
  [sv]="sv_SE.UTF-8"
  [pl]="pl_PL.UTF-8"
  [tr]="tr_TR.UTF-8"
  [ar]="ar_SA.UTF-8"
  [cs]="cs_CZ.UTF-8"
  [da]="da_DK.UTF-8"
  [id]="id_ID.UTF-8"
)

# manpage lang code -> tldr lang code (when they differ)
declare -A MANPAGE_TO_TLDR=(
  [fr-FR]="fr"
  [es-ES]="es"
  [zh-Hans]="zh"
)


TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Download tldr archives
echo "Downloading tldr archives..."
mkdir -p "$TMPDIR/tldr-archives"
curl -sfL "https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.zip" \
  -o "$TMPDIR/tldr-archives/en.zip" || true
for lang in fr de es it pt pt-BR ja ko ru zh uk sv pl tr ar cs da id; do
  curl -sfL "https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.${lang}.zip" \
    -o "$TMPDIR/tldr-archives/${lang}.zip" || true
done

# Extract English tldr as fallback for untranslated pages
EN_TLDR_DIR="$TMPDIR/tldr-pages-en"
mkdir -p "$EN_TLDR_DIR"
if [ -f "$TMPDIR/tldr-archives/en.zip" ]; then
  unzip -o "$TMPDIR/tldr-archives/en.zip" -d "$TMPDIR/tldr-extract-en" > /dev/null 2>&1 || true
  find "$TMPDIR/tldr-extract-en" -name "*.md" -exec cp {} "$EN_TLDR_DIR/" \; 2>/dev/null || true
fi

# Build uudoc once (if not already built by the docs step)
make -C "$COREUTILS_DIR" build-uudoc 2>&1 | tail -1

# Generate and build manpages for each language
for lang in "${!LANG_MAP[@]}"; do
  echo "=== Building $lang manpages ==="

  # Determine the tldr/url lang code
  tldr_lang="${MANPAGE_TO_TLDR[$lang]:-$lang}"

  # Extract tldr pages for this language
  tldr_dir="$TMPDIR/tldr-pages-${lang}"
  mkdir -p "$tldr_dir"
  if [ "$lang" != "en" ]; then
    archive="$TMPDIR/tldr-archives/${tldr_lang}.zip"
    if [ -f "$archive" ]; then
      extract_dir="$TMPDIR/tldr-extract-${lang}"
      unzip -o "$archive" -d "$extract_dir" > /dev/null 2>&1 || true
      find "$extract_dir" -name "*.md" -exec cp {} "$tldr_dir/" \; 2>/dev/null || true
    fi
  else
    tldr_dir="$EN_TLDR_DIR"
  fi

  # Generate manpages with the right locale (reuse already-built uudoc)
  manpages_dir="$TMPDIR/manpages-${lang}"
  cd "$COREUTILS_DIR"
  if ! LANG="${LANG_MAP[$lang]}" make install-manpages DESTDIR="$manpages_dir" 2>&1; then
    echo "WARNING: Failed to generate manpages for $lang, skipping"
    continue
  fi
  cd - > /dev/null

  # Determine output subdirectory
  if [ "$lang" = "en" ]; then
    out_subdir="$OUTPUT_DIR/en"
  else
    out_subdir="$OUTPUT_DIR/${tldr_lang}"
  fi

  # Skip if no manpages were generated
  if ! ls "$manpages_dir"/usr/local/share/man/man*/*.1 > /dev/null 2>&1; then
    echo "WARNING: No manpages found for $lang, skipping HTML generation"
    continue
  fi

  # Build HTML (pass English tldr as fallback for non-English builds)
  if [ "$lang" = "en" ]; then
    "$SCRIPT_DIR/build-manpages.sh" "$manpages_dir" "$tldr_dir" "$out_subdir" "$TEMPLATES_DIR" "$tldr_lang"
  else
    "$SCRIPT_DIR/build-manpages.sh" "$manpages_dir" "$tldr_dir" "$out_subdir" "$TEMPLATES_DIR" "$tldr_lang" "$EN_TLDR_DIR"
  fi
done

echo "All manpages built in $OUTPUT_DIR"
