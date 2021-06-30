---
title: "Router: Overview"
order: 10
---

# Overview

Hanami applications use [Hanami::Router](https://github.com/hanami/router) for routing: a Rack compatible, lightweight, and fast HTTP router for Ruby.

## The first route

With your favorite editor open `/config/routes.rb` and add the following line inside of the `main` slice block.

```ruby
get "/hello", to: ->(env) { [200, {}, ["Hello from Hanami!"]] }
```

So the whole file would look like this:

```ruby
# /config/routes.rb

Hanami.application.routes do
  slice :main, at: "/" do
    root to: "home.show"

    get "/hello", to: ->(env) { [200, {}, ["Hello from Hanami"]] }
  end
end
```

Then start the server with `puma config.ru` and visit [http://localhost:3000/hello](http://localhost:2300/hello).
You should see `Hello from Hanami!` in your browser.

Let's explain what we just did.
We created a **route**; an application can have many routes. By doing this, we told our app, to handle HTTP `get` request under the path: `/hello`, and handle it by calling a `Proc` object, that returns the status: `200`, empty headers, and the `Hello from Hanami"` body. This response is given back to the browser for rendering.

Each route starts with an [HTTP verb](http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html) declaration, `get` in our case.
Then we specify a relative URI (`/hello` for us) and the object that is responsible to respond to incoming requests.

**That is pretty neat!**

The only requirement for our routes to be handled properly is to pass an object as a handler, that responds to: `call` method, accepting one argument, and returning the expected response object.

Here is another example of implementing the same thing. If you're interested in custom route handling, [check out advanced usage section](/v2.0/router/advanced-usage).

```ruby
# /config/routes.rb

Hanami.application.routes do
  slice :main, at: "/" do
    root to: "home.show"

    get "/hello", to: "home.index"
  end
end
```

```ruby
# slices/main/actions/home/index.rb

module Main
  module Actions
    module Home
      class Index < Main::Action
        def handle(req, res)
          res.body = "Hello, Hanami!"
        end
      end
    end
  end
end
```

Eager to learn more advanced stuff? Keep going!
