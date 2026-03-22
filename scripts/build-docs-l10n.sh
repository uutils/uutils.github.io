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
# Merge with English so missing examples fall back to English
echo "Downloading translated tldr archives..."
EN_TLDR_DIR="$TMPDIR/tldr-en-dir"
if [ -f "$EN_TLDR" ]; then
  mkdir -p "$EN_TLDR_DIR"
  (cd "$EN_TLDR_DIR" && unzip -o "$EN_TLDR" > /dev/null 2>&1)
fi
for lang in "${!LANG_MAP[@]}"; do
  raw="$TMPDIR/tldr-raw-${lang}.zip"
  curl -sfL "https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.${lang}.zip" \
    -o "$raw" || true
  if [ -f "$raw" ]; then
    repack_dir="$TMPDIR/tldr-repack-${lang}"
    mkdir -p "$repack_dir/pages"
    (cd "$repack_dir" && unzip -o "$raw" -d pages/ > /dev/null 2>&1)

    # Record which utilities have translated examples (before merging with English)
    translated_list="$TMPDIR/tldr-translated-${lang}.list"
    (cd "$repack_dir" && find pages -name "*.md" -printf '%f\n' | sed 's/\.md$//' | sort -u > "$translated_list")

    # Merge: start with English, overlay translated on top
    if [ -d "$EN_TLDR_DIR" ]; then
      merge_dir="$TMPDIR/tldr-merge-${lang}"
      cp -r "$EN_TLDR_DIR" "$merge_dir"
      cp -r "$repack_dir/pages"/* "$merge_dir/pages/" 2>/dev/null || true
      (cd "$merge_dir" && zip -r "$TMPDIR/tldr-${lang}.zip" pages/ > /dev/null 2>&1)
      rm -rf "$merge_dir"
    else
      (cd "$repack_dir" && zip -r "$TMPDIR/tldr-${lang}.zip" pages/ > /dev/null 2>&1)
    fi
    rm -rf "$repack_dir" "$raw"
  fi
done

# Merge translated FTL with English: translated keys take priority,
# English keys fill in any gaps (handles empty files, partial translations).
# Sets MERGE_HAD_FALLBACK=1 if any English fallback entries were added.
merge_ftl() {
  local english="$1"
  local translated="$2"
  local output="$3"
  MERGE_HAD_FALLBACK=0

  # If translated file is empty or missing, keep English as-is
  if [ ! -s "$translated" ]; then
    cp "$english" "$output"
    MERGE_HAD_FALLBACK=1
    return 0
  fi

  # Extract top-level message IDs from the translated file
  # (lines starting with identifier = ...)
  local translated_keys
  translated_keys=$(grep -oP '^[a-zA-Z][a-zA-Z0-9_-]*(?=\s*=)' "$translated" || true)

  # Start with the translated content
  cp "$translated" "$output"

  # Append English entries whose keys are NOT in the translated file
  local current_key=""
  local entry_lines=""
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ "$line" =~ ^[a-zA-Z][a-zA-Z0-9_-]*[[:space:]]*= ]]; then
      # Flush previous entry if it was missing from translation
      if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
        printf '%s\n' "$entry_lines" >> "$output"
        MERGE_HAD_FALLBACK=1
      fi
      # Extract just the identifier
      current_key=$(echo "$line" | grep -oP '^[a-zA-Z][a-zA-Z0-9_-]*')
      entry_lines="$line"
    elif [[ "$line" =~ ^[[:space:]] ]] && [ -n "$current_key" ]; then
      # Continuation line (indented = part of current entry)
      entry_lines="$entry_lines"$'\n'"$line"
    else
      # Blank line or comment — flush previous entry if needed
      if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
        printf '%s\n' "$entry_lines" >> "$output"
        MERGE_HAD_FALLBACK=1
      fi
      current_key=""
      entry_lines=""
    fi
  done < "$english"
  # Flush last entry
  if [ -n "$current_key" ] && ! echo "$translated_keys" | grep -qxF "$current_key"; then
    printf '%s\n' "$entry_lines" >> "$output"
    MERGE_HAD_FALLBACK=1
  fi
}

restore_en() {
  # Restore all en-US.ftl files from backup
  for util_dir in "$COREUTILS_DIR"/src/uu/*/locales/; do
    util=$(basename "$(dirname "$util_dir")")
    backup="$TMPDIR/src-backup/uu/$util/locales/en-US.ftl"
    if [ -f "$backup" ]; then
      cp "$backup" "${util_dir}en-US.ftl"
    fi
  done
  if [ -f "$TMPDIR/src-backup/uucore/locales/en-US.ftl" ]; then
    cp "$TMPDIR/src-backup/uucore/locales/en-US.ftl" "$COREUTILS_DIR/src/uucore/locales/en-US.ftl"
  fi
  # Restore English tldr
  if [ -f "$EN_TLDR" ]; then
    cp "$EN_TLDR" "$COREUTILS_DIR/docs/tldr.zip"
  fi
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
  # Track which utilities needed English fallback
  declare -A fallback_utils=()
  for util_dir in src/uu/*/locales/; do
    if [ -f "${util_dir}${ftl_name}.ftl" ]; then
      util=$(basename "$(dirname "$util_dir")")
      en_backup="$TMPDIR/src-backup/uu/$util/locales/en-US.ftl"
      merge_ftl "$en_backup" "${util_dir}${ftl_name}.ftl" "${util_dir}en-US.ftl"
      if [ "$MERGE_HAD_FALLBACK" = "1" ]; then
        fallback_utils[$util]=1
      fi
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

  # Inject translation notice into utility pages that have untranslated strings
  # Convert ftl_name to Weblate language code (hyphens -> underscores)
  weblate_lang="${ftl_name//-/_}"
  for util in "${!fallback_utils[@]}"; do
    md_file="docs/src/utils/${util}.md"
    if [ -f "$md_file" ]; then
      notice="<div class=\"warning\">Some strings on this page have not been translated yet. You can help by <a href=\"https://hosted.weblate.org/projects/rust-coreutils/${util}/${weblate_lang}/\">translating them on Weblate</a>.</div>"
      # Insert notice after the first line (# utility-name)
      sed -i "1a\\${notice}" "$md_file"
    fi
  done
  if [ ${#fallback_utils[@]} -gt 0 ]; then
    echo "  Added translation notice to ${#fallback_utils[@]} utilities with untranslated strings"
  fi

  # Inject notice into Examples section for utilities whose examples fell back to English
  translated_list="$TMPDIR/tldr-translated-${lang}.list"
  if [ -f "$translated_list" ]; then
    examples_fallback=0
    for md_file in docs/src/utils/*.md; do
      [ -f "$md_file" ] || continue
      util=$(basename "$md_file" .md)
      # Only process files that have an Examples section
      if grep -q "^## Examples" "$md_file" && ! grep -qxF "$util" "$translated_list"; then
        # This utility's examples came from English fallback
        sed -i '/^## Examples$/a\
<div class="warning">The examples have not been translated yet and are shown in English. You can help by <a href="https://github.com/tldr-pages/tldr">translating them on tldr-pages</a>.</div>' "$md_file"
        examples_fallback=$((examples_fallback + 1))
      fi
    done
    if [ "$examples_fallback" -gt 0 ]; then
      echo "  Added example translation notice to $examples_fallback utilities"
    fi
  fi

  # Build mdbook to a language-specific output directory
  sed -i '/^multilingual/d' docs/book.toml
  (cd docs && mdbook build -d "book-${lang}")

  # Restore en-US.ftl files for next iteration
  restore_en

  echo "Built $lang docs in docs/book-${lang}/"
done

echo "All translated docs built."
