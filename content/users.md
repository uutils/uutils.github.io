+++
title = "Who uses uutils"
template = "page.html"
+++

uutils is no longer just a development experiment - it is running in production
at some of the largest software organisations in the world. This page documents
known adopters and how they use our tools.

---

## Microsoft

Microsoft ships uutils coreutils as **Coreutils for Windows**, a native
Windows distribution of uutils/coreutils, uutils/findutils, and a Microsoft
fork of uutils/grep. It was announced at **Microsoft Build 2026** (June 2, 2026)
by Pavan Davuluri, EVP Windows &amp; Devices, as part of Windows becoming a
first-class development platform.

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

## Canonical / Ubuntu

Canonical is progressively replacing GNU coreutils with uutils across Ubuntu.
Jon Seager (VP of Engineering) laid out the roadmap in March 2025 in
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

Canonical engineer [jnsgruk](https://github.com/jnsgruk) also created
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

## Snap Inc. (SPECS AR glasses)

[Snap Inc.](https://snap.com/) ships **Snap OS** - the proprietary Linux-based
operating system powering the [SPECS augmented reality glasses](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)
announced at Augmented World Expo 2026 - built on **Yocto/OpenEmbedded**.

Snap engineer Etienne Cordonnier has been the primary contributor and maintainer
of the `uutils-coreutils` recipe in the **meta-openembedded** (`meta-oe`) layer
since Yocto 4.1 (langdale). The recipe uses `PROVIDES = "coreutils"` so uutils
acts as a transparent drop-in replacement for GNU coreutils in embedded images.

Version coverage across Yocto releases:

| Yocto release | uutils version |
|---|---|
| 4.1 langdale | 0.0.16 |
| 4.2 mickledore | 0.0.18 |
| 4.3 nanbield | 0.0.22 |
| 5.0 scarthgap | 0.0.28 |
| 5.1 styhead | 0.0.27 |
| 5.2 walnascar | 0.0.30 |
| 5.3 whinlatter | 0.4.0 |
| 6.0 wrynose | 0.8.0 |
| master | 0.9.0 |

**Links:**
- [SPECS AR glasses announcement](https://newsroom.snap.com/introducing-specs-augmented-reality-glasses)
- [uutils-coreutils recipe on OpenEmbedded Layer Index](https://layers.openembedded.org/rrs/recipedetail/meta-openembedded/3417/)
- [Etienne Cordonnier's patches on the Yocto mailing list](https://lists.yoctoproject.org/g/poky/topic/bitbake_recipe_for/92508454)

---

## Apertus

[Apertus](https://www.apertus.org/) builds the **AXIOM Beta**, an open-source
professional cinema camera. Their firmware build system runs on Ubuntu hosts
and was updated in December 2025 to support uutils coreutils as the host
toolchain.

Specifically, the u-boot build scripts were patched to make the `dd` invocation
compatible with uutils semantics (explicit `cbs=` parameter required when
`conv=block,sync` is used). This patch is included in the
[axiom-firmware](https://github.com/apertus-open-source-cinema/axiom-firmware)
repository as `patches/u-boot/03_uutils_support.patch`.

This makes Apertus one of the first hardware projects to explicitly track and
maintain uutils compatibility in their build system.

**Links:**
- [apertus.org](https://www.apertus.org/)
- [axiom-firmware on GitHub](https://github.com/apertus-open-source-cinema/axiom-firmware)

---

## Are you using uutils?

If your project or organisation uses uutils tools, we would love to hear from
you. Open an issue or pull request on
[github.com/uutils/uutils.github.io](https://github.com/uutils/uutils.github.io)
to add your entry to this page.
