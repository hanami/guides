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

### Using Hanami HEAD

In case you're interested to debug a Hanami issue, you can generate an application that uses the HEAD version of Hanami, directly from the `main` branches of the GitHub repositories.

```shell
$ hanami new bookshelf --head
```
