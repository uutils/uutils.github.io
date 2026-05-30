+++
title = "Review Guidelines"
template = "page.html"
+++

This page describes what we expect from pull requests across the uutils
projects ([coreutils](https://github.com/uutils/coreutils),
[findutils](https://github.com/uutils/findutils) and the others) and how reviews
are carried out. It is meant for both **contributors** who want to know what a
reviewer looks for, and **reviewers** who want a shared checklist. Each
project's `CONTRIBUTING.md` links here; the rules below apply to all of them.

## The one rule that cannot be bent

> uutils is **original** code. We **cannot** accept any change based on the GNU
> source code, and you **must not even link to** the GNU source in an issue or
> PR. A reviewer will reject a contribution that appears to be derived from GNU
> (or any other strongly-licensed implementation such as GPL/LGPL code).

It is fine to look at permissively-licensed implementations
([Apple's file_cmds](https://github.com/apple-oss-distributions/file_cmds/),
[OpenBSD](https://github.com/openbsd/src/tree/master/bin)) and to read the GNU
*manuals* and man pages - just never the GNU *source*.

## What a reviewer expects before merging

A pull request is ready to be merged when it meets all of the following. If you
check these before requesting a review, your PR will move much faster.

- **It passes CI.** The test suite is green (allowing for intermittently
  failing tests), `rustfmt` is satisfied, and there are no `clippy` warnings.
- **It compiles without warnings on every CI platform.** Use `#[cfg(...)]` for
  platform-specific code rather than breaking other targets.
- **It is small and self-contained.** A series of small PRs gets merged far
  faster than one large one. Unrelated changes belong in separate PRs.
- **It has a descriptive title.** Describe the problem solved, e.g.
  `ls: fix version sort order`, not `Fix #1234`. Prefix with the utility name
  when relevant.
- **New behavior comes with tests.** Our test suite is fast; regressions should
  be caught by a test. Code coverage should not regress.
- **If possible, it was discussed first.** For anything non-trivial, open (or comment on) an
  issue *before* writing the code, so effort isn't wasted on a change we can't
  merge.
- **It follows GNU behavior** for options and output, verified against the GNU
  manual or output - never the GNU source.
- **GNU compatibility does not regress.** The GNU test suite (`run-gnu-test.sh`,
  tracked with `remaining-gnu-error.py`) should not go backwards; a
  compatibility fix should ideally add the now-passing test. Error messages and
  exit codes should match GNU, checked with `LANG=C` (except for locale bugs).
- If the GNU test suite passes but you still found a behavior difference, that is
  a gap in their coverage: please contribute the missing test upstream to GNU to
  improve their test suite.
- **It updates docs, help and translations.** A new option or behavior should
  also update the `--help` text, the documentation, the generated man pages, and
  at least the English `locales/en-US.ftl` strings.
- **It stays focused.** Keep formatting-only changes, unrelated refactors, and
  dependency or lockfile bumps out of a feature or fix PR.
- **It is safe with untrusted input.** Utilities process arbitrary file contents
  and arguments, so avoid unbounded allocations, integer overflow, and
  path-traversal foot-guns.
- **It does not regress performance.** Runtime should not get more than **3%**
  slower than the current `main`. Increased memory usage is acceptable when it is
  justified (e.g. it buys a meaningful speed-up or is needed for correctness).
- **It does not regress binary size.** The compiled binary should not grow more
  than **3%** compared to the current `main`, unless the increase is justified by
  the change.
- **New dependencies must be discussed and justified.** Adding a crate is not
  free - it affects build time, binary size, the audit surface, and licensing.
  Raise it first, explain why it's needed and why an existing dependency or a
  small amount of in-tree code won't do, and make sure its license is compatible
  (see Licensing in each project's `CONTRIBUTING.md`).

### Commit hygiene reviewers care about

- Small, atomic commits with a clean history.
- Informative messages annotated with the component, e.g.
  `cp: do not overwrite with -i` or `uucore: add support for FreeBSD`.
- Don't move code around unnecessarily - it makes diffs hard to review. If a
  move is needed, do it in its own commit.

### Coding expectations reviewers check against

- **No `panic!`** - avoid `.unwrap()`, `panic!` and stray `println!`. A
  justified `unreachable!` needs a comment.
- **No `exit`** - utilities must be embeddable, so avoid `std::process::exit`
  and friends.
- **Minimal `unsafe`** - generally only for FFI, always with a `// SAFETY:`
  comment. Performance is rarely a good enough reason.
- **`OsStr`/`Path` over `str`/`String`** for paths, since paths may not be valid
  UTF-8.
- **Macros sparingly**, and **comments that explain *why***, kept up to date.
- **Don't silence clippy with `#[allow(...)]`.** In particular, we don't want to
  see `#[allow(dead_code)]`; fix the underlying issue (or remove the unused code)
  instead of suppressing the lint.

## For contributors: getting your PR reviewed

- You don't need to ping a maintainer the moment you open a PR.
- If you get no response within a few days, it's fine to request a review.
- If after a week there's still no review, ping the maintainers on
  [Discord](https://discord.gg/wQVJbvJ) (`#coreutils-chat` for coreutils).
- You know your code best - please resolve merge conflicts on your branch
  yourself (`git merge main` or `git rebase main`, your choice). Ask for help if
  you get stuck.
- When you address review feedback, fold the fixes into the relevant commits
  (`git commit --fixup` / `git absorb`) to keep history clean.

## For reviewers: how we review

- **Double-check a human's work.** A reviewer is there to verify a contributor's
  reasoning, not to launder unreviewed machine output. Expect the author to be
  able to explain and justify every line.
- **Watch for GNU/GPL provenance.** Be especially careful with AI-assisted
  patches: assistants are trained on GPL sources and can reproduce them
  verbatim, which we cannot accept.
- **Keep comments short and actionable.** Prefer simple, one-line comments on
  the specific line, so the author knows exactly what to change.
- **Push back on** long-winded code, duplication, needless complexity, and
  changes that arrive without tests.
- **Confirm the basics** from the checklist above (CI, scope, title, tests,
  style) rather than re-deriving them each time.
- **Disregard machine-generated discussion.** Review comments and replies should
  come from a person. Maintainers may hide or ignore comments that read as
  AI-generated.

## AI-assisted contributions

AI-assisted contributions are allowed, but the same standards apply as for any
other patch. If you use an AI tool, **you** are responsible for the result: you
should understand every line, be able to justify it in review, and make sure the
output is not derived from GNU or other GPL code. Keep patches small and
self-review the diff carefully before opening the PR. Commit messages and PR
descriptions should describe the change, not the tooling used to produce it.

AI is a tool for writing *code*. Issue reports, pull request descriptions, and
replies to reviewers should be written in **your own words**. The whole point of
review discussion is to confirm that a human understands the change; generated
prose defeats that.

This is not about English fluency: if you are not a native speaker, using a tool
to fix grammar or translate your own words is fine. The point is that the ideas
and reasoning should be yours, not an AI's.

This section is inspired by the
[astral-sh AI policy](https://github.com/astral-sh/.github/blob/main/AI_POLICY.md)
and Mozilla's
[AI coding guidance](https://firefox-source-docs.mozilla.org/contributing/ai-coding.html).

## See also

- The full `CONTRIBUTING.md` in each repository
  ([coreutils](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md),
  [findutils](https://github.com/uutils/findutils/blob/main/CONTRIBUTING.md))
- `DEVELOPMENT.md` for setting up your environment
- Our [Code of Conduct](https://github.com/uutils/coreutils/blob/main/CODE_OF_CONDUCT.md)
