---
title: Configuration
order: 20
---

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

## Container Keys

Hanami exposes your database configuration through a series of container keys.

<dl class="row">
  <dt class="col-sm-3"><code>db.config</code></dt>
  <dd class="col-sm-9">Final ROM Configuration object</dd>
  <dt class="col-sm-3"><code>db.rom</code></dt>
  <dd class="col-sm-9">ROM instance for this slice</dd>
  <dt class="col-sm-3"><code>db.gateway</code></dt>
  <dd class="col-sm-9">Default DB Gateway</dd>
  <dt class="col-sm-3"><code>db.gateways.default</code></dt>
  <dd class="col-sm-9">Explicitly-named gateway</dd>
</dl>

Any additional gateways that you have defined will be registered under the `db.gateways` namespace.
