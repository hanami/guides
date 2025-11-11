---
title: New
order: 20
---

## hanami new

Generates a Hanami application with the given APP name, in a new directory from the current location.

```shell
$ hanami new bookshelf # generates a new Bookshelf application in ./bookshelf
$ hanami new my_app # generates a new MyApp application in ./my_app
```

On the application generation, Hanami performs gem bundling, NPM bundling, and general application setup.

### Specify a database

Provide `--database=DATABASE` to specify the database type for your app. Available options are `sqlite` (default), `mysql`, and `postgres`.

### Specifying a gem source

Provide a `--gem-source` to specify the gem source for your app's `Gemfile`.

```shell
$ hanami new bookshelf --gem-source=gem.coop

# Generates a Gemfile with:
# source "https://gem.coop"
```

### Skipping features

Skip the installation of certain Hanami features by passing `--skip-assets`, `--skip-view`, or `--skip-db`.

### Using Hanami HEAD

If you're interested in testing the latest code or debugging an issue, you can generate an application that uses the HEAD version of Hanami, directly from the `main` branches of the GitHub repositories.

```shell
$ hanami new bookshelf --head
```
