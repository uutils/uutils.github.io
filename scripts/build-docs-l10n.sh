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
#
# Languages are built concurrently (DOC_JOBS parallel workers, default nproc).
# Everything uudoc touches is relative to its working directory, so each
# language gets a throwaway copy of the checkout to work in rather than taking
# turns mutating the shared one. The checkout itself stays read-only here, which
# is what makes the concurrency safe and removes the need to restore en-US.ftl
# between languages.

set -euo pipefail

# Absolute path to this script: the parent re-invokes it through xargs to build
# each language, and the workers do not necessarily share its working directory.
SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

# Convert FTL locale code to URL code: strip region when language == region
# (e.g., fr-FR -> fr, es-ES -> es) but keep distinct ones (zh-Hans, pt-BR, nb-NO)
ftl_to_url() {
  local code="$1"
  local lang="${code%%-*}"
  local region="${code#*-}"
  if [ "${region,,}" = "${lang,,}" ]; then
    echo "$lang"
  else
    echo "$code"
  fi
}

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

# Build one language in its own sandbox. Reads COREUTILS_DIR, WORK_ROOT, UUDOC
# and EN_TLDR_DIR from the environment; the parent exports them before fanning
# out. The checkout is only read (so the en-US.ftl files there stay pristine for
# every other worker) and only written to for the finished book-<lang>/.
build_one_lang() {
  local lang="$1"
  local ftl_name="$2"
  local work="$WORK_ROOT/work-$lang"

  echo "=== Building $lang docs ==="
  rm -rf "$work"
  mkdir -p "$work"

  # A copy of the checkout for this language to scribble en-US.ftl into. It has
  # to be the whole thing rather than just the locales: uudoc shells out to
  # ./util/show-utils.sh, which runs `cargo metadata` and therefore needs the
  # workspace manifests. target/ is not needed (nothing is compiled here) and
  # docs/book*/ is previously built output that would only be copied and thrown
  # away, so both are left behind — that is most of the checkout's weight.
  tar -C "$COREUTILS_DIR" -cf - \
    --exclude='./target' --exclude='./.git' \
    --exclude='./docs/book' --exclude='./docs/book-*' . \
    | tar -C "$work" -xf -

  # Download and repack the translated tldr archive (uudoc expects a pages/
  # prefix), merged over English so untranslated examples still show up.
  local translated_list=""
  local raw="$work/tldr-raw.zip"
  if curl -sfL "https://github.com/tldr-pages/tldr/releases/download/v2.3/tldr-pages.${lang}.zip" -o "$raw"; then
    local repack_dir="$work/tldr-repack"
    mkdir -p "$repack_dir/pages"
    (cd "$repack_dir" && unzip -o "$raw" -d pages/ > /dev/null 2>&1)

    # Record which utilities have translated examples (before merging English in)
    translated_list="$work/tldr-translated.list"
    (cd "$repack_dir" && find pages -name "*.md" -printf '%f\n' | sed 's/\.md$//' | sort -u > "$translated_list")

    # Merge: start from English, overlay the translated pages on top, so a
    # utility with no translated page still gets its English examples. Note the
    # direction — overlaying English onto the translation with `cp -n` instead
    # would look equivalent but silently drops pages under uutils' cp.
    local zip_from="$repack_dir"
    if [ -d "$EN_TLDR_DIR" ]; then
      local merge_dir="$work/tldr-merge"
      cp -r "$EN_TLDR_DIR" "$merge_dir"
      cp -r "$repack_dir/pages"/* "$merge_dir/pages/"
      zip_from="$merge_dir"
    fi
    rm -f "$work/docs/tldr.zip"
    (cd "$zip_from" && zip -r "$work/docs/tldr.zip" pages/ > /dev/null 2>&1)
    rm -rf "$repack_dir" "$work/tldr-merge" "$raw"
  fi

  cd "$work"

  # uudoc hardcodes en-US.ftl — merge translated locale into en-US.ftl
  # so that untranslated keys fall back to English
  # Track which utilities needed English fallback
  local -A fallback_utils=()
  local util_dir util
  for util_dir in "$COREUTILS_DIR"/src/uu/*/locales/; do
    [ -f "${util_dir}${ftl_name}.ftl" ] || continue
    util=$(basename "$(dirname "$util_dir")")
    merge_ftl "${util_dir}en-US.ftl" \
      "${util_dir}${ftl_name}.ftl" "src/uu/$util/locales/en-US.ftl"
    if [ "$MERGE_HAD_FALLBACK" = "1" ]; then
      fallback_utils[$util]=1
    fi
  done
  if [ -f "$COREUTILS_DIR/src/uucore/locales/${ftl_name}.ftl" ]; then
    merge_ftl "$COREUTILS_DIR/src/uucore/locales/en-US.ftl" \
      "$COREUTILS_DIR/src/uucore/locales/${ftl_name}.ftl" "src/uucore/locales/en-US.ftl"
  fi

  # Re-generate markdown with swapped locale
  if ! "$UUDOC" 2>&1 | tail -3; then
    echo "WARNING: uudoc failed for $lang, skipping"
    cd "$WORK_ROOT" && rm -rf "$work"
    return 0
  fi

  # Inject translation notice into utility pages that have untranslated strings
  # Convert ftl_name to Weblate language code (hyphens -> underscores)
  local weblate_lang="${ftl_name//-/_}"
  local md_file notice
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
  if [ -n "$translated_list" ] && [ -f "$translated_list" ]; then
    local examples_fallback=0
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
  # Strip legacy FA4 `fa` class so mdbook 0.5's Font Awesome parser picks up
  # the `fa-brands` family for linux/windows/apple icons (avoids WARN spam).
  find docs/src/utils -name '*.md' -exec sed -i 's|class="fa fa-brands |class="fa-brands |g' {} +
  (cd docs && mdbook build -d "book-${lang}")

  rm -rf "$COREUTILS_DIR/docs/book-${lang}"
  mv "docs/book-${lang}" "$COREUTILS_DIR/docs/book-${lang}"
  cd "$WORK_ROOT" && rm -rf "$work"

  echo "Built $lang docs in docs/book-${lang}/"
}

