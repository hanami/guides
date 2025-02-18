---
title: Overview
order: 10
---

## Routing

Hanami provides a fast, simple [router](https://github.com/hanami/router) for handling HTTP requests.

Your application's routes are defined within the `Routes` class in `config/routes.rb`

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root { "Hello from Hanami" }
  end
end
```

## Adding a route

Each route in Hanami's router is comprised of:

- a HTTP method (i.e. `get`, `post`, `put`, `patch`, `delete`, `options` or `trace`)
- a path
- an endpoint to be invoked.

Endpoints are usually actions within your application, but they can also be a block, a [Rack](https://github.com/rack/rack) application, or anything that responds to `#call`.

```ruby
get "/books", to: "books.index"  # Invokes the Bookshelf::Actions::Books::Index action
post "/books", to: "books.create" # Invokes the Bookshelf::Actions::Books::Create action
get "/rack-app", to: RackApp.new
get "/my-lambda", to: ->(env) { [200, {}, ["A Rack compatible response"]] }
```

To add a full set of routes for viewing and managing books, you can either manually add the required routes to your `config/routes.rb` file, or use Hanami's action generator, which will generate actions in addition to adding routes for you.

```shell
$ bundle exec hanami generate action books.index
$ bundle exec hanami generate action books.show
$ bundle exec hanami generate action books.new
$ bundle exec hanami generate action books.create
$ bundle exec hanami generate action books.update
$ bundle exec hanami generate action books.destroy
```

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root { "Hello from Hanami" }

    get "/books", to: "books.index"
    get "/books/:id", to: "books.show"
    get "/books/new", to: "books.new"
    post "/books", to: "books.create"
    patch "/books/:id", to: "books.update"
    delete "/books/:id", to: "books.destroy"
  end
end
```

## Root request routing

A `root` method allows you to define a root route for handling `GET` requests to `"/"`. In a newly generated application, the root path calls a block which returns "Hello from Hanami". You can instead choose to invoke an action by specifying `root to: "my_action"`. For example, with the following configuration, the router will invoke the `home` action:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home"
  end
end
```

## Path matching

The path component of a route supports matching on fixed paths, as well as matching with dynamic path variables.

These variables can be accessed in Hanami actions via `request.params[:name]`, where `:name` matches the segment's name specified in the path.

## Fixed paths

The following fixed path route matches `GET` requests for `"/books"` exactly:

```ruby
get "/books", to: "books.index"
```

## Paths with variables

Path variables can be used for serving dynamic content. Path variables are defined with a colon followed by a name (for example `:id` or `:slug`). These variables can be accessed in Hanami actions via `request.params[:name]`.

The path `"/books/:id"` matches requests like `"/books/1"`:

```ruby
get "/books/:id", to: "books.show"

# GET /books/1
# request.params[:id] # => 1
```

Paths support multiple dynamic variables. For example, the path `"/books/:book_id/reviews/:id"` matches requests like `"/books/17/reviews/6"`:

```ruby
get "/books/:book_id/reviews/:id", to: "book_reviews.show"

# GET /books/17/reviews/6
# request.params[:book_id] # => 17
# request.params[:id] # => 6
```

Accessing these variables in a Hanami action looks like:

```ruby title="app/actions/book_reviews/show.rb"
# Request: GET /books/17/reviews/6

module Bookshelf
  module Actions
    module BookReviews
      class Show < Bookshelf::Action
        def handle(request, response)
          request.params[:book_id] # 17
          request.params[:id] # 6
        end
      end
    end
  end
end
```

## Constraints

Constraints can be added when matching variables. These are regular expressions that must match in order for the route to match. They can be useful for ensuring that ids are digits:

```ruby
get "/books/:id", id: /\d+/, to: "books.show"

# GET /books/2 # matches
# GET /books/two # does not match

get "/books/award-winners/:year", year: /\d{4}/, to: "books.award_winners.index"

# GET /books/award-winners/2022 # matches
# GET /books/award-winners/2 # does not match
# GET /books/award-winners/two-thousand # does not match
```

## Globbing and catch all routes

Catch all routes can be added using globbing. These routes can be used to handle requests that do not match any preceeding routes.

For example, in the absence of an earlier matching route, `"/pages/*match"` will match requests for paths like `"/pages/2022/my-page"`:

```ruby
get "/pages/*path", to: "page_catch_all"

# GET /pages/2022/my-page will invoke the Bookshelf::Actions::PageCatchAll action
# request.params[:path] # # => 2022/my-page
```

To create a catch all to handle all unmatched `GET` requests using a custom `"unmatched"` action, configure this route last:

```ruby
get "/*path", to: "unmatched"
```

## Named routes

Routes can be named using the `as` option.

```
get "/books", to: "books.index", as: :books
get "/books/:id", to: "books.show", as: :book
```

This enables `path` and `url` helpers, which can be accessed via the routes helper registered under `"routes"` within your application.

```ruby
Hanami.app["routes"].path(:books)
=> "/books"

Hanami.app["routes"].url(:books)
=> #<URI::HTTP http://0.0.0.0:2300/books>
```

When a route requires variables, they can be passed to the helper:

```ruby
Hanami.app["routes"].path(:book, id: 1)
=> "/books/1"
```

To set a base URL for the `url` helper, configure it in `config/app.rb`:

```ruby title="config/app.rb"
require "hanami"

module Bookshelf
  class App < Hanami::App
    config.base_url = "https://bookshelf.example.com"
  end
end
```

```ruby
Hanami.app["routes"].url(:book, id: 1)
=> #<URI::HTTP https://bookshelf.example.com/books/1>
```

## Scopes

To nest a series of routes under a particular namespace, you can use a scope:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    scope "about" do
      get "/contact-us", to: "content.contact_us" # => /about/contact-us
      get "/faq", to: "content.faq" # => /about/faq
    end
  end
end
```

## Grouping

To avoid conflicting source file names, you may at times wish to group actions by adding additional segments to the `to` endpoint:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    scope "sign-up" do
      get "email", to: "sign_up.email.new"  # Invokes the Bookshelf::Actions:SignUp::Email::New action
      get "phone", to: "sign_up.phone.new"  # Invokes the Bookshelf::Actions:SignUp::Phone::New action
    end
    scope "sign-in" do
      get "email", to: "sign_in.email.new"  # Invokes the Bookshelf::Actions:SignIn::Email::New action
      get "phone", to: "sign_in.phone.new"  # Invokes the Bookshelf::Actions:SignIn::Phone::New action
    end
  end
end
```

This wraps the actions with additional `Email` and `Phone` modules and therefore organizes their source files accordingly:

```
app
└── actions
    ├── sign_in
    |   ├── email
    |   |   └── new.rb
    |   └── phone
    |       └── new.rb
    └── sign_up
        ├── email
        |   └── new.rb
        └── phone
            └── new.rb
```

The same organization applies to the related default views and templates as well.

## Redirects

Redirects can be added using `redirect`. If you have many redirects, you might consider using a Rack middleware.

```ruby
redirect "/old", to: "/new"
```

By default, redirects use a `301` status code. Use a different code via the `code` option:

```ruby
redirect "/old", to: "/temporary-new", code: 302
```

## Inspecting routes

Hanami provides a `hanami routes` command to inspect your application's routes. Run `bundle exec hanami routes` on the command line to view current routes:

```shell
$ bundle exec hanami routes

GET     /                             home                          as :root
GET     /books                        books.index
GET     /books/:id                    books.show
GET     /books/new                    books.new
POST    /books                        books.create
PATCH   /books/:id                    books.update
DELETE  /books/:id                    books.destroy
```
