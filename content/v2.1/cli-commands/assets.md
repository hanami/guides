---
title: Assets
order: 100
---

## hanami assets compile

Compiles the app's [assets](/v2.1/actions/overview) into bundles for use in production:

```shell
$ bundle exec hanami assets compile
[bookshelf]
[bookshelf]   public/assets/app-SQ36TYM4.js       53b
[bookshelf]   public/assets/app-KUHJPSX7.css      45b
[bookshelf]   public/assets/app-KUHJPSX7.css.map  93b
[bookshelf]   public/assets/app-SQ36TYM4.js.map   93b
[bookshelf]
[bookshelf] ⚡ Done in 3ms
```

## hanami assets watch

Watches for changes to your assets and compiles the relevant files immediately. This is a long-running command, and is run by [hanami dev](/v2.1/commands/dev) by default.

```shell
$ bundle exec hanami assets watch
[bookshelf] [watch] build finished, watching for changes...
[bookshelf] [watch] build started (change: "app/assets/js/app.js")
[bookshelf] [watch] build finished
[bookshelf] [watch] build started (change: "app/assets/css/app.css")
[bookshelf] [watch] build finished
```
