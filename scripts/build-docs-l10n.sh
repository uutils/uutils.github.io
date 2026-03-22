#!/bin/bash
# Build coreutils mdbook docs for all languages
# Usage: build-docs-l10n.sh <coreutils-dir>
#
# Expects:
# - uudoc already built (cargo run --bin uudoc done previously)
# - l10n locales already copied into coreutils/src/uu/*/locales/
# - English docs already built in coreutils/docs/book/
#
# For each language, swaps the target locale's .ftl files into en-US.ftl
# (since uudoc hardcodes that filename), re-runs uudoc, then builds mdbook.

set -euo pipefail

COREUTILS_DIR="${1:?Usage: $0 <coreutils-dir>}"

# Languages to build (besides English which is already built)
declare -A LANG_MAP=(
  [fr]="fr-FR" [de]="de" [es]="es-ES" [it]="it" [pt]="pt" [pt-BR]="pt-BR"
  [ja]="ja" [ko]="ko" [ru]="ru" [zh]="zh-Hans" [uk]="uk" [sv]="sv"
  [pl]="pl" [tr]="tr" [ar]="ar" [cs]="cs" [da]="da" [id]="id"
)

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Save a copy of all en-US.ftl files for restoration
cp -r "$COREUTILS_DIR/src" "$TMPDIR/src-backup"

# Find uudoc binary (already built by the English docs step)
UUDOC="$COREUTILS_DIR/target/debug/uudoc"
if [ ! -x "$UUDOC" ]; then
  UUDOC="$COREUTILS_DIR/target/release/uudoc"
fi

# Save English tldr.zip for restoration
EN_TLDR="$TMPDIR/tldr-en.zip"
cp "$COREUTILS_DIR/docs/tldr.zip" "$EN_TLDR" 2>/dev/null || true

# Download and repack translated tldr archives (uudoc expects pages/ prefix)
echo "Downloading translated tldr archives..."
for lang in "${!LANG_MAP[@]}"; do
  raw="$TMPDIR/tldr-raw-${lang}.zip"
  curl -sfL "https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.${lang}.zip" \
    -o "$raw" || true
  if [ -f "$raw" ]; then
    repack_dir="$TMPDIR/tldr-repack-${lang}"
    mkdir -p "$repack_dir/pages"
    (cd "$repack_dir" && unzip -o "$raw" -d pages/ > /dev/null 2>&1)
    (cd "$repack_dir" && zip -r "$TMPDIR/tldr-${lang}.zip" pages/ > /dev/null 2>&1)
    rm -rf "$repack_dir" "$raw"
  fi
done

restore_en() {
  # Restore all en-US.ftl files from backup
  for util_dir in "$COREUTILS_DIR"/src/uu/*/locales/; do
    util=$(basename "$(dirname "$util_dir")")
    backup="$TMPDIR/src-backup/uu/$util/locales/en-US.ftl"
    [ -f "$backup" ] && cp "$backup" "${util_dir}en-US.ftl"
  done
  local uucore_backup="$TMPDIR/src-backup/uucore/src/lib/mods/locales/en-US.ftl"
  [ -f "$uucore_backup" ] && cp "$uucore_backup" "$COREUTILS_DIR/src/uucore/src/lib/mods/locales/en-US.ftl"
  # Restore English tldr
  [ -f "$EN_TLDR" ] && cp "$EN_TLDR" "$COREUTILS_DIR/docs/tldr.zip"
}

cd "$COREUTILS_DIR"

for lang in "${!LANG_MAP[@]}"; do
  echo "=== Building $lang docs ==="
  ftl_name="${LANG_MAP[$lang]}"

  # Swap in translated tldr.zip (fall back to English if unavailable)
  if [ -f "$TMPDIR/tldr-${lang}.zip" ]; then
    cp "$TMPDIR/tldr-${lang}.zip" docs/tldr.zip
  fi

  # uudoc hardcodes en-US.ftl — swap in the target locale temporarily
  for util_dir in src/uu/*/locales/; do
    if [ -f "${util_dir}${ftl_name}.ftl" ]; then
      cp "${util_dir}${ftl_name}.ftl" "${util_dir}en-US.ftl"
    fi
  done
  if [ -f "src/uucore/src/lib/mods/locales/${ftl_name}.ftl" ]; then
    cp "src/uucore/src/lib/mods/locales/${ftl_name}.ftl" "src/uucore/src/lib/mods/locales/en-US.ftl"
  fi

  # Re-generate markdown with swapped locale
  if ! "$UUDOC" 2>&1 | tail -3; then
    echo "WARNING: uudoc failed for $lang, skipping"
    restore_en
    continue
  fi

  # Build mdbook to a language-specific output directory
  sed -i '/^multilingual/d' docs/book.toml
  (cd docs && mdbook build -d "book-${lang}")

  # Restore en-US.ftl files for next iteration
  restore_en

  echo "Built $lang docs in docs/book-${lang}/"
done

echo "All translated docs built."
