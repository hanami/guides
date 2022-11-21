---
title: Exception handling
order: 100
---

When a request crashes with an exception, you may want to handle it in a graceful manner. To do this, you can use `handle_exception` in your actions.

Actions do not handle exceptions raised by your application by default. To handle exceptions, you need to define how a specific exception type should be translated into an HTTP response.

An exception handler can be a HTTP status code (eg. `500`, `401`), or a symbol that represents a method on the action.

## Status codes

```ruby
# app/actions/books/index.rb
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        handle_exception StandardError => 500

        def handle(request, response)
          raise "error"
        end
      end
    end
  end
end
```

In the above action, when `StandardError` is raised in the `#handle` method, a basic `500 Internal Server Error` will be returned.

<p><img src="/v2.0/actions/default-error-response.png" alt="Default error response"></p>


## Custom method handlers

To do more with an exception than simply rendering a particular status code, call a method by providing a symbol with the method's name:


```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        handle_exception RecordNotFound => 404
        handle_exception StandardError => :handle_standard_error

        def handle(*, response)
          raise "error"
        end

        private

        def handle_standard_error(request, response, exception)
          response.status = 500
          response.format = :json
          response.body = {error: "Sorry, something went wrong handling your request"}.to_json
        end
      end
    end
  end
end
```

Here, when `StandardError` is raised, `#handle_standard_error` will prepare a JSON response.

Methods used for exception handling accept three arguments: the `request`, the `response` and the `exception` being handled.

## Handling exceptions in base actions

Rather than configure exception handling in every action, it's usually convenient to configure it once, either in your app's base action, or in the base action of a slice.

If you use an error reporting service like Bugsnag or Sentry, you can report on exceptions here too.

```ruby
# app/action.rb

require "hanami/action"

module Bookshelf
  class Action < Hanami::Action
    include Deps["sentry"]

    handle_exception StandardError => :handle_standard_error

    private

    def handle_standard_error(request, response, exception)
      sentry.capture_exception(exception)

      response.status = 500
      response.body = "Sorry, something went wrong handling your request"
    end
  end
end
```

In development, where seeing a stack trace can be useful, reraise exceptions in order to make them visible in your browser.

```ruby
def handle_standard_error(request, response, exception)
  if Hanami.env?(:development)
    raise exception
  else
    response.status = 500
    response.body = "Sorry, something went wrong handling your request"
  end
end
```
