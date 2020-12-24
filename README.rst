JELLYbean
=========

Take Three
~~~~~~~~~~

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

Thre are many other chapters (aside from the introduction in Chapter 1), each
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
