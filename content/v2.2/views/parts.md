---
title: Parts
order: 70
---

All values returned from your [exposures](/v2.2/views/input-and-exposures) are decorated by parts, which provide a home for view-specific behavior alongside your app's domain objects.

Parts are fully integrated into the view rendering environment, which means that anything you can do from a template, you can also do from a part. This includes accessing the [context](/v2.2/views/context) as well as [rendering partials](/v2.2/views/templates-and-partials/) and building [scopes](/v2.2/views/scopes).

This means you can move much of your view logic out of templates and into parts. This makes your templates simpler and easier to follow, and puts your view logic into a place where it can be reused and refactored using typical object oriented approaches, as well as tested in isolation.

## Defining part classes

Parts are kept in the `Views::Parts` namespace within your app or slice. For example:

```ruby
# app/views/parts/book.rb

# auto_register: false

module Bookshelf
  module Views
    module Parts
      class Book < Bookshelf::Views::Part
      end
    end
  end
end
```

It's recommended to define a base part for the other parts in the app or slice to inherit:

```ruby
# app/views/part.rb

# auto_register: false

module Bookshelf
  module Views
    class Part < Hanami::View::Part
    end
  end
end
```

## Associating parts with exposures

When your exposure values are decorated as parts, the associated part classes are looked up based on each exposure's name.

For example, given an exposure named `:book`, the `Views::Parts::Book` class will be looked up within your app or slice.

For an exposure that returns an array, the exposure's name will be singularized and each element in the array will be decorated with the relevant part. Then the array itself will be decorated by a matching part.

For example, given an exposure named `:books`, `Views::Part::Book` will be used to decorate each value in the array, and  then `Views::Part::Books` will be used to decorate the whole array.

If you have no part class matching an exposure's name, then a generic `Hanami::View::Part` will be used.

## Specifying parts from exposures

You can specify a part name used to decorate any given exposure. To do this, use the `as:` option:

```ruby
# Will decorate the current_user with `Views::Parts::User`
expose :current_user, as: :user do
  # ...
end
```

You can also provide a concrete part class to `as:`

```ruby
expose :current_user, as: Parts::User
```

For exposures returning arrays:

- `expose :books, as: :item` will look up `Views::Parts::Item` to decorate the array elements, and `Views::Parts::Items` to decorate the array itself
- `expose :books, as: [:item_collection]` will look up `Views::Parts::Book` to decorate the array elements, and `Views::Parts::ItemCollection` for decorating the array itself
- `expose :books, as: [:item_collection, :item]` will look up `Views::Parts::Item` to decorate the array elements, and `Views::Parts::ItemCollection` for decorating the array itself

For all the `as:` structures above, you may also provide concrete part classes instead of symbolic names.

## Accessing the value

When using a part, you can call any methods that belong to the decorated value, and the part will delegate those methods to the value (via `#method_missing`). This means the part should "quack" just like the value that it wraps.

For example, from a template:

```sql
<!-- All the book methods are callable directly on the part -->
<p><%= book.title %></p>
```

This also applies when defining methods in your own part classes:

```ruby
class Book < Bookshelf::Views::Part
  # `title` and `publication_date` are methods on the decorated book
  def display_name
    "#{title} (#{publication_date})"
  end
end
```

In the case of naming collisions, or when overriding a method from the value, you can access the value directly via `#value` (or `#_value` as an alias, in case the decorated value itself responding to `#value`):

```ruby
class Book < Bookshelf::Views::Part
  def title
    value.title.upcase
  end
end
```

## String conversion

When output directly to a template, a part will use its value's `#to_s` (which you can also override in your own part classes):

```sql
<p><%= book %></p>
```

## Rendering partials

To return complex markup from part methods, you can use the `#render` method to render a partial, with the part object included in that partial's own locals:

```ruby
class Book < Bookshelf::Views::Part
  def info_box
    render("books/info_box")
  end
end
```

```sql
<%= book.info_box %>
```

This will render a `books/_info_box` partial template with the part available as `book` within the partial.

You can also render such partials explicitly within templates:

```sql
<%= book.render("books/info_box") %>
```

To make the part available by another local name within the partial's scope, us the `as:` option:

```ruby
render("books/info_box", as: :item)
```

You can also provide additional locals for the partial:

```ruby
render("books/info_box", title_label: "Book info")
```

## Accessing helpers

You can access [helpers](/v2.2/views/helpers) on a `helpers` object within the part:

```ruby
class Book < Bookshelf::Views::Part
  def cover_url
    value.cover_url || helpers.asset_url("book-cover-default.png")
  end
end
```

Making the helpers available via `helpers` avoids potential naming collisions, since parts can wrap all kinds of different values, each with their own range of different method names.

## Accessing the context

You can access the [context](/v2.2/views/context/) for the view's current rendering using the `#context` method (or `#_context` as an alias, in case the decorated value responds to `#context`):

```ruby
class Book < Bookshelf::Views::Part
  def path
    context.routes.path(:book, id)
  end
end
```

## Decorating part attributes

The value decorated by your part may have its own attributes that you also want decorated. To do this, declare these attribute `decorate` in your part class:

```ruby
class Book < Bookshelf::Views::Part
  # Returns the author as a Views::Parts::Author
  decorate :author
end
```

You can pass the same `as:` option to `decorate` as you do to exposures:

```ruby
# Returns the author as a Views::Parts::Person
decorate :author, as: :person
```

## Memoizing methods

A part object lives for the entirety of a single view rendering, so you can memoize expensive operations to ensure they only run once:

```ruby
class Book < Bookshelf::Views::Part
  # Returns the author as a Views::Parts::Author
  decorate :author
end
```

## Building scopes

To build [custom scopes](/v2.2/views/scopes/) from within a part, use the `#scope` method (or `#_scope` as an alias, in case the decorated value responds to `#_scope`):

```ruby
class Book < Bookshelf::Views::Part
  def info_box
    scope(:info_box, size: :large).render
  end
end
```
