---
title: Content Security Policy
order: 85
---

Content Security Policy (CSP) is a security standard that helps prevent Cross-Site Scripting (XSS), clickjacking, and other code injection attacks. CSP allows you to control which resources the browser is allowed to load for your web pages.

Hanami configures a strict Content Security Policy by default, which you can customize to meet your app's needs.

## Default configuration

Hanami sets the following CSP directives by default:

```ruby
{
  base_uri: "'self'",
  child_src: "'self'",
  connect_src: "'self'",
  default_src: "'none'",
  font_src: "'self'",
  form_action: "'self'",
  frame_ancestors: "'self'",
  frame_src: "'self'",
  img_src: "'self' https: data:",
  media_src: "'self'",
  object_src: "'none'",
  script_src: "'self'",
  style_src: "'self' 'unsafe-inline' https:"
}
```

This strict default policy:

- Only allows resources from the same origin (`'self'`)
- Blocks all resources by default (`default_src: "'none'"`)
- Permits HTTPS images and data URIs for images
- Allows inline styles (required for many CSS frameworks)

## Modifying CSP directives

### Appending to a directive

Add additional allowed sources to an existing directive:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config do
      config.actions.content_security_policy[:script_src] += " https://cdn.example.com"
    end
  end
end
```

### Replacing a directive

Completely replace a directive's value:

```ruby
config.actions.content_security_policy[:style_src] = "https://cdn.example.com"
```

### Adding a custom directive

Add directives not included in the default configuration:

```ruby
config.actions.content_security_policy[:upgrade_insecure_requests] = ""
```

### Removing a directive

Remove a directive entirely:

```ruby
# Using delete
config.actions.content_security_policy.delete(:object_src)

# Or set to nil
config.actions.content_security_policy[:object_src] = nil
```

## Disabling CSP

To disable CSP entirely:

```ruby
config.actions.content_security_policy = false
```

## Using nonces

Nonces are cryptographic tokens that allow specific inline scripts or styles to execute while maintaining a strict CSP. Hanami automatically generates a unique nonce for each request when you use the `'nonce'` directive.

Add the `'nonce'` directive to the CSP policies where you want to use nonces:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config do
      config.actions.content_security_policy[:script_src] = "'self' 'nonce'"
      config.actions.content_security_policy[:style_src] = "'self' 'nonce'"
    end
  end
end
```

By default, Hanami generates nonces using `SecureRandom.urlsafe_base64(16)`, producing a 22-character random string for each request.

You can customize nonce generation by providing your own generator:

```ruby
config.actions.content_security_policy_nonce_generator = -> (request) {
  # Optional: access the Rack request object
  MyCustomNonceGenerator.generate
}
```

### Using nonces in views

When nonces are enabled, the `javascript_tag` and `stylesheet_tag` helpers automatically include the nonce attribute:

```erb
<%= javascript_tag "app" %>

# Renders as:
# <script src="/assets/app.js" type="text/javascript" nonce="mSMnSwfVZVe+LyQy1SPCGw=="></script>
```

You can control nonce behavior on individual tags:

```ruby
# Use the auto-generated nonce (default when CSP nonces are enabled)
javascript_tag "app"

# Explicitly enable nonce
javascript_tag "app", nonce: true

# Disable nonce for this tag
javascript_tag "app", nonce: false

# Use a custom nonce value
javascript_tag "app", nonce: "custom-nonce-value"
```

You can access the current request's nonce in your views using the `content_security_policy_nonce` helper:

```erb
<script nonce="<%= content_security_policy_nonce %>">
  // Your inline script here
</script>
```
