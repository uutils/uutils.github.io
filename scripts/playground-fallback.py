#!/usr/bin/env python3
"""Keep the playground deployable when one tool's WASM build breaks.

The playground bundles several independently developed modules (coreutils,
grep, findutils, diffutils, sed). A regression in any one of them used to fail
the whole site deploy, so the live site silently froze. This script falls back
to the module that is currently deployed (the last build that passed) instead:

  fill-missing ARTIFACTS_DIR
      Run before assembling the playground assets. For every module whose WASM
      job produced no artifact (build failure), download the deployed .wasm
      files and recreate its command/version fragments from the live site.

  test PUBLIC_DIR
      Run the playground JS tests. If they fail, swap modules one at a time for
      their deployed version and keep each swap that reduces the number of
      failures, until the tests pass or every module has been tried.

Both modes print the modules that fell back, one per line, to the file named
by --report (appended), so the workflow can flag them.

MODULES mirrors the wasm-* jobs in .github/workflows/website.yml; keep the
two in sync when adding a tool to the playground.
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import urllib.request

LIVE_URL = "https://uutils.org/wasm"

MODULES = [
    {
        "name": "coreutils",
        "order": "00",
        "files": ["uutils.wasm", "locales.js"],
        "version_const": "UUTILS_WASM_VERSION",
        # Generated from coreutils' Cargo.toml; recovered from the live list.
        "commands": None,
    },
    {
        "name": "grep",
        "order": "10",
        "files": ["grep.wasm"],
        "version_const": "UUTILS_GREP_VERSION",
        "commands": ["grep"],
    },
    {
        "name": "find",
        "order": "20",
        "files": ["find.wasm", "locate.wasm", "updatedb.wasm"],
        "version_const": "UUTILS_FINDUTILS_VERSION",
        "commands": ["find", "locate", "updatedb"],
    },
    {
        "name": "diffutils",
        "order": "30",
        "files": ["diffutils.wasm"],
        "version_const": "UUTILS_DIFFUTILS_VERSION",
        "commands": ["diff", "cmp"],
    },
    {
        "name": "sed",
        "order": "40",
        "files": ["sed.wasm"],
        "version_const": "UUTILS_SED_VERSION",
        "commands": ["sed"],
    },
]


def fetch(name):
    with urllib.request.urlopen(f"{LIVE_URL}/{name}", timeout=60) as resp:
        return resp.read()


def version_block(text, const):
    m = re.search(r"const " + re.escape(const) + r" = \{.*?\};\n?", text, re.S)
    return m.group(0) if m else None


def live_commands(module):
    """Command names of `module` as currently deployed."""
    if module["commands"] is not None:
        return module["commands"]
    # The live list is coreutils followed by the standalone tools' commands.
    live = re.findall(r'"([^"]+)"', fetch("commands.js").decode())
    others = {c for m in MODULES if m["commands"] for c in m["commands"]}
    return [c for c in live if c not in others]


def report(path, name):
    print(f"::warning::playground: using the deployed {name} build", flush=True)
    if path:
        with open(path, "a") as f:
            f.write(name + "\n")


def fill_missing(args):
    live_version = None
    for module in MODULES:
        frag = os.path.join(
            args.dir, f"version-{module['order']}-{module['name']}.js"
        )
        if os.path.exists(frag):
            continue
        print(f"{module['name']}: no artifact, restoring the deployed build")
        if live_version is None:
            live_version = fetch("version.js").decode()
        block = version_block(live_version, module["version_const"])
        if block is None:
            sys.exit(f"{module['name']}: not on the live site, cannot fall back")
        for name in module["files"]:
            with open(os.path.join(args.dir, name), "wb") as f:
                f.write(fetch(name))
        with open(frag, "w") as f:
            f.write(block)
        commands = ",".join(f'"{c}"' for c in live_commands(module))
        cmd_frag = f"commands-{module['order']}-{module['name']}.txt"
        with open(os.path.join(args.dir, cmd_frag), "w") as f:
            f.write(commands + "\n")
        report(args.report, module["name"])


def run_tests(args):
    """Return the number of failing tests.

    A run that crashes or times out says nothing about the modules, so it is
    retried rather than compared against a real failure count.
    """
    for _ in range(3):
        proc = subprocess.run(
            ["node", args.runner, "--dir", args.dir, "--port", str(args.port)],
            capture_output=True,
            text=True,
        )
        print(proc.stdout, end="", flush=True)
        print(proc.stderr, end="", file=sys.stderr, flush=True)
        if proc.returncode == 0:
            return 0
        m = re.search(r"Results: \d+ passed, (\d+) failed", proc.stdout)
        if m and int(m.group(1)) > 0:
            return int(m.group(1))
        print("test run crashed, retrying", flush=True)
    sys.exit("playground tests keep crashing")


def restore(wasm_dir, module, live_version):
    """Swap `module` for its deployed build; return a function undoing it."""
    block = version_block(live_version, module["version_const"])
    if block is None:
        return None
    paths = [os.path.join(wasm_dir, n) for n in module["files"]]
    paths.append(os.path.join(wasm_dir, "version.js"))
    for p in paths:
        shutil.copy2(p, p + ".bak")

    def undo():
        for p in paths:
            os.replace(p + ".bak", p)

    try:
        for name in module["files"]:
            with open(os.path.join(wasm_dir, name), "wb") as f:
                f.write(fetch(name))
    except OSError as e:
        print(f"{module['name']}: cannot download the deployed build: {e}")
        undo()
        return None
    version_js = os.path.join(wasm_dir, "version.js")
    with open(version_js) as f:
        current = f.read()
    fresh = version_block(current, module["version_const"])
    with open(version_js, "w") as f:
        f.write(current.replace(fresh, block) if fresh else current + block)
    return undo


def test(args):
    failed = run_tests(args)
    if failed == 0:
        return
    wasm_dir = os.path.join(args.dir, "wasm")
    live_version = fetch("version.js").decode()
    for module in MODULES:
        print(f"\n{failed} failing test(s); retrying with the deployed "
              f"{module['name']} build", flush=True)
        undo = restore(wasm_dir, module, live_version)
        if undo is None:
            continue
        now = run_tests(args)
        if now < failed:
            for name in module["files"] + ["version.js"]:
                os.remove(os.path.join(wasm_dir, name + ".bak"))
            report(args.report, module["name"])
            failed = now
            if failed == 0:
                return
        else:
            undo()
    sys.exit(f"playground tests still fail ({failed}) with every fallback")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--report", help="file listing fallen-back modules")
    sub = parser.add_subparsers(dest="mode", required=True)
    p = sub.add_parser("fill-missing")
    p.add_argument("dir")
    p.set_defaults(func=fill_missing)
    p = sub.add_parser("test")
    p.add_argument("dir")
    p.add_argument("--port", type=int, default=8080)
    p.add_argument(
        "--runner",
        default=os.path.join(os.path.dirname(__file__), "run-tests.js"),
    )
    p.set_defaults(func=test)
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
