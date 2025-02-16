+++
title = "Home"
template = "index.html"
+++

<div class="hero">
    <picture>
        <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)">
        <img src="logo.svg">
    </picture>
    <div>uutils</div>
</div>

The uutils project reimplements ubiquitous command line utilities in
Rust. Our goal is to modernize the utils, while retaining full
compatibility with the existing utilities.

We are planning to replace all essential Linux tools.

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
</div>

# Crates

We maintain a variety of public crates to support our projects,
which are published on [crates.io](https://crates.io/).

- [`ansi-width`](https://github.com/uutils/ansi-width)
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

# Friends of uutils

We collaborate with and build upon many other projects in the Rust
community, either by using or providing crates. We highly recommend
giving these projects a look!

- [`nushell`](https://www.nushell.sh/)
- [`ripgrep`](https://github.com/burntsushi/ripgrep)
- [`eza`](https://github.com/eza-community/eza)
