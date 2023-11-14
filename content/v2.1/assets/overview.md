---
title: Overview
order: 10
---

Hanami 2 marks a significant advancement in the realm of web asset management by integrating [Esbuild](https://esbuild.github.io/), a modern and fast JavaScript bundler and minifier.

This integration is at the core of Hanami 2, bringing substantial improvements in the compilation, bundling, and optimization of web assets. Esbuild's high-speed performance and efficiency are leveraged to process JavaScript and CSS files rapidly, offering developers a more streamlined and productive development experience.

## Assets Structure

### App

A brand new Hanami 2 application will have the following assets structure:

```bash
$ tree
.
├── app
│   ├── assets
│   │   ├── css
│   │   │   └── app.css
│   │   ├── images
│   │   │   └── favicon.ico
│   │   └── js
│   │       └── app.js
├── config
│   └── assets.js
├── node_modules
├── package-lock.json
├── package.json
└── public
    ├── assets
    └── assets.json
```

  * `app/assets` is home to application assets.
  * `app/assets/css` and `app/assets/js` are special directories, where Hanami expects to find stylesheets and javascripts, respectively.
  * `app/assets/*` all the other subdirectories are considered as home for static assets.
  * `config/assets.js` is a file to customize assets and Esbuild behavior.
  * `package.json` and `package-lock.json` are [NPM](https://www.npmjs.com/) standard files to define dependencies.
  * `node_modules` is home NPM packages defined by `package.json`.
  * `public/assets` is the destination directory for compiled assets.
  * `public/assets.json` is the assets manifest, a file that allows Hanami to work with assets in production.

<p class="notice">
  For brevity, we're only showing assets relevant files.
</p>

### Slices

Hanami allows slices to manage their own assets.
The destination of the assets compilation is still `public/assets`.

Here's the typical assets structure of a new generated slice:

```bash
$ tree slices/admin
slices/admin
└── assets
    ├── css
    │   └── app.css
    └── js
        └── app.js
```

<p class="notice">
  For brevity, we're only showing assets relevant files.
</p>

## Assets Compilation

Assets compilation iis the transformation of source code assets into optimized, production-ready formats.

Esbuild streamlines this process by offering rapid compilation and efficient bundling of JavaScript and CSS files.

This leads to faster build times and smaller file sizes, crucial for enhancing web application performance.

The compilation process in Hanami 2 scans through the set of the JavaScript Entry Points, resolves their dependencies, apply code transformation, and finally outputs the results in the destination directory: `public/assets`.

## Entry Points

An **Entry Point** in the context of Esbuild is a file that serves as the starting point for building your final assets bundles.

This feature allows developers to define specific JavaScript files as starting points for the asset compilation process.

The benefit of this approach is the ability to have full control on the final bundles.

### App Entry Point

The default Entry Point generated for a Hanami 2 app is `app/assets/js/app.js`, which looks like this:

```js
import "../css/app.css";
```

It simply imports the default stylesheet, so it will be bundled.
All the other JavaScript application code can be implemented in this file, or simply imported.

<p class="notice">
  It's important to understand that only the JavaScript and Stylesheets referenced by an Entry Point will be part of a final bundle.
</p>

### Multiple Entry Points

A Hanami 2 application can have as many as Entry Points a developer wants.

For instance, different pages or components of a web application can have their own dedicated Entry éoints, leading to more efficient loading and rendering.

This modular approach also means that changes in one part of the application don't necessitate a complete rebuild of all assets, thereby optimizing development time and resource usage.
This is a departure from the more rigid asset structure in earlier versions of Hanami, marking a significant step towards a more modern and efficient asset management system.

As a guideline, a developer can introduce new Entry Points for different features or areas of their web application.

A classic example is the login screen.
A developer may wants to reduce the assets weight of the login screen by creating a new bundle.
To do so, they just need to introduce a new Entry Point.

They will create a directory `app/assets/js/login` (the name is arbitrary), and put a file named `app.js` in it.
This file is the Entry Point.

<p class="notice">
  By default, Hanami considers as Entry Points the files named <code>app.js</code>. Other JavaScript extensions are supported (<code>.mjs</code>, <code>jsx</code>, <code>.ts</code>, etc...).
</p>

Let's import the login stylesheet and a JavaScript function from our `app/assets/js/login/app.js`:

```js
import "../../css/login/app.css";
import { resetPassword } from "./resetPassword";
```

At this point here's the current setup, we have two Entry Points: `app.js` and `login/app.js`.

```bash
$ tree app/assets
app/assets
├── css
│   ├── app.css
│   └── login
│       └── app.css
├── images
│   └── favicon.ico
└── js
    ├── app.js # Entry Point
    └── login
        ├── app.js # Entry Point
        └── resetPassword.js

5 directories, 6 files
```

The two Entry Points will genereate two different assets bundles in the destination directory:

```bash
$ tree public
public
├── assets
│   ├── app.css
│   ├── app.js # Bundle
│   ├── favicon.ico
│   └── login
│       ├── app.css
│       └── app.js # Bundle
└── assets.json

2 directories, 6 files
```

The code from `app/assets/js/login/resetPassword.js` was bundled into `public/assets/login/app.js`.

## Asset Bundles

Asset bundling is a critical feature in Hanami 2, enhanced by integrating with Esbuild.

This process involves grouping multiple files, typically JavaScript or CSS, into a single bundled file. This consolidation is critical for optimizing web application performance, as it reduces the number of HTTP requests required to load a page.

Esbuild's efficiency in bundling comes into play here, combining files swiftly while minimizing the overall bundle size through advanced techniques like tree shaking and dead code elimination.

This means only the necessary code is included in the final bundle, eliminating unused or redundant code. Additionally, Hanami 2 allows developers to create multiple bundles, catering to different parts of an application.

This flexibility enables targeted delivery of assets, where only the required bundles are loaded for a page or component, further improving load times and resource utilization.
