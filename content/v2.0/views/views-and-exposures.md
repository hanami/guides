---
title: Views and exposures
order: 10
---

Each view in a Hanami application starts with a view class. In the same way that actions inherit from a base action class, views in your application inherit from a base view class at `app/view.rb`.

```ruby
# app/view.rb

require "hanami/view"

module Bookshelf
  class View < Hanami::View
  end
end
```

A books show view, inheriting from the base view:

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

One of the key responsibilities of a view is to fetch any data necessary to render its template, and to then expose that data to the template.

Imagine the following erb template for rendering a book, located at `app/templates/books/show.html.erb`:

```text
<h1><%= book[:title] %></h1>
<p><%= book[:description] %></p>
```

To render, this template needs a book. The view provides that book to the template using an exposure. Exposures are defined using the view's `#expose` method, which accepts a symbol specifying the exposure's name.

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

When called, this view now returns the expected output:

```ruby
bundle exec hanami console

bookshelf[development]> Bookshelf::App["views.books.show"].call.to_s
=> "<html><body><h1>Pride and Prejudice</h1><p>The 1813 Jane Austen classic.</p></body></html>"
```

Of course, rendering the same book each time is not the goal.

Let's assume instead that the action below takes the `:id` parameter for GET requests to `/books/:id` and provides that parameter as input to the view.

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

In the case of exposures, the input data provided to the view is available via keyword arguments to the exposure block.

Here, the Deps mixin is used to fetch a book by the id provided by the action from a book repository.

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
