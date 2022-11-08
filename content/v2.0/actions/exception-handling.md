---
title: Exception Handling
order: 100
---

Actions have an elegant API for exception handling. You can define the exception handling per action, using app/slice configuration.

## Default behavior

By default, actions do not handle errors risen by the app, and to handle them, you need to define the error mapping to the handler.

An exception handler can be a valid HTTP status code (eg. `500`, `401`), or a `Symbol` that represents an action method.

```ruby
# app/actions/books/index.rb
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        handle_exception StandardError => 500

        def handle(*, response)
          raise
        end
      end
    end
  end
end
```

`handle_exception` accepts a Hash where the key is the exception to handle, and the value is the corresponding HTTP status code.
In our example, when `StandardError` is raised, it will be handled as a `500` (Server Error).


![[default-error-response.png]]

## Custom error handlers

If the mapping with a custom HTTP status doesn't fit our needs, we can specify a custom handler and manage the exception by ourselves.

If you'll pass a symbol instead of the HTTP status code, the action will look for the method with the same name.

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        handle_exception StandardError => :my_error_handler

        def handle(*, response)
          raise
        end

        private

        def my_error_handler(req, res, exception)
          halt 500, "You've found a Unicorn!"
        end
      end
    end
  end
end
```

![[customized-error-response.png]]

In the example above we changed the default message delivered to the client.

This time, when `StandardError` will be raised, it'll be handled by our method.

<p class="warning">
When specifying a custom exception handler, it MUST accept a request, response, and <code>exception</code> argument.
</p>

## App/slice - level exception handling

Instead of configuring errors per-action, there is a chance you'll want to define the error mapping once per the whole application, or per slice.

You can do it, by configuring the base action for the given slice, or for the whole application.

```ruby
# /app/action.rb

require "hanami/action"

module Bookshelf
  class Action < Hanami::Action
    handle_exception StandardError => 500
  end
end
```

The behavior remains the same as described above, it just makes your code more DRY.