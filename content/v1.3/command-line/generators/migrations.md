---
title: "Migrations"
section: "Generators"
order: 50
---

Hanami has convenient code generators to speed up our development process.

  * Applications
  * Actions
  * Routes
  * Models
  * Migrations

## Migrations

Generate a database migration

```shell
$ bundle exec hanami generate migration create_books
      create  db/migrations/20161112113203_create_books.rb
```

It generates an empty migration with the UTC timestamp and the name we have specified: `db/migrations/20161112113203_create_books.rb`.
