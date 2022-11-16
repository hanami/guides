---
title: Request & Response
order: 40
---

## Request

In order to access the metadata coming from a HTTP request, an action has a private object `request` that derives from `Rack::Request`.
Here an example of some information that we can introspect.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        def handle(request, response)
          puts request.path_info                 # => "/dashboard"
          puts request.request_method            # => "GET"
          puts request.get?                      # => true
          puts request.post?                     # => false
          puts request.xhr?                      # => false
          puts request.referer                   # => "http://example.com/"
          puts request.user_agent                # => "Mozilla/5.0 Macintosh; ..."
          puts request.ip                        # => "127.0.0.1"
          puts request.env['HTTP_AUTHORIZATION'] # => "Basic abc123"
        end
      end
    end
  end
end
```

## Response

As an addition to a request, we have a `response` object to our disposal, which derives from `Rack::Response`

```ruby
# app/actions/books/index.rb

module Bookself
  module Actions
    module Books
      class Index < Action
        def call(params)
          response.session # => {}
          response.renderable? # => true
          response.charset # => utf-8
          response.format # =>
          response.action # => sandbox.actions.books.index
          response.env # => { [[RACK ENV]] }
          response.exposures # => {}
          response.format # =>
          response.cookies # => #<Hanami::Action::CookieJar:0x00007fdda29a3878>
          response.charset # => utf-8
          response.flash # => #<Hanami::Action::Flash:0x00007fdda29a32d8>
          response.allow_redirect? # => true
        end
      end
    end
  end
end
```

It has private accessors to explicitly set status, headers, body and more:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
    
        def handle(req, res)
          res.status = 201
          res.body   = 'Your resource has been created'
          res.headers.merge!({ 'X-Custom' => 'OK' })
        end
      end
    end
  end
end

# It will return [201, { "X-Custom" => "OK" }, ["Your resource has been created"]]
```
