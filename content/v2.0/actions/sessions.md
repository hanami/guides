---
title: Sessions
order: 90
---

## Enable Sessions

Sessions are available in Hanami applications, but not enabled by default.
If we want to turn on this feature, we just need to uncomment a line of code.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.sessions = :cookie, secret: ENV['WEB_SESSIONS_SECRET']
    end
  end
end
```

The first argument is the name of the adapter for the session storage.
The default value is `:cookie`, that uses `Rack::Session::Cookie`.

<p class="convention">
The name of the session adapter is the underscored version of the class name under <code>Rack::Session</code> namespace.
Example: <code>:cookie</code> for <code>Rack::Session::Cookie</code>.
</p>

We can use a different storage compatible with Rack sessions.
Let's say we want to use Redis. We should bundle `redis-rack` and specify the name of the adapter: `:redis`.
Hanami is able to autoload the adapter and use it when the application is started.

<p class="convention">
Custom storage technologies can be loaded via <code>require "rack/session/#{ adapter_name }"</code>.
</p>

The second argument passed to `sessions` is a Hash of options that are **passed to the adapter**.
We find only a default `:secret`, but we can specify all the values that are supported by the chosen adapter.

## Usage

Sessions behave like a Hash: we can read, assign and remove values.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.session[:b]         # read
          response.session[:a] = 'foo' # assign
          response.session[:c] = nil   # remove
        end
      end
    end
  end
end
```

### Sharing session values between slices

To share session values, defined in one slice, we must provide the same session secret to all the slices where we need those values.

```ruby
# Define ENV variables for development environment
Main_SESSIONS_SECRET="123456789"
ADMIN_SESSIONS_SECRET="123456789"
```

Set session variable in the first slice.

```ruby
# slices/main/books/index.rb

module Main
  module Actions
    module Books
      class Index < Main::Action
        def handle(request, response)
          response.session[:foo] = 'bar' # assign
        end
      end
    end
  end
end
```

Read session variable in the second app.

```ruby
# slices/admin/books/index.rb

module Admin
  module Actions
    module Books
      class Index < Main::Action
        def handle(request, response)
          puts response.session[:foo] # read => 'bar'
        end
      end
    end
  end
end
```
