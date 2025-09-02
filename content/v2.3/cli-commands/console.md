---
title: Console
order: 40
---

## hanami console

Starts the Hanami console (REPL).

```shell
$ bundle exec hanami console

bookshelf[development]>
```

This command accepts an `engine` argument that can start the console using IRB or Pry.

```shell
$ bundle exec hanami console --engine=irb # (the default)
$ bundle exec hanami console --engine=pry
```
