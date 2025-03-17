---
title: Content security policy
order: 20
---

The [content security policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is a set of instructions which restrict how resources are loaded and executed in a web browser. Hanami uses sensible defaults which you can extend or overwrite with your own.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.content_security_policy[:style_src] = "'self'"
    config.actions.content_security_policy[:scrypt_src] += " 'unsafe-eval'"
  end
end
```

The following instruction keys are recognized:

* `:base_uri`
* `:child_src`
* `:connect_src`
* `:default_src`
* `:font_src`
* `:form_action`
* `:frame_ancestors`
* `:frame_src`
* `:img_src`
* `:media_src`
* `:object_src`
* `:script_src`
* `:style_src`

To disable CSP altogether:

```ruby
config.actions.content_security_policy = false
```

## External scripts

By default, Hanami does not allow for the execution of external scripts, but you can easily change that:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.content_security_policy[:script_src] += " https://js-lib-from-cdn.net"
  end
end
```

This is particularly useful if you [serve your own assets via a CDN](/v2.2/assets/using-a-cdn/).

## Nonce

Inline `<script>` are not allowed by default and inline `<style>` are only possible thanks to the rather unattractive `'unsafe-inline'` instruction. However, there's a more robust way to allow either or both with the [nonce instruction](https://content-security-policy.com/nonce/).

To enable nonce in Hanami, use the built-in middleware and add `'nonce'` instructions to your rules:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.middleware.use Hanami::Middleware::Nonce

    config.actions.content_security_policy[:script_src] = "'self' 'nonce'"
    config.actions.content_security_policy[:style_src] = "'self' 'nonce'"
  end
end
```

With this in place, a random unique nonce value is generated on every request and then injected into the CSP header which is sent back to the browser.

As long as you add an nonce attribute with the same value whenever you code inline scripts or styles in your views, the browser won't block them. There's a handy view helper for that purpose:

```html
<script nonce="<%= content_security_policy_nonce %>"></script>
<style nonce="<%= content_security_policy_nonce %>"></style>
```

The same holds true for scripts and styles loaded with `<script src="">` and `<link href="">`, but as long as you stick to the `javascript_tag` and `stylesheet_tag` helpers, Hanami takes care of this for you.
