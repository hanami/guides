---
title: Input and exposures
order: 15
---

Each view in a Hanami application starts with a view class. In the same way that actions inherit from a base action class, views inherit from a base view class at (defined in `app/view.rb`).

One of the key responsibilities of a view is to source any data required by its template. To know what data to surface, a view might need some input such as the `id` of an item to render, or what page of results from a collection to display.

Imagine the following ERB template for showing a book, located at `app/templates/books/show.html.erb`:

```text
<h1><%= book.title %></h1>
<p><%= book.description %></p>
```

To render, this template requires a book object. A view can provide that book object to the template using an __exposure__.

## Exposures

Exposures are the mechanism that allow values to be passed from views to templates. They are defined using the `#expose` method, which accepts a symbol specifying the exposure's name. Here, as an example, the exposed book is a struct with a title and description:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        Book = Struct.new(:title, :description, keyword_init: true)

        expose :book do
          Book.new(title: "Pride and Prejudice", description: "The 1813 Jane Austen classic.")
        end
      end
    end
  end
end
```

When called from an action, the books show view will now render:

```shell
$ curl http://localhost:2300/books/1

<html>
  <body>
    <h1>Pride and Prejudice</h1>
    <p>The 1813 Jane Austen classic.</p>
  </body>
</html>
```
## View input

To render a specific book from a data store, the view needs to know what book to render. A specific id or a slug can be passed to the view as __view input__.

For example, assuming the books show action services a route like `GET /books/:id`, the requested book id can be passed from the action below to view as an argument to the view:

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        def handle(request, response)
          response.render view, id: request.params[:id]
        end
      end
    end
  end
end
```

Within the view, inputs are available as keyword arguments to exposure blocks:


```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps["repositories.book_repo"]

        expose :book do |id:|
          book_repo.get!(id)
        end
      end
    end
  end
end
```

Now that `id` is provided as input, the view can expose the requested book to its template using a book repository that fetches from the database.

## Using the response object to provide input

An alternative way to provide view input is to set properties on the response object. The following two actions are equivalent:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(*, response)
          response.render view, page: request.params[:page], per_page: request.params[:per_page]
        end
      end
    end
  end
end
```

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response[:page] = request.params[:page]
          response[:per_page] = request.params[:per_page]
        end
      end
    end
  end
end
```

## Specifying input defaults

For optional input data, you can provide a default values (either `nil` or something more meaningful). A books index view might have defaults for page and per_page:


```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["repositories.book_repo"]

        expose :books do |page: 1, per_page: 20|
          book_repo.listing(page: page, per_page: per_page)
        end
      end
    end
  end
end
```

## Exposing input to the template

View inputs can be exposed to templates directly:

```ruby
# app/views/books/search.rb

module Bookshelf
  module Views
    module Books
      class Search < Bookshelf::View
        expose :query
      end
    end
  end
end
```

```text
<p>You are searching for <%= query %></p>
```

## Depending on other exposures

Sometimes one exposure will depend on value of another. You can depend on another exposure by naming it as a positional argument in your exposure block.

Below, the author exposure depends on the book exposure, allowing the author to be fetched based on the book's `author_id`.

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps[
          "repositories.book_repo",
          "repositories.author_repo"
        ]

        expose :book do |id:|
          book_repo.get!(id)
        end

        expose :author do |book|
          author_repo.get!(book.author_id)
        end
      end
    end
  end
end
```

## Private exposures

You can create private exposures that are not passed to the template. This is helpful if you have an exposure that other exposures will depend on, but is not otherwise needed in the template.

Here only the author's name is exposed:

```ruby
# app/views/authors/show.rb

module Bookshelf
  module Views
    module Authors
      class Show < Bookshelf::View
        include Deps["repositories.author_repo"]

        private_expose :author do |author_id:|
          author_repo.get!(author_id)
        end

        expose :author_name do |author|
          author.name
        end
      end
    end
  end
end
```

## Layout exposures

Exposure values are made available only to the template by default. To make an exposure also available to the [layout](/v2.1/views/templates-and-partials/), use the `layout: true` option:


```ruby
expose :recommended_books, layout: true do
  book_repo.recommended_listing
end
```

## Undecorated exposures

By default, exposures are decorated by a [part](/v2.1/views/parts/). To opt out of part decoration use the `decorate: false` option. This may be helpful when you are exposing a "primitive" object that requires no extra behaviour, like a number or a string.

```ruby
expose :page_number, decorate: false
```

