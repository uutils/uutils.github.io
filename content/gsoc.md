+++
title = "Uutils at GSOC"
+++

<div class="term term-gsoc">
  <div class="term-bar">
    <span class="t">uutils gsoc --help</span>
    <span class="win-btn" title="Minimize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 11h8"/></svg></span>
    <span class="win-btn" title="Maximize"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4.5" y="4.5" width="7" height="7" rx="1"/></svg></span>
    <span class="win-btn close" title="Close"><svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg></span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> uutils gsoc --help</div>
    <p>Google Summer of Code is a global, online program focused on bringing new contributors into open source software development. GSoC contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.</p>
  </div>
</div>

If you want to know more about how it works, check out the links below.

**Useful links**:
* [GSOC Contributor Guide](https://google.github.io/gsocguides/student/)
* [GSOC FAQ](https://developers.google.com/open-source/gsoc/faq)
* [GSOC Timeline](https://developers.google.com/open-source/gsoc/timeline) (important for deadlines!)

# What is it about?

The [uutils project](https://github.com/uutils/) is aiming at rewriting key Linux utilities in Rust, targeting [coreutils](https://github.com/uutils/coreutils), [findutils](https://github.com/uutils/findutils), [diffutils](https://github.com/uutils/diffutils), [sed](https://github.com/uutils/sed), [grep](https://github.com/uutils/grep), [awk](https://github.com/uutils/awk), [procps](https://github.com/uutils/procps), [util-linux](https://github.com/uutils/util-linux), and [bsdutils](https://github.com/uutils/bsdutils). Their goal is to create fully compatible, high-performance drop-in replacements, ensuring reliability through upstream test suites. coreutils is already production-ready and shipping in distributions; findutils, diffutils and grep are well advanced; while sed, awk and the system utilities (procps, util-linux, bsdutils) are at earlier stages of development.

# How to get started

Here are some steps to follow if you want to apply for a GSOC project
with uutils.

1. **Check the requirements.** You have to meet
  [Google's requirements](https://developers.google.com/open-source/gsoc/faq#what_are_the_eligibility_requirements_for_participation) to apply. Specifically for uutils, it's best if you at
  least know some Rust and have some familiarity with using the
  coreutils and the other tools.
1. **Reach out to us!** We are happy to discuss potential projects and help you find a meaningful project for uutils. Tell us what interests you about the project and what experience you have and we can find a suitable project together. You can talk to the uutils maintainers on the [Discord server](https://discord.gg/wQVJbvJ). In particular, you can contact:
    * Sylvestre Ledru (@sylvestre on GitHub and Discord)

2. **Get comfortable with uutils.** To find a good project you need to understand the codebase. We recommend that you take a look at the code, the issue tracker and maybe try to tackle some [good-first-issues](https://github.com/search?q=org%3Auutils+is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22&type=issues) across any of our projects. Also take a look at our [contributor guidelines](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md).
3. **Find a project and a mentor.** We have a [list of potential projects](https://github.com/uutils/coreutils/wiki/GSOC-Project-Ideas) you can adapt or use as inspiration. Make sure discuss your ideas with the maintainers! Some project ideas below have suggested mentors you could contact.
4. **Write the application.** You can do this with your mentor. The application has to go through Google, so make sure to follow all the advice in Google's [Contributor Guide](https://google.github.io/gsocguides/student/writing-a-proposal). Please make sure you include your prior contributions to uutils in your application.

# Tips

- Make sure the project is concrete and well-defined.
- Communication is super important!
- Try to tackle some issues to get familiar with uutils and demonstrate your motivation.

# Project Ideas

These are starting points for a Google Summer of Code project with uutils. Feel free to adapt one or propose your own, and see the [guidelines for the project list](https://google.github.io/gsocguides/mentor/defining-a-project-ideas-list). Each idea lists its difficulty, an estimated size (~175 or ~350 hours) and a suggested mentor where one is available.

<div class="gsoc-ideas">

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Performance optimization for coreutils</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/coreutils">uutils/coreutils</a> has strong GNU compatibility, but some utilities can still be made faster. Systematically profile, benchmark and optimize the hot paths so they match or beat GNU coreutils.</p>
  <ul>
    <li>Profile utilities with <code>perf</code>, flamegraph and criterion</li>
    <li>Build a benchmark suite comparing against GNU coreutils</li>
    <li>Optimize hot paths in <code>cat</code>, <code>cut</code>, <code>sort</code>, <code>uniq</code>, <code>wc</code>, etc.</li>
    <li>Reduce allocations, improve buffering, use SIMD where it helps</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, performance profiling, systems/I/O optimization; SIMD a plus.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Expand differential fuzzing for coreutils</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p>coreutils has <a href="https://github.com/uutils/coreutils/tree/main/fuzz/fuzz_targets">some fuzzing infrastructure</a>, but many utilities lack coverage. Expand differential fuzzing that compares uutils against GNU to catch discrepancies automatically.</p>
  <ul>
    <li>Add fuzz targets for utilities that currently lack them</li>
    <li>Build differential harnesses comparing uutils vs GNU output</li>
    <li>Run campaigns with AFL++ and libFuzzer, wire them into CI</li>
    <li>Triage and fix the bugs the fuzzers find</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, fuzzing tools (AFL++, libFuzzer, cargo-fuzz), differential testing.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete <code>findutils</code> GNU compatibility</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: Sylvestre</span>
  </div>
  <p><a href="https://github.com/uutils/findutils">uutils/findutils</a> already passes <a href="https://github.com/uutils/findutils-tracking/">more than half</a> of the GNU findutils and BFS tests. Finish the remaining work to reach full compatibility and production readiness.</p>
  <ul>
    <li>Implement missing options and predicates for <code>find</code></li>
    <li>Fix edge cases in traversal and symlink handling</li>
    <li>Complete <code>xargs</code> argument handling</li>
    <li>Pass the remaining GNU tests; add differential fuzzing</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, filesystem operations, <code>find</code>/<code>xargs</code> usage; fuzzing a plus.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete <code>diffutils</code> GNU compatibility</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/diffutils">uutils/diffutils</a> implements <code>diff</code>, <code>diff3</code>, <code>cmp</code> and <code>sdiff</code>. Complete the remaining features and edge cases so it passes the GNU test suite.</p>
  <ul>
    <li>Implement missing options and output formats for <code>diff</code></li>
    <li>Improve algorithm efficiency for large files</li>
    <li>Complete <code>diff3</code> three-way merges</li>
    <li>Pass the GNU diffutils tests; add differential fuzzing</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, diff algorithms (Myers, Patience), text processing.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete the Rust implementation of <code>sed</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/sed">uutils/sed</a> has been started but needs significant work to fully match GNU <code>sed</code> and POSIX. Implement the missing commands and edge cases and make it pass the GNU test suite.</p>
  <ul>
    <li>Implement missing commands and addressing flags</li>
    <li>Handle complex regex, backreferences and multi-line pattern space</li>
    <li>Implement hold-space operations correctly</li>
    <li>Pass the GNU <code>sed</code> tests; add differential fuzzing</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, regular expressions, <code>sed</code> scripting, text processing.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Rust implementation of <code>grep</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-hard">Hard</span>
    <span class="gsoc-badge size">~350h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p>Build a high-performance, feature-complete drop-in replacement for GNU <a href="https://github.com/uutils/grep">grep</a> - full command-line interface, output modes and edge-case behavior, with the performance Rust can provide.</p>
  <ul>
    <li>Implement the full POSIX/GNU <code>grep</code> CLI</li>
    <li>Support BRE, ERE and PCRE patterns</li>
    <li>Handle context lines, recursive search, binary and compressed files</li>
    <li>Pass the GNU <code>grep</code> tests; benchmark against GNU grep</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, regex engines, performance optimization, I/O.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Rust implementation of <code>awk</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-hard">Hard</span>
    <span class="gsoc-badge size">~350h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p>Implement <a href="https://github.com/uutils/awk">awk</a>, a complete programming language for pattern scanning and text processing, targeting POSIX <code>awk</code> and GNU <code>awk</code> (gawk) extensions.</p>
  <ul>
    <li>Build the lexer, parser and pattern-action execution engine</li>
    <li>Support built-in variables (<code>NR</code>, <code>NF</code>, <code>FS</code>, <code>RS</code>) and functions</li>
    <li>Implement field splitting, arrays, user functions and control flow</li>
    <li>Set up GNU test suite execution for validation</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, lexers/parsers/interpreters, regex; language implementation a plus.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete <code>procps</code> implementation</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~350h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/procps">uutils/procps</a> reimplements the process and system monitoring tools. Complete the core utilities and reach production readiness with full GNU compatibility. Scope can be focused on one of the groups below.</p>
  <ul>
    <li>Process management &amp; info: <code>ps</code>, <code>pgrep</code>, <code>pidwait</code>, <code>pkill</code>, <code>skill</code>, <code>snice</code></li>
    <li>System monitoring &amp; statistics: <code>top</code>, <code>vmstat</code>, <code>tload</code>, <code>w</code>, <code>watch</code></li>
    <li>Memory &amp; resource analysis: <code>pmap</code>, <code>slabtop</code>, <code>free</code>, <code>uptime</code></li>
    <li>Robust <code>/proc</code> parsing across kernels; run the GNU procps tests</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, Linux <code>/proc</code> filesystem, process management and monitoring.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete <code>util-linux</code> implementation</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~350h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/util-linux">uutils/util-linux</a> reimplements essential system utilities. Complete the most commonly used tools and reach production-ready status with full compatibility. Scope can be focused on one of the groups below.</p>
  <ul>
    <li>Essential system utilities: <code>dmesg</code>, <code>lscpu</code>, <code>lsipc</code>, <code>lslocks</code>, <code>lsmem</code>, <code>lsns</code>, <code>mount</code>, <code>umount</code></li>
    <li>Process &amp; resource management: <code>chrt</code>, <code>ionice</code>, <code>kill</code>, <code>renice</code>, <code>prlimit</code>, <code>taskset</code>, <code>runuser</code></li>
    <li>User &amp; session management: <code>su</code>, <code>agetty</code>, <code>last</code>, <code>lslogins</code>, <code>mesg</code>, <code>setsid</code>, <code>setterm</code></li>
    <li>Run the GNU util-linux tests; man-page compatibility</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, Linux system calls and kernel interfaces, system administration.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Complete <code>bsdutils</code> implementation</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><a href="https://github.com/uutils/bsdutils">uutils/bsdutils</a> reimplements BSD-origin utilities found on Linux. Complete the core tools with compatibility across BSD and GNU/Linux variants.</p>
  <ul>
    <li>Complete <code>logger</code>, <code>column</code>, <code>hexdump</code>, <code>look</code> and friends</li>
    <li>Terminal session recording: <code>script</code>, <code>scriptlive</code>, <code>scriptreplay</code></li>
    <li>Handle cross-platform differences and portability</li>
    <li>Set up test suites for both BSD and GNU variants</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, BSD and Linux environments, terminal emulation, cross-platform development.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Localization</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-hard">Hard</span>
    <span class="gsoc-badge size">Size: TBD</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p>Support localization for formatting, quoting and sorting in utilities like <code>date</code>, <code>ls</code> and <code>sort</code>. The core question is how to deal with locale data: the all-Rust <a href="https://github.com/unicode-org/icu4x">icu4x</a> library (possibly with a custom <code>localedef</code>-like command) versus a wrapper around the C <code>icu</code> library.</p>
  <ul>
    <li>Described in detail in <a href="https://github.com/uutils/coreutils/issues/3997">issue #3997</a></li>
    <li>Background discussion in <a href="https://github.com/uutils/coreutils/issues/1919#issuecomment-846471073">#1919</a> and <a href="https://github.com/uutils/coreutils/issues/3584">#3584</a></li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, Unicode/locale handling.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Code refactoring for <code>procps</code>, <code>util-linux</code> &amp; <code>bsdutils</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: Sylvestre</span>
  </div>
  <p>Refactor the Rust versions of procps, util-linux and bsdutils to reduce duplication, particularly around <code>uudoc</code>, the test framework, and single/multicall binary support.</p>
  <ul>
    <li>Eliminate duplicated code across the three projects</li>
    <li>Unify the documentation and test scaffolding</li>
    <li>Improve maintainability and shared infrastructure</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, Linux utilities, code optimization and refactoring.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">A multicall binary and core library for <code>findutils</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p><code>findutils</code> currently consists of a few unconnected binaries. Build a multicall binary (like <code>coreutils</code>) and a library of shared functions (like <code>uucore</code>).</p>
  <ul>
    <li>Design a unified multicall entry point</li>
    <li>Extract shared functionality into a core library</li>
    <li>Consider sharing code between coreutils and findutils</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, library and CLI design.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">GNU test execution for <code>procps</code>, <code>util-linux</code>, <code>diffutils</code> &amp; <code>bsdutils</code></h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: Sylvestre</span>
  </div>
  <p>Integrate the upstream test suites against the Rust versions of procps, util-linux, diffutils and bsdutils - crucial for proving drop-in compatibility. We already do this for coreutils via <a href="https://github.com/uutils/coreutils/blob/main/.github/workflows/GnuTests.yml">GitHub Actions</a>, a <a href="https://github.com/uutils/coreutils/blob/main/util/build-gnu.sh">build script</a> and a <a href="https://github.com/uutils/coreutils/blob/main/util/run-gnu-test.sh">run script</a>.</p>
  <ul>
    <li>Adapt the coreutils CI approach to each project</li>
    <li>Wire the test suites into GitHub Actions</li>
    <li>Track and report compatibility over time</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> GitHub Actions, Rust, GNU testing methodologies, Linux utilities.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Symbolic/fuzz testing and formal verification of tool grammars</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-mixed">Mixed</span>
    <span class="gsoc-badge size">Size: Mixed</span>
    <span class="gsoc-badge mentor">Mentor: TBD (informally @chadbrewbaker)</span>
  </div>
  <p>Inspired by <a href="https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3">lightweight formal methods at AWS</a>; most KLEE scaffolding was done for <a href="https://project-oak.github.io/rust-verification-tools/2021/07/14/coreutils.html">KLEE 2021</a>. Start with <code>wc</code>, formalize its command-line grammar, run it under AFL++ and KLEE, then generalize.</p>
  <ul>
    <li>Add proofs of resource use and correctness, especially around syscalls and memory</li>
    <li>Unify fuzzer and KLEE seeds so they help each other find paths</li>
    <li>Formalize the <code>wc</code> UTF-8 inner loop into a SIMD-friendly automaton / monoid</li>
    <li>Automate detection of <a href="https://accidentallyquadratic.tumblr.com">accidentally quadratic</a> behavior</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, KLEE, AFL++, SMT solvers (Z3, CVC5), TLA+/Alloy, grammar testing.</p>
</article>

<article class="gsoc-card">
  <h3 class="gsoc-card-title">Official Redox support</h3>
  <div class="gsoc-meta">
    <span class="gsoc-badge diff-medium">Medium</span>
    <span class="gsoc-badge size">~175h</span>
    <span class="gsoc-badge mentor">Mentor: TBD</span>
  </div>
  <p>We want to support the <a href="https://www.redox-os.org/">Redox</a> operating system but are not actively testing against it. Since the last round of fixes in <a href="https://github.com/uutils/coreutils/pull/2550">#2550</a>, regressions have likely crept in.</p>
  <ul>
    <li>Set up Redox in CI</li>
    <li>Fix the issues that arise and port missing features</li>
  </ul>
  <p class="gsoc-skills"><strong>Skills:</strong> Rust, cross-platform/OS development.</p>
</article>

</div>
