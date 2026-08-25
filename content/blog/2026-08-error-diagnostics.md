+++
title = "Pointing at the error: compiler-style diagnostics in uutils coreutils"
date = 2026-08-25
page_template = "post.html"
authors = ["Sylvestre Ledru"]

[extra]
diag_replay = true
+++

For fifty years, most of Unix tools have reported errors the same way: a single line on stderr. That line tells you *what* went wrong, but not *where*. It rarely matters for a simple command but some utilities take arguments that are really small languages of their own: a `test` expression, a `chmod` mode, a `sort` key, a `tr` set. When one of those fails to parse, the interesting question is which argument, or which single character, is at fault.

Rust developers are used to a much better answer to that question, because `rustc` shows the offending source line and points at it. uutils coreutils now does the same for its command line, starting with the 0.11.0 release. When stderr is a terminal, parse errors are rendered as a report: the arguments are echoed back as a source line, and a caret points at the culprit with a line of advice when we can offer one.

Here is what that looks like, starting with `tr`, whose GNU message is famously opaque.

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

A `cut` list of ranges is often long, with only one item in it wrong.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">cut</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> cut -f 1,4-2,9-12 notes.txt</div>
<pre class="diag">cut: invalid decreasing range</pre>
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

The caret can point *inside* an argument, at the exact character that broke the parse.

Before:

<div class="term term-diag">
  <div class="term-bar">
    <span class="t">chmod</span>
  </div>
  <div class="term-body">
    <div class="term-prompt"><span class="pr">$</span> chmod g+rw?x notes.txt</div>
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

