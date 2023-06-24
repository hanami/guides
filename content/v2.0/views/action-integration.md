---
title: Action integration
order: 20
---

Hanami actions are designed to work seamlessly with Hanami views, with features like automatic view rendering and support for a context object that offers views access to the current request.

### Automatic view rendering

By convention, Hanami actions will automatically render a corresponding view, should that view exist.

For example, this `Pages::Contact` action will render a `Pages::Contact` view:

```ruby
# app/actions/pages/contact.rb

module Bookshelf
  module Actions
    module Pages
      class Contact < Bookshelf::Action
        def handle(*, response)
        end
      end
    end
  end
end
```


### Explicit view rendering

Should you choose, you can make the connection between the action and the view explicit rather than automatic.

To do this, use the Deps mixin to pass a view object to the `#render` method of the response object. This will assign the result of the view rendering to the body of the outgoing response.

```ruby
# app/actions/pages/contact.rb

module Bookshelf
  module Actions
    module Pages
      class Contact < Bookshelf::Action
        include Deps[view: "views.pages.contact"]

        def handle(*, response)
          response.render view
        end
      end
    end
  end
end
```

Using this approach, you can choose to render a different view.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        include Deps[view: "views.pages.alternative_contact"]

        def handle(*, response)
          response.render view
        end
      end
    end
  end
end
```
