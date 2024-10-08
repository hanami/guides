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

```

```shell
=> database db/bookshelf.sqlite created
=> database db/event_store.sqlite created
=> database slices/admin/config/db/bookshelf.sqlite created
=> database slices/admin/config/db/pii.sqlite created
```

