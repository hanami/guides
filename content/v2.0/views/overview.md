---
title: Overview
order: 10
---

Hanami provides a complete system for rendering HTML, JSON and other formats using views.

In addition to templates and helpers, features such as exposures, parts and contexts provide the tools needed to write well-architected view code.

<p class="notice">
  For a guided walk-through of Hanami with some example use of views, be sure to check out the <a href="/v2.0/introduction/getting-started/">Getting Started Guide</a>.
</p>

## Introduction

When rendering content, the key class to reach for in Hanami is a view. A view represents a view in its entirety. It decides what template to render, as well as what data to expose to that template.

A template - for example a `*.html.erb` or `*.html.slim` file - contains the markup that will be used to render the view's output.

By convention, views are placed in the `app/views` directory, with templates placed in `app/templates`.

### Rendering a simple home page

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

This view will use the template at `app/templates/home/show.html.erb`, which might look like:

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
          # This Home::Show action will automatically render a matching Home::Show view
        end
      end
    end
  end
end
```

<p><img src="/v2.0/views/welcome-to-bookshelf.png" alt="Welcome to Bookshelf" class="img-responsive"></p>


### Rendering views explicitly

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


Views

 - Exposures

Parts

Helpers
 - form helpers

Templates

Formats

HTML escaping
