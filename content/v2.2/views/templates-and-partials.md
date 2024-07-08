---
title: Templates and partials
order: 40
---

Every view has a template, which is given the values from the view's [exposures](/v2.2/views/input-and-exposures) and then used to render the view's output.

Templates are kept the `templates/` directory in the root of `app/` and each slice directory.

Each view looks for a template that matches its name. For example, given a `Books::Show` view, a template named `books/show` will be located within the templates directory.

## Template engines

Views use ERB templates by default. To use an ERB template, give your file an `.html.erb` extension.

Template files follow a 3-part naming scheme: `<name>.<format>.<engine>`:

- `name` matches the name of the view, with Ruby module nesting translated into slashes
- `format` matches the template with the view's [format](/v2.2/views/configuration)
- `engine` determines the rendering engine to use for the template

Along with ERB, Hanami supports the full range of template engines available through [Tilt](https://github.com/jeremyevans/tilt), and will detect the engine based on each template's file extension.

Views also provide special first-class support for [Haml](https://haml.info) and [Slim](https://slim-template.github.io) to ensure they behave consistently with the default ERB templates.

Where a template engine requires their own gem, be sure to install this yourself, as well as require it in your base view class:

```ruby
# app/view.rb

# Use Slim for ".html.slim" templates
require "slim"

module Bookshelf
  class View < Hanami::View
  end
end
```

## Layouts

Each view's template is rendered within a layout. Layouts are kept within the `templates/layouts/` directory, and views use an `app` layout by default.

Every layout should `yield` at the appropriate location to include the content from the template. For example:

```sql
# app/templates/layouts/app.html.erb

<html>
  <body>
    <%= yield %>
  </body>
</html>
```

## HTML safety

When using ERB, Haml or Slim templates, strings will be checked for their HTML safety when they are included in the template.

If the string is HTML safe, it will be included in the template without escaping. For all other strings, it will be HTML escaped as it is included.

HTML safety checks are made by calling `string.html_safe?`.

When writing your own [helpers](/v2.2/views/helpers/) or other code providing strings to templates, you can make a string as HTML safe by calling `.html_safe` on the string:

```
def my_helper
  "<p>This is safe</p>".html_safe
end
```

You may choose to skip the auto-escaping of non-HTML safe strings by using particular template tags. In ERB:

```sql
<%== "<p>Non-safe strings will not be auto-escaped</p>" %>
```

Similar tags also exist for Haml and Slim. Use these tags with caution. This is **not recommended** for strings coming from untrusted user input.

## Template scope

Each template and partial is rendered within its own scope, which determines the variables and methods available for the template to use. These include:

- Your template's locals: the values returned from its [exposures](/v2.2/views/intput-and-exposures/), wrapped by [parts](/v2.2/views/parts/)
- Your app or slice's [helpers](/v2.2/views/helpers/)
- The public methods available on the view's [context](/v2.2/views/context/)
- A `#render` method, for rendering partials

You may choose to provide custom scopes for templates and partials. To learn more, see [Scopes](/v2.2/views/scopes/).

## Rendering partials

You can render a partial from your template using the `render` method:

```sql
<%= render "path/to/my_partial" %>
```

Partials are looked up within the templates directory, with the partial's file name expected to be prefixed by an underscore. For the example above, the partial template is expected to be at `templates/path/to/_my_partial.html.slim`.

You can provide explicit locals to a partial via keyword arguments:

```sql
<%= render "path/to/my_partial", my_locals: "go here" %>
```

When you provide explicit locals to a partial, only those locals will be available to the partial. When you provide no locals at all, then the partial will have access to the calling template's own set of locals.
