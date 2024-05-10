---
title: HTML
order: 30
---

This helper provides a range of methods for producing HTML.

## tag

Returns a tag builder for building any kind of HTML strings. Chain any method onto `tag` to produce its HTML tag.

```ruby
tag.div # => <div></div>
tag.img # => <img>
```

Provide content for the tag either as its first positional argument, or as the string returned from its given block.

```ruby
tag.div("hello")            # => <div>hello</div>
tag.div { "hello" }         # => <div>hello</div>
tag.div(tag.p("hello"))     # => <div><p>hello</p></div>
tag.div { tag.p("hello") }  # => <div><p>hello</p></div>
```

Provide keyword arguments for the tag's attributes:

```ruby
tag.div(class: "a") # => <div class="a"></div>
```

Provide array or hash values for the tag's attribute to concatenate those values, or include only the keys whose values are truthy:

```ruby
tag.div(class: ["a", "b"])              # => <div class="a b"></div>
tag.div(class: {"a": true, "b": false}) # => <div class="a"></div>
```

You can also build custom tags.

```ruby
tag.custom_tag("hello") # => <custom-tag>hello</custom-tag>
```

The tag attributes and contents are automatically [HTML escaped](/v2.1/helpers/string-escaping), unless marked as HTML safe.

```ruby
tag.p("<script>alert()</script>")
# => <p>&lt;script&gt;alert()&lt;/script&gt;</p>

tag.p(class: "<script>alert()</script>")
# => <p class="&lt;script&gt;alert()&lt;/script&gt;"></p>

tag.p("<em>safe content</em>".html_safe)
# => <p><em>safe content</em></p>
```

When used inside [view templates](/v2.1/views/templates-and-partials), all given as a block will be concatenated and used as the tag's contents.

```sql
<%= tag.div(id: "el") do %>
  <p>Template content can be mixed in.</p>
  <%= tag.p("Also nested tag builders.") %>
<% end %>
```

## token_list

Returns a string of space-separated tokens from a range of given arguments. This is intended for building an HTML tag attribute value, such as a list of class names (it is also aliased as `class_names`).

```ruby
token_list("foo", "bar")
# => "foo bar"

token_list("foo", "foo bar")
# => "foo bar"

token_list({ foo: true, bar: false })
# => "foo"

token_list(nil, false, 123, "", "foo", { bar: true })
# => "123 foo bar"
```

## link_to

Returns an `a` anchor tag for the given contents and URL.

This uses the `tag` builder to prepare the tag, so all tag builder options are accepted.

```ruby
link_to("Home", "/")
# => <a href="/">Home</a>

link_to("/") { "Home" }
# => <a href="/">Home</a>

link_to("Home", "/", class: "button")
# => <a href="/" class="button">Home</a>
```

The tag's contents are automatically escaped, unless marked as HTML safe.

```ruby
link_to("<script>alert('xss')</script>", "/")
# => <a href="/">&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</a>

link_to("/") { "<script>alert('xss')</script>" }
# => <a href="/">&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</a>
```
