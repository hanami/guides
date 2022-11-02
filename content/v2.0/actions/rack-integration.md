---
title: Rack Integration
order: 60
---

## Rack Environment

Hanami is fully compatible with Rack.

Actions offer a high level API built on top of Rack.
If we need to access raw data from Rack environment we can use `request.env`.

## Rack Middleware

Hanami mounts a very thin default middleware stack.
Additional components can be mounted globally, at the application level, or locally.

## Global Middleware

If we need a component that wraps all the applications (under `app/` and `slices/*`), we can edit `config.ru` at the root of the project.

```ruby
# config.ru
require 'hanami/boot'

require 'rack/auth/basic'
use Rack::Auth::Basic

run Hanami.app
```

## Project Middleware

There is also another way (the recommended one) to mount a Rack middleware: at the application or slice level. 

The difference is that the  `app`  configuration is shared across all slices.

```ruby
# config/app.rb

module Bookshelf 
  class App < Hanami::App
    # ...
    middleware.use Rack::Auth::Basic
  end
end
```

For a single slice, the middleware setup would look like this

```ruby
# config/slices/main.rb

module Main
  class Slice < Hanami::Slice
    # ...
    middleware.use Rack::Auth::Basic
  end
end
```

## Action Middleware (Not working)
