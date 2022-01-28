# coreutils documentations

This repository generates the user and dev documentations of https://github.com/uutils/coreutils

## User documentation

It is available on:
https://uutils.github.io/coreutils-docs/user/

Can be generated with:
```
cargo run --bin uudoc --all-features
cd docs
mdbook build
```

## Developer documentation:

It is available on:
https://uutils.github.io/coreutils-docs/dev/coreutils/

Can be generated with:
```
cargo doc --no-deps --all-features --workspace
```

The pages are committed daily into the gh-pages branch.
