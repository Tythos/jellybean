JELLYbean
=========

JELLYbean has two purposes:

#. Teach this damned fool how to write a basic compiler.

#. Provide a simple language-design studio to play around with grammar and
   syntax rules for quick-turnaround investigations.

Eventually, both these purposes will be combined when JELLYbean reaches the
point where it can export experimental langauge specifications to more
formalized tools across interpreter targets.

.. contents::

Specification
-------------

The two spreadsheets (.CSV format) in this directory define a language:

* "terminals.csv" defines a tag and RegExp-style pattern for identifying and
  tokenizing each terminal. Patterns will be used to instantiate a RegExp
  object, after being automatically prepended with a beginning-of-string token
  ("^"), and stored in Terminal objects.

* "rules.csv" lists tag and sequence pairs that define the language grammar.
  Two special cases exist for tags: "/" identifies valid top-level nullable
  sequences, while "" (empty string) identifies nullable sequences that can be
  dismissed.

We are able to define a language with static data structures because we do not
attach any interpreter actions or logic to individual operations. These can be
mapped to the Abstract Syntax Tree after parsing is complete, as each leaf node
in the AST retains all information from the original Token object. This makes
for much more transparent design of the language specification.

Dependencies
------------

The "deps/" folder containts JavaScript dependencies utilized by this project.
The license for the JELLYbean package does not apply to dependencies, most of
which have their own licenses in comment sections.

Source
------

The "src/" folder contains JavaScript modules unique to this project. Most
define models that support language lexing and parsing operations. The
application entry point is in "main.js"; all utilize *AMD*-compatible module
formats.

Usage
-----

Opening "index.html" will populate terminal and rule tables with the contents
of "data/terminals.csv" and "data/terminals.csv", respectively. You can then
step through individual lexing steps to observe how the terminals are applied,
or batch all lexing operations at the same time.

Once the lexer table is sufficiently populated, you can step through individual
parsing actions to see how the stack is constructed and tokens are consumed, or
batch all parsing operations at the same time.

Once parsing has completed, the AST will be rendered into an idented format at
the bottom of the page. This identifies reduction nodes (ending with ":") vs.
leaf nodes (ending with " = [value]").

Conflicts
---------

This lexer/parser application utilizes an LALR(1) algorithm that resolves
conflicts in the following manner. This logic is primarly encoded in
"src/Parser.js", under the "Parser.protoptype.step()" function.

#. Two Arrays are generated to identify all matching shift and reduction
   operations. If both arrays are empty, a syntax error is raised.

#. If only one reduction operation is available, with a dismissable nullable,
   it is prioritized to clean up the stack before additional actions are taken.

#. If a single shift action is available, but no reduction actions are
   available, the shift action is performed.

#. If a single reduction action is avaiable, but no shift actions are
   available, the reduction action is performed

#. If shift actions and a single reduction action exists, and the reduction
   action is a top-level nullable ("/"), it is ignored and the shift is
   performed regardless.

#. If multiple shift and reduction actions exist, a "SHIFT-REDUCE" conflict is
   declared as a console warning, and the shift action is performed.

#. If multiple reduction actions exists, a "REDUCE-REDUCE" conflict exists,
   which should never take place in a well-designed grammar (or so I'm told).

Like most simplified LALR(1) algorithms, precendence and priority are not
encoded into the grammar. While this could be supported at some point in the
future, related issues can typically be solved by judicial review and
modification of the grammar rules to isolate reduction paths and minimize
conflicts. See David Beazley's excellent documentation at
https://www.dabeaz.com/ply/ply.html (which served as a major inspiration and
reference for this project) to learn more.

Notes and Caveats
-----------------

I'm just a humble aerospace engineer, who knows *just* enough about computer
science to a) think he knows what he's doing, and b) therefore be potentially
dangerous. Caveat user.

First: Yes, this isn't a "true" compiler in the sense that it does not generate
instructions in the form of object, byte, or assembly. The final output is an
AST, because a) I wanted to keep langauge specification static (i.e., not to
require evaluation behavior, to keep specifications in flat text files), and b)
I want to keep the underlying code flexible to apply across a number of domains
and languages. Generating instructions from the resulting AST is "simply" (ha
ha) a matter of "walking" the tree to perform each operation against a managed
context. I might explore this more in a future iteration or seperate tool.

Second: This isn't perfect. Keep in mind that the original objective was simply
to teach this damned fool how to write a basic compiler. In particular, I know
there are some conflicts in terms; "Nullable" and "dismissable" in particular
are used "sort of" like they are in Chomsky Normal Form, but we differentiate
here between "top-level nullables" (which are closer to a "start symbol") and
"dismissable nullables" (which are closer to an "empty string"). You can
compare terms (https://en.wikipedia.org/wiki/Chomsky_normal_form), while the
actual metagrammar is more similar to a streamlined Extended Backus-Naur Form
(https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form).

Lastly: The shift-reduction logic probably isn't perfect. I think I could prove
that it's "good enough", if not optimized. There are some behaviors (like
newline modification to the parser cursor coordinates) that are hard-coded here
to retain the advantage of a static grammar specification. What does exist,
though, I've found to be pretty useful for stepping through lexing/parsing
logic to understand exactly what goes on in the belly of the beast.

Feel free to file an issue on GitHub (https://github.com/Tythos/jellybean) if
you have severe objections (pull requests appreciated, in that case), general
feedback, bug reports, or ideas for future features that might be valuable for
this particular use case (which is primarily educational in nature).
