---
title: "Migrations"
section: "Destroy"
order: 40
---

## Migrations

We can destroy a migration.

```shell
$ bundle exec hanami destroy migration create_books
```

It deletes the migration with the corresponding name (eg. `db/migrations/20150621181347_create_books.rb`).
