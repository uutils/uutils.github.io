+++
title = "Extending the coreutils project - Rewriting base tools in Rust "
draft = true
date = 2024-02-17
authors = ["Sylvestre Ledru", "Terts Diepraam"]
+++

Over the last 4 years, we have been working at reimplementing some of the key linux tools in Rust. We started with the Coreutils and Findutils.

As we are getting closer to parity with the GNU implementation of the Coreutils, we have been thinking about what is next.

Given the overwhelming positive feedback around this initiative, we are going to extend our efforts to rewrite other part of the modern Linux/Unix/Mac stack in Rust. We also noticed a lot of contributions on these projects coming for a lot of different contributors.

For the next projects, we are using the same approach: dropped-in replacement of the GNU C implementation. For consistency purposes and not interested by a license debate, we are going to use the MIT license.

For now, we are going to focus on:
* util-linux
* bsdutils
* procps
* diffutils (transfer by Michael Howell)
* acl

As they are part of the essential packages on Debian & Ubuntu.

We are also glad to announced that TODO transfered their implementation of the diffutils under uutils.

Sylvestre Ledru, Terts and Daniel