[Try it in the playground](https://uutils.org/playground/?cmd=chmod+%27g%2Brw%3Fx%27+fruits.txt).

The `sort` key syntax is compact enough that a stray character is easy to miss.

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

`env -S` takes a whole command line and splits it as a shell would, and its message names an offset - precisely the thing a caret can show instead. Because the string holds spaces it is echoed back quoted, and the caret still points inside it.

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

[Try it in the playground](https://uutils.org/playground/?cmd=env+-S+%27echo+%24%7B1FOO%7D%27).

`test` builds a whole expression out of separate arguments, so the report echoes the expression alone and points at the argument that broke it.

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

And a SIZE is a number plus a unit, so the caret says which of the two was rejected.

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

`numfmt --format` is a printf-style format with exactly one conversion allowed, and that is the kind of rule an error message usually just restates. Here the annotation says which conversion was rejected instead.

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

In 0.11.0, 24 utilities have adopted it - every one of them can be tried in the playground:

| Utility  | What the caret points at | Try it |
| -------- | ------------------------ | ------ |
| `test`   | the argument that made the expression fail | [`test 7 -eq zap`](https://uutils.org/playground/?cmd=test+7+-eq+zap) |
| `expr`   | the argument that made the expression fail | [`expr 9 + foo`](https://uutils.org/playground/?cmd=expr+9+%2B+foo) |
| `chmod`  | the failing clause (or character) of an invalid symbolic or octal mode | [`chmod 'g+rw?x' fruits.txt`](https://uutils.org/playground/?cmd=chmod+%27g%2Brw%3Fx%27+fruits.txt) |
| `mkdir`  | the failing part of the mode given to `-m`/`--mode` | [`mkdir -m u+q mydir`](https://uutils.org/playground/?cmd=mkdir+-m+u%2Bq+mydir) |
| `mkfifo` | the failing part of the mode given to `-m`/`--mode` | [`mkfifo -m u+q mypipe`](https://uutils.org/playground/?cmd=mkfifo+-m+u%2Bq+mypipe) |
| `mknod`  | the failing part of the mode given to `-m`/`--mode` | [`mknod -m u+q mydev c 1 3`](https://uutils.org/playground/?cmd=mknod+-m+u%2Bq+mydev+c+1+3) |
| `install`| the failing part of the mode given to `-m`/`--mode` | [`install -m u+q fruits.txt dest`](https://uutils.org/playground/?cmd=install+-m+u%2Bq+fruits.txt+dest) |
| `tr`     | the part of a set that is at fault (bad class, backwards range, bad repeat count, …) | [`tr 'qw[y-b]' x`](https://uutils.org/playground/?cmd=tr+%27qw%5By-b%5D%27+x) |
| `sort`   | the failing part of a `-k`/`--key` or field specification, or of the SIZE given to `-S` | [`sort -k2.3x fruits.txt`](https://uutils.org/playground/?cmd=sort+-k2.3x+fruits.txt) |
| `numfmt` | the failing part of a `--field` or `--format` specification | [`numfmt --format=%q 1000`](https://uutils.org/playground/?cmd=numfmt+--format%3D%25q+1000) |
| `printf` | the failing conversion or escape in the format string | [`printf %5.2c q`](https://uutils.org/playground/?cmd=printf+%255.2c+q) |
| `seq`    | the failing conversion in the format given to `-f`/`--format` | [`seq -f %5.2c 1 3`](https://uutils.org/playground/?cmd=seq+-f+%255.2c+1+3) |
| `stat`   | the failing directive of a `-c`/`--format` or `--printf` format | [`stat -c %d%.3 fruits.txt`](https://uutils.org/playground/?cmd=stat+-c+%25d%25.3+fruits.txt) |
| `env`    | the failing part of a `-S`/`--split-string` string | [`env -S 'echo ${1FOO}'`](https://uutils.org/playground/?cmd=env+-S+%27echo+%24%7B1FOO%7D%27) |
| `dd`     | the failing key, value or flag of a `KEY=VALUE` operand | [`dd conv=ucase,zap`](https://uutils.org/playground/?cmd=dd+conv%3Ducase%2Czap) |
| `join`   | the failing field of the output format given to `-o` | [`join -o 1.2,2.x fruits.txt fruits.txt`](https://uutils.org/playground/?cmd=join+-o+1.2%2C2.x+fruits.txt+fruits.txt) |
| `cut`    | the failing range in the list given to `-b`, `-c`, `-f` or `-F` | [`cut -f 1,4-2 fruits.txt`](https://uutils.org/playground/?cmd=cut+-f+1%2C4-2+fruits.txt) |
| `split`  | the failing part of the SIZE given to `-b`, `-C` or `-l` | [`split -b 7zq fruits.txt`](https://uutils.org/playground/?cmd=split+-b+7zq+fruits.txt) |
| `shred`  | the failing part of the SIZE given to `-s`/`--size` | [`shred -s 4vv fruits.txt`](https://uutils.org/playground/?cmd=shred+-s+4vv+fruits.txt) |
| `head`   | the failing part of the SIZE given to `-c` or `-n` | [`head -c 1fb fruits.txt`](https://uutils.org/playground/?cmd=head+-c+1fb+fruits.txt) |
| `tail`   | the failing part of the SIZE given to `-c` or `-n` | [`tail -c 1fb fruits.txt`](https://uutils.org/playground/?cmd=tail+-c+1fb+fruits.txt) |
| `truncate` | the failing part of the SIZE given to `-s`/`--size` | [`truncate -s 10fb fruits.txt`](https://uutils.org/playground/?cmd=truncate+-s+10fb+fruits.txt) |
| `od`     | the failing part of the SIZE given to `-j`, `-N`, `-S` or `-w` | [`od -N 3zz fruits.txt`](https://uutils.org/playground/?cmd=od+-N+3zz+fruits.txt) |
| `stdbuf` | the failing part of the buffering mode given to `-i`, `-o` or `-e` | [`stdbuf -o 6pq head`](https://uutils.org/playground/?cmd=stdbuf+-o+6pq+head) |

### Compatibility first

Our main goal remains being a drop-in replacement for GNU coreutils, so this is strictly an interactive nicety:

- Reports are only rendered when **stderr is a terminal**. In a script, a pipe or a test suite, each utility keeps printing exactly the plain one-line message shown as "Before" in the examples above, so anything that greps stderr keeps working.
- Exit codes are unchanged.
- Colors are only used on a terminal and respect [`NO_COLOR`](https://no-color.org/).
- Like the rest of uutils, the messages, labels and help lines are localized; translations are managed on [Weblate](https://hosted.weblate.org/projects/rust-coreutils/).
- It can be compiled out to save a little space: the rendering sits behind the `feat_diagnostics` cargo feature (on by default), and building without it drops the `ariadne` dependency while every utility keeps its plain messages.

### Turning it on and off

By default the rendering keys off stderr being a terminal, and nothing else. Which is usually what you want - but not always, so `UUTILS_DIAG` overrides it: `always` draws the report even into a file or a pipe, `never` keeps the plain line even at a terminal, and `auto` - or an unset variable, or a value nobody meant - decides from stderr as before. An unrecognized value is deliberately not an error: this is the kind of variable that gets exported from a shell profile once and forgotten, and no spelling of it should be able to make a utility fail.

There is no flag to go with it, because the utilities that most need one cannot have it: `test`, `printf` and `expr` have argument grammars where a new option is either illegal or ambiguous with the operands themselves.

So, to get a report out of a script or a CI log - to paste into a bug report, say:

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

Colors are a separate question, and one the terminal still answers: a report forced into a file is written without them, so nothing has to strip escape sequences back out. [`NO_COLOR`](https://no-color.org/) is the middle setting at a terminal - the report is still drawn, just in plain text.

Both directions also predate the variable and still work. Sending stderr somewhere that is not a terminal gets the plain line:

```
$ sort -k2.3x notes.txt 2>&1 | cat
sort: stray character in field spec: invalid field specification '2.3x'
```

And giving a command a pty - `script -qec "sort -k2.3x notes.txt" /dev/null`, or `unbuffer` from expect - gets the report, which is handy when the command has to run under a terminal for other reasons.

If there is a utility whose errors you would like to see get the same treatment, [contributions are welcome](https://github.com/uutils/coreutils/blob/main/CONTRIBUTING.md)!
