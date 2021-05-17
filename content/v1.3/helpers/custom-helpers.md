---
title: Custom Helpers
order: 90
---

In the [overview](/helpers/overview) section, we introduced the design for helpers.
They are modules that enrich views’ behaviors.
Because they are just Ruby modules, **we can create our own helpers**.

## Example

Imagine we need (for some reason) a helper that shuffles the characters of a string and we want it to be available in our views.

First, let’s define a `Web::Helpers::Shuffler` module, and put it within a new `helpers` directory.

```ruby
# app/web/helpers/shuffler.rb
module Web
  module Helpers
    module Shuffler
      private
      SEPARATOR = ''.freeze

      def shuffle(string)
        string
          .encode(Encoding::UTF_8, invalid: :replace)
          .split(SEPARATOR).shuffle.join
      end
    end
  end
end
```

<p class="notice">
  There is NO coupling between the file name and the name of the module.
  We can define this code where and how we want.
</p>

Now let’s make this helper available to use by editing our app’s `application.rb`. First, add that new `helpers` directory to the load paths of the application so it can be eagerly loaded. Second, include the `Web::Helpers::Shuffler` module in all the views. See the [Views: Share Code](/views/share-code/) section for low-level details.

```ruby
# apps/web/application.rb
module Web
  class Application < Hanami::Application
    configure do
      # ...

      load_paths << [
        'helpers',
        'controllers',
        'views'
      ]

      # ...

      view.prepare do
        include Hanami::Helpers
        include Web::Helpers::Shuffler
      end
    end
  end
end
```

<p class="notice">
  Please note that our custom helper will work even if we remove the <code>include Hanami::Helpers</code> line, because it’s just Ruby.
</p>
