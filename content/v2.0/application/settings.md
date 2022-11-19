---
title: Settings
order: 10
---

Hanami supports application settings through a `Settings` class, defined in `config/settings.rb`.

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    # Define your app settings here, for example:
    #
    # setting :my_flag, default: false, constructor: Types::Params::Bool
  end
end
```

Using this class, you can define what settings exist within your application, what types and defaults they have, and whether or not they are required for your application to boot.

Each setting is read from an environment variable matching its name. For example, with the following configuration, the Redis URL and Sentry DSN are sourced from the `REDIS_URL` and `SENTRY_DSN` environment variables.


```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :redis_url, constructor: Types::String
    setting :sentry_dsn, constructor: Types::String
  end
end
```

## Types

Environment variables are strings, but it's convenient for settings like `analytics_enabled` to be a boolean value, or `max_cart_items` to be an integer.

You can coerce settings to these types by specifying the relevant constructor. For example, `Types::Params::Bool` and `Types::Params::Integer` will coerce values to boolean and integer values respectively:

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :analytics_enabled, constructor: Types::Params::Bool
    setting :max_cart_items, constructor: Types::Params::Integer
  end
end
```

We can see this in action in the Hanami console:

```shell
ANALYTICS_ENABLED=true MAX_CART_ITEMS=100 bundle exec hanami console

bookshelf[development]> Hanami.app["settings"].analytics_enabled
=> true

bookshelf[development]> Hanami.app["settings"].max_cart_items
=> 100
```

Common types that are useful in settings constructors include:

```ruby
Types::String
Types::Params::Bool
Types::Params::Integer
Types::Params::Float
Types::Params::Date
Types::Params::Time
```

## Required and optional settings

Whether or not each setting is required for your application to start is determined by its constructor.

If a setting uses a constructor like `Types::String` or `Types::Params::Bool`, then Hanami will raise an exception if the setting is missing, rather than let your application start in a potentially invalid state.

The below settings configuration will result in a `Hanami::Settings::InvalidSettingsError` when `DATABASE_URL` and `ANALYTICS_ENABLED` environment variables are not set:

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :analytics_enabled, constructor: Types::Params::Bool
    setting :max_cart_items, constructor: Types::Params::Integer
  end
end
```

```shell
bundle exec hanami server

! Unable to load application: Hanami::Settings::InvalidSettingsError: Could not initialize settings. The following settings were invalid:

analytics_enabled:  cannot be coerced to false
max_cart_items: can’t convert nil into Integer
```

The same exception will be raised if a setting can't be correctly coerced:

```shell
ANALYTICS_ENABLED=true MAX_CART_ITEMS="not coerceable to integer"  bundle exec hanami server

! Unable to load application: Hanami::Settings::InvalidSettingsError: Could not initialize settings. The following settings were invalid:

max_cart_items: invalid value for Integer(): "not coerceable to integer"
```

To make a setting optional, use `optional` to allow `nil` values:

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :analytics_enabled, constructor: Types::Params::Bool.optional
    setting :max_cart_items, constructor: Types::Params::Integer.optional
  end
end
```

## Default values

Settings can also specify defaults to be used in the absence of the relevant environment variable.

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :redis_url, default: "redis://localhost:6379", constructor: Types::String
    setting :analytics_enabled, default: false, constructor: Types::Params::Bool
    setting :max_cart_items, default: 100, constructor: Types::Params::Integer
  end
end
```

## Constraints

To enforce additional contraints on settings, you can use a [dry-types](https://dry-rb.org/gems/dry-types) constraint in your constructor.

Here, the value of the `session_secret` must be at least 32 characters, while the value of the `from_email` setting must satisfy the EMAIL_FORMAT regular expression:

```ruby
# config/settings.rb

# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    EMAIL_FORMAT = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i

    setting :session_secret, constructor: Types::String.constrained(min_size: 32)
    setting :from_email, constructor: Types::String.constrained(format: EMAIL_FORMAT)
  end
end
```

## Using settings within your application

Hanami makes settings available within your application through a built-in settings provider.

```ruby
Hanami.app["settings"]
```

### Accessing settings within components

To access settings within one of your components, use Hanami's Deps mixin:

```ruby
# app/analytics/send_event.rb

module Bookshelf
  module Analytics
    class SendEvent
      include Deps["settings"]

      def call(event_type, payload)
        return unless settings.analytics_enabled

        # ...send event to analytics service here ...
      end
    end
  end
end
```

For more information on components and the Deps mixin, see the [architecture guide](/v2.0/architecture/containers/).

### Accessing settings within providers

When registering a provider, settings can be access via the `target` method, which exposes the application's container:

```ruby
# config/providers/redis.rb

# frozen_string_literal: true

Hanami.app.register_provider :redis do
  start do
    require "redis"

    redis = Redis.new(url: target["settings"].redis_url)

    register "redis", redis
  end
end
```

See the guides for [providers](/v2.0/architecture/providers/) and [containers](/v2.0/architecture/containers/) for more information.

### Accessing settings within your app class

In some cases, you may want to use a setting to inform an application configuration inside your `App` class. Within the `App` class, settings are exposed at the class level for you, via a `settings` method:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.sessions = :cookie, {
      key: "bookshelf.session",
      secret: settings.session_secret,
      expire_after: 60*60*24*365
    }
  end
end
```

## Adding custom methods

One benefit of using a concrete `Settings` class is that you can add methods to the settings class. This allows you to encapsulate settings-related logic and provides you with a way to a design the best interface into your settings.


```ruby
# frozen_string_literal: true

module Bookshelf
  class Settings < Hanami::Settings
    setting :analytics_enabled, default: false, constructor: Types::Params::Bool
    setting :analytics_api_key, constructor: Types::String.optional

    def send_analytics?
      analytics_enabled && !analytics_api_key.nil?
    end
  end
end
```
