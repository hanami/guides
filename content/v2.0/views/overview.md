---
title: Overview
order: 10
---

Hanami provides a complete view system that offers everything you need to render responses in HTML, JSON and other formats through your application's views.

The view system is designed to allow you to write well-factored view code that's as considered as the other parts of your application.

In addition to templates and helpers, features such as view exposures, view parts and the view context are available as you need them.

For a guided walk-through of using views be sure to check out the [Getting Started Guide](/introduction/getting-started).

## A simple view

Let's take a look at a simple view for rendering a home page in HTML.

In a Hanami application, views live in the `app/views` directory (or in the `slices/my-slice/views` directory if you're using a slice).

Here's what a simple home show view looks like within a `Bookshelf` application:

```ruby
# app/views/home/show.rb

module Bookshelf
  module Views
    module Home
      class Show < Bookshelf::View
      end
    end
  end
end
```

When it renders, this view will use the template at `app/templates/home/show.html.erb` for its content.

```text
<h1>Welcome to Bookshelf</h1>
```

It will also use the layout at `app/templates/layouts/app.html.erb`.

```text
<html>
  <body>
    <%= yield %>
  </body>
</html>
```

To see the result of our view, let's have our home show action invoke it in response to a HTTP request.

Assuming a route to have requests to the root handled by a home show action is configured in `config/routes.rb`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
  end
end
```

Then the following home show action will, by convention, automatically invoke the home show view, rendering the expected response.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(*, response)
        end
      end
    end
  end
end
```

<p><img src="/v2.0/views/welcome-to-bookshelf.png" alt="Welcome to Bookshelf" class="img-responsive"></p>

To achieve the same result, we could also have made the connection between the action and the view explicit, by passing the view to the response object's `#render` method, as below.


```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        include Deps[view: "views.home.show"]

        def handle(request, response)
          response.render view
        end
      end
    end
  end
end
```

Views can also render decoupled from the request and response cycle, making them highly flexible for situations that call for background rendering (such as rendering emails or composing instant messages), as well as for testing.

We can see this in action in the Hanami console:

```ruby
bundle exec hanami console

bookshelf[development]> Hanami.app["views.home.show"].call.to_s
=> "<html><body><h1>Welcome to Bookshelf</h1></body></html>"
```

## Key concepts in Hanami view
