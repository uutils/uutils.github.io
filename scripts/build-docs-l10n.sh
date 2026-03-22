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

COREUTILS_DIR="$(cd "${1:?Usage: $0 <coreutils-dir>}" && pwd)"

# ftl filename -> URL lang code (when they differ)
declare -A FTL_TO_URL=(
  [fr-FR]="fr" [es-ES]="es" [zh-Hans]="zh" [zh-Hant]="zh-Hant"
  [pt-BR]="pt-BR" [nb-NO]="nb-NO"
)

# Discover available locales from the coreutils source (l10n already copied in)
# Use ls utility as reference
declare -A LANG_MAP=()
for ftl in "$COREUTILS_DIR"/src/uu/ls/locales/*.ftl; do
  [ -f "$ftl" ] || continue
  ftl_name=$(basename "$ftl" .ftl)
  [ "$ftl_name" = "en-US" ] && continue
  url_code="${FTL_TO_URL[$ftl_name]:-$ftl_name}"
  LANG_MAP[$url_code]="$ftl_name"
done

echo "Found ${#LANG_MAP[@]} locales to build: ${!LANG_MAP[*]}"

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

# Merge translated FTL with English: translated keys take priority,
# English keys fill in any gaps (handles empty files, partial translations)
merge_ftl() {
  local english="$1"
  local translated="$2"
  local output="$3"

  # If translated file is empty or missing, keep English as-is
  if [ ! -s "$translated" ]; then
    cp "$english" "$output"
    return
  fi

  # Extract top-level message IDs from the translated file
  # (lines starting with identifier = ...)
  local translated_keys
  translated_keys=$(grep -oP '^[a-zA-Z][a-zA-Z0-9_-]*(?=\s*=)' "$translated" || true)

  # Start with the translated content
  cp "$translated" "$output"

  # Append English entries whose keys are NOT in the translated file
  local in_entry=false
  local current_key=""
  local entry_lines=""
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^[a-zA-Z][a-zA-Z0-9_-]*[[:space:]]*= ]]; then
      # Flush previous entry if it was missing from translation
      if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
        printf '%s\n' "$entry_lines" >> "$output"
      fi
      current_key="${line%%[[:space:]]*=*}"
      # Trim: extract just the identifier
      current_key=$(echo "$line" | grep -oP '^[a-zA-Z][a-zA-Z0-9_-]*')
      entry_lines="$line"
    elif [[ "$line" =~ ^[[:space:]] ]] && [ -n "$current_key" ]; then
      # Continuation line (indented = part of current entry)
      entry_lines="$entry_lines"$'\n'"$line"
    else
      # Blank line or comment — flush previous entry if needed
      if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
        printf '%s\n' "$entry_lines" >> "$output"
      fi
      current_key=""
      entry_lines=""
    fi
  done < "$english"
  # Flush last entry
  if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
    printf '%s\n' "$entry_lines" >> "$output"
  fi
}

restore_en() {
  # Restore all en-US.ftl files from backup
  for util_dir in "$COREUTILS_DIR"/src/uu/*/locales/; do
    util=$(basename "$(dirname "$util_dir")")
    backup="$TMPDIR/src-backup/uu/$util/locales/en-US.ftl"
    [ -f "$backup" ] && cp "$backup" "${util_dir}en-US.ftl"
  done
  local uucore_backup="$TMPDIR/src-backup/uucore/locales/en-US.ftl"
  [ -f "$uucore_backup" ] && cp "$uucore_backup" "$COREUTILS_DIR/src/uucore/locales/en-US.ftl"
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

  # uudoc hardcodes en-US.ftl — merge translated locale into en-US.ftl
  # so that untranslated keys fall back to English
  for util_dir in src/uu/*/locales/; do
    if [ -f "${util_dir}${ftl_name}.ftl" ]; then
      util=$(basename "$(dirname "$util_dir")")
      en_backup="$TMPDIR/src-backup/uu/$util/locales/en-US.ftl"
      merge_ftl "$en_backup" "${util_dir}${ftl_name}.ftl" "${util_dir}en-US.ftl"
    fi
  done
  if [ -f "src/uucore/locales/${ftl_name}.ftl" ]; then
    uucore_en_backup="$TMPDIR/src-backup/uucore/locales/en-US.ftl"
    merge_ftl "$uucore_en_backup" "src/uucore/locales/${ftl_name}.ftl" "src/uucore/locales/en-US.ftl"
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
