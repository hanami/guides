---
title: Formats and MIME types
order: 70
---

Hanami maps [over 50 of the most common MIME types][built-in-formats] to simple **format** names for you to use when configuring your actions.

[built-in-formats]: https://github.com/hanami/controller/blob/dc5bb2a1db48b0ccf3faf52aac20eaef0fd135a3/lib/hanami/action/mime.rb#L15-L69

Configuring your actions to accept one or more formats will:

- Ensure the actions accept only matching requests based on their `Accept` or `Content-Type` headers
- Default to an appropriate `Content-Type` header on responses
- For certain formats, enable automatic parsing of request bodies

## Accepting a format across all actions

To accept a format for all actions, use `config.actions.format` in your app class.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.accept :json
  end
end
```

You can also configure actions to accept multiple formats:

```ruby
config.actions.formats.accept :json, :html
```

## Accepting a format for particular actions

You can also accept formats on any individual action class. `config.formats` in an action class is
analogous to `config.actions.formats` in your app class.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        config.formats.accept :json

        def handle(request, response)
          # ...
        end
      end
    end
  end
end
```

If you accept a format on a base action class, then it will be inherited by all its subclasses.

```ruby
# app/action.rb

module Bookshelf
  class Action < Hanami::Action
    config.formats.accept :json
  end
end
```

## Request acceptance

Once your actions accept a format, they will reject requests that do not match the format.

The following kinds of requests will be accepted:

- No `Accept` or `Content-Type` headers
- `Accept` header that includes the format's MIME type
- No `Accept` header, but a `Content-Type` header that matches the format's MIME type

Whereas these kinds of requests will be rejected:

- `Accept` does not include the format's MIME type, rejected as `406 Not acceptable`
- No `Accept` header, but a `Content-Type` header is present and does not match the format's MIME type, rejected as `415 Unsupported media type`

For example, if you set `config.formats.accept :json`, then requests with these headers will be accepted:

- `Accept: application/json`
- `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"` (courtesy of the `*/*`)
- `Content-Type: application/json`

While requests with these headers will be rejected:

- `Accept: text/html`
- `Accept: text/html,application/xhtml+xml,application/xml;q=0.9`
- `Content-Type: application/x-www-form-urlencoded`

## Parsing JSON request bodies

If you configure `:json` as an accepted format in your app class, then any requests with `Content-Type: application/json` will have their request bodies parsed and made available as request params.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.accept :json
  end
end
```

You can also enable the body parser manually if required.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use :body_parser, :json
  end
end
```

## Response format

Actions set a default `Content-Type` response header, based on your accepted formats along with the MIME type and charset of the request.

For example, if a request's `Accept` header is `"text/html,application/xhtml+xml,application/xml;q=0.9"`, the action will return a content type of `"text/html; charset=utf-8"`, assuming that the action is configured to accept the `:html` format.

When handling a request _without_ an `Accept` header, the response's `Content-Type` will be set to the action's _default format_. You can configure this directly:

```ruby
config.formats.default = :json
```

If you do not directly configure a default format, then the first of your accepted formats will be the default:

```ruby
config.formats.accept :json, :html
config.formats.default # => :json
```

You can also assign a particular format directly on the response inside your action.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.format = :json # or response.format = "application/json"
          response.body = {result: "OK"}.to_json
        end
      end
    end
  end
end
```


## Default character set

The default character set for actions is `utf-8`. This is included in your response's `Content-Type` header:

```text
Content-Type: application/json; charset=utf-8
```

You can configure this app-wide or on a per-action basis.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.default_charset = "koi8-r"
  end
end
```

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        config.default_charset = koi8-r"
      end
    end
  end
end
```

## Registering additional MIME Types

If you need your actions to work with additional MIME types, you can register these as formats:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.register custom: "application/custom"
  end
end
```

This will add the `:custom` format for the `"application/custom"` MIME type.

You can also configure multiple MIME types to correspond to a format:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.register json: ["application/json+scim", "application/json"]
  end
end
```

In this case, requests for either of these MIME types be considered as `:json`.

For your actions to accept requests with these registered MIME types, you must still configure your acctions to accept the corresponding format:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.register json: ["application/json+scim", "application/json"]
    config.actions.formats.accept :json
  end
end
```
