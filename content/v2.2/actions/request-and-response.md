---
title: Request and response
order: 40
---

When a Hanami action is called, the incoming HTTP request and outgoing HTTP response are represented by the `request` and `response` objects provided to the action's `#handle` method.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
        end
      end
    end
  end
end
```

## Request

The `request` object provides details about the incoming request. Use it to query information about the request, such as params and headers.

The object inherits from [Rack::Request](https://www.rubydoc.info/gems/rack/Rack/Request), which provides a range of methods like `#path_info`, `#content_type` and `#get_header`.

Here are some of the methods you can call on `request`:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          request.path_info                        # => "/books"
          request.request_method                   # => "GET"
          request.get?                             # => true
          request.post?                            # => false
          request.xhr?                             # => false
          request.referer                          # => "http://example.com/"
          request.user_agent                       # => "Mozilla/5.0 Macintosh; ..."
          request.ip                               # => "127.0.0.1"
          request.get_header("HTTP_AUTHORIZATION") # => "Basic abc123"
          request.env["HTTP_AUTHORIZATION"]        # => "Basic abc123"
        end
      end
    end
  end
end
```

## Response

The `response` object represents your action's outgoing HTTP response.

Use it to control how your action responds to a request by setting an outgoing status, body or headers.

```ruby
# app/actions/books/create.rb

module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        def handle(request, response)
          response.status = 201
          response.body = "Your resource has been created"
          response.headers["My-Header"] = "value"
          response.format = :json
        end
      end
    end
  end
end
```

The `response` object inherits from [Rack::Response](https://www.rubydoc.info/gems/rack/Rack/Response).

### Response status

By default, the response status is `200`. Setting the response status via `response.status` is useful when setting statuses like `200 OK`, `201 Created` and `404 Not Found`.

You may use the canonical symbolic name for a status instead of the integer, as defined in
`Hanami::Http::Status::SYMBOLS`. See [Status Codes](/v2.2/actions/status-codes/) for the complete list.

In situations where you want an action to halt, for example to return a `401 Unauthorized` response, use the action's `halt` method. To return a redirect, use `response.redirect_to("/path")`. See [Control flow](/v2.2/actions/control-flow/) for details.

### Response format

The value set using `response.format` can either be a format name (`:json`) or a content type string (`"application/json"`). Consult [MIME types and formats](/v2.2/actions/formats-and-mime-types/) for more information about setting response formats.