# Worker re-entry point: the parent fans out by re-invoking this script, so that
# each language gets a shell of its own and cannot disturb its neighbours.
if [ "${1:-}" = "--build-one-lang" ]; then
  build_one_lang "$2" "$3"
  exit 0
fi

COREUTILS_DIR="$(cd "${1:?Usage: $0 <coreutils-dir>}" && pwd)"

# Discover available locales from the coreutils source (l10n already copied in)
# Use ls utility as reference
declare -A LANG_MAP=()
for ftl in "$COREUTILS_DIR"/src/uu/ls/locales/*.ftl; do
  [ -f "$ftl" ] || continue
  ftl_name=$(basename "$ftl" .ftl)
  [ "$ftl_name" = "en-US" ] && continue
  url_code=$(ftl_to_url "$ftl_name")
  LANG_MAP[$url_code]="$ftl_name"
done

echo "Found ${#LANG_MAP[@]} locales to build: ${!LANG_MAP[*]}"

WORK_ROOT=$(mktemp -d)
trap 'rm -rf "$WORK_ROOT"' EXIT

# Find uudoc binary (already built by the English docs step)
UUDOC="$COREUTILS_DIR/target/debug/uudoc"
if [ ! -x "$UUDOC" ]; then
  UUDOC="$COREUTILS_DIR/target/release/uudoc"
fi

# Unpack the English tldr archive once; every worker overlays its translation
# on top of this copy.
EN_TLDR_DIR="$WORK_ROOT/tldr-en-dir"
if [ -f "$COREUTILS_DIR/docs/tldr.zip" ]; then
  mkdir -p "$EN_TLDR_DIR"
  (cd "$EN_TLDR_DIR" && unzip -o "$COREUTILS_DIR/docs/tldr.zip" > /dev/null 2>&1)
fi

export COREUTILS_DIR WORK_ROOT UUDOC EN_TLDR_DIR

JOBS="${DOC_JOBS:-$(nproc)}"
echo "Building ${#LANG_MAP[@]} languages with $JOBS parallel jobs"

# A plain bash job pool rather than `xargs -P`: uutils' own xargs accepts -P but
# does not implement it, so anyone running this on a machine that has uutils
# installed as /usr/bin/xargs would silently get a serial build.
FAILURES="$WORK_ROOT/failures"
: > "$FAILURES"

for lang in "${!LANG_MAP[@]}"; do
  # Wait for a slot to free up before starting the next language.
  while [ "$(jobs -rp | wc -l)" -ge "$JOBS" ]; do
    wait -n || true
  done
  # Each worker's output is prefixed with its language so the interleaved logs
  # stay readable. `!` keeps `set -e` out of it; pipefail makes the pipeline
  # report the worker's status rather than sed's.
  (
    if ! bash "$SELF" --build-one-lang "$lang" "${LANG_MAP[$lang]}" 2>&1 | sed "s/^/[$lang] /"; then
      echo "$lang" >> "$FAILURES"
    fi
  ) &
done
wait

if [ -s "$FAILURES" ]; then
  echo "ERROR: failed to build docs for:" "$(tr '\n' ' ' < "$FAILURES")" >&2
  exit 1
fi

echo "All translated docs built."
