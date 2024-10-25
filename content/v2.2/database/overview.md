---
title: Overview
order: 10
---

Hanami’s persistence layer is based on the Ruby Object Mapper (ROM) project. ROM is a radically different approach to persistence than you may be familiar with. Don’t let that scare you, because all the component parts of ROM are designed to provide clear separation of responsibilities. The hardest part is shifting your perspective to think in a new paradigm.

Above all else ROM favors:

- **Explicitness** over "magic" whenever possible
- **Speed**, because performance is a *feature*
- **Flexibility** in your domain layer's design

[ROM: Principles & Design](https://rom-rb.org/learn/#principles-amp-design)

While traditional Object-Relational Mapping comes from a strictly Object-Oriented approach, ROM combines the best parts of Functional Programming and OOP that play to Ruby’s inherent strengths as a language. Instead of homogenizing all datastores into a lowest-common-denominator API, ROM embraces the diversity of storage engines and the powerful features they can provide.

## Relations

Relations represent a collection of information in your persistence layer, and its relationships to other collections. They contain a **schema**, **associations**, and a **dataset**.

Relations model how you query the persistence layer for information. With a SQL database, this means constructing SQL queries. But importantly, ROM does not assume your backend technology; you could be querying a YAML file, a document-based storage engine, or an HTTP endpoint as well. Hanami does not officially support doing this yet, but it is possible.

The default adapter used by `Hanami::DB::Relation` is the `ROM::SQL` adapter. The adapter defines the top-level semantics of how the storage engine works, and how to connect to it. `ROM::SQL` is based on the [Sequel](http://sequel.jeremyevans.net/) library.

## Schemas

The schema defines the shape of the incoming data and how it should be coerced into Ruby types. Most of the time, you will see this inferred from the database directly:

```ruby
class Users < Hanami::DB::Relation
  schema :users, infer: true
end
```

However, if you need to make any alterations to the defaults you can explicitly declare schema with or without inference.

```ruby
class Users < Hanami::DB::Relation
  schema :users, infer: true do
    attribute :email, Types::Email
  end
end
```


`ROM::SQL` provides a wide array of data types for SQL engines, but you can provide your own based on dry-types.

For more on Schemas, see [ROM Core: Schemas](https://rom-rb.org/learn/core/5.2/schemas/)

## Associations

Associations define the relationships between individual Relations.

```ruby
class Users < Hanami::DB::Relation
  schema(infer: true) do
    associations do
      has_many :users_tasks
      has_many :tasks, through: :users_tasks
    end
  end
end
```


For more on associations, see [ROM SQL: Associations](https://rom-rb.org/learn/sql/3.3/associations/).

## Datasets

Datasets define how the underlying data is fetched by default. ROM defaults to selecting all attributes in the schema, but this is trivial to override.

```ruby
class Users < Hanami::DB::Relation
  schema(:users, infer: true)

  dataset do
    select(:id, :name).order(:name)
  end
end
```

The dataset can be thought of as the current state of the query before it happens; adding query conditions builds up the state of this dataset until you initiate the query.

The output of Dataset queries are plain Ruby hashes, which are consumed by a Repository.

For more on Datasets, see [Sequel: Dataset Basics](http://sequel.jeremyevans.net/rdoc/files/doc/dataset_basics_rdoc.html)

## Repositories

Repositories are the primary public interface of the persistence layer. They exist to bridge the gap between business objects and database objects.

Because Relation queries are highly dependent on the shape of the persistence layer, the Repository encapsulates this responsibility with a permanent, public API.

Consider the case of a users table that originally used emails as the identity of the user.

```ruby
class UserRepo < Hanami::DB::Repository
  def find(email) = users.where(email:).one
end
```


Now, the requirement is that you move to usernames as the principal identity. Without a Repository, every place in your codebase that queries a User would need to accommodate this change. But here, we can do:

class UserRepo < Hanami::DB::Repository
  def find(username) = users.where(username:).one
end


If the rest of your business logic treats the identity as an opaque string, then you’re done. The encapsulation afforded by Repository restricts the knowledge of the persistence layer from where it does not belong.

For more on Repositories, see [ROM: Repositories](https://rom-rb.org/learn/repository/5.2/)

## Structs

The final output of a Repository is a Struct.

A Hanami struct is immutable, and contains no business logic. They are extensible for adding presentation logic:

```ruby
module Main
  module Structs
    class User < Hanami::DB::Struct
      def full_name
        "#{given_name} #{family_name}"
      end

      def mailbox
        "#{full_name} <#{email}>"
      end

      def to_json = JSON.generate(attributes)
    end
  end
end
```

But you don’t need to define every struct ahead of time, only to extend its functionality. Structs will be generated on-demand in your slice’s `Structs` namespace.

A Struct is not a permanent abstraction of a piece of data: it is a momentary projection of the data you requested. This means that instead of a User model that fills every role you need of a user, you could project user data as a Credential for authentication, a Role for authorization, a Visitor for displaying their identity on the page. Every projection can serve a specific purpose, and contain exactly the information you need and nothing more.

More importantly, the form your structs take in the application layer can change independently of the persistence layer. Your database tables can change without impacting the structs; the application structs can change without impacting the database. All you have to do is manage the changing relationships to produce the same output.

## Configuration

As of 2.2 Hanami will automatically generate DB configuration for your application. You can suppress this with --skip-db

```console
hanami new bookshelf --skip-db
```

The default posture is to share a single configuration for the whole application, however Slices support having their own separate config.

DB persistence is provided by a new provider called db. It is activated by the presence of a config/db directory in the root Application or Slice.

## DATABASE_URL

The primary point of configuration for your database connection is the DATABASE_URL environment variable.

```
DATABASE_URL=postgres://localhost/bookshelf_development
DATABASE_URL=mysql2://user:password@localhost/bookshelf_dev
DATABASE_URL=sqlite://config/db/development.sqlite
```

For more detail on the syntax of the URLs, see [ROM SQL: Connecting to a Database](https://rom-rb.org/learn/sql/3.3/#connecting-to-a-database)

## Advanced Configuration

If all you need to do is define `DATABASE_URL`, you don’t need to create any further configuration. However, there are cases where you may want to add Sequel or ROM plugins to your configuration.

This is achieved by creating `config/providers/db.rb`

```ruby
Hanami.app.configure_provider :db do
  config.gateway :default do |gw|
    # In addition to putting it in the DATABASE_URL env
    # variable, it can also be set in code here
    gw.database_url = "postgres://localhost:5432/mydb"

    # The default PostgreSQL configuration would look like this
    gw.adapter :sql do |sql|
      # ROM plugins are organized under the applicable component type
      # this plugin is named 'instrumentation' and applies to ROM::Relation
      sql.plugin relations: :instrumentation do |plugin|
        # If the plugin defines a config object with more options
        # you can yield it here and set the values
        plugin.notifications = slice["notifications"]
      end

      # Not every plugin requires extra configuration
      sql.plugin relations: :auto_restrictions

      # Sequel extensions are registered with a single symbolic name
      # sql.extension supports multiple arguments, and you can call it
      # multiple times. We split these up into two simply for readability.
      sql.extension :caller_logging, :error_sql, :sql_comments
      sql.extension :pg_array, :pg_enum, :pg_json, :pg_range
    end
  end
end
```

By default you are adding to the defaults above, but you can tell Hanami to skip them if you wish.

```ruby
gw.adapter :sql do |sql|
  # skip everything
  sql.skip_defaults

  # skip ROM plugins
  sql.skip_defaults :plugins

  # skip Sequel extensions
  sql.skip_defaults :extensions
end
```

More on [Sequel Extensions](http://sequel.jeremyevans.net/rdoc/files/doc/extensions_rdoc.html)

## Slice Configuration

As Slices are designed to provide modular isolation of business domains, it’s likely that database isolation will also be desirable in some cases.

When configuring your slice database, instead of `DATABASE_URL`, you will use the `SLICE_NAME__DATABASE_URL` convention.

So, given the following slice definition:

```ruby
module Main
  class Slice < Hanami::Slice
  end
end
```

You would define a `MAIN__DATABASE_URL` environment variable and a `slices/main/config/db` directory.

Slice configuration is hierarchical, so if you have database configuration in the parent it will be inherited by all child slices by default. You can opt out of this via the import_from_parent setting.

```ruby
module Main
  class Slice < Hanami::Slice
    config.db.import_from_parent = false
  end
end
```

## Gateway Configuration

Isolating database connections per-slice is not a requirement. You may want to have multiple connections within a single slice, especially if you’re connecting to different kinds of datastores. ROM configurations have **gateways** that define independent database connections.

Consider the case of a database migration from MySQL to PostgreSQL. Doing this in a single step is highly risky, so it would be desirable to have connections to both for a period of time.

The simplest configuration may be done using the `DATABASE_URL__GATEWAY` format:

```
DATABASE_URL=postgres://localhost:5432/bookshelf_development
DATABASE_URL__LEGACY=mysql://localhost:3306/legacy
```

This works in concert with Slice configuration, as well:

```
MAIN__DATABASE_URL__LEGACY=mysql://localhost:3306/legacy
```

Sometimes you will want additional connection options used when opening the connection. These may be added as query parameters on the DATABASE_URL:

```
DATABASE_URL__LEGACY=mysql://localhost:3306/legacy?max_connections=4
```

But as with Slice configuration, you can do more advanced things in code as well:

```ruby
Hanami.app.configure_provider :db do
  config.gateway :default do |gw|
    gw.connection_options search_path: ['public', 'alt']

    gw.adapter :sql do |sql|
      sql.extension :my_custom_ext
    end
  end

  config.gateway :legacy do |gw|
    gw.connection_options max_connections: 4
    gw.adapter :sql
  end
end
```

More on [Sequel connection options](http://sequel.jeremyevans.net/rdoc/files/doc/opening_databases_rdoc.html)

Relations are assigned to the default gateway automatically, so if you are defining a Relation for an alternate, you need to configure that explicitly:

```ruby
class Users < Hanami::DB::Relation
  gateway :legacy
  schema infer: true
end
```

## Migrations

Migrations are Ruby files that provide syntax for generating [Data Definition Language](https://en.wikipedia.org/wiki/Data_definition_language) for the `ROM::SQL` adapter. They are generated by the Hanami command line, and provided by the Sequel library.

Migration filenames are defined in [snake case](https://en.wikipedia.org/wiki/Snake_case) and prefaced by a numeric timestamp of when they were created. This allows for roughly sequential execution without the likelihood of collisions from sequential integers when multiple people are creating them at the same time.

They are located in the `config/db/migrate` directory.

```
$ tree config/db/migrate
config/db/migrate
├── 20240717170227_create_posts.rb
└── 20240717170318_add_published_at_to_posts.rb
```

### Direction

Migration files are bi-directional, they define schema changes *forward* and *backward*, or `up` and `down` in Sequel’s syntax. This is important, in case your migration changes cause a problem you will want to roll them back as quickly as possible, and requiring a fresh migration to do this may take too much time.

```ruby
ROM::SQL.migration do
  change do
    create_table :users do
      primary_key :id
      foreign_key :account_id, :accounts, on_delete: :cascade, null: false

      column :given_name, String, null: false
      column :family_name, String, null: false
      column :email, "citext", null: false
    end
  end
end
```

In the example above, we used the `change` method to define our migration. This is written in the style of an up migration, and the down version is inferred by Sequel.

Sometimes, this cannot be automatically inferred. You will need to provide explicit `up` and `down` definitions in this case.

```ruby
ROM::SQL.migration do
  up do
    alter_table :users do
      add_unique_constraint [:email], name: :users_email_uniq
    end
  end

  down do
    alter_table :users do
      drop_constraint :users_email_uniq
    end
  end
end
```

### Transactions

The majority of migrations are run within a transaction, so that DDL errors trigger a rollback and don’t leave you in a partial state. But certain operations don’t support running inside a transaction.

Within a migration block, `no_transaction` tells the migrator to run the migration without first starting a transaction.

```ruby
ROM::SQL.migration do
  no_transaction

  up do
    alter_table :users do
      add_index :email, concurrently: true
    end
  end

  down do 
    alter_table :users do
      drop_index :email, concurrently: true
    end
  end
end
```

### Syntax

Sequel migration syntax provides some flexibility in how you may choose to represent your table columns.

```ruby
create_table :users do
  # column method, explicit SQL type
  column :email, "varchar(255)", null: false

  # column method, inferred SQL type: varchar(255)
  column :email, String, null: false

  # helper method, no inference, SQL type: text
  text :email, null: false

  # Ruby type method, inferred SQL type: varchar(255)
  String :email, null: false
end
```

Sequel also provides Ruby syntax for defining logical pieces, such as constraints

```ruby
create_table :users do
  primary_key :id
  column :name, String, null: false
  constraint(:name_min_length) { char_length(name) > 2 }
end
```

Read more at [Sequel: Schema modification methods](http://sequel.jeremyevans.net/rdoc/files/doc/schema_modification_rdoc.html)

Ruby syntax is not a requirement, however, and sometimes what you are doing is not easy or possible to express in Sequel’s DSL. In those cases, `execute` acts as an escape-hatch into raw SQL. The drawback of `execute` is that it cannot infer how to reverse your changes, so you will have to provide explicit up and down migrations.

```ruby
ROM::SQL.migration do
  up do
    execute <<~SQL
        CREATE TRIGGER posts_tsvector_update()
        BEFORE INSERT OR UPDATE ON public.posts
        FOR EACH ROW
        WHEN (
          OLD.title IS DISTINCT FROM NEW.title OR
          OLD.content IS DISTINCT FROM NEW.content
        )
        EXECUTE PROCEDURE tsvector_update_trigger(search_tsvector, 'public.english', title, content)
    SQL
  end

  down do
    execute "DROP TRIGGER posts_tsvector_update() ON public.posts"
  end
end
```

In this example, we’re storing vector information for PostgreSQL’s text search in a column, automatically built by a trigger.

### Database Structure

When adding migrations to your project, it’s useful to maintain a record of what the current state of your database structure was at the time.

This serves three purposes:

1. Spot-check your schema changes to ensure you’re doing what you intended
2. Provide a simple way to connect the structure of your database to a specific code change
3. A blank-slate for setting up a development or test database without running all migrations sequentially

Hanami provides this in the form of `config/db/structure.sql`. The choice of using plain SQL to reflect your DB structure gives you maximum flexibility in using the most powerful features of your database.
