+++
title = "Uutils at GSOC"
+++

Google summer of code is:

> Google Summer of Code is a global, online program focused on bringing
> new contributors into open source software development. GSoC
> Contributors work with an open source organization on a 12+ week
> programming project under the guidance of mentors.

If you want to know more about how it works, check out the links below.

**Useful links**:
* [GSOC Contributor Guide](https://google.github.io/gsocguides/student/)
* [GSOC FAQ](https://developers.google.com/open-source/gsoc/faq)
* [GSOC Timeline](https://developers.google.com/open-source/gsoc/timeline) (important for deadlines!)

# What is it about?

The [uutils project](https://github.com/uutils/) is aiming at rewriting key Linux utilities in Rust, targeting [coreutils](https://github.com/uutils/coreutils), [findutils](https://github.com/uutils/findutils), [diffutils](https://github.com/uutils/diffutils), [procps](https://github.com/uutils/procps), [util-linux](https://github.com/uutils/util-linux), and [bsdutils](https://github.com/uutils/bsdutils). Their goal is to create fully compatible, high-performance drop-in replacements, ensuring reliability through upstream test suites. Significant progress has been made with coreutils, diffutils, and findutils, while the other utilities are in the early stages of development.

# How to get started

Here are some steps to follow if you want to apply for a GSOC project
with uutils.

1. **Check the requirements.** You have to meet
  [Google's requirements](https://developers.google.com/open-source/gsoc/faq#what_are_the_eligibility_requirements_for_participation) to apply. Specifically for uutils, it's best if you at
  least know some Rust and have some familiarity with using the
  coreutils and the other tools.
1. **Reach out to us!** We are happy to discuss potential projects and help you find a meaningful project for uutils. Tell us what interests you about the project and what experience you have and we can find a suitable project together. You can talk to the uutils maintainers on the [Discord server](https://discord.gg/wQVJbvJ). In particular, you can contact:
    * Sylvestre Ledru (@sylvestre on GitHub and Discord)
    * Terts Diepraam (@tertsdiepraam on GitHub and @terts on Discord)
2. **Get comfortable with uutils.** To find a good project you need to understand the codebase. We recommend that you take a look at the code, the issue tracker and maybe try to tackle some [good-first-issues](https://github.com/uutils/coreutils/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22). Also take a look at our [contributor guidelines](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md).
3. **Find a project and a mentor.** We have a [list of potential projects](https://github.com/uutils/coreutils/wiki/GSOC-Project-Ideas) you can adapt or use as inspiration. Make sure discuss your ideas with the maintainers! Some project ideas below have suggested mentors you could contact.
4. **Write the application.** You can do this with your mentor. The application has to go through Google, so make sure to follow all the advice in Google's [Contributor Guide](https://google.github.io/gsocguides/student/writing-a-proposal). Please make sure you include your prior contributions to uutils in your application.

# Tips

- Make sure the project is concrete and well-defined.
- Communication is super important!
- Try to tackle some issues to get familiar with uutils and demonstrate your motivation.

# Project Ideas

This page contains project ideas for the Google Summer of Code for
uutils. Feel free to suggest project ideas of your own.

[Guidelines for the project list](https://google.github.io/gsocguides/mentor/defining-a-project-ideas-list)

Summarizing that page, each project should include:
- Title
- Description
- Expected outputs
- Skills required/preferred
- Possible mentors
- Size (either ~175 or ~350 hours)
- Difficulty (easy, medium or hard)

## Complete the `ls` GNU compatibility

Most of the features in `ls` have been implemented by now.
However, a bunch of work remains on the color side for a full GNU compat. Other tests are failing.
We have 12 remaining failing tests.

To get the list of failing tests, run:
```
$ ./util/remaining-gnu-error.py |grep "/ls/"
```

- Difficulty: Medium
- Size: 175
- Mentors: Sylvestre
- Required skills:
  - Rust
  - Basic knowledge about the terminal

## Complete the `cp` GNU compatibility

Most of the features in `cp` have been implemented by now.
However, some corner cases needs to be implemented. We have 16 remaining failing tests.

To get the list of failing tests, run:
```
$ ./util/remaining-gnu-error.py |grep "/cp/"
```

- Difficulty: Medium
- Size: 175
- Mentors: Sylvestre
- Required skills:
  - Rust
  - Basic knowledge about the terminal

## Complete the `mv` GNU compatibility

Most of the features in `mv` have been implemented by now.
However, some corner cases needs to be implemented. We have 10 remaining failing tests.

To get the list of failing tests, run:
```
$ ./util/remaining-gnu-error.py |grep "/mv/"
```

- Difficulty: Medium
- Size: 175
- Mentors: Sylvestre
- Required skills:
  - Rust
  - Basic knowledge about the terminal

## Improve `stty`
The `stty` utility is currently only partially implemented and should be expanded.

See issues: [#3859](https://github.com/uutils/coreutils/issues/3859), [#3860](https://github.com/uutils/coreutils/issues/3860), [#3861](https://github.com/uutils/coreutils/issues/3861), [#3862](https://github.com/uutils/coreutils/issues/3862), [#3863](https://github.com/uutils/coreutils/issues/3863).

- Difficulty: Medium
- Size: 175
- Mentors: Terts Diepraam
- Required skills:
  - Rust
  - Basic knowledge about the terminal

## Improve findutils coverage

[More than half](https://github.com/uutils/findutils-tracking/) of the findutils GNU & BFS are passing. The goal of this project is to improve the compatibility of uutils/findutils with regard to GNU's implementation.

See [https://github.com/uutils/findutils](https://github.com/uutils/findutils)


To achieve this, we should invest in fuzzing findutils:
Just like we are [doing with some](https://github.com/uutils/coreutils/tree/main/fuzz/fuzz_targets) [Coreutils programs](https://github.com/uutils/coreutils/blob/main/.github/workflows/fuzzing.yml), we should:
* fuzz findutils
* do some differential testing with GNU's implementation (and potentially others)

- Difficulty: Medium
- Size: 175
- Mentors: Sylvestre
- Required skills:
  - Rust
  - Basic knowledge about the terminal usage

## Localization
Support for localization for formatting, quoting & sorting in various utilities, like `date`, `ls` and `sort`. For this project, we need to figure out how to deal with locale data. The first option is to use the all-Rust `icu4x` library, which has a different format than what distributions usually provide. In this case a solution _could_ be to write a custom `localedef`-like command. The second option is to use a wrapper around the C `icu` library, which comes with the downside of being a C dependency.

This is described in detail in [issue #3997](https://github.com/uutils/coreutils/issues/3997).

And was also discussed in [#1919](https://github.com/uutils/coreutils/issues/1919#issuecomment-846471073), [#3584](https://github.com/uutils/coreutils/issues/3584).

- Difficulty: Hard
- Size: TBD
- Mentors: TBD
- Required skills:
  - Rust

## `procps`: Development of Process Management and Information Tools in Rust

This project focuses on creating Rust-based implementations of process management and information tools: `ps`, `pgrep`, `pidwait`, `pkill`, `skill`, and `snice`. The goal is to ensure full compatibility with all options and successful passing of GNU tests, maintaining the functionality and reliability of these essential tools.

- **Description:** Develop Rust-based versions of key process management and information tools, ensuring compatibility with all options and GNU tests.
- **Expected Outputs:** Efficient, reliable tools with full option compatibility and passing GNU tests.
- **Skills Required/Preferred:** Proficiency in Rust, understanding of Linux process management, experience with GNU testing methodologies.
- **Possible Mentors:** [To be determined]
- **Size:** ~350 hours.
- **Difficulty:** Medium.

## `procps`: Development of System Monitoring and Statistics Tools in Rust

This project involves the Rust-based development of system monitoring and statistics tools: `top`, `vmstat`, `tload`, `w`, and `watch`. The objective is to achieve full compatibility with all options and to pass GNU tests, ensuring these tools provide accurate and reliable system insights.

- **Description:**:  Create Rust versions of system monitoring and statistics tools, with a focus on full option compatibility and passing GNU tests.
- **Expected Outputs:**:  Robust tools for system monitoring and statistics, fully compatible with existing options and verified by GNU tests.
- **Skills Required/Preferred:**:  Rust expertise, knowledge of system performance metrics, familiarity with GNU testing frameworks.
- **Possible Mentors:**:  [To be determined]
- **Size:**:  ~350 hours.
- **Difficulty:**:  Medium.

## `procps`: Development of Memory and Resource Analysis Tools in Rust

The aim of this project is to develop Rust-based versions of memory and resource analysis tools: `pmap` and `slabtop`. The project will focus on ensuring full compatibility with all options and passing GNU tests, providing in-depth and reliable analysis of memory usage and kernel resources.

- **Description:**:  Implement Rust versions of memory and resource analysis tools, with emphasis on option compatibility and passing GNU tests.
- **Expected Outputs:**:  Advanced tools for memory and resource analysis, fully compatible with existing options and validated by GNU tests.
- **Skills Required/Preferred:**:  Proficiency in Rust, deep understanding of memory management and kernel resources, experience with GNU testing methodologies.
- **Possible Mentors:**:  [To be determined]
- **Size:**:  ~175 hours.
- **Difficulty:**:  Medium.

## `util-linux`: Reimplementation of essential system utilities in Rust

The objective of this project is to reimplement essential system utilities from the util-linux package in Rust. This initiative will include the development of Rust-based versions of various utilities, such as `dmesg`, `lscpu`, `lsipc`, `lslocks`, `lsmem`, and `lsns`. The primary focus will be on ensuring that these Rust implementations provide full compatibility with existing options and pass GNU tests, delivering reliable and efficient system utilities for Linux users.

- **Description:**: Reimplement essential system utilities, including `dmesg`, `lscpu`, `lsipc`, `lslocks`, `lsmem`, and `lsns`, using Rust while emphasizing compatibility with existing options and GNU test validation.
- **Expected Outputs:**: Rust-based system utilities that mirror the functionality of their counterparts, ensuring full compatibility and reliability, validated by GNU tests.
- **Skills Required/Preferred:**: Proficiency in Rust programming, knowledge of system utilities and their functionality, experience with GNU testing methodologies.
- **Possible Mentors:**: [To be determined]
- **Size:**: ~175 hours.
- **Difficulty:**: Medium.

## `util-linux`: Process and Resource Management: Reimplementation in Rust

This project focuses on the reimplementations of crucial Linux utilities related to process and resource management in the Rust programming language. The target utilities include `runuser`, `sulogin`, `chrt`, `ionice`, `kill`, `renice`, `prlimit`, `taskset`, and `uclampset`. The primary goal is to create Rust-based versions of these utilities, ensuring compatibility with their original counterparts, and validating their functionality with GNU tests.

- **Description:**: Reimplement key Linux utilities for process and resource management, such as `runuser`, `sulogin`, `chrt`, `ionice`, `kill`, `renice`, `prlimit`, `taskset`, and `uclampset`, in the Rust programming language. The emphasis is on maintaining compatibility with the original utilities and validating their functionality using GNU tests.
- **Expected Outputs:**: Rust-based versions of the specified utilities that seamlessly integrate into Linux systems, providing the same functionality and passing GNU tests for reliability.
- **Skills Required/Preferred:**: Proficiency in Rust programming, understanding of process and resource management on Linux, experience with GNU testing methodologies.
- **Possible Mentors:**: [To be determined]
- **Size:**: ~175 hours.
- **Difficulty:**: Medium.

## `util-linux`: User and Session Management: Reimplementation in Rust

This project focuses on the reimplementations of essential Linux utilities related to user and session management in the Rust programming language. The target utilities include `su`, `agetty`, `ctrlaltdel`, `pivot_root`, `switch_root`, `last`, `lslogins`, `mesg`, `setsid`, and `setterm`. The primary goal is to create Rust-based versions of these utilities, ensuring compatibility with their original counterparts, and validating their functionality with GNU tests.

- **Description:**: Reimplement essential Linux utilities for user and session management, such as `su`, `agetty`, `ctrlaltdel`, `pivot_root`, `switch_root`, `last`, `lslogins`, `mesg`, `setsid`, and `setterm`, in the Rust programming language. The emphasis is on maintaining compatibility with the original utilities and validating their functionality using GNU tests.
- **Expected Outputs:**: Rust-based versions of the specified utilities that seamlessly integrate into Linux systems, providing the same functionality and passing GNU tests for reliability.
- **Skills Required/Preferred:**: Proficiency in Rust programming, understanding of user and session management on Linux, experience with GNU testing methodologies.
- **Possible Mentors:**: [To be determined]
- **Size:**: ~175 hours.
- **Difficulty:**: Medium.

This project aims to modernize and enhance critical Linux utilities related to user and session management, ensuring they remain efficient, reliable, and fully compatible with existing systems.

## Code refactoring for `procps`, `util-linux`, and `bsdutils`

Refactoring the Rust-based versions of procps, util-linux, and bsdutils to reduce code duplication.

- **Title:**:  Code Optimization and Refactoring for procps, util-linux, and bsdutils in Rust
- **Description:**:  This project involves optimizing and refactoring the Rust-based versions of procps, util-linux, and bsdutils. The focus will be on eliminating duplicated code across these utilities, particularly in areas like uudoc, the test framework, and support for single/multicall binaries.
- **Expected outputs:**:  A streamlined codebase with reduced duplication, improved maintainability for procps, util-linux, and bsdutils.
- **Skills required/preferred:**:  Proficiency in Rust programming, understanding of Linux utilities, experience with code optimization and refactoring.
- **Possible mentors:**:  Sylvestre
- **Size:**:  175 hours
- **Difficulty:**:  Medium

## A multicall binary and core library for `findutils`

`findutils` currently exists of a few unconnected binaries. It would be nice to have a multicall binary (like
`coreutils`) and a library of shared functions (like `uucore`).

This also might require thinking about sharing code between coreutils and findutils.

- **Difficulty**: Medium
- **Size**: 175 hours
- **Mentors**: TBD
- Required skills:
  - Rust

## Implementation of GNU Test Execution for `procps`, `util-linux`, `diffutils`, and `bsdutils`

The project aims at integrating the GNU test suite execution using the Rust-based versions of `procps`, `util-linux`, `diffutils`, and `bsdutils`, ensuring compatibility, crucial for seamless drop-in replacement integration. We have been doing such operation successfully for the Coreutils using [GitHub Actions](https://github.com/uutils/coreutils/blob/main/.github/workflows/GnuTests.yml), a [build script](https://github.com/uutils/coreutils/blob/main/util/build-gnu.sh) and a [run script](https://github.com/uutils/coreutils/blob/main/util/run-gnu-test.sh).

- **Description:**:  Run the GNU test suite on the Rust-based versions of procps, util-linux, diffutils, and bsdutils
- **Expected Outputs:**:  The GNU test suite execution for each utility, ensuring functionality meets expected standards
- **Skills Required/Preferred:**:  GitHub action understanding, Proficiency in Rust, experience with GNU testing methodologies, familiarity with Linux system utilities, and understanding of software testing principles.
- **Possible Mentors:**:  Sylvestre
- **Size:**:  ~175 hours
- **Difficulty:**:  Medium

## Refactoring `factor`

The uutils `factor` is currently significantly slower than
GNU `factor` and only supports numbers up to 2^64-1. See [issue 1559](https://github.com/uutils/coreutils/issues/1559)
and [issue 1456](https://github.com/uutils/coreutils/issues/1456) for more information.

- Difficulty: Hard
- Size: 175 hours
- Mentors: TBD
- Required skills:
  - Rust
  - Optimization techniques
  - Mathematics

## Symbolic/Fuzz Testing and Formal Verification of Tool Grammars

See [Using Lightweight Formal Methods to Validate a Key Value Storage Node In Amazon S3](https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3).

Most KLEE scaffolding was done for [KLEE 2021](https://project-oak.github.io/rust-verification-tools/2021/07/14/coreutils.html).

Start with `wc`, formalize the command line grammar. Get it working under AFL++ and Klee. Add several proofs of resource use and correctness - especially proofs about operating system calls and memory/cache usage. Generalize to other tools. Try to unify the seeds for the fuzzer and KLEE so they can help each other find new paths. Use QEMU to test several operating systems and architectures. Automate detection of performance regressions - try to hunt for [accidentally quadratic](https://accidentallyquadratic.tumblr.com) behavior.

Specific to `wc` - formalize the inner loop over a UTF-8 buffer into a finite state automata with counters that can generalize into SIMD width operations like [simdjson](https://simdjson.org). Further generalize into a monoid so K processors can combine results.

- Difficulty: Mixed
- Size: Mixed
- Mentors: TBD  - informally @chadbrewbaker
- Required skills:
  - Rust
  - KLEE
  - Fuzzers like AFL++
  - Grammar testing frameworks like [LARK](https://github.com/ligurio/lark-grammars/tree/master/lark_grammars/grammars)
  - /usr/bin/time -v (and similar tools for Widows/OSX).
  - Alloy, TLA+, [P](https://github.com/p-org/P)
  - System call tracing with [strace](https://jvns.ca/blog/2014/02/17/spying-on-ssh-with-strace/), [uftrace](https://github.com/namhyung/uftrace) etc.
  - SMT solvers like [Z3](https://www.philipzucker.com/programming-and-interactive-proving-with-z3py/) and CVC5 for superoptimization and proofs of automata equivalence.
  - [SOUPER](https://github.com/google/souper) and [CompilerExplorer](https://godbolt.org)
  - Basic statistics on quantiles (histograms) for outlier detection. The math is simple as generalizing from one to k medians but the formal notation is [complex](https://aakinshin.net/posts/thdqe-hdi/).
  - [MPI-IO](https://wgropp.cs.illinois.edu/courses/cs598-s16/lectures/lecture32.pdf), just enough to read a file into k parts and combine "wc" outputs to understand multicore scaling.

## Development of advanced terminal session recording and replay tools in Rust

This project involves creating Rust-based implementations of `/usr/bin/script`, `/usr/bin/scriptlive`, and `/usr/bin/scriptreplay`. The `/usr/bin/script` command will record terminal sessions, `/usr/bin/scriptlive` will offer real-time recording features, and `/usr/bin/scriptreplay` will be used to replay recorded sessions.

The work will happen in https://github.com/uutils/bsdutils.

- **Description:**:  Develop Rust-based versions of `/usr/bin/script`, `/usr/bin/scriptlive`, and `/usr/bin/scriptreplay` for terminal session recording and replaying.
- **Expected Outputs:**:  Robust and cross-platform terminal session recording and replay tools, with real-time features in `scriptlive`.
- **Skills Required/Preferred:**:  Proficiency in Rust, understanding of terminal emulation, experience with cross-platform development.
- **Possible Mentors:**:  [To be determined]
- **Size:**:  ~175 hours
- **Difficulty:**:  Medium

## Official Redox support</h2>
We want to support the Redox operating system, but are not actively testing against it. Since the last round of fixes in [#2550](https://github.com/uutils/coreutils/pull/2550), many changes have probably been introduced that break Redox support. This project would involve setting up Redox in the CI and fixing any issues that arise and porting features over.

- Difficulty: Medium
- Size: 175 hours
- Mentors: TBD
- Required skills:
  - Rust
