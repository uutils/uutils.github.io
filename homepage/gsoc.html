# What is Google Summer of Code?

As Google explains it:

> Google Summer of Code is a global, online program focused on bringing new contributors into open source software development. GSoC Contributors work with an open source organization on a 12+ week programming project under the guidance of mentors.

If you want to know more about how it works, check out the links below.

**Useful links**:
* [GSOC Contributor Guide](https://google.github.io/gsocguides/student/)
* [GSOC FAQ](https://developers.google.com/open-source/gsoc/faq)
* [GSOC Timeline](https://developers.google.com/open-source/gsoc/timeline) (important for deadlines!)

# How to get started

Here are some steps to follow if you want to apply for a GSOC project with uutils.

0. **Check the requirements.** You have to meet [Google's requirements](https://developers.google.com/open-source/gsoc/faq#what_are_the_eligibility_requirements_for_participation) to apply. Specifically for uutils, it's best if you at least know some Rust and have some familiarity with using the coreutils.
1. **Reach out to us!** We are happy to discuss potential projects and help you find a meaningful project for uutils. Tell us what interests you about the project and what experience you have and we can find a suitable project together. You can talk to the uutils maintainers on the [Discord server](https://discord.gg/wQVJbvJ). In particular, you can contact:
    * Sylvestre Ledru (@sylvestre on GitHub and Discord)
    * Terts Diepraam (@tertsdiepraam on GitHub and @terts on Discord)
2. **Get comfortable with uutils.** To find a good project you need to understand the codebase. We recommend that you take a look at the code, the issue tracker and maybe try to tackle some [good-first-issues](https://github.com/uutils/coreutils/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22). Also take a look at our [contributor guidelines](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md).
3. **Find a project and a mentor.** We have a [list of potential projects](https://github.com/uutils/coreutils/wiki/GSOC-Project-Ideas) you can adapt or use as inspiration. Make sure discuss your ideas with the maintainers! Some project ideas below have suggested mentors you could contact.
4. **Write the application.** You can do this with your mentor. The application has to go through Google, so make sure to follow all the advice in Google's [Contributor Guide](https://google.github.io/gsocguides/student/writing-a-proposal).

# Tips

* Make sure the project is concrete and well-defined.
* Communication is super important!
* Try to tackle some simple issues to get familiar with uutils.

# Project Ideas

This page contains project ideas for the Google Summer of Code for uutils. Feel free to suggest project ideas of your own.

[Guidelines for the project list](https://google.github.io/gsocguides/mentor/defining-a-project-ideas-list)

Summarizing that page, each project should include:
- Title
- Description
- Expected outputs
- Skills required/preferred
- Possible mentors
- Size (either ~175 or ~350 hours)
- Difficulty (easy, medium or hard)


## Implement `stty`
The `stty` utility is currently only partially implemented and should be expanded.

See issues: [#3859](https://github.com/uutils/coreutils/issues/3859), [#3860](https://github.com/uutils/coreutils/issues/3860), [#3861](https://github.com/uutils/coreutils/issues/3861), [#3862](https://github.com/uutils/coreutils/issues/3862), [#3863](https://github.com/uutils/coreutils/issues/3863).

- Difficulty: Medium
- Size: 175 or 350 depending on the scope
- Mentors: Terts Diepraam
- Required skills:
  - Rust
  - Basic knowledge about the terminal

## Localization
Support for localization for formatting, quoting & sorting in various utilities, like `date`, `ls` and `sort`. For this project, we need to figure out how to deal with locale data. The first option is to use the all-Rust `icu4x` library, which has a different format than what distributions usually provide. In this case a solution _could_ be to write a custom `localedef`-like command. The second option is to use a wrapper around the C `icu` library, which comes with the downside of being a C dependency.

This is described in detail in [issue #3997](https://github.com/uutils/coreutils/issues/3997).

And was also discussed in [#1919](https://github.com/uutils/coreutils/issues/1919#issuecomment-846471073), [#3584](https://github.com/uutils/coreutils/issues/3584).

- Difficulty: Hard
- Size: TBD
- Mentors: TBD
- Required skills:
  - Rust

## Better GNU test reports
Better integration with the GNU tests, because they usually test many cases in one sh file and I would like to have more detailed feedback on how many tests inside a file are passing.

- Difficulty: TBD
- Size: TBD
- Mentors: TBD
- Required skills:
  - Rust
  - Bash
  - (preferably) CI/CD

## A multicall binary and core library for `findutils`
`findutils` currently exists of a few unconnected binaries. It would be nice to have a multicall binary (like `coreutils`) and a library of shared functions (like `uucore`).

This also might require thinking about sharing code between coreutils and findutils.

- Difficulty: Medium
- Size: 175 hours
- Mentors: TBD
- Required skills:
  - Rust

## Refactoring `factor`
The uutils `factor` is currently significantly slower than GNU `factor` and only supports numbers up to 2^64-1. See [issue 1559](https://github.com/uutils/coreutils/issues/1559) and [issue 1456](https://github.com/uutils/coreutils/issues/1456) for more information.

- Difficulty: Hard
- Size: 175 hours
- Mentors: TBD
- Required skills:
  - Rust
  - Optimization techniques
  - (preferably) mathematics

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

## Official Redox support
We want to support the Redox operating system, but are not actively testing against it. Since the last round of fixes in [#2550](https://github.com/uutils/coreutils/pull/2550), many changes have probably been introduced that break Redox support. This project would involve setting up Redox in the CI and fixing any issues that arise and porting features over.

- Difficulty: Medium
- Size: 175 hours
- Mentors: TBD
- Required skills:
  - Rust

## Port GNU's `parse_datetime`
GNU coreutils has a particularly complex function called `parse_datetime`, which parses absolute and relative date and time according to the rules specified [in the documentation](https://www.gnu.org/software/coreutils/manual/html_node/Date-input-formats.html). We currently only support a small subset of the formats that GNU's `parse_datetime` supports. This function is used for the `-d` option of `touch` and as input to `date`.

At the end of the project, there should be a module (or crate) with a fully compatible datetime parser with an extensive test suite.

See [PR 4193](https://github.com/uutils/coreutils/pull/4193) and [`parse_date` in `touch`](https://github.com/uutils/coreutils/blob/6a9660f9f64c44db85ee2c130d892946d78781ab/src/uu/touch/src/touch.rs#L334)

- Difficulty: Hard
- Size: ~350 hours
- Mentors: TBD
- Required skills:
  - Rust
  - Parsing
