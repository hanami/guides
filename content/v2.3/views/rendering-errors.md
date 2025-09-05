---
title: Rendering errors
order: 90
---

When running your app in production mode, error views will be rendered for any uncaught exceptions. This allows you to present a helpful error screen to your users while also hiding any technical details of the error.

These error views are static HTML only. You can find them in your app's `public/` directory, at `404.html` and `500.html`.

You can customize these views however you wish, though you should be mindful to keep their content static and self-contained to the HTML file as much as possible.

## Customizing error views

You can enable or disable these error views using the `config.render_errors` app setting. This defaults to `true` when your app is in production mode, and `false` for all other modes.

To configure which error views show for which exceptions, use the `config.render_error_responses` setting. This is a hash that maps string representations of Ruby exception classes to the symbolized form (downcased, underscored) of [Rack's list of HTTP error names](https://github.com/rack/rack/blob/f6c583adb0e863e524bacedaf594602964e01078/lib/rack/utils.rb#L469-L538). These names are then mapped to the equivalent status codes and used to locate the HTML files in `public/`.

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.render_error_responses.merge!(
      "ROM::TupleCountMismatchError" => :not_found
    )
  end
end
```
