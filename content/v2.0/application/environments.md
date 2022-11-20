---
title: Environments
order: 60
---

Hanami supports different environments based on a `HANAMI_ENV` environment variable.

Setting `HANAMI_ENV` allows your code to act differently, depending on the environment.

If `HANAMI_ENV` is not set, Hanami will fallback to checking `RACK_ENV`. If neither variable is set, the environment defaults to `:development`.

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

```ruby
# HANAMI_ENV=my_special_environment

Hanami.env
=> :my_special_environment
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

## Production deployments

When deploying your application to production, set the `HANAMI_ENV` environment variable to `production`.
