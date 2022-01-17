---
title: "Basic Usage"
order: 20
---

In the [previous section](/v2.0/actions/overview), we generated an action.  Now let's use it!

## View rendering

Because in the previous section we used a strict generator command that created only the action file, our app would crash if we would start it now because the expected view and template files are missing.

Let's quickly fix it by adding proper files to our project:

```html
# slices/main/web/templates/dashboard/index.html.erb
<h1>Dashboard</h1>
```

```ruby
# slices/main/views/dashboard/index.rb
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

  1. The router fetches the proper action `Main::Actions::Dashboard::Index` instance from *container* and invokes `#call`.
  2. The view `Main::Views::Dashboard::Index` instance associated with the action is then called using `#call` to render the template file.
  3. The application returns the response to the browser.

<p class="convention">
  For a given action named <code>Main::Actions::Dashboard::Index</code>, a corresponding view MUST be present: <code>Main::Views::Dashboard::Index</code>.
</p>

If we visit `/dashboard` we will see `<h1>Dashboard</h1>` in our browser.

## Bypass Rendering

By default an action takes care of the HTTP status code and response header, but not of the body of the response.
As seen above, it delegates the corresponding view to render and set this value.

Sometimes we want to bypass this process. For instance we want to return a simple body like `OK`. To involve a view in this case is a waste of CPU cycles.

To do that, we need to define the `handle` method.

```ruby
# slices/main/actions/dashboard/index.rb
module Main
  module Actions
    module Dashboard
      class Index < Main::Action  
        def handle(req, res)
          res.body = 'OK'
        end
      end
    end
  end
end
```

The `handle` method accepts two arguments: request, and response.

If we set the body of the response from an action, **our application will ignore the view**.

Here is how Hanami handles an incoming request in this case:

  1. The router fetches the proper action `Main::Actions::Dashboard::Index` instance from *container* and invokes `#call`.
  2. The action sets the body skipping the view check.
  2. The application returns the response to the browser.

If we visit `/dashboard` again, now we should see `OK`.

<p class="convention">
  If the response body was already set by an action, the rendering process is bypassed.
</p>

With direct body assignment, **we can safely delete the corresponding view and template**.

In the [next section](/v2.0/actions/parameters) you can learn how to safely parse parameters incoming to our action!
