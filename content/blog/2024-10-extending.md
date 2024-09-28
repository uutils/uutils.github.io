+++
title = "Extending the Coreutils project - Rewriting base tools in Rust "
draft = true
date = 2024-03-26
authors = ["Sylvestre Ledru", "Terts Diepraam"]
+++

Over the last 4 years, we have been working at reimplementing some of the key Linux tools in Rust. We started with the [Coreutils](https://github.com/uutils/coreutils) and [findutils](https://github.com/uutils/findutils).

As we approach feature parity with the GNU Coreutils implementation, and as its adoption in production environments continues to expand, we have been thinking about what is next.

Given the overwhelming positive feedback around this initiative, we are going to extend our efforts to rewrite other parts of the modern Linux/Unix/Mac stack in Rust (still with Windows support in mind when relevant).
We also noticed a lot of contributions on these projects coming from a lot of different hackers (475 different contributors on Coreutils!).
With the growing enthusiasm for Rust and the eagerness to learn it, now is the best time to push this project. We think that rewriting in Rust will help with the longer term maintenance of the ecosystem, ensuring it stays robust, safe and welcoming for new generations of contributors.

For the next projects, we are using the same approach: dropped-in replacement of the GNU C implementation.
For now, we are going to focus on:
* [diffutils](https://github.com/uutils/diffutils) (transferred by Michael Howell) - [Good first issues](https://github.com/uutils/diffutils/labels/good%20first%20issue)
  Almost ready
* [procps](https://github.com/uutils/procps) - [Good first issues](https://github.com/uutils/procps/labels/good%20first%20issue)
  5 programs started
* [acl](https://github.com/uutils/acl) - [Good first issues](https://github.com/uutils/acl/labels/good%20first%20issue)
  The 3 started
* [util-linux](https://github.com/uutils/util-linux) - [Good first issues](https://github.com/uutils/util-linux/labels/good%20first%20issue)
  A couple programs started
* [bsdutils](https://github.com/uutils/bsdutils) - [Good first issues](https://github.com/uutils/bsdutils/labels/good%20first%20issue)
  One program started
* [login](https://github.com/uutils/login/) - [Good first issues](https://github.com/uutils/login/labels/good%20first%20issue)
  Just the skeleton
* [hostname](https://github.com/uutils/hostname/) - [Good first issues](https://github.com/uutils/hostname/labels/good%20first%20issue)
  Almost empty


These packages are part of the essential list on Debian & Ubuntu.


Sylvestre Ledru, Terts Diepraam and Daniel Hofstetter

FAQ
###

How long is it going to take?
-----------------------------

Some programs like diff, acl or hostname should be completed quickly.
Others will take years to be completed.

Do you hate the GNU project?
----------------------------

Not at all: we often contribute to the upstream implementations when we identify issues, add missing tests, etc.


Why the MIT License?
--------------------

For consistency purposes and not interested by a license debate, we are going to use the MIT license just like the Coreutils.


The binaries are too big?
-------------------------

Does it really matter? Yes, Rust binaries are usually bigger than GNU but we don't think it is a blocker, even for embedded devices.


Is it really safer?
-------------------

While Rust is clearly a better language than C/C++ for security, these programs are often very safe. It isn't a key argument for us for
this rewrite.

What about performances?
------------------------

Although we haven't entered the optimization phase, Rust's modern design inherently facilitates some straightforward performance improvements.
