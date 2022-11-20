---
title: Control Flow
order: 110
aliases:
  - "/actions/control-flow"
---

## Callbacks

If we want to execute some logic before and/or after `#handle` is executed, we can use a callback.
Callbacks are useful to declutter code for common tasks like checking if a user is signed in, set a record, handle 404 responses or tidy up the response.

The corresponding DSL methods are `before` and `after`.
These methods each accept a symbol that is the name of the method that we want to call, or an anonymous proc.

### Methods

```ruby
# apps/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        before :validate_params
        
        params do
          required(:id).filled(:integer)
        end

        private

        def validate_params(request, response)
          params = request.params
          halt 422, params.errors.to_h unless params.valid?
        end
      end
    end
  end
end
```

With the code above, we are validating and coercing URL `:id` parameter, making sure it will always be integer. Otherwise, we stop request processing, immediately returning error to the browser.

Because it isn't strictly related to our business logic, we move it to a callback.

### Proc

The example above can be rewritten with anonymous proc.

They are bound to the instance context of the action.

```ruby
# app/actions/books/show.rb
module Bookshelf
  module Actions
    module Books
      class Show < Action
        before { |request, response| halt 422, request.params.errors.to_h unless request.params.valid? }

        # ...
      end
    end
  end
end
```

A callback proc takes the `request` and `response` arguments, the same as `handle` method.

<p class="warning">
Don't use callbacks for model domain logic operations like sending emails.
This is an antipattern that causes a lot of problems for code maintenance, testability and accidental side effects.
</p>

## Halt

Using exceptions for control flow is expensive for the Ruby VM.
There is a lightweight alternative that our language supports: **signals** (see `throw` and `catch`).

Hanami takes advantage of this mechanism to provide **faster control flow** in our actions via `#halt`.

```ruby
# app/actions/books/index.rb

module Bookshellf
  module Actions
    module Books
      class Index < Action
        def handle(req, res)
          halt 401 unless authenticated?(req)
          # ...
        end

        private
        
        def authenticated?(req)
          # ...
        end
      end
    end
  end
end
```

When used, this API **interrupts the flow**, and returns the control to the framework.
Subsequent instructions will be entirely skipped.

<p class="warning">
When <code>halt</code> is used, the flow is interrupted and the control is passed back to the framework.
</p>

That means that `halt` can be used to skip `#handle` invocation entirely if we use it in a `before` callback.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        before :authenticate!

        def handle(req, res)
          # ...
        end

        private
        
        def authenticate!(req, res)
          halt 401 if current_user.nil?
        end
      end
    end
  end
end
```

`#halt` accepts an HTTP status code as the first argument.
When used like this, the body of the response will be set with the corresponding message (eg. "Unauthorized" for `401`).

An optional second argument can be passed to set a custom body.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        def handle(req, res)
          halt 404, "These aren't the droids you're looking for"
        end
      end
    end
  end
end
```

When `#halt` is used, **Hanami** renders a default status page with the HTTP status and the message.


<p><img src="/v2.0/actions/404-response.png" alt="Hanami 404 response" class="img-responsive"></p>

## Redirect

A special case of control flow management is relative to HTTP redirect.
If we want to reroute a request to another resource we can use `redirect_to` called on the response object.

When `redirect_to` is invoked, control flow is stopped and **subsequent code in the action is not executed**.

It accepts a string that represents an URI, and an optional `:status` argument.
By default the status is set to `302`.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        def handle(req, res)
          res.redirect_to routes.path(:root), status: 302
          raise "This line will never be executed"
        end
      end
    end
  end
end
```

### Back

Sometimes you'll want to `redirect_to` back in your browser's history so the easy way to do it
is the following way:

```ruby
res.redirect_to request.get_header("Referer") || fallback_url
```
