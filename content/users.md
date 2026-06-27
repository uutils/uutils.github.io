+++
title = "Who uses uutils"
template = "page.html"
+++

uutils is no longer just a development experiment - it is running in production
at some of the largest software organisations in the world. This page documents
known adopters and how they use our tools.

---

## Canonical / Ubuntu

Canonical is progressively replacing GNU coreutils with uutils across Ubuntu.
Canonical laid out the roadmap in March 2025 in
[*Carefully But Purposefully Oxidising Ubuntu*](https://discourse.ubuntu.com/t/carefully-but-purposefully-oxidising-ubuntu/56995).

The rollout:

| Release | Status |
|---|---|
| Ubuntu 25.10 | uutils coreutils ships as default - real-world testing before the LTS |
| Ubuntu 26.04 LTS | rust-coreutils 0.8.0 included; `cp`, `mv`, `rm` remain GNU pending 8 TOCTOU fixes found in audit |
| Ubuntu 26.10 | Target for 100% rust-coreutils |

To support this transition, Canonical commissioned a two-phase security audit
with [Zellic](https://zellic.io) (December 2025 – March 2026). The audit found
and resolved 113 issues in total, all reported back to the uutils upstream.
The full report is available at
[github.com/Zellic/publications](https://github.com/Zellic/publications/blob/master/uutils%20coreutils%20-%20Zellic%20Audit%20Report.pdf).

A Canonical engineer also created
[**oxidizr**](https://github.com/jnsgruk/oxidizr), a tool that lets users
on Ubuntu 24.04+ switch to uutils today - replacing GNU binaries with uutils
symlinks, reversibly, in one command.

**Links:**
- [Discourse: Carefully But Purposefully Oxidising Ubuntu](https://discourse.ubuntu.com/t/carefully-but-purposefully-oxidising-ubuntu/56995)
- [Discourse: Migration to rust-coreutils in 25.10](https://discourse.ubuntu.com/t/migration-to-rust-coreutils-in-25-10/59708)
- [Discourse: An update on rust-coreutils (April 2026)](https://discourse.ubuntu.com/t/an-update-on-rust-coreutils/80773)
- [github.com/jnsgruk/oxidizr](https://github.com/jnsgruk/oxidizr)
- [LWN.net coverage](https://lwn.net/Articles/1014002/)

---

## Microsoft

Microsoft ships uutils coreutils as **Coreutils for Windows**, a native
Windows distribution of uutils/coreutils, uutils/findutils, and a Microsoft
fork of uutils/grep. It was announced at **Microsoft Build 2026** (June 2, 2026)
as part of Windows becoming a first-class development platform.

The distribution is available today via:

```
winget install Microsoft.Coreutils
```

The stated goal is to make moving between Linux, macOS, WSL, containers, and
Windows frictionless: the same commands, flags, and pipelines work the same
way, so existing scripts carry over without translation.

Microsoft maintains the downstream packaging at
[github.com/microsoft/coreutils](https://github.com/microsoft/coreutils).
The uutils/coreutils project is the upstream - Microsoft builds from it
directly and does not rewrite the tools.

**Links:**
- [Windows Developer Blog - Build 2026 announcement](https://blogs.windows.com/windowsdeveloper/2026/06/02/build-2026-furthering-windows-as-the-trusted-platform-for-development/)
- [Microsoft Learn - Coreutils for Windows overview](https://learn.microsoft.com/en-us/windows/core-utils/overview)
- [github.com/microsoft/coreutils](https://github.com/microsoft/coreutils)

---

## Snap Inc. (SPECS AR glasses)

[Snap Inc.](https://snap.com/) ships **Snap OS** - the proprietary Linux-based
operating system powering the [SPECS augmented reality glasses](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)
announced at Augmented World Expo 2026 - built on **Yocto/OpenEmbedded**.

A Snap engineer has been the primary contributor and maintainer
of the `uutils-coreutils` recipe in the **meta-openembedded** (`meta-oe`) layer
since Yocto 4.1 (langdale). The recipe uses `PROVIDES = "coreutils"` so uutils
acts as a transparent drop-in replacement for GNU coreutils in embedded images.

**Links:**
- [SPECS AR glasses announcement](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)
- [uutils-coreutils recipe on OpenEmbedded Layer Index](https://layers.openembedded.org/rrs/recipedetail/meta-openembedded/3417/)
- [Patches on the Yocto mailing list](https://lists.yoctoproject.org/g/poky/topic/bitbake_recipe_for/92508454)

---

## Debian

Debian has packaged uutils coreutils since **Debian 12 (Bookworm)** and is
actively tracking upstream releases.

Debian is also following Ubuntu's path toward making uutils the default.
A **Google Summer of Code 2024** project - *"Improve support of the Rust
coreutils in Debian"* - was mentored to accelerate the
integration. The package is also inherited by downstream Debian-based
distributions including Raspbian, Kali Linux, Parrot OS, PureOS, and deepin 23.

**Links:**
- [Debian package tracker: rust-coreutils](https://packages.debian.org/search?keywords=rust-coreutils)
- [GSoC 2024 project](https://wiki.debian.org/SummerOfCode2024/ApprovedProjects)

---

## Alpine Linux

Alpine Linux packages uutils coreutils in its **community repository** (Alpine
3.19+, now at 0.9.0 in Alpine Edge / 3.24). What makes Alpine particularly
notable is the depth of adoption: **29 downstream Alpine packages already
declare a dependency on uutils-coreutils**, including lvm2, netdata, dracut,
Pi-hole, and openvas-scanner.

When both `uutils-coreutils` and `coreutils` are installed, Alpine's package
manager automatically purges the GNU binaries and replaces them with uutils
symlinks.

**Links:**
- [Alpine package: uutils-cutils](https://pkgs.alpinelinux.org/package/edge/community/x86_64/uutils-coreutils)

---

## Redox OS

[Redox OS](https://www.redox-os.org/), the microkernel operating system written
entirely in Rust, uses uutils as its coreutils layer. The
[Redox Book](https://doc.redox-os.org/book/system-tools.html) states it plainly:
"Redox uses the Rust implementation of the GNU Coreutils, uutils." Redox is also
listed as an officially supported platform in the uutils codebase.

---

## VS Code for the Web

**Microsoft VS Code for the Web** (vscode.dev) uses uutils coreutils compiled
to **WebAssembly/WASI** to power the shell commands (`ls`, `cat`, `date`, etc.)
available in the browser-based terminal. This was documented in the official
VS Code blog in June 2023 and represents one of the first large-scale
production deployments of uutils in a WASM context.

**Links:**
- [VS Code blog: WebAssembly shell](https://code.visualstudio.com/blogs/2023/06/05/vscode-wasm-wasi)

---

## Buildroot

[Buildroot](https://buildroot.org/), the widely-used embedded Linux build
system, ships an official `uutils-coreutils` package since April 2025.

This brings uutils into the reach of a vast ecosystem of IoT, industrial, and
embedded devices built with Buildroot.

---

## Apertus

[Apertus](https://www.apertus.org/) builds the **AXIOM Beta**, an open-source
professional cinema camera. Their firmware build system runs on Ubuntu hosts
and was updated in December 2025 to support uutils coreutils as the host
toolchain.

This makes Apertus one of the first hardware projects to explicitly track and
maintain uutils compatibility in their build system.

**Links:**
- [apertus.org](https://www.apertus.org/)
- [axiom-firmware on GitHub](https://github.com/apertus-open-source-cinema/axiom-firmware)

---

## Fedora / RHEL / EPEL

uutils coreutils is packaged in **Fedora** since F39/F40 (as `rust-coreutils`,
renamed to `uutils-coreutils` in Fedora 42). It is available in Fedora
42, 43, 44 and Rawhide at version 0.7.0, and in **EPEL 9 and EPEL 10** - making
it available to Red Hat Enterprise Linux users. Fedora is not planning to make
it the default in the near term but maintains the package actively.

uutils is also packaged in **OpenMandriva** (all branches) and **Apertis**
(the Debian-based embedded automotive Linux distro, v2023–v2027).

**Links:**
- [Fedora package: uutils-coreutils](https://packages.fedoraproject.org/pkgs/uutils-coreutils/)
- [EPEL package](https://packages.fedoraproject.org/pkgs/uutils-coreutils/)

---

## NixOS

uutils coreutils is available in **nixpkgs** as `uutils-coreutils` and
`uutils-coreutils-noprefix` (the latter installs commands without the `uu-`
prefix, as drop-in replacements).

**Links:**
- [NixOS Wiki: uutils coreutils](https://wiki.nixos.org/wiki/Uutils_coreutils)

---

## macOS

uutils is available on macOS via two package managers:

- **Homebrew**: `brew install uutils-coreutils`
- **MacPorts**: `port install coreutils-uutils`

This makes uutils a practical cross-platform development tool: scripts written
with uutils on Linux run identically on macOS developer machines without
depending on GNU coreutils via Homebrew.

---

## Windows (community)

Beyond Microsoft's official distribution, uutils is available on Windows via:

- **MSYS2** (all variants): 0.9.0
- **Scoop**: `scoop install uutils-coreutils`
- **Chocolatey**: `choco install uutils-coreutils`

---

## Termux (Android) and ChromeOS

- **[Termux User Repository (TUR)](https://github.com/termux-user-repository/tur/blob/master/tur/uutils-coreutils/build.sh#L2)**:
  uutils-coreutils 0.9.0 is available for Android terminals via Termux.
- **[Chromebrew](https://github.com/chromebrew/chromebrew/blob/master/packages/uutils_coreutils.rb#L6)**: ChromeOS users can
  install uutils-coreutils via the Chromebrew package manager.

---

## Are you using uutils?

If your project or organisation uses uutils tools, we would love to hear from
you. Open an issue or pull request on
[github.com/uutils/uutils.github.io](https://github.com/uutils/uutils.github.io)
to add your entry to this page.
