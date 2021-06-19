---
title: "Models"
section: "Generators"
order: 40
---

## Models

Generate an entity and a repository with a single command

```shell
$ bundle exec hanami generate model book
      create  lib/bookshelf/entities/book.rb
      create  lib/bookshelf/repositories/book_repository.rb
      create  db/migrations/20170213123250_create_books.rb
      create  spec/bookshelf/entities/book_spec.rb
      create  spec/bookshelf/repositories/book_repository_spec.rb
```

It generates an entity with the corresponding repository, migration, and tests.

The migration will already contain the code for the creation of the table, the primary key and the timestamps:

```ruby
# db/migrations/20170213123250_create_books.rb
Hanami::Model.migration do
  change do
    create_table :books do
      primary_key :id

      column :created_at, DateTime, null: false
      column :updated_at, DateTime, null: false
    end
  end
end
```
