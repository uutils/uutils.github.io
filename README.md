# coreutils documentations

This repository generates the user and dev documentations of https://github.com/uutils/coreutils

## User documentation

Can be generated with
```
cargo run --bin uudoc --all-features
cd docs
mdbook build
```

It is available on:
https://uutils.github.io/coreutils-docs/coreutils/user/

# Developer documentation:

The code documentation is generated daily from the https://github.com/uutils/coreutils repository.

It is available on:
https://uutils.github.io/coreutils-docs/coreutils/dev/

The pages are committed daily into the gh-pages branch.
