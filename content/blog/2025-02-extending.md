+++
title = "Extending the Coreutils project - Rewriting base tools in Rust"
date = 2025-02-01
page_template = "post.html"
authors = ["Sylvestre Ledru"]
+++

Over the last four years, we have been working on reimplementing some of the key Linux tools in Rust. We started with the [Coreutils](https://github.com/uutils/coreutils) and [findutils](https://github.com/uutils/findutils).

As we approach feature parity with the GNU Coreutils implementation, and as its adoption in production environments continues to expand, we have been thinking about what is next.

Given the very positive feedback around this initiative, we are going to extend our efforts to rewrite other parts of the modern Linux/Unix/Mac stack in Rust (still with Windows support in mind when relevant). These efforts will be managed under the [uutils umbrella](https://github.com/uutils/), which will allow us to maintain a cohesive and unified approach across various utilities.

We also noticed a lot of contributions on these projects coming from a diverse group of hackers (530 different contributors on Coreutils alone!). With the growing enthusiasm for Rust and the eagerness to learn it, now is the best time to push this project forward. Rewriting in Rust will help with the long-term maintenance of the ecosystem, ensuring it stays robust, safe, and welcoming for new generations of contributors.

### Vision for the Future

As we expand the scope of the project, we are working on a future where Rust becomes the backbone of essential Linux, Unix, and potentially macOS system tools. Our focus will be on improving security, ensuring long-term maintainability, and optimizing performance for both modern and legacy systems. Through the uutils umbrella, we aim to create a more secure, efficient, and scalable alternative to the traditional tools, replacing software developed in older, less secure programming languages like C.

This project is also an investment for the future. C is becoming less popular with the next generation of developers. Just like how the Linux kernel continues to evolve and includes Rust, it is our responsibility to upgrade the core utilities of the system to a modern, safer programming language. By doing so, we ensure that the essential tools used in Linux/Unix systems remain relevant, maintainable, and accessible to future contributors.

### Specific Benefits of Rust

Rust offers several advantages over C/C++, particularly in terms of memory safety, concurrency, and performance. By eliminating common security issues such as null pointer dereferences and buffer overflows, Rust allows us to build tools that are inherently safer. Its modern compiler tooling also enables us to optimize performance without sacrificing code safety, ensuring that our utilities can handle the demands of modern computing environments while remaining easy to maintain.

### Challenges and Opportunities

As with any large-scale reimplementation, there are challenges to overcome. Porting complex utilities from C to Rust requires careful consideration of edge cases and platform-specific behaviors. Additionally, ensuring full compatibility across Linux, Unix, and macOS environments presents unique challenges. However, these challenges also offer opportunities for growth and innovation, allowing us to extend and refine core system utilities for modern needs. Rust's modern design gives us the chance to improve both security and performance while maintaining cross-platform compatibility.

### Next Steps

For the next phase of the project, we are adopting the same approach: a drop-in replacement of the C implementations. Here's what's coming next:
| Name                                               | Description                                        | Status                      |
|----------------------------------------------------|----------------------------------------------------|-----------------------------|
| [acl](https://github.com/uutils/acl)               | Access control list utilities                      |                             |
| [bsdutils](https://github.com/uutils/bsdutils)     | Basic utilities for BSD compatibility              |                             |
| [coreutils](https://github.com/uutils/coreutils)   | Basic utilities for the system                     | Production level            |
| [diffutils](https://github.com/uutils/diffutils)   | File comparison utilities                          | Almost ready                |
| [findutils](https://github.com/uutils/findutils)   | Utilities for finding files                        | Getting close to completion |
| [hostname](https://github.com/uutils/hostname)     | Utility to show or set system hostname             |                             |
| [login](https://github.com/uutils/login)           | User login management utilities                    |                             |
| [procps](https://github.com/uutils/procps)         | Utilities for monitoring and controlling processes |                             |
| [util-linux](https://github.com/uutils/util-linux) | Utilities essential for Linux systems              |                             |

These packages are part of the essential list for Debian and Ubuntu, and we're excited to push their Rust reimplementation further.

### GSoC 2024 Participation

In 2024, we had the pleasure of mentoring three students during Google Summer of Code (GSoC):

1. **Sreehari Prasad** worked on improving the support of Rust CCoreutils. His focus was on making uutils compatible with the GNU coreutils test suite. Sreehari resolved most of the failing tests for the `cp`, `mv`, and `ls` utilities and significantly enhanced compatibility.

2. **Hanbings** tackled the implementation of key GNU `findutils` utilities like `xargs` and `find` in Rust. His work focused on improving compatibility with the GNU suite while enhancing performance, resulting in major progress on missing features and test code.

3. **Krysztal Huang** worked on implementing the `procps` suite, which includes utilities like `slabtop`, `top`, `pgrep`, `pidof`, `ps`, `pidwait`, and `snice`. This project involved implementing some of these commands.

### Call to Action for Contributors

Contributors who are passionate about system-level programming and Rust are always welcome. Whether you're experienced with GNU utilities or just learning Rust, your contributions will be invaluable to this
project. You can get involved by picking up good-first issues, reviewing code, or even helping us test new features across various platforms. The [uutils GitHub organization](https://github.com/uutils) has all the information you need to get started.
You can also sponsor the project through [GitHub Sponsors](https://github.com/sponsors/uutils).

### FAQ

**How long is it going to take?**

Some programs, like `diff`, `acl`, or `hostname`, could be completed quickly, while others will take years to finish.

**Do you hate the GNU project?**

Not at all. We often contribute to the upstream implementations when we identify issues, add missing tests, and so on.

**Why the MIT License?**

For consistency purposes. We're not interested in a license debate and will continue to use the MIT license, as we did with Coreutils.

**The binaries are too big. Does it really matter?**

Yes, Rust binaries are generally bigger than GNU's, but we don't think it's a blocker, even for embedded devices.

**Is it really safer?**

While Rust is better than C/C++ for security, these programs are often already very safe. Security is not the key argument for us in this rewrite even if Rust provides some automatic improvements.

**What about performance?**

Although we haven't started optimizing yet, Rust's design facilitates performance improvements naturally. We are confident that, in time, these tools will match or exceed the performance of their GNU counterparts.
