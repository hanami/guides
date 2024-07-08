---
title: Rendering from actions
order: 20
---

Hanami actions are designed to work seamlessly with Hanami views, with features like automatic view rendering and support for a context object that gives views access to details like the current request.

## Automatic rendering

By convention, Hanami actions will automatically provide an action's corresponding view (assuming that view exists) as a `view` dependency, and then automatically render that view.

For example, this `Pages::Contact` action will render a `Pages::Contact` view:

```ruby
# app/actions/pages/contact.rb

module Bookshelf
  module Actions
    module Pages
      class Contact < Bookshelf::Action
        def handle(request, response)
        end
      end
    end
  end
end
```

When automatically rendering a view, the request's params hash will be passed directly to the view as its [input](/v2.2/views/input-and-exposures/).

## Explicit view rendering

In many cases, you'll want to exercise greater control over the input you pass to your view. To do this, pass your input (along with the view itself) to `response.render`:

```ruby
# app/actions/pages/contact.rb

module Bookshelf
  module Actions
    module Pages
      class Contact < Bookshelf::Action
        def handle(request, response)
          response.render(view, page: params[:page])
        end
      end
    end
  end
end
```

## Explicit view dependencies

Should you choose, you can make the connection between the action and the view explicit rather than automatic. Using this approach, you can choose to render a different view to the one that would be automatically provided.

To do this, use the Deps mixin to provide your own depencency named `view`.

```ruby
# app/actions/pages/contact.rb

module Bookshelf
  module Actions
    module Pages
      class Contact < Bookshelf::Action
        include Deps[view: "views.pages.contact"]

        def handle(request, response)
        end
      end
    end
  end
end
```

Using this approach, you can also choose to render one of several views based on certain conditions.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        include Deps[
          view: "views.pages.contact",
          alternative_view: "views.pages.alternative_contact",
        ]

        def handle(request, response)
          if some_condition
            response.render(alternative_view)
          else
            response.render(view)
          end
        end
      end
    end
  end
end
```

## RESTful view dependencies

Actions named according to RESTful conventions will automatically look for an alternative view if the directly corresponding view cannot be found:

- For actions named `Create`, the `New` view will be provided
- For actions named `Update`, the `Edit` view will be provided

This allows you to reuse such views across both their relevant RESTful actions. For example, you can use a single `Books::New` view from both `Books::New` and `Books::Create` actions, with the latter action likely to re-render the `Books::New` view in the case of an invalid form submission.

## Accessing request details

Views rendered from actions make the action's current request available in their [context](/v2.2/views/context/). This means you can use the following methods inside your templates, parts and scopes:

- `#request`
- `#session`
- `#flash`
- `#csrf_token`

## Disabling automatic view rendering

To disable automatic rendering from actions, define an `#auto_render?(response)` method in the action that returns false:

```ruby
def auto_render?(response)
  false
end
```
