---
title: Input and exposures
order: 15
---

Each view in a Hanami application starts with a view class. In the same way that actions inherit from a base action class, views inherit from a base view class at (defined in `app/view.rb`).

One of the key responsibilities of a view is to source any data required by its template.

Imagine the following ERB template for showing a book, located at `app/templates/books/show.html.erb`:

```text
<h1><%= book[:title] %></h1>
<p><%= book[:description] %></p>
```

To render, this template requires a book object. The view can provide that book object to the template using an __exposure__.


## Exposures

Exposures are the mechanism that allow values to be passed from views to templates. They are defined using the `#expose` method, which accepts a symbol specifying the exposure's name. Here, the exposed book is a hash with a title and description:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        expose :book do
          {title: "Pride and Prejudice", description: "The 1813 Jane Austen classic."}
        end
      end
    end
  end
end
```

When called, the books show view will now render:

```ruby
bundle exec hanami console

bookshelf[development]> Bookshelf::App["views.books.show"].call.to_s
=> "<html><body><h1>Pride and Prejudice</h1><p>The 1813 Jane Austen classic.</p></body></html>"
```

## View input

Of course in a real application you may want to source book information from a database, and render the specific book requested.

Assuming the books show action services a route like `GET /books/:id`, the requested book id can be passed from the action to the view as view input:

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

Within the view itself, inputs are available as keyword arguments to exposure blocks.

Now that `id` is provided as input, the view can expose the right book to its template using a book repository that fetches from the database:

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

### Exposing input to the template

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




### Providing input defaults

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

### Depending on other exposures

Sometimes one exposure will depend on value of another. You can depend on another exposure by naming it as a positional argument for your exposure block. Below, the author exposure depends on the book exposure, allowing the author to be fetched based on the book's `author_id`.

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
