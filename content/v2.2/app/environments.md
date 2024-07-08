---
title: Environments
order: 60
---

Hanami supports different environments based on a `HANAMI_ENV` environment variable.

Setting `HANAMI_ENV` allows your code to act differently, depending on the environment.

If `HANAMI_ENV` is not set, Hanami will fallback to checking `RACK_ENV`. If neither variable is set, the environment defaults to `:development`.

By convention, Hanami expects `HANAMI_ENV` to be either `development`, `test`, or `production`.

## Environment helpers

Use the following helpers if your code needs behave differently in different environments.

### Hanami.env

`Hanami.env` returns a symbol representing the current environment.

```ruby
# HANAMI_ENV=development

Hanami.env
=> :development
```

```ruby
# HANAMI_ENV=test

Hanami.env
=> :test
```

```ruby
# HANAMI_ENV=production

Hanami.env
=> :production
```

### Hanami.env?

`Hanami.env?(*names)` returns true if the given name(s) match the current environment.

```ruby
# HANAMI_ENV=development

Hanami.env?(:development)
=> true

Hanami.env?(:test)
=> false

Hanami.env?(:production)
=> false
```

You can match on more than one environment:

```ruby
# HANAMI_ENV=development

Hanami.env?(:development, :test)
=> true
```

```ruby
# HANAMI_ENV=test

Hanami.env?(:development, :test)
=> true
```

```ruby
# HANAMI_ENV=production

Hanami.env?(:development, :test)
=> false
```

## Environment specific app config

Config options that are environment specific can be set on the app class. For example:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    environment(:production) do
      # Production specific config or initialization
      config.middleware.use ProductionOnlyMiddleware
    end
  end
end
```

See the [app config guide](/v2.2//app/app-config/) for information on supported config options.

## Production deployments

When deploying your application to production, set the `HANAMI_ENV` environment variable to `production`.

In production, Hanami logs to standard out by default, using a structured JSON format with a log level of `:info` rather than `:debug`, which is used in development and test. See the [logger guide](/v2.2/logger/configuration/) for more detail.
