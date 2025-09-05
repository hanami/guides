---
title: Overview
order: 10
---

## Introduction

Operations organize business logic in Hanami apps. They are the foundation of your app’s "service layer".

Operations are built using [dry-operation](https://dry-rb.org/gems/dry-operation/1.0/).

With operations, you can model your logic as a linear flow of steps, each returning a `Success` or `Failure`. If all steps of an operation succeed, the operation completes and returns its final value as a success. If any step returns a failure, execution short circuits and returns that failure immediately.

To create an operation, run `hanami generate operation`:

```shell
$ bundle exec hanami generate operation books.create
```

This will give you the following:

```ruby
# app/books/create.rb

module Bookshelf
  module Books
    class Create < Bookshelf::Operation
      def call
      end
    end
  end
end
```

From here, you can build your flow of steps using `step`. For example:

```ruby
# frozen_string_literal: true

module Bookshelf
  module Books
    class Create < Bookshelf::Operation
      def call(attrs)
        attrs = step validate(attrs)
        book = step create(attrs)
        step update_feeds(book)

        book
      end

      private

      def validate(attrs)
        # Return Success(attrs) or Failure(some_error)
      end

      def create(attrs)
        # Return Success(book) or Failure(some_error)
      end

      def update_feeds(book)
        # Return Success or Failure
      end
    end
  end
end
```

Operations can work with dependencies from across your app. To include dependencies, use the [Deps mixin](/v2.3/app/container-and-components/#injecting-dependencies-via-deps).

For example:

```ruby
# frozen_string_literal: true

module Bookshelf
  module Books
    class Create < Bookshelf::Operation
      include Deps["repos.book_repo"]

      # ...

      private

      def create(attrs)
        Success(book_repo.create(attrs))
      end
    end
  end
end
```

To learn more about operations, see [the dry-operation documentation](https://dry-rb.org/gems/dry-operation/1.0/).

## Database transactions

Operations provide a `#transaction` block method that integrates with the databases in your app. Any step failure inside the transaction block will roll back the transaction as well as short circuiting the operation.

```ruby
def call(attrs)
  transaction do
    attrs = step validate(attrs)
    book = step create(attrs)
    step update_feeds(book)

    book
  end
end
```

By default, `transaction` uses your "default" [gateway](/v2.3/database/configuration/#gateway-configuration). To use a different one, specify gateway: followed by the desired gateway name.

```ruby
transaction(gateway: :other) do
  # ...
end
```

## Working with operations

Typically, operations will be called from places like [actions](/v2.3/actions/overview/). Such an arrangement allows you to keep your business logic well contained, and your actions focused on HTTP responsibilities only.

After calling an operation, you will receive either a `Success` or a `Failure`. You can pattern match on this result to handle each situation.

```ruby
module Bookshelf
  module Actions
    class Create < Bookshelf::Action
      include Deps["books.create"]

      def handle(request, response)
        case create.call(request.params[:book])
        in Success(book)
          response.redirect_to routes.path(:book, book.id)
        in Failure[:invalid, validation]
          response.render view, validation:
        end
      end
    end
  end
end
```

This pattern matching allows you to handle different types of failures in a clear and explicit manner.

Operations' `Success` and `Failure` results come from dry-monads. To learn more about working with results, see the [dry-monads result documentation](https://dry-rb.org/gems/dry-monads/1.6/result/).
