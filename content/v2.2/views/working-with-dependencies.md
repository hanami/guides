---
title: Working with dependencies
order: 10
---

Hanami views are designed to work with dependencies from across your app. Using dependencies is how your view can retrieve the values it needs to include in its template.

To include dependencies, use the Deps mixin:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :book do |id:|
          book_repo.get!(id)
        end
      end
    end
  end
end
```

From here, you can use these dependencies within your [exposures](/v2.2/views/input-and-exposures/).
