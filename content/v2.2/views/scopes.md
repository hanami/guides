---
title: Scopes
order: 80
---

A scope is the object that determines the methods available to use from within a template. The [standard scope](/v2.2/views/templates-and-partials/) provides access to locals, helpers, the context, partial rendering, as well as the building of _custom scopes_.

You can use a custom scope to add your own behavior around a template and its particular set of locals. Along with [parts](/v2.2/views/parts/), this allows you to move your view logic away from templates and into a place where it can be reused and refactored using typical object oriented approaches, as well as tested in isolation.

## Defining scope classes

Scopes are kept in the `Views::Scopes` namespace within your app or slice. For example:

```ruby
# app/views/scopes/media_player.rb

# auto_register: false

module Bookshelf
  module Views
    module Scopes
      class MediaPlayer < Bookshelf::Views::Scope
      end
    end
  end
end
```

It's recommended to define a base scope for the other scopes in the app or slice to inherit:

```ruby
# app/views/scope.rb

# auto_register: false

module Bookshelf
  module Views
    class Scope < Hanami::View::Scope
    end
  end
end
```

## Building scopes

Build a scope by using the `#scope` method in a template, a part, or another scope object:

```ruby
scope(:media_player)
```

You can also provide locals to the scope:

```ruby
scope(:media_player, item: audio_file)
```

When you build a scope, the associated class will be looked up based on the scope's name.

For example, given the exposure named `:media_player`, the `Views::Scopes::MediaPlayer` class will be looked up within your app or slice.

If you have no scope class matching an the scope's name, then a generic `Hanami::View::Scope` will be used.

## Rendering partials

You can render a partial via a scope with the standard `#render` method:

```ruby
scope(:media_player, item: audio_file).render("media/audio_player")
```

The rendered partial will have access to all the scope's methods, as well as its locals.

You can also render partials from methods within your scope class:

```ruby
class MediaPlayer < Bookshelf::Views::Scope
  def render_player
    render("media/audio_player")
  end
end
```

## Accessing locals

Within a scope class, or any partial rendered via that scope, you can access the scope's locals directly by their names.

For example, from a template:

```sql
<!-- Given an `item:` local passed to the scope -->
<%= item.title %>
```

Or within a scope class:

```ruby
class MediaPlayer < Bookshelf::Views::Scope
  def display_title
    # `item` is a local
    "#{item.title} (#{item.duration})"
  end
end
```

You can also access a full hash of locals via `#locals` (or `#_locals` as an alias, in case there is a local itself called `locals`). This is useful for providing default values for locals that may not be provided when the scope is built:

```ruby
class MediaPlayer < Bookshelf::Views::Scope
  def show_artwork?
    locals.fetch(:show_artwork, true)
  end
end
```

## Accessing the context

You can access the [context](/v2.2/views/context/) for the view's current rendering using the `#context` method (or `#_context` as an alias, in case there is a local named `context`).

Scopes also delegate missing methods to the context object (provided there is no local with that name).

For example:

```ruby
class MediaPlayer < Bookshelf::Views::Scope
  def item_url
    # `item` is a local, and `routes` is a method on the context
    routes.path(:item, item.id)
  end
end
```

## Memoizing methods

Any given scope object lives from the time of its creation until the end of rendering, so you can memoize expensive operations to ensure they only run once.
