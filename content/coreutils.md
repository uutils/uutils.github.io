+++

title = "coreutils"
template = "project.html"

[extra]
status = "ready"

+++

uutils coreutils is a cross-platform reimplementation of the GNU coreutils in Rust. While all programs have been implemented, some options might be missing or different behavior might be experienced.

[![GNU test results](https://raw.githubusercontent.com/uutils/coreutils-tracking/refs/heads/main/gnu-results.svg)](https://github.com/uutils/coreutils-tracking)

# Goals

This project aims to be a drop-in replacement for the GNU utils. Differences with GNU are treated as bugs.

uutils aims to work on as many platforms as possible, to be able to use the same utils on Linux, Mac, Windows and other platforms. This ensures, for example, that scripts can be easily transferred between platforms.

# Beyond GNU

Being a drop-in replacement still leaves room to do better where nothing depends on the exact behavior. GNU reports every error as a single line on stderr, which says *what* went wrong but not *where*. When a parse error happens at a terminal - a bad `sort` key, a `chmod` mode, a `tr` set - uutils echoes the command line back and points a caret at the part that is at fault, the way a compiler does:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">tr</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> tr &#x27;qw[y-b]&#x27; x</div>
<pre class="diag">tr: range-endpoints of &#x27;y-b&#x27; are in reverse collating sequence order
   <span class="a-d">╭─[</span> tr:1:7 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">tr qw[</span><span class="a-e">y-b</span><span class="a-s">] x</span>
 <span class="a-f">  │</span>       <span class="a-e">─┬─</span>
 <span class="a-f">  │</span>        <span class="a-e">╰───</span> did you mean &#x27;b-y&#x27;?
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a range goes from the lower character to the higher one, as in a-z
<span class="a-d">───╯</span></pre>
  </div>
</div>

Scripts, pipes and test harnesses still get the plain GNU one-line message, so nothing that reads stderr can tell the difference. See [Pointing at the error](/blog/2026-08-error-diagnostics/) for the utilities this covers and how to turn it on and off.

# Contributing

To contribute to uutils coreutils, please see [CONTRIBUTING](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md).

# License

uutils coreutils is licensed under the MIT License - see the [LICENSE](https://github.com/uutils/coreutils/blob/main/LICENSE) file for details.

GNU Coreutils is licensed under the GPL 3.0 or later.
