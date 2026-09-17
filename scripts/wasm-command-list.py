#!/usr/bin/env python3
"""List the coreutils utilities enabled by a Cargo feature.

The playground advertises the commands baked into the WASM build. Those come
from the `feat_wasm` feature in coreutils' Cargo.toml, which is a mix of
utility names (optional dependencies) and other feature groups such as
`feat_common_core`. Resolve the groups recursively and print the leaf utility
names, one per line.

Usage: wasm-command-list.py <path-to-Cargo.toml> [feature]
"""

import sys
import tomllib


def main() -> int:
    cargo_toml = sys.argv[1]
    root = sys.argv[2] if len(sys.argv) > 2 else "feat_wasm"

    with open(cargo_toml, "rb") as f:
        manifest = tomllib.load(f)

    features = manifest.get("features", {})

    utils: set[str] = set()
    seen: set[str] = set()
    stack = [root]
    while stack:
        name = stack.pop()
        if name in seen:
            continue
        seen.add(name)
        if name in features:
            for entry in features[name]:
                # Drop `dep:foo`, `foo/bar` and `foo?/bar` forms: they enable
                # features of a crate rather than naming a utility.
                if entry.startswith("dep:") or "/" in entry:
                    continue
                stack.append(entry)
        else:
            # Not a feature group, so it is an optional dependency, i.e. a
            # utility crate. A few are declared as `uu_<name>` to avoid
            # clashing with a Cargo built-in (`uu_test`); the multicall binary
            # exposes them under the bare name.
            utils.add(name.removeprefix("uu_"))

    if not utils:
        print(f"error: feature {root!r} resolved to no utilities", file=sys.stderr)
        return 1

    for util in sorted(utils):
        print(util)
    return 0


if __name__ == "__main__":
    sys.exit(main())
