---
title: DB
order: 80
---

## hanami db

Hanami provides commands to manage all aspects of your database’s lifecycle. List all the commands with the `--help` option.

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

Each of the commands below will target all the databases in your app and slices by default. To target an individual database, provide an `--app` or `--slice=SLICE` option, as well as `--gateway=GATEWAY` if you have multiple gateways configured.

## hanami db create

Creates the databases for the current environment.

## hanami db drop

Drops the databases for the current environment.

## hanami db migrate

Runs migrations to apply changes to the app's databases.

To migrate to a specific version (forwards or backwards), provide the `--target` option, along with the timestamp of the target migration.

```shell
$ bundle exec hanami db migrate --target=20241009134756
```

To migrate to the beginning, provide `--target=0`.

By default, migrating will also generate a structure dump file (such a `config/db/structure.sql`). To skip this, provide the `--no-dump` flag.

For more on migrations, see the [migrations guide](/v2.3/database/migrations/).

## hanami db rollback

Rolls back one or more migrations for a single database. This is a convenient alternative to calling `db migrate` with a specific `--target`.

Call `rollback` on its own to roll back the most recent migration.

Specify `--steps` to roll back that the n most recent migrations:

```
$ bundle exec hanami rollback --steps=2
```

Specify `--target` to roll back to a specific migration version:

```
$ bundle exec hanami rollback --target=20241009134756
```

The rollback command operates on one database at a time. If your app has more than one database, specify the database with `--app`, `--slice=SLICE`, as well as `--gateway=GATEWAY` if you have multiple gateways configured.

## hanami db prepare

Prepares the app's databases for use, from whatever state they may be in.

For each database, runs the following commands:

- `db create` (if the database does not exist)
- `db structure load` (if the database does not exist)
- `db migrate`
- `db seed` (once per slice only)

This command operates idempotently, so you can run it at any stage of your development process.

## hanami db seed

Loads and executes the seeds files for your app and slices. These are located at `config/db/seeds.rb`.

These seed files should create the database records required to run the app. The code in these files be idempotent so that it can be executed at any time.

## hanami db structure dump

Dumps the structure of the app's databases into `structure.sql` files.

## hanami db structure load

Prepares the app's databases structure by executing their `structure.sql` files.

This is a faster way to bring a new database into a ready state compared to re-running all historical migrations.

## hanami db version

Prints current schema version for the app's databases.
