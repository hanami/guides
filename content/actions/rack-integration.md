---
title: Rack Integration
order: 60
---

## Rack Environment

Actions offer a high level API built on top of Rack.
If we need to access raw data from Rack environment we can use `params.env`.

## Rack Middleware

Hanami mounts a very thin default middleware stack.
Additional components can be mounted globally, at the application level, or locally.

## Global Middleware

If we need a component that wraps all the applications (under `apps/`), we can edit `config.ru` at the root of the project.

```ruby
# config.ru
require './config/environment'
require 'rack/auth/basic'

use Rack::Auth::Basic
run Hanami.app
```

## Project Middleware

There is also another way (the recommended one) to mount a Rack middleware: at the project level:

```ruby
# config/environment.rb

Hanami.configure do
  # ...
  middleware.use Rack::Auth::Basic
end
```

## Application Middleware

If we need a component that's only used by a specific application (under `apps/`), we can add it to the application's configuration.

```ruby
# apps/web/application.rb
require 'rack/auth/basic'

module Web
  class Application < Hanami::Application
    configure do
      # ...
      middleware.use Rack::Auth::Basic
    end
  end
end
```

## Action Middleware

Sometimes we need a middleware only to be used for a set of well known resources.
If we mount it at the global or application level the performance will start to degrade.
Actions allow us to mount a fine grained middleware stack.

```ruby
# apps/web/controllers/sessions/create.rb
require 'omniauth'

module Web
  module Controllers
    module Sessions
      class Create
        include Web::Action

        use OmniAuth::Builder {
          # ...
        }

        def call(params)
          # ...
        end
      end
    end
  end
end
```

We can use the following syntax to mount different middleware that require arguments.

```ruby
# apps/web/controllers/dashboard/index.rb
module Web
  module Controllers
    module Dashboard
      class Index
        include Web::Action

        use XMiddleware.new('x', 123)
        use YMiddleware.new
        use ZMiddleware

        def call(params)
          # ...
        end
      end
    end
  end
end
```
