---
title: Helpers
order: 50
---

While Hanami views help you keep your view logic close to its associated values via [parts](/v2.1/views/parts/), sometimes you need behavior that works with all kinds of values, in all parts of your views. For this, you can use helpers.

Helpers are small, stateless, general purpose methods that are available in [templates](/v2.1/views/templates/), [parts](/v2.1/views/parts/) and [scopes](/v2.1/views/scopes/). Hanami provides a range of standard helpers, and you can also define your own.

## Standard helpers

Hanami provides a range of standard helpers for common aspects of writing views. See [Helpers](/v2.1/helpers/overview/) for an overview of these helpers.

For the examples below, we'll be using the standard `format_number` helper, which takes a number and turns it into a human-friendly string representation:

```ruby
format_number(1234) # => "1,234"
```

## Helpers in templates

You can call helpers directly by their method names in your templates:

```sql
<p><%= format_number(1234) %></p>
```

Helper methods will take priority over your view's [exposures](/v2.1/views/exposures/). Be mindful of this when naming your exposures and writing your own helper methods.

## Helpers in parts

Helpers in [parts](/v2.1/views/parts/) are available on a `helpers` object within the part:

```ruby
def word_count
  # Presuming a `body_text` method on the value wrapped by the part
  helpers.format_number(body_text.split)
end
```

Making the helpers available via `helpers` avoids potential naming collisions, since parts can wrap all kinds of different values, each with their own range of different method names.

## Helpers in scopes

Like templates, helpers in [scopes](/v2.1/views/scopes/) are available directly as methods:

```ruby
def post_word_count
  # Presuming a `post` local
  format_number(post.body_text.split)
end
```

## Writing your own helpers

When you generate a new Hanami app, you'll find a helpers module generated in `app/views/helpers.rb`:

```ruby
module MyApp
  module Views
    module Helpers
      # Add your view helpers here
    end
  end
end
```

Any methods you write inside this module will become available as helpers in all the places outlined above.

If you'd like to further organize your helpers, you can create nested modules and include them explicitly in this helpers module. For example:

```ruby
module MyApp
  module Views
    module Helpers
      # Defined in app/views/helpers/formatting_helper.rb
      include FormattingHelper
    end
  end
end
```

This same structure applies within slices as well as the app. When you generate a new slice, you'll find a corresponding helpers module generated in the slice:

```ruby
module MySlice
  module Views
    module Helpers
      # Add your view helpers here
    end
  end
end
```

The methods in this module will become available as helpers in the views within the slice.

To make app-level view helpers available within slices, include the app's helpers module:

```ruby
module MySlice
  module Views
    module Helpers
      include MyApp::Views::Helpers
    end
  end
end
```

## Using the view context within helpers

When writing your own helpers, you can access the [view context](/v2.1/views/context/) via `_context`.

The context includes useful app facilities like the inflector:

```ruby
def my_helper
  _context.inflector.pluralize("greeting")
end
```

For views [rendered within an action](/v2.1/actions/rendering-views/), the context also provides the current request:

```ruby
def current_path?(path)
  path == _context.request.fullpath
end
```
