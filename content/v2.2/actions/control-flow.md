---
title: Control flow
order: 110
---

Actions support control flow through callbacks, halting and redirects.

## Callbacks

Callbacks allow logic to be executed either before or after an action's `#handle` method. They are useful for encapsulating code used for tasks like checking whether a user is signed in, handling 404 responses or tidying up a response.

A callback can be added using the `before` or `after` methods. These methods accept either a symbol representing the name of a method to be called, or a proc.

Like the `#handle` method, callbacks receive the request and response as arguments.

### Method callbacks

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        before :validate_params

        params do
          required(:id).filled(:integer)
        end

        def handle(request, response)
          # ...
        end

        private

        def validate_params(request, response)
          params = request.params
          halt 422, request.params.errors.to_h unless request.params.valid?
        end
      end
    end
  end
end
```

If the action above, the `validate_params` method will be called before the action's handler. The callback ensures that if the `:id` parameter cannot be coerced to an integer, the action will be halted and a `422 Unprocessable` response returned.

With this callback in place, the `#handle` method can now proceed knowing that all parameters are valid.

### Proc

The example above could also be implemented using a proc. Procs are bound to the instance context of the action.

```ruby
# app/actions/books/show.rb
module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        before { |request, response| halt 422, request.params.errors.to_h unless request.params.valid? }

        params do
          required(:id).filled(:integer)
        end

        def handle(request, response)
          # ...
        end
      end
    end
  end
end
```

## Halt

Halting an action interrupts its flow and returns control to the framework, which then returns a response based on the status code and body passed to the `halt` call.

```ruby
halt 401, "You are not authorized"
```

Internally, Hanami uses Ruby's throw and catch mechanisms to provide this behaviour, which is a lightweight approach compared to using exceptions.

This action will return a `401 Unauthorized` response when the `#authenticated?` method returns false:

```ruby
# app/actions/books/index.rb

module Bookshellf
  module Actions
    module Books
      class Index < Action
        def handle(request, response)
          halt 401 unless authenticated?(request)
          # ...
        end

        private

        def authenticated?(request)
          # ...
        end
      end
    end
  end
end
```

When `halt` is invoked, subsequent instructions within the action are entirely skipped. That means that `halt` will skip the `#handle` invocation entirely when triggered in a `before` callback.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        before :authenticate_user!

        def handle(request, response)
          # ...
        end

        private

        def authenticate_user!(request, response)
          halt 401 unless request.session[:user_id]
        end
      end
    end
  end
end
```

`#halt` accepts an HTTP status code as the first argument and an optional body as its second argument. If no body is provided, the body will be set to a message corresponding to the status code (for example the body of a `401` response will be `"Unauthorized"`).

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        def handle(request, response)
          halt 404, "These aren't the droids you're looking for"
        end
      end
    end
  end
end
```

<p><img src="/v2.2/actions/404-response.png" alt="Hanami 404 response" class="img-responsive"></p>

As with `Response#status=`, you may use a symbolic status name instead of an integer.

```ruby
halt :not_found
```

See [Status Codes](/v2.2/actions/status-codes/) for the complete list.

## Redirects

To redirect a request to another location, call the `#redirect_to` method on the `response` object.

When you call `redirect_to`, control flow is stopped and subsequent code in the action is not executed.

`redirect_to` accepts a url and an optional HTTP status, which defaults to `302`.

```ruby
response.redirect_to("/sign-in")
response.redirect_to("https://hanamirb.org", status: 301)
```

This action below shows an example of redirecting unauthenticated users to a sign in page:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Action
        before :authenticate_user!

        def handle(request, response)
          # ...
        end

        private

        def authenticate_user!(request, response)
          response.redirect_to("/sign-in") unless request.session[:user_id]
        end
      end
    end
  end
end
```

If you have given the route you wish to redirect to a name, you can also use the `routes` helper, which is automatically available to actions.

```ruby
# config/routes.rb
get "/sign-in", to: "sign_in", as: :sign_in
```


```ruby
# Within your action
response.redirect_to routes.path(:sign_in)
```

See the [Routing guide](/v2.2/routing/overview/) for more information on named routes.
