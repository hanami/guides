---
title: Inflector
order: 80
---

Hanami includes an inflector that supports the pluralization, singularization and humanization of English words, as well as other transformations. This inflector is a [Dry::Inflector](https://dry-rb.org/gems/dry-inflector) instance.

Hanami uses the inflector internally for a variety of purposes, but it's also available to use in your own code via the `"inflector"` component.

## Configuring the inflector

To customize how particular words are inflected, use `config.inflections` in your app class.

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    config.inflections do |inflections|
      inflections.acronym "DB", "XML", "NBA", "WNBA"
      inflections.uncountable("hanami")
    end
  end
end
```

A common reason for customization is to configure inflections to support desired class names and other constants. For example, the `WNBA` acronym above supports constants like `Games::WNBA` instead of `Games::Wnba`. See the [autoloading guide](/v2.1/app/autoloading/) for more detail.


## Using the inflector in a component

Like `"settings"` and `"logger"`, the inflector is available in your app and slice containers as an `"inflector"` component.

Use it in your own classes via the Deps mixin through `include Deps["inflector"]`.

```ruby
# app/my_component.rb

module Bookshelf
  class MyComponent
    include Deps["inflector"]

    def call
      inflector.pluralize("book")    # => "books"
      inflector.singularize("books") # => "book"

      inflector.camelize("dry/inflector") # => "Dry::Inflector"
      inflector.classify("books")         # => "Book"
      inflector.tableize("Book")          # => "books"

      inflector.dasherize("best_selling_books")  # => "best-selling-books"
      inflector.underscore("best-selling-books") # => "best_selling_books"

      inflector.demodulize("Bookshelf::MyComponent") # => "MyComponent"

      inflector.humanize("hanami_inflector") # => "Hanami inflector"
      inflector.humanize("author_id")        # => "Author"

      inflector.ordinalize(1)  # => "1st"
      inflector.ordinalize(2)  # => "2nd"
    end
  end
end
```

## Replacing the inflector

If needed, you can replace the inflector by providing your own. Your replacement inflector should be another `Dry::Inflector` instance or provide the same interface.

```ruby
# config/app.rb

require "hanami"
require "my_inflector"

module Bookshelf
  class App < Hanami::App
    config.inflector = MyInflector.new
  end
end
```
