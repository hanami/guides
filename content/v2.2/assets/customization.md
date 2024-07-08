---
title: Customization
order: 30
---

To customize your assets compilation, update `config/assets.js` to match the following:

```js
import * as assets from "hanami-assets";

await assets.run({
  esbuildOptionsFn: (args, esbuildOptions) => {
    // Add to esbuildOptions here. Use `args.watch` as a condition for different options for
    // compile vs watch.

    return esbuildOptions;
  }
});
```

Inside `esbuildOptionsFn`, update `esbuildOptions` to set your own [esbuild options](https://esbuild.github.io/api/) for asset compilation. By the time this function runs, hanami-assets has set its own necessary options on `esbuildOptions`.

If you want to apply different options when compiling assets (for production) versus watching assets (for development), use `args.watch` as a conditional.

```js
await assets.run({
  esbuildOptionsFn: (args, esbuildOptions) => {
    if (args.watch) {
      // watch mode (development) options here
    } else {
      // compile mode (production) options here
    }

    return esbuildOptions;
  }
});
```

## Slice asset customization

You can customise asset compilation for an individual slice by creating a `config/assets.js` within the slice directory. This will be used in preference to the config file at the top level.
