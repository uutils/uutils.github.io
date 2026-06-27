+++
title = "Home"
template = "index.html"
+++

<div class="term term-hero">
  <div class="term-bar">
    <span class="t">uutils --about</span>
    <span class="win-btn" title="Minimize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 11h8"/></svg></span>
    <span class="win-btn" title="Maximize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4.5" y="4.5" width="7" height="7" rx="1"/></svg></span>
    <span class="win-btn close" title="Close"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></span>
  </div>
  <div class="term-body">
    <div class="hero">
      <img src="logo-dark.svg" alt="uutils logo">
      <div class="hero-prompt"><span class="pr">user@machine</span>:~$ uutils --about</div>
      <div class="hero-title">uutils<span class="hero-cursor">_</span></div>
      <p class="hero-tagline">Cross-platform Rust reimplementations of the command-line tools you use every day, with full GNU compatibility.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="/playground">Try the playground</a>
        <a class="btn btn-ghost" href="https://github.com/uutils">View on GitHub</a>
      </div>
    </div>
  </div>
</div>

The uutils project reimplements ubiquitous command line utilities in
Rust. Our goal is to modernize the utils, while retaining full
compatibility with the existing utilities.

We are planning to replace all essential Linux tools.

# Why?

C has served us well for decades, but it is time to move on. For new generations of developers, Rust is more appealing — and it brings real, substantive benefits:

- **Memory safety** — eliminates entire categories of bugs without sacrificing performance
- **Cross-platform portability** — the same code runs on Linux, macOS, Windows, Android, FreeBSD, NetBSD, OpenBSD, Solaris, Illumos, Fuchsia, Redox and even WebAssembly
- **Modern tooling** — Cargo, crates.io and a rich ecosystem mean we don't have to reinvent the wheel
- **Easy parallelism** — fearless concurrency built into the language
- **Terrific performance** — on par with or better than C implementations

This is not about fighting the GNU project. It is not primarily about security (GNU coreutils only had 17 CVEs since 2003) or about license debates. It is about **modernizing foundational software** so it can be maintained and improved by the next generation of contributors.

Ubuntu is already [carefully but purposefully adopting](https://discourse.ubuntu.com/t/carefully-but-purposefully-oxidising-ubuntu/56995) uutils coreutils, Debian is following the same path, and Microsoft offers it as well.

# Projects

<div class="term">
  <div class="term-bar">
    <span class="t">uutils list --status</span>
    <span class="win-btn" title="Minimize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 11h8"/></svg></span>
    <span class="win-btn" title="Maximize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4.5" y="4.5" width="7" height="7" rx="1"/></svg></span>
    <span class="win-btn close" title="Close"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> uutils list --status</div>
    <div class="projects">
      <a class="prow" href="/coreutils"><span class="name">coreutils</span><span class="desc">everyday commands: <code>ls</code>, <code>cp</code>, <code>mv</code></span><span class="st st-ready">ready</span></a>
      <a class="prow" href="/findutils"><span class="name">findutils</span><span class="desc"><code>find</code>, <code>locate</code>, <code>xargs</code></span><span class="st st-beta">beta</span></a>
      <a class="prow" href="/diffutils"><span class="name">diffutils</span><span class="desc"><code>diff</code>, <code>cmp</code>, <code>diff3</code>, <code>sdiff</code></span><span class="st st-beta">beta</span></a>
      <a class="prow" href="/grep"><span class="name">grep</span><span class="desc"><code>grep</code>, <code>egrep</code>, <code>fgrep</code></span><span class="st st-beta">beta</span></a>
      <a class="prow" href="/util-linux"><span class="name">util-linux</span><span class="desc"><code>mount</code>, <code>fdisk</code>, <code>lsblk</code>, <code>dmesg</code></span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/procps"><span class="name">procps</span><span class="desc"><code>ps</code>, <code>top</code>, <code>free</code>, <code>vmstat</code></span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/sed"><span class="name">sed</span><span class="desc">stream editor for filtering and transforming text</span><span class="st st-alpha">alpha</span></a>
      <a class="prow" href="/awk"><span class="name">awk</span><span class="desc">pattern scanning and text-processing language</span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/tar"><span class="name">tar</span><span class="desc">create and extract tar archives</span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/acl"><span class="name">acl</span><span class="desc"><code>getfacl</code>, <code>setfacl</code>, <code>chacl</code></span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/hostname"><span class="name">hostname</span><span class="desc">show or set the system hostname</span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/login"><span class="name">login</span><span class="desc"><code>login</code>, <code>su</code>, <code>passwd</code></span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/bsdutils"><span class="name">bsdutils</span><span class="desc"><code>cal</code>, <code>logger</code>, <code>script</code>, <code>wall</code></span><span class="st st-wip">in progress</span></a>
      <a class="prow" href="/shadow"><span class="name">shadow</span><span class="desc"><code>useradd</code>, <code>passwd</code>, <code>groupadd</code></span><span class="st st-wip">in progress</span></a>
    </div>
  </div>
</div>

# Crates

We maintain a variety of public crates to support our projects,
which are published on [crates.io](https://crates.io/).

- [`ansi-width`](https://github.com/uutils/ansi-width)
- [`num-prime`](https://github.com/uutils/num-prime)
- [`parse_datetime`](https://github.com/uutils/parse_datetime)
- [`platform-info`](https://github.com/uutils/platform-info)
- [`uutils-term-grid`](https://github.com/uutils/uutils-term-grid)

# Who we are

uutils is a community-driven, open-source effort maintained by volunteers around the world. There is no company behind it, just contributors who care about the future of foundational command-line tools.

Everything happens in the open on [GitHub](https://github.com/uutils), and newcomers are genuinely welcome. Many of our contributors landed their first-ever open-source patch on a uutils project, and we are happy to help you do the same.

[Meet the team](/team) behind uutils.

# Contributing

You can help us out by:

- [Tackling a good first issue](https://github.com/search?q=org%3Auutils+is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22&type=issues&s=created&o=desc) across any of our projects (the easiest way to get started)
- Contributing code
- Contributing documentation
- Reporting bugs (e.g. incompatibilities with GNU utilities)
- Triaging bugs
- [Sponsoring uutils on GitHub](https://github.com/sponsors/uutils)

You can join our [Discord server](https://discord.gg/wQVJbvJ) to discuss or ask anything concerning uutils. We're happy to help you get started with contributing!

# Talks & Media

We did a few talks about this project, see [our talks & media page](/talks).

# Friends of uutils

We collaborate with and build upon many other projects in the Rust
community, either by using or providing crates. We highly recommend
giving these projects a look!

- [`nushell`](https://www.nushell.sh/)
- [`ripgrep`](https://github.com/burntsushi/ripgrep)
- [`eza`](https://github.com/eza-community/eza)
