---
title: Sessions
order: 90
---

Sessions are disabled by default. To enable sessions, add a config like the following to your app:

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

For this to work, you will need to add a `session_secret` to your app settings. See [settings](/v2.1/app/settings/) for more details.

```ruby
# config/settings.rb

module Bookshelf
  class Settings < Hanami::Settings
    setting :session_secret, constructor: Types::String
  end
end
```
## Using sessions

With sessions enabled, actions can set and read values from the session using the `response` and `request` objects.

```ruby

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          # Setting a value in the session
          response.session[:user_id] = 1

          # Reading a value from the session
          request.session[:user_id] # => 1

          # Removing a value from the session
          request.session[:user_id] = nil
        end
      end
    end
  end
end
```

## Session adapters

When configuring sessions, the first argument of the configuration is the adapter to use for session storage.

Specifying `:cookie`, as above, will use `Rack::Session::Cookie` for the session storage.


<p class="convention">
The name of the session adapter is the underscored version of the class name under <code>Rack::Session</code> namespace.
Example: <code>:cookie</code> for <code>Rack::Session::Cookie</code>.
</p>

To use a different adapter, for example `:redis`, add the `redis-rack` gem and specify the adapter as `:redis`.

<p class="convention">
Custom storage technologies can be loaded via <code>require "rack/session/#{ adapter_name }"</code>.
</p>

The second argument passed to `sessions` is a hash of options to be passed to the chosen adapter.
