# JELLYbean

Jellybean has two purposes:

1. Teach this damned fool how to write a basic metacompiler, including
   step-by-step inspection and debugging of both lexing and parsing steps.

1. Provide a simple language-design studio to play around with grammar and
   syntax rules for quick-turnaround investigations.

Eventually, both these purposes will be combined when Jellybean reaches the
point where it can export experimental langauge specifications to more
formalized tools across interpreter targets.

## v4 Warning

I am currently in the middle of refactoring (after some hiatus) this effort to
reflect a more robust set of UI and general JS tools that I've adopted. This
will also, one hopes, give me the chance to finally push something workable
over the finish line. The Mogensen text continues to be the primary
driver/guide, but a more consistent treatement of passes as transforms, and the
data structures exchanged between them, can be expected.

For the time being, know that you can `yarn install` and `yarn run dev` your
way to a roughly functional placeholder of an app build while the remainder of
updates take place. Other updates (aside from a Vite build) include ES6 imports
(no more require), more module-friendly decomposition for logic sharing, and a
TripletUI-based presentation layer that should be better at getting out of the
way.

In the meantime older pages can be found in (surprise!) the "old/" folder and
should still be reasonable self-consistent.

## Take Three

This new branch of JELLYbean is a step-by-step attempt to derive
JavaScript-based compiler tools from scratch, based on Torben Mogensen's
outstanding text, "Basics of Compiler Design":

  http://hjemmesider.diku.dk/~torbenm/Basics/

At this time, the plan is to have a top-level chapter breakdown that opens into
visualizations of structures and algorithms for each key chapter. This will
correspond to the following outline:

* Chapter 2: Lexical Analysis

* Chapter 3: Syntax Analysis (including multiple parser algorithms)

* Chapter 4: Scope and Symbol Tables

* Chapter 5: Interpretation

The are many other chapters (aside from the introduction in Chapter 1), each
of which cover special topics that may or may not be of interest and/or direct
relevance to the fundamental JELLYbean application and objectives. Potential
"extras" I am considering include:

* Chapter 6: Type Checking

* Chapter 7: Intermediate Code Generation

* Chapter 10: Function Calls

* Chapter 11: Analysis and Optimization

* Chapter 13: Bootstrapping a Compiler

Because this is a JavaScript-based implementation, we avoid (for now)
considerations of memory management, register allocation, and machine code
generation.

The primary objective is the same as previous JELLYbean iterations: To have a
working LALR(1) parser implementation in JavaScript that can ingest arbitrary
token and grammar rules to generate a compiler for a user-defined programming
language.

## Update (v2)

A v2 has now been released! This includes:

* Completely re-written parser logic based on a substantially more robust (and
  formally proof-backed) LR(1) algorithm.

* Single-file module specification

* Straight-from-CSV models (via Papaparse or csvloader plugin for RequireJS)
  for terminals and rules.

* Much faster/more independent error and debugging reports.

* Unnecessary models (input, tables, etc.) have been removed, as has rendering
  (and therefore Handlebars requirements).

However, this is not the version used by the front-facing web page, mainly
because the final item above discourages detailed visualization. But if you
don't need to manually inspect and verify each step of the parsing process,
I'd recommend you jump straight to the new (v2.0.0) version.

### Specification

The two spreadsheets (.CSV format) in the "data/" folder define a language:

* "terminals.csv" defines a tag and RegExp-style pattern for identifying and
  tokenizing each terminal. Patterns will be used to instantiate a RegExp
  object, after being automatically prepended with a beginning-of-string token
  ("^"), with tag-pattern pairs stored in Terminal objects.

* "rules.csv" lists tag and sequence pairs that define the language grammar.
  Two special cases exist for tags: "/" identifies valid top-level nullable
  sequences, while "" (empty string) identifies nullable sequences that can be
  dismissed.

We are able to define a language with static data structures because we do not
attach any interpreter actions or logic to individual operations. These can be
mapped to the Abstract Syntax Tree after parsing is complete, as each leaf node
in the AST retains all information from the original Token object. This makes
for much more transparent design and debugging of the language specification.

### Dependencies

The "deps/" folder containts JavaScript dependencies utilized by this project.
The license for the Jellybean package does not apply to dependencies, most of
which have their own licenses in comment sections.

### Source

The "src/" folder contains JavaScript modules unique to this project. Most
define models that support language lexing and parsing operations. The
application entry point is in "main.js"; all utilize *AMD*-compatible module
formats.

### Usage

Opening "index.html" will populate terminal and rule tables with the contents
of "data/terminals.csv" and "data/rules.csv", respectively. You can then step
through individual lexing steps to observe how the terminals are applied, or
batch all lexing operations at the same time.

