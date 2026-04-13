+++
title = "Home"
template = "index.html"
+++

<div class="hero">
    <picture>
        <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)">
        <img src="logo.svg" alt="uutils logo">
    </picture>
    <div>uutils</div>
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

Ubuntu is already [carefully but purposefully adopting](https://discourse.ubuntu.com/t/carefully-but-purposefully-oxidising-ubuntu/56995) uutils coreutils, and Debian is following the same path.

# Projects

<div class="projects">
  <a class="project" href="/coreutils">
    <h2>coreutils</h2>
    <p>
      The commands you use everyday: <code>ls</code>, <code>cp</code>, etc. Production ready!
    </p>
  </a>
  <a class="project" href="/findutils">
    <h2>findutils</h2>
    <p>
      Finding what you need: <code>find</code>, <code>locate</code>, <code>updatedb</code> &amp; <code>xargs</code>.
    </p>
  </a>
  <a class="project" href="/diffutils">
    <h2>diffutils</h2>
    <p>
      Comparing text and files: <code>diff</code>, <code>cmp</code>, <code>diff3</code>, <code>sdiff</code>.
    </p>
  </a>
  <a class="project" href="/util-linux">
    <h2>util-linux</h2>
    <p>
      Essential system utilities: <code>mount</code>, <code>fdisk</code>, <code>lsblk</code>, <code>dmesg</code> and more.
    </p>
  </a>
  <a class="project" href="/procps">
    <h2>procps</h2>
    <p>
      Process monitoring utilities: <code>ps</code>, <code>top</code>, <code>free</code>, <code>vmstat</code> and more.
    </p>
  </a>
  <a class="project" href="/sed">
    <h2>sed</h2>
    <p>
      Stream editor for filtering and transforming text.
    </p>
  </a>
  <a class="project" href="/tar">
    <h2>tar</h2>
    <p>
      Archiving utility for creating and extracting tar archives.
    </p>
  </a>
  <a class="project" href="/acl">
    <h2>acl</h2>
    <p>
      Access control list utilities: <code>getfacl</code>, <code>setfacl</code>, <code>chacl</code>.
    </p>
  </a>
  <a class="project" href="/hostname">
    <h2>hostname</h2>
    <p>
      Show or set the system hostname.
    </p>
  </a>
  <a class="project" href="/login">
    <h2>login</h2>
    <p>
      Login and user management utilities: <code>login</code>, <code>su</code>, <code>passwd</code> and more.
    </p>
  </a>
  <a class="project" href="/bsdutils">
    <h2>bsdutils</h2>
    <p>
      BSD utility programs: <code>cal</code>, <code>logger</code>, <code>script</code>, <code>wall</code> and more.
    </p>
  </a>
</div>

# Crates

We maintain a variety of public crates to support our projects,
which are published on [crates.io](https://crates.io/).

- [`ansi-width`](https://github.com/uutils/ansi-width)
- [`num-prime`](https://github.com/uutils/num-prime)
- [`parse_datetime`](https://github.com/uutils/parse_datetime)
- [`platform-info`](https://github.com/uutils/platform-info)
- [`uutils-term-grid`](https://github.com/uutils/uutils-term-grid)

# Contributing

You can help us out by:

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
