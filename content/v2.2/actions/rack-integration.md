---
title: Rack integration
order: 60
---

## Rack environment

Actions offer a high level API built on top of [Rack](https://github.com/rack/rack). To access the raw data from the Rack environment within an action, use `request.env`.

```ruby
module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        def handle(request, response)
          request.env

          request.env["REQUEST_METHOD"] #=> GET
          request.env["PATH_INFO"] #=> /books/1
        end
      end
    end
  end
end
```

## Rack middleware

Hanami mounts a thin default middleware stack. Additional middleware can be mounted either at application level, in the router, or for an individual action.

### Inspecting the middleware stack

Use the `hanami middleware` command to inspect the Rack middleware stack.

```shell
$ bundle exec hanami middleware

/    Dry::Monitor::Rack::Middleware (instance)
```

### Application-level middleware

To add middleware at an application level, use the `middleware` config on your app:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use Rack::Auth::Basic
  end
end
```


```shell
$ bundle exec hanami middleware

/    Dry::Monitor::Rack::Middleware (instance)
/    Rack::Auth::Basic
```

Middleware will be included in the stack in the order in which it's added.


```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use Rack::Auth::Basic
    config.middleware.use Rack::MethodOverride
  end
end
```

```shell
$  bundle exec hanami middleware

/    Dry::Monitor::Rack::Middleware (instance)
/    Rack::Auth::Basic
/    Rack::MethodOverride
```

If needed, you can use `before:` or `after:` to insert a middleware at a particular point in the stack:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use Rack::Auth::Basic
    config.middleware.use Rack::MethodOverride
    config.middleware.use Rack::ShowStatus, before: Rack::Auth::Basic
  end
end
```


```shell
$  bundle exec hanami middleware

/    Dry::Monitor::Rack::Middleware (instance)
/    Rack::ShowStatus
/    Rack::Auth::Basic
/    Rack::MethodOverride
```

## Router middleware

Middleware can also be added via your routes configuration in `config/routes.rb`. Middleware added here is added after any middleware added via app config.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    use Rack::Runtime

    root { "Hello from Hanami" }
  end
end
```

Adding middleware via your routes config lets you add middleware to specific routes.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    use Rack::Runtime

    root { "Hello from Hanami" }

    scope "restricted" do
      use Rack::Auth::Basic

      get "/page" do
        "Some restricted content"
      end
    end

    slice :admin, at: "/admin" do
      use Rack::Auth::Basic

      get "/books", to: "books.index"
    end
  end
end
```
```shell
$ bundle exec hanami middleware

/              Dry::Monitor::Rack::Middleware (instance)
/              Rack::Runtime
/restricted    Rack::Auth::Basic
/admin         Rack::Auth::Basic
```

## Using config.ru

Middleware can also be implemented in `config.ru`. This middleware will not be part of the Hanami application's middleware stack.

```ruby
# config.ru

require "hanami/boot"

use Rack::Static, :urls => ["/public"]

run Hanami.app
```