Once the lexer table is sufficiently populated, you can step through individual
parsing actions to see how the stack is constructed and tokens are consumed, or
batch all parsing operations at the same time.

Once parsing has completed, the AST will be rendered into an indented format at
the bottom of the page. This identifies reduction nodes (ending with ":") vs.
leaf nodes (ending with " = [value]").

### Conflicts

This lexer/parser application utilizes a mostly-LALR(1)-like algorithm that
resolves conflicts in the following manner. This logic is primarly encoded in
"src/Parser.js", under the "Parser.protoptype.step()" function.

1. Two Arrays are generated to identify all matching shift and reduction
   operations. If both arrays are empty, a syntax error is raised.

1. If only one reduction operation is available, with a dismissable nullable,
   it is prioritized to clean up the stack before additional actions are taken.

1. If a single shift action is available, but no reduction actions are
   available, the shift action is performed.

1. If a single reduction action is avaiable, but no shift actions are
   available, the reduction action is performed

1. If shift and reduction actions exists, and the reduction action is a
   top-level nullable ("/"), it is ignored and the shift is performed
   regardless.

1. If multiple shift and reduction actions exist, a "SHIFT-REDUCE" conflict is
   declared as a console warning, and the shift action is performed.

1. If multiple reduction actions exists, a "REDUCE-REDUCE" conflict exists,
   which should never take place in a well-designed grammar (or so I'm told).

Like some other simplified LALR(1) algorithms, precendence and priority are not
explicitly encoded into the grammar. While this could be supported at some
point in the future, related issues can typically be solved by judicial review
and modification of the grammar rules to isolate reduction paths and minimize
conflicts. See David Beazley's excellent documentation at
https://www.dabeaz.com/ply/ply.html (which served as a major inspiration and
reference for this project) to learn more.

### Notes and Caveats

I'm just a humble aerospace engineer, who knows *just* enough about computer
science to a. think he knows what he's doing, and b. therefore be potentially
dangerous. Caveat user.

First: Yes, this isn't a "true" compiler in the sense that it does not generate
instructions in the form of object, byte, or assembly. The final output is an
AST, because a. I wanted to keep langauge specification static (i.e., not to
require evaluation behavior, to keep specifications in flat text files), and b.
I want to keep the underlying code flexible to apply across a number of domains
and languages. Generating instructions from the resulting AST is "simply" (ha
ha) a matter of "walking" the tree to perform each operation against a managed
context. Because sources are static, we don't do much precedence comparison,
either--though in some cases the first match will be used; this needs to be
formalized, preferably in a way that retains the static specification pipeline.

Second: This isn't perfect. Keep in mind that the original objective was simply
to teach this damned fool how to write a basic compiler. I know there are some
conflicts in terms; "Nullable" and "dismissable" in particular are used in a
manner similar to Chomsky Normal Form, but we differentiate here between
"top-level nullables" (which are closer to a "start symbol") and "dismissable
nullables" (which are closer to an "empty string"). You can compare terms
(https://en.wikipedia.org/wiki/Chomsky_normal_form), while the actual
metagrammar is more similar to a very streamlined Extended Backus-Naur Form
(https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form).

Lastly: The shift-reduction logic probably isn't perfect (though I think I
could prove that it's "good enough"), and it's *definitely* not optimized.
Compared to traditional lexer/parser tools, the resource requirements in
particular are huge. There are also some behaviors (like newline modification
to the parser cursor coordinates) that are hard-coded here to retain the
advantage of a static grammar specification with full reverse-inspection from
the AST back to the original input.

Feel free to file an issue on GitHub (https://github.com/Tythos/jellybean) if
you have severe objections (pull requests appreciated, in that case), general
feedback, bug reports, or ideas for future features that might be valuable for
this particular use case (which is primarily educational in nature).

## Resources

* [StackOverflow post with resource listings](https://stackoverflow.com/questions/1669/learning-to-write-a-compiler)

* [A Nanopass Framework for Compiler Education](https://www.cs.indiana.edu/~dyb/pubs/nano-jfp.pdf)

* [Let's Build a Compiler](http://www.stack.nl/~marcov/compiler.pdf)

* [Implementing a Langauge with LLVM](http://llvm.org/docs/tutorial/LangImpl01.html)

* [SLY Documentation](https://sly.readthedocs.io/en/latest/sly.html)

* [LALR on Wikipedia](https://en.wikipedia.org/wiki/LALR_parser)

* [A Tutorial Explaining LALR(1) Parsing](https://web.cs.dal.ca/~sjackson/lalr1.html)

* [The Dragon Book (of course)](https://suif.stanford.edu/dragonbook/)

* [David Beazley's "PLY (Python Lex-Yacc)"](http://www.dabeaz.com/ply/)

* [David Beazley's "Write a Compiler" Course](https://www.dabeaz.com/compiler.html)
