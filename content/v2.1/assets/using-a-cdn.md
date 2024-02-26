---
title: Using a CDN
order: 20
---

## Content delivery network (CDN)

You can configure Hanami to serve your assets from a content delivery network (CDN). This approach is useful in production to improve the performance of serving your static assets.

To configure an assets CDN, use `config.assets.base_url` in your app class.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    environment :production do
      config.assets.base_url = "https://some-cdn.net/my-site"
    end
  end
end
```

Once you have configured this `base_url`, all [assets helpers](v2.1/helpers/assets) will return absolute URLs prefixed by this base URL.

```ruby
asset_url("app.js")
# => "https://some-cdn.net/my-site/assets/app-LSLFPUMX.js"
```

## Content Security Policy (CSP)

By default, Hanami sets a `Content-Security-Policy` header that does not allow for the execution of external JavaScript code.

To permit code hosted on your CDN, use `config.actions.content_security_policy` in your app class.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    environment :production do
      config.actions.content_security_policy[:script_src] += " https://some-cdn.net"
      config.assets.base_url = "https://some-cdn.net/my-site"
    end
  end
end
```

## Subresource integrity

A CDN can dramatically improve page speed, but it can potentially open a security breach. If the CDN that is compromised and serves bad JavaScript files or stylesheets, we expose our users to security attacks like Cross-Site Scripting (XSS).

To solve this problem, browser vendors use a defense called [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). When enabled, the browser verifies that the checksum of the downloaded file matches a checksum in the HTML document requesting it.

To enable subresource integrity, use `config.assets.subresource_integrity` in your app class, choosing one or more checksum algorithms.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    environment :production do
      config.assets.subresource_integrity = [:sha256, :sha512]
    end
  end
end
```

With this config, the `javascript_tag` and `stylesheet_tag` [assets helpers](v2.1/helpers/assets) will return tags with `integrity` and `crossorigin` attributes.

```html
<script
  src="/assets/app-LSLFPUMX.js"
  type="text/javascript"
  integrity="sha256-WB2pRuy8LdgAZ0aiFxLN8DdfRjKJTc4P4xuEw31iilM= sha512-4gegSER1uqxBvmlb/O9CJypUpRWR49SniwUjOcK2jifCRjFptwGKplFWGlGJ1yms+nSlkjpNCS/Lk9GoKI1Kew=="
  crossorigin="anonymous"
></script>
```

Checksum calculations are CPU intensive, so adding additional subresource_integrity schemes will extend the time it takes to compile assests, and therefore deploy your app. We suggest using `:sha256` for starters.
