---
title: Cookies
order: 80
---

Actions can set [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) on outgoing requests via the `response` object.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.cookies["tasty_cookie"] = "strawberry"
        end
      end
    end
  end
end
```

Cookies subsequently sent by the browser can be read from the `request`.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          request.cookies["tasty_cookie"] # => "strawberry"
        end
      end
    end
  end
end
```

## Cookie configuration

You can set one or more of the following options for cookies issued by actions using the action cookies config on your app.

  * `:domain` - `String` (`nil` by default), the domain
  * `:path` - `String` (`nil` by default), a relative URL
  * `:max_age` - `Integer` (`nil` by default), cookie duration expressed in seconds
  * `:secure` - `Boolean` (`true` by default if using SSL), restrict cookies to secure connections
  * `:httponly` - `Boolean` (`true` by default), restrict JavaScript access to cookies


```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.cookies = {
      domain: "hanami.example.com",
      secure: true,
      httponly: true,
      path: "/foo",
      max_age: 300
    }
  end
end
```

This configuration can be overridden within an action passing a hash, which has a `value` key representing the value of the cookie, and any properties to override.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.cookies["tasty_cookie"] = "strawberry"

          response.cookies["longer_lived_cookie"] = {
            value: "anzac_biscuit",
            max_age: 604800
          }
        end
      end
    end
  end
end
```

## Removing cookies

To remove a cookie, assign it the value `nil`.

```ruby
response.cookies["tasty_cookie"] = nil
```

## Disabling cookies

To prevent cookies from being set in your actions, provide the following config to your app:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.cookies = nil
  end
end
```
