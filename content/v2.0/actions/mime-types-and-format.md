---
title: MIME Types and format
order: 70
---
```ruby
module MyApp
  class App < Hanami::App
    config.actions.format json: "application/json"
    config.actions.default_request_format = :json
    config.actions.default_response_format = :json
    config.middleware.use :body_parser, :json
  end
end
```


Actions have advanced features for MIME Type detection, automatic headers, whitelisting etc..

## Request Introspection

In order to understand what the requested MIME Type is, an action looks at the `Accept` request header and exposes a high level API: `.format`.

The `format` method accepts as an argument a symbol representation of the MIME Type (eg. `:html`, `:json`, `:xml` etc..).

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :json
        
        def handle(*, response)
          response.body = [{foo: 'bar'}].to_json
        end
      end
    end
  end
end
```

This will always set the `Content-Type` to `application/json` on the response headers.

## Automatic Content-Type

If the explicit format is not defined
An action returns the `Content-Type` response header automatically according to the requested MIME Type and charset.

If the client asks for `Accept: text/html,application/xhtml+xml,application/xml;q=0.9`, the action will return `Content-Type: text/html; charset=utf-8`.

### Default Charset

In case you would like o change the default charset for your action, We can specify a different default charset to return.
The standard value is `utf-8`, but we can change it to other value.

```ruby
# app/web/application.rb

# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        default_charset 'koi8-r'
      end
    end
  end
end
```

### Override

As for all configs, you can set `format` on different levels. 

#### Action-level setting

For specific action, you can define format within the action body.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        format :json
      end
    end
  end
end
```

#### App/Slice-level setting

When you want to set default fallback format for the whole slice, or a parent action, configure in the general `action` class for the given slice, and the value will be inherited to the child actions.

```ruby
# app/action.rb

module Bookshelf
  class Action < Bookshelf::Action
    format :xml
  end
end
```

#### Application-level setting

When you want to set default fallback format for all actions in your application (all slices), use the `actions` configuration namespace in the app.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.default_charset = 'koi8-r'
    config.actions.format = :json
  end
end
```

## Parse JSON body

By default, if you include a body parameter in your request, it'll be interpreted as plain text. In case you want to send JSON request, you'll need to set the correct `body_parser` in the actions config.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use :body_parser, :json
  end
end
```

With this, all `json` parameters sent within the body, will be accessible in the `request.params` in the action normally.

## Whitelisting

We can also restrict the range of accepted MIME Types.
If the incoming request doesn't satisfy this constraint, the application will return a `Not Acceptable` status (`406`).

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.values %i[html json]
  end
end
```

## Register MIME Types

Hanami knows about more than 100 of the most common MIME types.
However, we may want to add custom types in order to use them with `#format=` or `.accept`.

In our application settings we can use `actions.formats.add`, which accepts a `Hash` where the key is the format symbol (`:custom`) and the value is a string expressed in the MIME type standard (`application/custom`).

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.formats.add :custom, 'application/custom'
  end
end
```
