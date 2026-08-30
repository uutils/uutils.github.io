+++
title = "Pointing at the error: compiler-style diagnostics in uutils coreutils"
date = 2026-08-30
page_template = "post.html"
authors = ["Sylvestre Ledru"]

[extra]
diag_replay = true
+++

Unix tools report errors as a single line on stderr. That line says what went wrong, not where. For most commands there is nowhere else to point anyway, but a few take arguments that are small languages: a `test` expression, a `chmod` mode, a `sort` key, a `tr` set. When one of those fails to parse, what you actually want to know is which argument, or which character of it, the parser tripped over.

rustc has been answering that question with a caret for years, and [ariadne](https://codeberg.org/zesterer/ariadne) puts the same rendering one dependency away. Starting with 0.11.0, coreutils uses it. When stderr is a terminal, a parse error is printed as a report: the arguments are echoed back as a source line, a caret marks the culprit, and a help line explains the syntax when we have something useful to say about it.

### What it looks like

Start with `tr`, whose GNU message assumes you already know what a collating sequence is.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">tr</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> tr &#x27;qw[y-b]&#x27; x</div>
<pre class="diag">tr: range-endpoints of &#x27;y-b&#x27; are in reverse collating sequence order</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">tr</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/tr.json">
      <div class="diag-fallback">
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
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=tr+%27qw%5By-b%5D%27+x).

A `cut` list can be long, with a single bad item in it.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">cut</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> cut -f 1,4-2,9-12 notes.txt</div>
<pre class="diag">cut: invalid decreasing range
Try &#x27;cut --help&#x27; for more information.</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">cut</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/cut.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> cut -f 1,4-2,9-12 notes.txt</div>
<pre class="diag">cut: invalid decreasing range
   <span class="a-d">╭─[</span> cut:1:10 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">cut -f 1,</span><span class="a-e">4-2</span><span class="a-s">,9-12 notes.txt</span>
 <span class="a-f">  │</span>          <span class="a-e">─┬─</span>
 <span class="a-f">  │</span>           <span class="a-e">╰───</span> this range ends before it starts
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a list is N, N-M, N- or -M, separated by commas, as in -f1,4-6,9-
<span class="a-d">───╯</span>
Try &#x27;cut --help&#x27; for more information.</pre>
      </div>
    </div>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=cut+-f+1%2C4-2+fruits.txt).

