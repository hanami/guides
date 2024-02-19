---
title: Overview
order: 10
---

Most web apps require various assets (JavaScript, CSS, images, fonts and so on) to go along with their HTML. Hanami provides built-in asset management using [esbuild](https://esbuild.github.io/), an extremely fast bundler for the web.

## Assets Structure

### App

A new Hanami app gives you the following structure for your assets:

```bash
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
    └── assets
        ├── assets.json
        ├── app-HYVEQYF6.css
        ├── app-6PW7FGD5.js
        └── favicon-5VHYTKP2.ico
```

- `app/assets/` is where you keep your app's assets
- `app/assets/css/` and `app/assets/js/` are special directories, where Hanami expects to find your stylesheets and JavaScript files respectively.
- `app/assets/images/` (and every other subdirectory under `app/assets/`) is where you can keep any static assets.
- `config/assets.js` configures your asset compilation behaviour (including esbuild customizations).
- `package.json` and `package-lock.json` are the [npm](https://www.npmjs.com/) standard files for defining dependencies for your assets. Hanami's own [hanami-assets](https://www.npmjs.com/package/hanami-assets) npm package is included here.
- `node_modules/` contains the installed npm packages.
- `public/assets/` is the destination directory for compiled assets.
- `public/assets/assets.json` is the **assets manifest**, a file that allows Hanami to find your compiled assets in production.
- `public/assets/*` are your compiled assets.

<p class="notice">
  For brevity, we're only showing assets-specific files here.
</p>

### Slices

Slices can have their own independent assets. These live in an `assets/` directory within the slice, and will be compiled to a dedicated slice directory under `public/assets/`.

Here's the structure for assets in a newly generated "admin" slice:

```bash
.
├── slices/admin
│   └── assets
│       ├── css
│       │   └── app.css
│       └── js
│           └── app.js
└── public/assets/admin
    ├── assets.json
    ├── app-HYVEQYF6.css
    └── app-6PW7FGD5.js
```

<p class="notice">
  For brevity, we're only showing assets-specific files from the slice.
</p>

## Assets CLI commands

You can use two CLI to compile your assets:

- `hanami assets compile` will compile all your assets for production.
- `hanami assets watch` will watch for changes to your assets and compile the relevant files immediately.

The [`hanami dev` command](/v2.1/cli-commands/dev/) will start `hanami assets watch` by defalt, giving you

See the [assets CLI guide](/v2.1/cli-commands/assets/) for more detail.

## Asset compilation

Asset compilation is the transformation of your source assets into optimized, production-ready formats.

esbuild streamlines this process by offering rapid compilation and efficient bundling of JavaScript and CSS files. This leads to faster build times and smaller file sizes, crucial for web app performance.

When Hanami compiles your assets, it detects your JavaScript **entry points**, resolves their dependencies, applies code transformations, and funally outputs the resulting compiled files into `public/assets/`.

## Entry points

An **entry point** is a file that serves as the starting point for a compiled **asset bundle** (see also [esbuild's definition](https://esbuild.github.io/api/#entry-points)).

You can create one or more entry points, and use these to determine the asset bundles that you include across the various pages in your app.

### Default entry point

The default entry point for a Hanami app is `app/assets/js/app.js`, which looks like this:

```js
import "../css/app.css";
```

It imports the default stylesheet, so it can be included in the bundle. You should include the rest of your app's JavsScript code in this file, or import it from other files.

<p class="notice">
  Only the JavaScript files and stylesheets referenced by an entry point will be included in the final bundle.
</p>

### Multiple entry points

You can have as many entry points as you like. You might create dedicated entry points for certain pages or features in your app, to improve page loading and rendering.

This approach also means that changes in one part of your assets won't result in a complete rebuild of all assets, which improves development time feedback and resource usage.

To create a new entry point, create any directory under `js/` and put a file named `app.js` in it. This file will be your new entry point.

<p class="notice">
  Hanami uses files named <code>app.js</code> as entry points. Other JavaScript extensions are also supported, including <code>.mjs</code>, <code>.ts</code>, <code>.mts</code>, <code>.tsx</code>, <code>.jsx</code>.
</p>

For example, to crete an entry point for a "sign in" page, create an `app/assets/js/signin/app.js` file. In this entry point, you can import a matching stylesheet and a related JavaScript function:

```js
import "../../css/signin/app.css";
import { resetPassword } from "./resetPassword";
```

At this point, your app will now have two entry points, `app.js` and `signin/app.js`:

```bash
app/assets
├── css
│   ├── app.css
│   └── login
│       └── app.css
├── images
│   └── favicon.ico
└── js
    ├── app.js # Entry point
    └── login
        ├── app.js # Entry point
        └── resetPassword.js
```

These entry points will generate two different compiled **asset bundles**:

```bash
public/assets
├── assets.json
├── app-GVDAEYEC.css
├── app-LSLFPUMX.js # Bundle
└── login
    ├── app-JPZQ4M77.css
    └── app-LSLFPUMX.js # Bundle
```

Since `public/assets/login/app.js` is a bundle, it includes the content from the `app/assets/js/login/resetPassword.js` file it imported.

## Asset bundles

The process of generating an asset bundle involves grouping multiple files (typically JavaScript or CSS) referenced from your entry point into single bundled file. This consolidation is helpful for web app performance, since it reduces the number of HTTP requests required to load a single page.

Hanami's use of [esbuild](https://esbuild.github.io/) means this bundling is extremely fast, while also minimizing the resulting bundle size through advanced techniques like tree shaking and dead code elmination.

This approach, combined with multiple bundles (via multiple corresponding entry points) allows you to arrange your assets so that only the required bundles are loaded for a page or component, which improves your page load times and resource utilisation.
