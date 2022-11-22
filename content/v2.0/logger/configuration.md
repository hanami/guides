---
title: Configuration
order: 10
---

Hanami provides a built-in logger that is used by default as a general-purpose logger and, if you're building a web application, a Rack request logger too.

You can tweak its configuration in your `App` class, but typically, the defaults should serve you well. Hanami sets up its logger differently depending on the environments:

- In `development` environment logger logs to `$stdout` in `:debug` mode
- In `test` environment logger logs to `logs/test.log` in `:debug` mode
- In `production` environment logger logs to `$stdout` in `:info` mode using `:json` formatter

### Changing default config

The logger configuration is namespaced as `config.logger` and you can access it in your `App` class. If you change these settings, they will be set *for all environments by default*.

Here's how you could set `:json` formatter for all environments:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    # This would change formatter for all environments to `:json`
    config.logger.formatter = :json
  end
end
```

You can fine-tune your logger on a per-environment basis using the convenient `environment` method:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    environment(:development) do
      config.logger.stream = root.join("log").join("development.log")
    end
  end
end
```

### Log filters

In order to avoid having sensitive information leak to your log streams, Hanami configures log filtering to filter out the following keys:

- `_csrf`
- `password`
- `password_confirmation`

If you want to add more keys, you can simply do it like this:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    config.logger.filters = config.logger.filters + ["token"]
  end
end
```

### Colorized output

If you want colorized log levels in your output, you can do so via `colorize` option:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    environment(:development) do
      config.logger.options[:colorize] = true
    end
  end
end
```

You can also customize text log template to use custom colors:

```ruby
require "hanami"

module Bookshelf
  class App < Hanami::App
    environment(:development) do
      config.logger.options[:colorize] = true

      config.logger.template = <<~TMPL
        [<blue>%<progname>s</blue>] [%<severity>s] [<green>%<time>s</green>] %<message>s %<payload>s
      TMPL
    end
  end
end
```

### Customizing logging destinations

You may want to handle certain type of log entries in a special way. One example of this could be logging unexpected crashes to a special file to be able to see them more easily when running tests. You can achieve this by adding a dedicated logging backend.

Here's what you could add to your `spec_helper.rb` to have any exception that's being logged while tests are running go to `log/exceptions.log` file:

```ruby
# spec/spec_helper.rb

Hanami.logger.add_backend(
  stream: Hanami.app.root.join("log").join("exceptions.log"), log_if: :exception?
)

begin
  raise "Oh noez"
rescue => e
  Hanami.logger.error(e)
end
```
