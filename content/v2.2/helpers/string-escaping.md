---
title: String escaping
order: 20
---

## HTML escaping

`escape_html` (also aliased as `h`) returns an escaped string that is [safe to include in HTML templates](/v2.2/views/templates/). Use this helper when including any untrusted user input in HTML content, particularly within other helpers that mix untrusted input among HTML tags.

This helper marks the escaped string marked as HTML safe, ensuring it will not be escaped again. If the given string is already marked as HTML safe, then it will be returned without escaping.

```ruby
escape_html("Safe content")
# => "Safe content"

escape_html("<script>alert('xss')</script>")
# => "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"

escape_html(raw("<p>Not escaped</p>"))
# => "<p>Not escaped</p>"
```

## Bypassing HTML escaping

`raw` returns the given string marked as HTML safe (regardless of its content), meaning it will not be escaped when included in your view's HTML.

**This is NOT recommended if the string is coming from untrusted user input. Use at your own peril.**

```ruby
raw(user.name)
# => "Little Bobby <alert>Tables</alert>"

raw(user.name).html_safe?
# => true
```

## URL sanitizing

`sanitize_url` returns a the given URL string if it has one of the permitted URL schemes. For URLs with non-permitted schemes, this returns an empty string.

Use this method when including URLs from untrusted user input in your view content.

The default permitted schemes are:
- `http`
- `https`
- `mailto`

```ruby
sanitize_url("https://hanamirb.org")
# => "http://hanamirb.org"

sanitize_url("javascript:alert('xss')")
# => ""

sanitize_url("gemini://gemini.circumlunar.space/", %w[http https gemini])
# => "gemini://gemini.circumlunar.space/"
```
