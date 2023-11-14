---
title: Generate
order: 90
---

## hanami generate

Hanami 2.1 provides a few generators:

```shell
$ bundle exec hanami generate --help
Commands:
  hanami generate action NAME
  hanami generate part NAME
  hanami generate slice NAME
  hanami generate view NAME
```

### hanami generate action

Generates an [action](/v2.1/actions/overview):

```shell
$ bundle exec hanami generate action books.show
```

Use the `--help` option to access all accepted options:

```shell
$ bundle exec hanami generate action --help
```

### hanami generate part

Generates a view [part](/v2.1/views/parts/):

```shell
$ bundle exec hanami generate part book
```

Use the `--help` option to access all accepted options:

```shell
$ bundle exec hanami generate part --help
```

### hanami generate slice

Generates a [slice](/v2.1/app/slices/):

```shell
$ bundle exec hanami generate slice admin
```

Use the `--help` option to access all accepted options:

```shell
$ bundle exec hanami generate slice --help
```

### hanami generate view

Generates a [view](/v2.1/views/overview/):

```shell
$ bundle exec hanami generate view books.create
```

Use the `--help` option to access all accepted options:

```shell
$ bundle exec hanami generate view --help
```
