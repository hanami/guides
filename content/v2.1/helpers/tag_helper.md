---
title: Tag Helper
order: 20
---

This helper makes accessible all the HTML-related tags.

### Usage

Here is how you can use it **in templates**:

```ruby
<%= tag.div(id: "el") do %>
  <p>Template content can be mixed in.</p>
  <%= tag.p("Also nested tag builders.") %>
<% end %>
```

This will render:

```html
<div id="el">
  <p>Template content can be mixed in.</p>
  <p>Also nested tag builders.</p>
</div>
```

[In parts](/v2.1/views/parts), you can access your helpers via the `helpers` object.

Given you have a view exposure defined:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        expose :book do
          Book.new(title: "Hanami")
        end
      end
    end
  end
end
```

Then you can have the part with the helper used.

```ruby
# app/views/parts/book.rb

module Bookshelf
  module Views
    module Parts
      module Book
        def content
          helpers.tag.h1(value.title)
        end
      end
    end
  end
end
```

Then in the template you can just access the part:

```ruby
# app/templates/books/show.html.erb

<%= book.content %>
```

### Features

Here are lists of features with the corresponding examples:

**Auto-closing tags according to HTML5 spec**

```ruby
tag.div # => <div></div>
```

**Content string as first argument**

```ruby
tag.img # => <img>
tag.div("First argument is content")        # => <div>First argument is content</div>
```

**Accepts content as block returning a string**

```ruby
tag.div { "Content in the block" }     # => <div>Content in the block</div>
```

**Allows for nesting tags via argument or block**

```ruby
tag.div(tag.p("Nested tag builder")) # => <div><p>Nested tag builder</p></div>

tag.div do
  tag.p("Also nested tag builders.")
end
```

**It builds attributes from given hash**

```ruby
tag.div("With Additional attributes", class: ["a", "b"]) # => <div class="a b">With additional attributes</div>
```

**Builds nested HTML attributes attributes from given hash**

```ruby
tag.div(id: "el", data: {x: "y"}) # => <div id="el" data-x="y"></div>
tag.div(id: "el", aria: {x: "y"}) # => <div id="el" aria-x="y"></div>
```

**Allows for dynamic attributes visibility control**

```ruby
tag.div("Dynamic attributes", class: {"a": true, "b": false}) # => <div class="a">Dynamic Attributes</div>
```

**Supports custom tags**

```ruby
tag.custom_tag("hello") # => <custom-tag>hello</custom-tag>
```


### Escaping HTML input

The tag contents are automatically escaped for security reasons:

```ruby
tag.p("<script>alert()</script>")         # => <p>&lt;script&gt;alert()&lt;/script&gt;</p>
tag.p(class: "<script>alert()</script>")  # => <p class="&lt;script&gt;alert()&lt;/script&gt;"></p>
```

To bypass it use `html_safe` on the given content

```ruby
tag.p("<em>safe content</em>".html_safe)  # => <p><em>safe content</em></p>
```

## link_to helper

For anchors, we've a dedicated wrapper `link_to` on `tag.a`, that share all the features with the [tag helpers](/v2.1/helpers/overview#tag-helper).

Returns an anchor tag for the given contents and URL.


### Usage

The difference is, that you may pass `url` as a second argument, right after the content.

```ruby
link_to(content, url, **attributes)

link_to("Home", "/")
# => <a href="/">Home</a>
```

The URL becomes first argument in case the block is passed.

```ruby
link_to("/") { "Home" }
# => <a href="/">Home</a>

link_to("Home", "/", class: "button") %>
# => <a href="/" class="button">Home</a>
```

#### Automatic escaping

The tag's contents are automatically escaped (unless marked as HTML safe).

```ruby
link_to("<script>alert('xss')</script>", "/")
# => <a href="/">&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</a>

link_to("/") { "<script>alert('xss')</script>" }
# => <a href="/">&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</a>
```

## token_list helper

This helper returns a string of space-separated tokens from a range of given arguments. It's intended for building an HTML tag attribute value, such as a list of class names

### Usage

```ruby
token_list("foo", "bar")
# => "foo bar"
#
token_list("foo", "foo bar")
# => "foo bar"
#
token_list({ foo: true, bar: false })
# => "foo"
#
token_list(nil, false, 123, "", "foo", { bar: true })
# => "123 foo bar"
```
