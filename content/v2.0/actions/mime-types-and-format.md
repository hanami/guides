---
title: MIME Types and formats
order: 70
---

Hanami actions provide support for MIME type detection and request and response formats, including the ability to configure formats for specific actions, base actions, or across your entire application.

## Request format introspection

Actions use the `Accept` header of incoming requests to determine an acceptable format.

An `#accept?` method on `request` can be used to check whether a particular MIME type is acceptable to the client.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          # GET /books, { Accept => "application/json" }
          request.accept?("application/json") # => true
          request.accept?("text/html")        # => false
        end
      end
    end
  end
end
```

## Response formats

Actions automatically return a `Content-Type` response header based on the requested MIME type and charset of the incoming request.

For example, if a request's `Accept` header is `"text/html,application/xhtml+xml,application/xml;q=0.9"`, the action will return a content type of `"text/html; charset=utf-8"`, assuming that the action is configured such that `"text/html"` is an acceptable format.


### Format allowlisting

The formats that an action is willing to accept can be restricted using the action's format method. The action below will return `406 Not Acceptable` for incoming requests unwilling to accept either json or xml.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :json, :xml

        def handle(request, response)
          # ...
        end
      end
    end
  end
end
```

Setting a single format ensures that an action will return only that format (as long as the format is acceptable to the client).

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :json

        def handle(request, response)
          response.body = {result: "OK"}.to_json
        end
      end
    end
  end
end
```

### Setting format on the response object

To force a particular content type on a response, you can also use the `#format=` method on the response object.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :html, :json

        def handle(request, response)
          response.format = :json # or response.format = "application/json"
          response.body = {result: "OK"}.to_json
        end
      end
    end
  end
end
```

### Default character set

The default chartset for actions is `utf-8`. This can be adjusted on a per-action basis, or as an application-wide setting.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        config.default_charset "koi8-r"
      end
    end
  end
end
```

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.default_charset = 'koi8-r'
  end
end
```

## Configuring format in base actions

You can configure format on a base action from which other actions inherit. This below configuration will apply to any action that inherits from `Bookshelf::Action`.

```ruby
# app/action.rb

module Bookshelf
  class Action < Hanami::Action
    config.format :json
  end
end
```

## Configuring format at an application level

An application wide format can be configured on your app class.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.format :json
  end
end
```
## Parsing JSON request bodies

If your actions need to accept requests of `Content-Type: application/json` with a request body which should be parsed and made available as request params, remember to enable the body parser middleware.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use :body_parser, :json
  end
end
```

## Registering additional MIME Types

Hanami knows about more than 100 of the most common MIME types. However, you can add additional types like so:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.add :custom, "application/custom"
  end
end
```

Setting `format :custom` on an action will now set `Content-Type: application/custom` on responses.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :custom

        def handle(request, response)
          # ...
        end
      end
    end
  end
end
```
