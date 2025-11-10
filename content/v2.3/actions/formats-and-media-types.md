---
title: Formats and media types
order: 70
---

Hanami maps [over 50 of the most common media types][built-in-formats] to simple **format** names for you to use when configuring your actions.

[built-in-formats]: https://github.com/hanami/controller/blob/dc5bb2a1db48b0ccf3faf52aac20eaef0fd135a3/lib/hanami/action/mime.rb#L15-L69

Accepting one or more formats from your actions will:

- Ensure the actions accept only appropriate requests based on their `Accept` or `Content-Type` headers.
- Set an appropriate `Content-Type` header on responses.

## Configuring a format for all actions

To accept a format for all actions, use `config.actions.format.accept` in your app class.

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

## Configuring a format for particular actions

You can also configure formats on any action class. `config.formats` in an action class is analogous to `config.actions.formats` in your app class.

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

If you configure a format on a base action class, then it will be inherited by all its subclasses.

```ruby
# app/action.rb

module Bookshelf
  class Action < Hanami::Action
    config.formats.accept :json
  end
end
```

## Request acceptance

Once you accept a format, your actions will reject requests that do not match the format.

The following kinds of requests will be accepted:

- No `Accept` or `Content-Type` headers
- `Accept` header that includes the format's media type
- No `Accept` header, but a `Content-Type` header that matches the format's media type

Whereas these kinds of requests will be rejected:

- `Accept` does not include the format's media type, rejected as `406 Not acceptable`
- No `Accept` header, but a `Content-Type` header is present and does not match the format's media type, rejected as `415 Unsupported media type`

For example, if you configure `formats.accept :json`, then requests with these headers will be accepted:

- `Accept: application/json`
- `Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"` (courtesy of the `*/*`)
- `Content-Type: application/json`

While requests with these headers will be rejected:

- `Accept: text/html`
- `Accept: text/html,application/xhtml+xml,application/xml;q=0.9`
- `Content-Type: application/x-www-form-urlencoded`

## Response format

Actions set a `Content-Type` response header based on your accepted formats along with the media type and charset of the incoming request.

For example, if a request's `Accept` header is `"text/html,application/xhtml+xml,application/xml;q=0.9"`, the action will return a content type of `"text/html; charset=utf-8"`, assuming that the action accepts the `:html` format.

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
        config.default_charset = "koi8-r"
      end
    end
  end
end
```

## Registering additional formats and media types

If you need your actions to work with additional media types, you can configure these like so:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.register :custom, "application/custom"
  end
end
```

This will register the `:custom` format for the `"application/custom"` media type. Your actions can then accept this format, either at the app-level, or within specific action classes:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.register :custom, "application/custom"
    config.actions.formats.accept :custom
  end
end
```

```ruby
# app/action.rb

module Bookshelf
  class Action < Hanami::Action
    config.formats.accept :custom
  end
end
```

You can also configure a format to map to multiple media types:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.add :json, ["application/json+scim", "application/json"]
  end
end
```

In this case, requests for both these media types will be accepted.
