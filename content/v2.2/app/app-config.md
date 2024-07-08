---
title: App config
order: 70
---

You can configure various aspects of your Hanami app using `config` in your app class.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.inflections do |inflections|
      inflections.acronym "WNBA"
    end
  end
end
```

You can also configure your app differently in different environments.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    environment(:production) do
      require "my_custom_middleware"
      config.middleware.use MyCustomMiddleware
    end
  end
end
```

See the [environments guide](/v2.1/app/environments) for more detail.

Individual slices may also be configured. See the [slices guide](/v2.1/app/slices) for more detail.

See below for a description of all available `config` methods.

## General

### `inflections`

Along with `inflector`, customizes your your app's string inflection rules. See the [inflector guide](/v2.1/app/inflector) for more detail.

### `slices`

Specifies the slices to load. See the [slices guide](/v2.1/app/slices) for more detail.

## Code loading

### `root`

Sets the root for the app or slice. For the app, defaults to `Dir.pwd`. For slices, defaults to the slice's name under the `/slices/` directory.

The root is used for locating the code to be loaded by the app. See the [autoloading guide](/v2.1/app/autoloading) and the [containers and components guide](/v2.1/app/container-and-components) for more detail.

### `shared_app_component_keys`

Sets the keys for the app components to be automatically imported into each slice. See the [slices guide](/v2.1/app/slices) for more detail.

### `no_auto_register_paths`

Sets an array of paths (relative to the root of the app or any slice) to be excluded from component auto-registration. Defaults to `["entities"]`. See the [containers and components guide](/v2.1/app/container-and-components) for more detail.

## Router

### `base_url`

Sets the base URL for the app's web server. This is used when building URLs for named routes. Defaults to `"http://0.0.0.0:2300"`. See the [routes guide](/v2.1/routing/overview/) for more detail.

### `middleware`

Configures the Rack middleware stack to be used by the app's router. Defaults to an empty middleware stack.

Add a middleware with `use`:

```ruby
# config/app.rb
config.middleware.use MyMiddleware, "middleware", "args", "here"
```

Use the `before:` or `after:` options to insert a middleware at a particular point in the stack:

```ruby
# config/app.rb
config.middleware.use MyMiddleware, before: AlreadyAddedMiddleware
```

If you configure actions to use the `:json` format, then `Hanami::Middleware::BodyParser` will be added automatically and configured to parse JSON request bodies.

## Actions

Sets the configuration to be used by all actions in the app.

```ruby
# config/app.rb
config.actions.format :json
```

See the [actions guide](/v2.1/actions/overview) for more detail.