The caret does not have to cover a whole argument. It can land on one character.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">chmod</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> chmod &#x27;g+rw?x&#x27; notes.txt</div>
<pre class="diag">chmod: invalid operator (expected +, -, or =, but found ?)</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">chmod</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/chmod.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> chmod &#x27;g+rw?x&#x27; notes.txt</div>
<pre class="diag">chmod: invalid operator (expected +, -, or =, but found ?)
   <span class="a-d">╭─[</span> chmod:1:5 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">g+rw</span><span class="a-e">?</span><span class="a-s">x notes.txt</span>
 <span class="a-f">  │</span>     <span class="a-e">─</span>
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a mode is either octal, as in 644, or clauses such as u+rwx,go-w
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

`sort` keys are short enough that a stray character is easy to miss.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">sort</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> sort -k2.3x notes.txt</div>
<pre class="diag">sort: stray character in field spec: invalid field specification &#x27;2.3x&#x27;</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">sort</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/sort.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> sort -k2.3x notes.txt</div>
<pre class="diag">sort: stray character in field spec: invalid field specification &#x27;2.3x&#x27;
   <span class="a-d">╭─[</span> sort:1:11 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">sort -k2.3</span><span class="a-e">x</span><span class="a-s"> notes.txt</span>
 <span class="a-f">  │</span>           <span class="a-e">─</span>
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a key is FIELD[.CHAR][OPTS][,FIELD[.CHAR][OPTS]], as in -k2.3,4nr
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=sort+-k2.3x+fruits.txt).

`env -S` takes a whole command line and splits it the way a shell would. The old message could only quote the offending fragment back at you. Note that the string contains spaces, so it is echoed back quoted, and the caret still lands inside the quotes.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">env</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> env -S &#x27;echo ${1FOO}&#x27;</div>
<pre class="diag">env: only ${VARNAME} expansion is supported, error at: ${1FOO}</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">env</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/env.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> env -S &#x27;echo ${1FOO}&#x27;</div>
<pre class="diag">env: only ${VARNAME} expansion is supported, error at: ${1FOO}
   <span class="a-d">╭─[</span> env:1:14 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">env -S &#x27;echo </span><span class="a-e">${1</span><span class="a-s">FOO}&#x27;</span>
 <span class="a-f">  │</span>              <span class="a-e">─┬─</span>
 <span class="a-f">  │</span>               <span class="a-e">╰───</span> a variable name cannot start with a digit
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: only $NAME and ${NAME} are expanded; the other shell forms are not
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

`test` builds its expression out of separate arguments. The report echoes the expression on its own, without the `test` in front, and marks the argument that broke it.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">test</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> test 7 -eq zap</div>
<pre class="diag">test: invalid integer &#x27;zap&#x27;</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">test</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/test.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> test 7 -eq zap</div>
<pre class="diag">test: invalid integer &#x27;zap&#x27;
   <span class="a-d">╭─[</span> test:1:7 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">7 -eq </span><span class="a-e">zap</span>
 <span class="a-f">  │</span>       <span class="a-e">───</span>
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: -eq, -ne, -lt, -le, -gt and -ge compare integers; use =, !=, &lt; or &gt; to compare strings
 <span class="a-f">  │</span>       -eq equal, -ne not equal, -lt less than, -le less than or equal, -gt greater than, -ge greater than or equal
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=test+7+-eq+zap).

A SIZE is a number followed by a unit. The report says which half was rejected.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">head</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> head -c 1fb notes.txt</div>
<pre class="diag">head: invalid number of bytes: &#x27;1fb&#x27;</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">head</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/head.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> head -c 1fb notes.txt</div>
<pre class="diag">head: invalid number of bytes: &#x27;1fb&#x27;
   <span class="a-d">╭─[</span> head:1:10 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">head -c 1</span><span class="a-e">fb</span><span class="a-s"> notes.txt</span>
 <span class="a-f">  │</span>          <span class="a-e">─┬</span>
 <span class="a-f">  │</span>           <span class="a-e">╰──</span> not a known unit
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a size is a number and an optional unit: K, M, G and so on for 1024, KB, MB, GB for 1000
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=head+-c+1fb+fruits.txt).

One parser handles every SIZE in the suite, so the same report shows up for `tail -c`, `truncate -s`, `split -b`, `shred -s`, `od -N`, `sort -S`, the block sizes of `du -B`, `df -B` and `ls --block-size`, and the threshold of `du -t`.

`numfmt --format` is a printf-style format that allows exactly one conversion. The old message just restated the rule. The annotation names the conversion you actually wrote.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">numfmt</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> numfmt --format=%q 1000</div>
<pre class="diag">numfmt: invalid format &#x27;%q&#x27;, directive must be %[0][&#x27;][-][N][.][N]f</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">numfmt</span>
  </div>
  <div class="term-body">
    <div class="diag-replay" data-cast="/casts/numfmt.json">
      <div class="diag-fallback">
        <div class="term-prompt"><span class="pr">$</span> numfmt --format=%q 1000</div>
<pre class="diag">numfmt: invalid format &#x27;%q&#x27;, directive must be %[0][&#x27;][-][N][.][N]f
   <span class="a-d">╭─[</span> numfmt:1:18 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">numfmt --format=%</span><span class="a-e">q</span><span class="a-s"> 1000</span>
 <span class="a-f">  │</span>                  <span class="a-e">┬</span>
 <span class="a-f">  │</span>                  <span class="a-e">╰──</span> f is the only conversion numfmt has; %d, %e, %g and the other C conversions are not accepted
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a format is [PREFIX]%[0][&#x27;][-][WIDTH][.PRECISION]f[SUFFIX], as in &quot;%&#x27;-10.2f&quot;
<span class="a-d">───╯</span></pre>
      </div>
    </div>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=numfmt+--format%3D%25q+1000).

`csplit` patterns contain regexes, and the regex engine already knows which character it choked on. We were simply throwing that position away.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">csplit</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> csplit notes.txt &#x27;/a{2,1}/&#x27;</div>
<pre class="diag">csplit: &#x27;/a{2,1}/&#x27;: invalid pattern</pre>
  </div>
</div>

After:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">csplit</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> csplit notes.txt &#x27;/a{2,1}/&#x27;</div>
<pre class="diag">csplit: &#x27;/a{2,1}/&#x27;: invalid pattern
   <span class="a-d">╭─[</span> csplit:1:20 <span class="a-d">]</span>
   <span class="a-d">│</span>
 <span class="a-d">1 │</span> <span class="a-s">csplit notes.txt /a</span><span class="a-e">{2,1}</span><span class="a-s">/</span>
 <span class="a-f">  │</span>                    <span class="a-e">──┬──</span>
 <span class="a-f">  │</span>                      <span class="a-e">╰────</span> invalid repetition count range, the start must be &lt;= the end
 <span class="a-f">  │</span>
 <span class="a-f">  │</span> <span class="a-h">Help</span>: a pattern is a line number N, /REGEXP/[OFFSET] or %REGEXP%[OFFSET], each optionally followed by {N} or {*}
<span class="a-d">───╯</span></pre>
  </div>
</div>

[Try it in the playground](https://uutils.org/playground/?cmd=csplit+fruits.txt+%27%2Fa%7B2%2C1%7D%2F%27).

That label comes straight from the regex engine and is not translated, since it is the only place the wording exists.

### Where it applies

28 utilities use it in 0.11.0. The linked examples run in the playground; the others are for utilities the WebAssembly build does not ship, so try those locally:

| Utility  | What the caret points at | Try it |
| -------- | ------------------------ | ------ |
| `test`   | the argument that made the expression fail | [`test 7 -eq zap`](https://uutils.org/playground/?cmd=test+7+-eq+zap) |
| `expr`   | the argument that made the expression fail | [`expr 9 + foo`](https://uutils.org/playground/?cmd=expr+9+%2B+foo) |
| `chmod`  | the failing clause (or character) of an invalid symbolic or octal mode | `chmod 'g+rw?x' fruits.txt` |
| `mkdir`  | the failing part of the mode given to `-m`/`--mode` | [`mkdir -m u+q mydir`](https://uutils.org/playground/?cmd=mkdir+-m+u%2Bq+mydir) |
| `mkfifo` | the failing part of the mode given to `-m`/`--mode` | `mkfifo -m u+q mypipe` |
| `mknod`  | the failing part of the mode given to `-m`/`--mode` | `mknod -m u+q mydev c 1 3` |
| `install`| the failing part of the mode given to `-m`/`--mode` | `install -m u+q fruits.txt dest` |
| `tr`     | the part of a set that is at fault (bad class, backwards range, bad repeat count, …) | [`tr 'qw[y-b]' x`](https://uutils.org/playground/?cmd=tr+%27qw%5By-b%5D%27+x) |
| `sort`   | the failing part of a `-k`/`--key` or field specification, or of the SIZE given to `-S` | [`sort -k2.3x fruits.txt`](https://uutils.org/playground/?cmd=sort+-k2.3x+fruits.txt) |
| `numfmt` | the failing part of a `--format` or `--field` specification, the value given to `--from`, `--to`, `--from-unit`, `--to-unit`, `--padding` or `--header`, or the input number itself | [`numfmt --format=%q 1000`](https://uutils.org/playground/?cmd=numfmt+--format%3D%25q+1000) |
| `printf` | the failing conversion or escape in the format string | [`printf %5.2c q`](https://uutils.org/playground/?cmd=printf+%255.2c+q) |
| `seq`    | the failing conversion in the format given to `-f`/`--format` | [`seq -f %5.2c 1 3`](https://uutils.org/playground/?cmd=seq+-f+%255.2c+1+3) |
| `stat`   | the failing directive of a `-c`/`--format` or `--printf` format | `stat -c %d%.3 fruits.txt` |
| `env`    | the failing part of a `-S`/`--split-string` string | `env -S 'echo ${1FOO}'` |
| `dd`     | the failing key, value or flag of a `KEY=VALUE` operand | [`dd conv=ucase,zap`](https://uutils.org/playground/?cmd=dd+conv%3Ducase%2Czap) |
| `join`   | the failing field of the output format given to `-o` | [`join -o 1.2,2.x fruits.txt fruits.txt`](https://uutils.org/playground/?cmd=join+-o+1.2%2C2.x+fruits.txt+fruits.txt) |
| `cut`    | the failing range in the list given to `-b`, `-c`, `-f` or `-F` | [`cut -f 1,4-2 fruits.txt`](https://uutils.org/playground/?cmd=cut+-f+1%2C4-2+fruits.txt) |
| `csplit` | the failing pattern operand, the character of its regex that broke, or the format given to `-b`/`-n` | [`csplit fruits.txt '/a(b/'`](https://uutils.org/playground/?cmd=csplit+fruits.txt+%27%2Fa%28b%2F%27) |
| `split`  | the failing part of the SIZE given to `-b`, `-C` or `-l` | [`split -b 7zq fruits.txt`](https://uutils.org/playground/?cmd=split+-b+7zq+fruits.txt) |
| `shred`  | the failing part of the SIZE given to `-s`/`--size` | [`shred -s 4vv fruits.txt`](https://uutils.org/playground/?cmd=shred+-s+4vv+fruits.txt) |
| `head`   | the failing part of the SIZE given to `-c` or `-n` | [`head -c 1fb fruits.txt`](https://uutils.org/playground/?cmd=head+-c+1fb+fruits.txt) |
| `tail`   | the failing part of the SIZE given to `-c` or `-n` | [`tail -c 1fb fruits.txt`](https://uutils.org/playground/?cmd=tail+-c+1fb+fruits.txt) |
| `truncate` | the failing part of the SIZE given to `-s`/`--size` | [`truncate -s 10fb fruits.txt`](https://uutils.org/playground/?cmd=truncate+-s+10fb+fruits.txt) |
| `od`     | the failing part of the SIZE given to `-j`, `-N`, `-S` or `-w` | [`od -N 3zz fruits.txt`](https://uutils.org/playground/?cmd=od+-N+3zz+fruits.txt) |
| `du`     | the failing part of the SIZE given to `-B`/`--block-size` or `-t`/`--threshold` | `du -B 1fb` |
| `df`     | the failing part of the SIZE given to `-B`/`--block-size` | `df -B 1fb` |
| `ls`     | the failing part of the SIZE given to `--block-size` (also `dir` and `vdir`) | [`ls --block-size=1fb`](https://uutils.org/playground/?cmd=ls+--block-size%3D1fb) |
| `stdbuf` | the failing part of the buffering mode given to `-i`, `-o` or `-e` | `stdbuf -o 6pq head` |

### Compatibility first

Being a drop-in replacement for GNU coreutils comes first, so this is strictly an interactive nicety:

- Reports are only rendered when **stderr is a terminal**. In a script, a pipe or a test suite, each utility keeps printing exactly the plain one-line message shown as "Before" in the examples above, so anything that greps stderr keeps working.
- Exit codes are unchanged.
- Colors are only used on a terminal and respect [`NO_COLOR`](https://no-color.org/).
- Like the rest of uutils, the messages, labels and help lines are localized; translations are managed on [Weblate](https://hosted.weblate.org/projects/rust-coreutils/).
- It can be compiled out to save a little space: the rendering sits behind the `feat_diagnostics` cargo feature (on by default), and building without it drops the `ariadne` dependency while every utility keeps its plain messages.

### Turning it on and off

By default the rendering keys off stderr being a terminal and nothing else, which is usually but not always what you want. `UUTILS_DIAG` overrides it: `always` draws the report even into a file or a pipe, `never` keeps the plain line even at a terminal, and `auto`, or an unset variable, decides from stderr as before. An unrecognized value is deliberately not an error. This is the kind of variable people export from a shell profile once and forget about, and a typo in it should not be able to make a utility fail.

There is no command-line flag to go with it. The utilities that would need one most cannot have it: in `test`, `printf` and `expr`, a new option would be either illegal or ambiguous with the operands themselves.

To get a report out of a script or a CI log, to paste into a bug report for instance:

```
$ UUTILS_DIAG=always sort -k2.3x notes.txt 2> parse.log
$ cat parse.log
sort: stray character in field spec: invalid field specification '2.3x'
   ╭─[ sort:1:11 ]
   │
 1 │ sort -k2.3x notes.txt
   │           ─
   │
   │ Help: a key is FIELD[.CHAR][OPTS][,FIELD[.CHAR][OPTS]], as in -k2.3,4nr
───╯
```

Colors are decided separately, and still by the terminal: a report forced into a file is written without them, so there are no escape sequences to strip back out. [`NO_COLOR`](https://no-color.org/) sits in between at a terminal, where the report is still drawn, just in plain text.

The two tricks people used before the variable existed still work. Sending stderr somewhere that is not a terminal gets the plain line:

```
$ sort -k2.3x notes.txt 2>&1 | cat
sort: stray character in field spec: invalid field specification '2.3x'
```

And giving a command a pty (`script -qec "sort -k2.3x notes.txt" /dev/null`, or `unbuffer` from expect) gets the report back, which is handy when the command has to run under a terminal for other reasons.

### What comes next

coreutils is where this starts, not where it stops. The rendering lives in `uucore::diagnostics`, which the other uutils projects already depend on, so picking it up is mostly a matter of handing the parser's error a span. [findutils](/findutils) and [sed](/sed) are being wired up now; a `find` expression and a `sed` script are exactly the kind of small languages a caret helps with, and [grep](/grep), [awk](/awk) and the rest have the same regexes and format strings to point at.

If a utility you use still prints an unhelpful one-liner, [patches are welcome](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md)!
