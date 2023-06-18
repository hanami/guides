---
title: Views and exposures
order: 10
---

Each view in a Hanami application starts with a view class.

In the same way that actions inherit from a base action class, views in your application inherit from a base view class at (defined in `app/view.rb`).

A books show view for displaying a book in a Bookshelf application is defined as follows:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
      end
    end
  end
end
```

Views are responsible for providing the data that their corresponding templates need to render.

Imagine the following erb template for rendering a book, located at `app/templates/books/show.html.erb`:

```text
<h1><%= book[:title] %></h1>
<p><%= book[:description] %></p>
```

To render, this template needs a book. The view can provide that book to the template using an exposure.

Exposures are the mechanism that allow values to be passed to templates. They are defined using the `#expose` method, which accepts a symbol specifying the exposure's name. Here for example, the exposed book is a hash with a title and description:

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

When called, the books show view now renders:

```ruby
bundle exec hanami console

bookshelf[development]> Bookshelf::App["views.books.show"].call.to_s
=> "<html><body><h1>Pride and Prejudice</h1><p>The 1813 Jane Austen classic.</p></body></html>"
```

## Providing input to the view

Of course in a real application we'll want to source book information from a database or other storage, rendering the particular book the visitor requested.

Assuming the books show action services a route like `GET /books/:id`, we can pass the requested book id to the view as input:

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

Inputs to the view are available within the view as keyword arguments to exposure blocks.

Using a book repository that fetches books from the database, the view can expose a book to the template as follows:


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

### Depending on other exposures

Sometimes one exposure will depend on value of another. You can depend on another exposure by naming it as a positional argument for your exposure block.

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

### Providing defaults

For optional input data, you can provide a default values (either `nil` or something more meaningful). A books index view might specify defaults for page and per_page for example:


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
