---
title: "Basic Usage"
order: 20
---

In the [previous section](/v2.0/actions/overview), we generated an action.  Now let's use it!

## View rendering (2.1)

Because in the previous section we used a strict generator command that created only the action file, our app would crash if we would start it now because the expected view and template files are missing.

Let's quickly fix it by adding proper files to our project:

```html
# app/templates/dashboard/index.html.erb
<h1>Dashboard</h1>
```

```ruby
# app/views/dashboard/index.rb
module Main
  module Views
    module Dashboard
      class Index < View::Base
      end
    end
  end
end

```

Here is how Hanami handles an incoming request:

  1. The router fetches the proper action `Sandbox::Actions::Dashboard::Index` instance from *container* and invokes `#call`.
  2. `#call` method performs some initial processing (i.e, `callbacks`) and calls the `#handle`, passing rack request and rack response objects as arguments.
  4. The application returns the response object to the browser.

<p class="convention">
  For a given action named <code>Sandbox::Actions::Dashboard::Index</code>, a corresponding view MUST be present: <code>Sandbox::Views::Dashboard::Index</code>.
</p>

If we visit `/dashboard` we will see `<h1>Dashboard</h1>` in our browser.

## Rendering

By default action takes care of the HTTP status code and response header, but not of the body of the response.

To set the response body, and override other parts of it (like headers), we need to define the `handle` method.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Main::Action  
        def handle(req, res)
          res.body = 'OK'
          res.status = 200
        end
      end
    end
  end
end
```

The `handle` method accepts two arguments: `request`, and `response`.

Here is how Hanami handles an incoming request in this case:

  1. The router fetches the proper action `Bookshelf::Actions::Books::Index` instance from *container* and invokes `#call`.
  2. The action sets the body skipping.
  2. The application returns the response to the browser.

If we visit `/books` again, now we should see `OK`.

In the [next section](/v2.0/actions/parameters) you can learn how to safely parse parameters coming to our action!
