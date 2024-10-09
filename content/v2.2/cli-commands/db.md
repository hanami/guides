---
title: Routes
order: 110
---

## hanami db

Hanami supports multiple database-related CLI commands, to help manage databases and their schemas for your app. You can list all of them, by adding the `--help` option.

```shell
$ bundle exec hanami db --help

Commands:
  hanami db create                                  # Create databases
  hanami db drop                                    # Delete databases
  hanami db migrate                                 # Migrates database
  hanami db prepare                                 # Prepare databases
  hanami db seed                                    # Load seed data
  hanami db structure [SUBCOMMAND]
  hanami db version                                 # Print schema version
```

### hanami db create
Allows to create the database for the current environment.

```shell
$ bundle exec hanami db create

# => database db/bookshelf.sqlite created
```

The DB name is fetched from the `DATABASE_URL` environment variable.

```yaml
# .env
DATABASE_URL=sqlite://db/bookshelf.sqlite
```

The command will accept options listed below.

```shell
  --app                             # Use app database, default: false
  --slice=VALUE                     # Use database for slice
  --gateway=VALUE                   # Use database for gateway
  --help, -h                        # Print this help
```

**Create slice database**

You can have separate databases for your slices without any additional configuration. The only thing needed is to define the `DATABASE_URL` environment variable for your slice. You can do it, by *prepending* the `DATABASE_URL` with your slice name, separating it by `__` (**double underscore**). Here is a quick example:

```shell
# quickly generate the new slice if you don't have one.
$ bundle exec hanami g slice Admin
```

```ruby
# .env
DATABASE_URL=sqlite://db/bookshelf.sqlite

ADMIN__DATABASE_URL=sqlite://slices/admin/config/db/bookshelf.sqlite
```

Now, when you'll run the command with the `--slice` option, separate db will be created for your slice.

```shell
$ bundle exec hanami db create

# => database slices/admin/config/db/bookshelf.sqlite created
```


**Specify DB gateway**

Hanami supports multiple databases on the slice but also relation level. We can mix the `--app` or `--slice` flag with `--gateway` option, to specify what DB to create. The only thing needed is to define the separate `DATABASE_URL` environment variable for your gateway. You can do it, by *appending* the `DATABASE_URL` with your slice name, separating it by `__` (**double underscore**). Here is a quick example:

Below we assume, that there is a general `bookshelf` database for reading data, and an `event_store` used for writing parts and making business decisions.  Then within the `Admin` slice, we want to have a separate database to store `Personally identifiable information`.

```ruby
# .env
DATABASE_URL=sqlite://db/bookshelf.sqlite

DATABASE_URL__EVENT_STORE=sqlite://db/event_store.sqlite

ADMIN__DATABASE_URL=sqlite://slices/admin/config/db/bookshelf.sqlite
ADMIN__DATABASE_URL__PII=sqlite://slices/admin/config/db/pii.sqlite
```

```shell
$ bundle exec hanami db create --gateway=event_store --app
# => database db/event_store.sqlite created

$ bundle exec hanami db create --gateway=pii --slice=admin
# => database slices/admin/config/db/pii.sqlite created
```

**Multiple databases created automatically**

If you won't specify options, all matching databases will be created at once.

```shell
=> database db/bookshelf.sqlite created
=> database db/event_store.sqlite created
=> database slices/admin/config/db/bookshelf.sqlite created
=> database slices/admin/config/db/pii.sqlite created
```

### hanami db drop
Allows to drop the databases for the current environment. Similar to other DB commands, it works based on `ENV` variables configuration for `DATABASE_URL` of main app, slices and gateways (Check:[hanami db create](#hanami-db-create) for examples about options)

```shell
$ bundle exec hanami db drop
=> database db/bookshelf.sqlite dropped
```

The command will accept options listed below.

```shell
  --app                             # Use app database, default: false
  --slice=VALUE                     # Use database for slice
  --gateway=VALUE                   # Use database for gateway
  --help, -h                        # Print this help
```


**Multiple databases dropped automatically**

If you don't specify options, all configured databases will be dropped at once.

```ruby
# .env
DATABASE_URL=sqlite://db/bookshelf.sqlite

DATABASE_URL__EVENT_STORE=sqlite://db/event_store.sqlite

ADMIN__DATABASE_URL=sqlite://slices/admin/config/db/bookshelf.sqlite
ADMIN__DATABASE_URL__PII=sqlite://slices/admin/config/db/pii.sqlite
```

```shell
=> database db/bookshelf.sqlite dropped
=> database db/event_store.sqlite dropped
=> database slices/admin/config/db/bookshelf.sqlite dropped
=> database slices/admin/config/db/pii.sqlite dropped
```

### hanami db migrate
This command will run migrations for all configured databases in the app.

```shell
$ bundle exec hanami db migrate
# => database db/bookshelf.sqlite migrated in 0.0019s
```

The command will accept options listed below.

```shell
  --app                             # Use app database, default: false
  --slice=VALUE                     # Use database for slice
  --gateway=VALUE                   # Use database for gateway
  --target=VALUE, -t VALUE          # Target migration number
  --[no-]dump                       # Dump the database structure after migrating, default: true
  --help, -h                        # Print this help
```

For examples how to run migrations only for main app, specified slice or gateway, check the [hanami db create](#hanami-db-create) section.

**Migration folders**

Migrations for the default app database, are stored in `db/migrate` folder. Each gateway or slice will expect to have separate folders to store migrations.

```text
# migrations for default app database. 
# Example: DATABASE_URL => 'db/migrate'
db/migrate

# migrations for <<gateway_name>> app databases.
# Example: DATABASE_URL_EVENT_STORE => 'db/event_store_migrate'
db/<<gateway_name>>_migrate

# migrations for default slice databases.
# example: ADMIN__DATABASE_URL => 'slices/admin/config/db/migrate'
slices/<<slice_name>>/config/db/migrate

# migrations for per-slice gateway databases
# example: ADMIN__DATABASE_URL_PII => 'slices/admin/config/db/pii_migrate'
slices/<<slice_name>>/config/db/<<gateway>>_migrate
```

**Generating db dumps**

By default, you'll get the *_structure.sql file describing the schema for each database. If you wish to skip this behavior, you can pass the `--no-dump` option.

```shell
$ bundle exec hanami db migrate --no-dump
# => database db/bookshelf.sqlite migrated in 0.0004s
```

As you can see, this part is a bit faster, which may be useful for speeding up the CI setup.

**Migrating forward or backward to the specified version**

You can migrate to any migration version, by passing the migration file timestamp in the `--target` option.

```shell
$ bundle exec hanami db migrate --target=20241009134756
```


You can quickly rollback all the way down using `--target=0`

```shell
 $ bundle exec hanami db migrate --target=0 # rollbacks all migrations
```

### hanami db prepare
Preparing DB means, creating all configured databases, and running migrations for all of them.

```shell
$ bundle exec hanami db prepare
# => database db/bookshelf.sqlite migrated in 0.0005s
# => db/bookshelf.sqlite structure dumped to config/db/structure.sql in 0.019s
```

The command will accept options listed below.

```shell
  --app                             # Use app database, default: false
  --slice=VALUE                     # Use database for slice
  --help, -h                        # Print this help
```

For examples how to run db preparation only for main app, or specified slice, check the [hanami db create](#hanami-db-create) section.

