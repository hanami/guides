---
title: Context
order: 60
---

When each view is rendered, a single context object provides access to common facilities from across the app, making these available to every template, partial, part and scope in that rendering.

These facilities are exposed via methods on the context object. For example, the app's [inflector](/v2.2/app/app-config) is returned from the context's `#inflector` method.

In templates and scopes, you can call these methods implicitly, without an explicit receiver:

```sql
<%= inflector.pluralize("koala") %>
```

In parts and helpers, you can access the context as `context` (as well as its alias `_context`, which may be used in in case of a name conflict on the value wrapped by a part). In these places, access the context methods by calling them on `context` directly:

```
# app/views/parts/post.rb

class Post < Bookshelf::Views::Part
  def koalas
    context.inflector.pluralize("koala")
  end
end
```

## Standard context

The standard context in Hanami apps includes the following methods:

- `#inflector`: the app's configured inflector
- `#routes`: the app's named routes helpers, via `#path` and `#url` methods
- `#content_for`: a method to get and set content strings to be shared across templates, such as defining a page title (applied in the layout) from a template
- `#assets`: low-level access to front end assets (but you should prefer the [assets helpers](/v2.2/helpers/assets/))

For views rendered from an action, the following methods are also available:

- `#request`: the current request
- `#session`: the session for the current request
- `#flash`: flash messages from the previous request

You can access all these context methods in templates, partials, parts, helpers and scopes using the approaches outlined above.

## Customizing the standard context

You customize Hanami's standard context by defining your own class named `Views::Context` within your app or slice:

```ruby
# app/views/context.rb

# auto_register: false

module Bookshelf
  module Views
    class Context < Hanami::View::Context
    end
  end
end
```

Here you can define your own methods that you wish to make available across all aspects of views. These can be completely independent, or they can work with the methods provided by the standard context.

For example, you could define a predicate method returning true when a given path matches the current request:

```ruby
# app/views/context.rb

# auto_register: false

module Bookshelf
  module Views
    class Context < Hanami::View::Context
      def current_path?(path)
        request.fullpath == path
      end
    end
  end
end
```

The context class is compatible with the Deps mixin, so you can also include your own dependencies as required:

```ruby
# app/views/context.rb

# auto_register: false

module Bookshelf
  module Views
    class Context < Hanami::View::Context
      include Deps["repositories.user_repo"]

      def current_user
        return nil unless session["user_id"]

        @current_user ||= user_repo.get(session["user_id"])
      end
    end
  end
end
```

The context object will have `#dup` called once at the beginning of each rendering. As such, if your customizations to the context include any mutable variables (like arrays or hashes), you should ensure these are also duped via your own `#initialize_copy`:

```ruby
# app/views/context.rb

# auto_register: false

module Bookshelf
  module Views
    class Context < Hanami::View::Context
      include Deps["repositories.user_repo"]

      def initialize(*)
        super
        # Imagine your context exposes methods that modify this hash
        @my_hash = []
      end

      def initialize_copy(source)
        super
        @my_hash = source.instance_variable_get(:@my_hash).dup
      end
    end
  end
end
```

## Decorating context attributes

Your custom context may have attributes that you want deocrated as [parts](/v2.2/views/parts/). To do this, declare these attributes using `decorate` in your context class:

```ruby
# app/views/context.rb

# auto_register: false

module Bookshelf
  module Views
    class Context < Hanami::View::Context
      # Return the current_user as a Bookshelf::Views::Parts::User
      decorate :current_user, as: :user

      def current_user
        # ...
      end
    end
  end
end
```

## Providing an alternative context object

When rendering your views, you may choose to provide an alternative context object. To do this, pass it via `context:` when rendering views directly:

```ruby
my_view.call(context: my_alternative_context)
```

Or when rendering in actions:

```ruby
def handle(request, response)
  # ...
  responder.render(view, context: my_alternative_context)
end
```

You may also opt out of the Hanami standard context entirely by configuring a view's `default_context`. To learn more, see [Configuration](/v2.2/views/configuration/).
