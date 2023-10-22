# degit-template-tripletui

A degit-friendly template for basic vite projects, slightly streamlined and with a few more modern bells and whistles (es6 modules, etc.). Based on the TripletUI model for easy modeling and extension of reusable UI elements.

```bash
$ degit https://github.com/tythos/degit-template-tripletui.git
$ npm install
$ npm run dev
```

The "Nameplate/" directory illustrates how the TripletUI model can be used to encapsulate UI elements. There are three steps to defining such an element (see Nameplate/index.mjs), and three steps to using it (see index.mjs).

To define a TripletUI model:

1. Extend the TripletUI base class exported by the corresponding package

2. Define and import a relevant stylesheet and Handlebars-compatible template (the latter will have an `.HBS` file extension, and should be passed to the super-constructor after being imported as raw text).

3. Define any event interfaces for this UI element; each interface is characterized by a query selector, a DOM event to listen to, and a tag to broadcast upon activation of that event

To utilize a TripletUI model:

1. Import and instantiate the appropriate element model

2. Set any relevant properties and subscribe to any desired events

3. Finally, render to the desired parent node within the DOM

All three steps can be accomplished by chaining function calls.

The TripletUI models (such as "Nameplate" in this case) can be easily published and shared as individual packages. Nameplate is included here in a subfolder primarily for demonstration purposes.
