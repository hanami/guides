---
title: Overview
order: 10
---

Hanami provides a complete view system for rendering HTML, JSON and other formats.

In addition to helpers, templates and partials, features like exposures, parts and contexts provide a comprehensive toolset for well-architected view code.

<p class="notice">
  For a guided walk-through of Hanami with some example use of views, be sure to check out the <a href="/v2.2/introduction/getting-started/">Getting Started Guide</a>.
</p>

## Introduction

A typical Hanami view has a view class and a template. Both are created for you when you generate an action:

```shell
$ bundle exec hanami generate action home.show

Created app/actions/home/show.rb
Created app/views/home/show.rb              <- view
Created app/templates/home/show.html.erb    <- template
```

You can also generate a view independently of an action. This is useful for standalone views that render emails, instant messages or other background rendered content:

```shell
$ bundle exec hanami generate view emails.welcome

Created app/views/emails/welcome.rb
Created app/templates/emails/welcome.html.erb
```

### Rendering a home page

Here's the view class generated for the home show action above:

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

And the corresponding template at `app/templates/home/show.html.erb`:

```text
<h1>Bookshelf::Views::Home::Show</h1>
```

Let's change this template to say "Welcome to Bookshelf", then configure a route to render the home show action for requests to the root.

```text
<h1>Welcome to Bookshelf</h1>
```

The route:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
  end
end
```

The home show action:

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

Requests for the root will now render a home page:

<p><img src="/v2.2/views/welcome-to-bookshelf.png" alt="Welcome to Bookshelf" class="img-responsive"></p>

### Understanding views

A Hanami view has a few important responsibilities. These include deciding what template to render, as well as what data to expose to that template and how.

When it comes to data, views can either accept data as input, fetch it themselves, or a mix of the two.

Let's say the Bookshelf application needs to render a list of books on a books index page. An ERB template for that might look like:

```text
<h1>What's on the Bookshelf</h1>
<ul>
  <% books.each do |book| %>
    <li><%= book.title %></li>
  <% end %>
</ul>
```

To provide the books this template needs, the view can fetch them from a book repository (or any source of its choosing), then expose them to the template by creating a `books` exposure using the `expose` method:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :books do
          book_repo.listing
        end
      end
    end
  end
end
```

The result of the block passed to the exposure is now available in the template as `books`.

If the book repo also offered a list of best selling titles, the view could expose those through a second exposure:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :books do
          book_repo.listing
        end

        expose :best_sellers do
          book_repo.best_sellers
        end
      end
    end
  end
end
```

Where they are available via `best_sellers`:

```text
<h1>What's on the Bookshelf</h1>
<ul>
  <% books.each do |book| %>
    <li><%= book.title %></li>
  <% end %>
</ul>

<h2>Don't miss these best selling titles</h2>
<ul>
  <% best_sellers.each do |book| %>
    <li><%= book.title %></li>
  <% end %>
</ul>

```

Exposures can also decorate the objects they provide to the view via Parts, which allow view specific behaviours to be added to objects.

Views can also accept input (for example, they might take an `:id` parameter from an action), and renderer different formats (i.e. the same view can render both HTML and JSON).

They can also be configured to use a different templates and layout to their defaults:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        config.template = "books/index" # configure which template to render
        config.layout = "app" # configure which layout to use. Set to false or nil to use no layout
      end
    end
  end
end
```

See more in [configuration](/v2.2/views/configuration/).

### Stand-alone rendering

One of the most useful properties of views is that they can be used outside of the HTTP request cycle. This means they can be used to render emails, instant messages or other content in background processes. It also means they’re readily testable.

We can see this in action in the Hanami console:

```ruby
bundle exec hanami console

bookshelf[development]> Hanami.app["views.home.show"].call.to_s
=> "<html><body><h1>Welcome to Bookshelf</h1></body></html>"
```

And in an RSpec example:

```ruby
# spec/views/home/show_spec.rb

RSpec.describe Bookshelf::Views::Home::Show do
  subject(:view) { described_class.new }

  describe "#call" do
    subject(:output) { view.call }

    it "renders a welcome heading" do
      expect(output.to_s).to match "<h1>Welcome to Bookshelf</h1>"
    end
  end
end
```
