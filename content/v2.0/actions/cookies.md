---
title: Cookies
order: 80
---

## Enable Cookies

Hanami applies _"batteries included, but not installed"_ philosophy.
Cookies are a feature that is present but needs to be activated.

In our application settings there is a line to uncomment.

```ruby
# config/app.rb

module Bookshelf
  class Application < Hanami::Application
    config.actions.cookies = { max_age: 300 }
  end
end
```

From now on, cookies are automatically sent for each response.

## Settings

With that configuration we can specify options that will be set for all cookies we send from our application.

  * `:domain` - `String` (`nil` by default), the domain
  * `:path` - `String` (`nil` by default), a relative URL
  * `:max_age` - `Integer` (`nil` by default), cookie duration expressed in seconds
  * `:secure` - `Boolean` (`true` by default if using SSL), restrict cookies to secure connections
  * `:httponly` - `Boolean` (`true` by default), restrict JavaScript access to cookies

## Usage

Cookies behave like a `Hash`: we can read, assign and remove values.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.cookies[:b]         # read
          response.cookies[:a] = 'foo' # assign
          response.cookies[:c] = nil   # remove
        end
      end
    end
  end
end
```

When setting a value, a cookie can accept a `String`
