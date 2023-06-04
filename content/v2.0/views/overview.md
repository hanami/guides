---
title: Overview
order: 10
---

Hanami provides a complete system for rendering HTML, JSON and other formats using views.

In addition to templates and helpers, features such as exposures, parts and contexts allow you to write views that are as thoughtfully designed as the rest of your application.

For a guided walk-through with some example use of views, be sure to check out the [Getting Started Guide](/introduction/getting-started).
## Introduction


Two of the key concepts in Hanami's view layer are views and templates.

A view represents a view in its entirety. Amongst other responsibilities, a view decides what template to render, as well as what data to expose to that template.

A template - for example a `*.html.erb` or `*.html.slim` file - contains the markup to be renderd to generate the view's output.

By convention, views are placed in the `app/views` directory, while templates are placed in `app/templates`.

Here's what a simple home show view for rendering a HTML home page looks like within a `Bookshelf` application.

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

By convention, when this view renders it will use the template at `app/templates/home/show.html.erb`:

```text
<h1>Welcome to Bookshelf</h1>
```

With a root route configured to call a home show action as below, we have all we need to render the home page in response to a HTTP request.

By convention, this home show action will automatically render the matching home show view.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
  end
end
```


```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(*, response)
          # this Home::Show action will automatically render its matching Home::Show view
        end
      end
    end
  end
end
```

<p><img src="/v2.0/views/welcome-to-bookshelf.png" alt="Welcome to Bookshelf" class="img-responsive"></p>


Should we choose, we can also make the connection between the action and the view explicit rather than automatic.

To do this, we include the home show view via Hanami's Deps mixin and pass it to the `#render` method of the response object.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        include Deps[view: "views.home.show"]

        def handle(*, response)
          response.render view
        end
      end
    end
  end
end
```


Using this approach, we can choose to render a different view.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        include Deps[view: "views.home.experiment_b.show"]

        def handle(*, response)
          response.render view
        end
      end
    end
  end
end
```

It's important to note that views can also be rendered outside of the request and response cycle. This means they can be used to render emails, instant messages or other content in background processes. It also means they're readily testable.

We can see this in action in the Hanami console:

```ruby
bundle exec hanami console

bookshelf[development]> Hanami.app["views.home.show"].call.to_s
=> "<html><body><h1>Welcome to Bookshelf</h1></body></html>"
```

Or in an RSpec example:

```ruby
RSpec.describe Views::Home::Show do
  subject(:view) { described_class.new }

  describe "#call" do
    subject(:output) { view.call }

    it "renders a welcome heading" do
      expect(output.to_s).to have_selector "h1", text: "Welcome to Bookshelf"
    end
  end
end
```

TODO: check the above spec works :)

## Key concepts in Hanami view


TODO: list and link to each section.
