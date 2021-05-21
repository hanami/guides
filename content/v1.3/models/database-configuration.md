---
title: Database Configuration
order: 20
aliases:
  - "/models/database-configuration"
---

## Environment variables

Before starting your server, you need to configure the database link in <code>.env*</code> files.

Open this file for each environment and update <code>DATABASE_URL</code> for your database.

Setup database variable for the development environment:

```env
# .env.development
DATABASE_URL="database_type://username:password@localhost/bookshelf_development"
```

Setup database variable for the test environment:

```env
# .env.test
DATABASE_URL="database_type://username:password@localhost/bookshelf_test"
```

For jdbc urls you can't set username and password to the left of @ you have to set them as parameters in the url:

```env
DATABASE_URL="jdbc-database_type://localhost/bookshelf_test?user=username&password=password"
```

## Setup your database

After your database variables setup is done you need to create the database and run the migrations before being able to launch a development server.

In your terminal, enter:

```shell
$ bundle exec hanami db prepare
```

To setup your test environment database, enter:

```shell
$ HANAMI_ENV=test bundle exec hanami db prepare
```

## Sequel plugins

Hanami models use [ROM](https://rom-rb.org/) as a low-level backend. This means that you can easily use any [Sequel](https://github.com/jeremyevans/sequel) plugins in your app.
For this you need to define a `gateway` block in your model configuration, add the extension by calling `extension` on `gateway.connection` and pass the extension name in:

```ruby
# config/environment.rb

Hanami.configure do
  model do
    gateway do |g|
      g.connection.extension(:connection_validator)
    end
  end
end
```
