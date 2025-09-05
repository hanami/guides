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
- `public/assets/` is the destination directory for all compiled assets.
- `public/assets/assets.json` is the **assets manifest**, a file that allows Hanami to find your compiled assets in production.
- `public/assets/*` are your compiled assets.

<p class="notice">
  For brevity, we're only showing assets-specific files on this page.
</p>

### Slices

Slices can have their own independent assets. These live in an `assets/` directory within the slice, and will be compiled to a dedicated slice directory under `public/assets/` (underscored to prevent collisions with your own asset files).

Here's the structure for assets in a newly generated "admin" slice:

```bash
.
├── slices/admin
│   └── assets
│       ├── css
│       │   └── app.css
│       └── js
│           └── app.js
└── public/assets/_admin
    ├── assets.json
    ├── app-HYVEQYF6.css
    └── app-6PW7FGD5.js
```

## Assets CLI commands

You can use two CLI commands to compile your assets:

- `hanami assets compile` will compile all your assets for production.
- `hanami assets watch` will watch for changes to your assets and compile the relevant files immediately.

The [`hanami dev` command](/v2.3/cli-commands/dev/) will start `hanami assets watch` by defalt, giving you

See the [assets CLI guide](/v2.3/cli-commands/assets/) for more detail.

## Asset compilation

Asset compilation is the transformation of your source assets into optimized, production-ready formats.

esbuild streamlines this process by offering rapid compilation and efficient bundling of JavaScript and CSS files. This leads to faster build times and smaller file sizes, crucial for web app performance.

When Hanami compiles your assets, it detects your JavaScript **entry points**, resolves their dependencies, applies code transformations, and finally outputs the resulting compiled files into `public/assets/`.

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

## Assets in production vs development

### In production

When you run `hanami assets compile`, your assets are prepared for production usage.

This means the compiled asset file names include a [content hash suffix](https://esbuild.github.io/api/#entry-names), which marks the file based on its content. The files shown above (such as `public/assets/app-LSLFPUMX.js`) are examples of this.

This content hash will change if and only if the content of any of the input files has changed. This means you can configure your web server to tell browsers to cache these asset files forever, because any changes in their content will result in a new file name, which browsers will download fresh.

Production assets are also [minified](https://esbuild.github.io/api/#minify) to reduce their size, and [source maps](https://esbuild.github.io/api/#sourcemap) are also generated.

In production mode, Hanami does not serve static assets by default. Instead, it expects a proxy server (like Nginx) to be configured to serve these assets.
However, if you're running your Hanami app in an environment like Docker and want it to serve assets itself in production, you can set the `HANAMI_SERVE_ASSETS` environment variable to true.

### In development

When you run `hanami assets watch`, your assets are expected to be used in local development only.

No content hash is included in the filename, to make it easier for you to locate and inspect you latest compiled assets. In this case, the compiled asset files would have names that match their source files, such as `public/assets/app.js`.

Development assets are not minified, and source maps are not generated.

## Using your assets

Now that you've compiled your assets, you can reference them from within your app, in your views or directly via the assets component.

### Independent app or slice assets

Via all the methods below, your app or slice _can only access its own assets_, those that originated inside its own `assets/` directory.

### Assets component

You can reference your assets directly via the assets component, the object registered as `"assets"` within your app or slice container.

```ruby
$ bundle exec hanami console

bookshelf[development]> Hanami.app["assets"]["app.js"]
# => #<Hanami::Assets::Asset:0x0000000121882918
#  @base_url=#<Hanami::Assets::BaseUrl:0x00000001215b5de8 @url="">,
#  @path="/assets/app.js",
#  @sri=nil>

bookshelf[development]> app["assets"]["app.js"].url
# => "/assets/app.js"
```

You can include this `"assets"` component as a dependency of any class to access your assets wherever you need across your app. See [Injecting dependencies via `Deps`](/v2.3/app/container-and-components/#injecting-dependencies-via-deps) to learn more.

### View helpers

Hanami includes a range of helpers for referencing your assets across your views, as well as generating asset-related HTML tags.

To use a helper, provide an asset path matching the name of your entry point or any other static asset (such as images, fonts, etc.).

```ruby
asset_url("app.js")
# => "/assets/app-LSLFPUMX.js"

javascript_tag("app")
# => '<script src="/assets/app-LSLFPUMX.js" type="text/javascript"></script>'
```

See the [assets helpers guide](/v2.3/helpers/assets) for more detail.

### Elsewhere in views

This `"assets"` component is automatically included as a dependency of the [view context](/v2.3/views/context/). This means you can access `assets` in your view [parts](/v2.3/views/parts/) and [scopes](/v2.3/views/scopes/) too.

```ruby
# app/views/parts/book.rb

# auto_register: false

module Bookshelf
  module Views
    module Parts
      class Book < Bookshelf::Views::Part
        def cover_image_url
          value.cover_image_url || context.assets["default-cover-image.jpg"]
        end
      end
    end
  end
end
```
