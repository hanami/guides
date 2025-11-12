---
title: "Building an API"
order: 30
---

Now that we've [created our app](/v2.3/introduction/getting-started/), let's turn it into an API.

## Adding our first functionality

Let's take a look at Hanami by creating the beginnings of a bookshelf app.

We'll start by creating a home endpoint that returns "Welcome to Bookshelf".

First, let's look at our app's routes file at `config/routes.rb`:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    # Add your routes here. See https://guides.hanamirb.org/routing/overview/ for details.
  end
end
```

This `Bookshelf::Routes` class contains the configuration for our app's router. Routes in Hanami are comprised of a HTTP method, a path, and an endpoint to be invoked, which is usually a Hanami action. (See the [Routing guide](/v2.3/routing/overview/) for more information).

Let's add a route for our home endpoint that invokes a new action.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
  end
end
```

We can use Hanami's action generator to create this action:

```shell
$ bundle exec hanami generate action home.index --skip-view --skip-route --skip-tests
```

We can find this action in our `app` directory at `app/actions/home/index.rb`:

```ruby
# app/actions/home/index.rb

module Bookshelf
  module Actions
    module Home
      class Index < Bookshelf::Action
        def handle(request, response)
        end
      end
    end
  end
end
```

In a Hanami app, every action is an individual class. Actions decide what HTTP response (body, headers and status code) to return for a given request.

Actions define a `#handle` method which accepts a `request` object, representing the incoming request, and a `response` object, representing the outgoing response.

```ruby
def handle(request, response)
  # ...
end
```

For more details on actions, see the [Actions guide](/v2.3/actions/overview/).

Let's adjust our home action to return our "Welcome to Bookshelf" message.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Index < Bookshelf::Action
        def handle(request, response)
          response.body = "Welcome to Bookshelf"
        end
      end
    end
  end
end
```

### Testing your API

Now that we've created our first endpoint, let's start the development server and verify it works.

Run the following command to start the server:

```shell
$ bin/hanami dev
```

This starts Hanami's development server, which watches for file changes and automatically reloads your app as you work.

Once the server is running, open a new terminal and use `curl` to test your endpoint:

```shell
$ curl http://localhost:2300
Welcome to Bookshelf
```

Keep the dev server running as you continue through this guide - you'll be able to make requests to test your changes as you make them.

## Adding a new route and action

As the next step in our bookshelf project, let's add the ability to display an index of all books in the system, delivered as a JSON API.

First, let's set up a RESTful route for listing books by using the `resources` helper in `config/routes.rb`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
    resources :books, only: [:index]
  end
end
```

The `resources` helper can create standard RESTful routes for a resource:

- `GET /books` → `"books.index"` (list all books)
- `POST /books` → `"books.create"` (create a book)
- `GET /books/:id` → `"books.show"` (show a specific book)

In this guide, we'll implement the index, show, and create actions. (The new and edit actions are typically used for HTML forms, which we don't need in a JSON API.) We use the `only:` option to specify which routes to create, adding each action as we implement it.

Now let's generate an action for the books index:

```shell
$ bundle exec hanami generate action books.index --skip-view --skip-route --skip-tests
```

Since we've already defined our routes using `resources`, we use the `--skip-route` flag to prevent the generator from adding a duplicate route.

Now let's adjust our action to return a JSON formatted response using `response.format = :json`. We'll also set the response body to a list of books:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          books = [
            {title: "Test Driven Development"},
            {title: "Practical Object-Oriented Design in Ruby"}
          ]

          response.format = :json
          response.body = books.to_json
        end
      end
    end
  end
end
```

Test your books endpoint with curl:

```shell
$ curl http://localhost:2300/books
[{"title":"Test Driven Development"},{"title":"Practical Object-Oriented Design in Ruby"}]
```

You should see the two hardcoded books returned as JSON.

## Listing books from a database

Of course, returning a static list of books is not particularly useful. Let's address this by retrieving books from a database.

### Preparing a books table

To create a books table, we need to generate a migration:

```shell
$ hanami generate migration create_books
```

Edit the migration file to create a books table with title and author columns and a primary key:

```ruby
# config/db/migrate/20251112215119_create_books.rb

ROM::SQL.migration do
  change do
    create_table :books do
      primary_key :id
      column :title, :text, null: false
      column :author, :text, null: false
    end
  end
end
```

Migrate the development and test databases:

```shell
$ bundle exec hanami db migrate
```

Next, let's generate a relation to allow our app to interact with our books table. To generate a relation:

```shell
$ bundle exec hanami generate relation books
```

This creates the following file at `app/relations/books.rb`:

```ruby
# app/relations/books.rb

module Bookshelf
  module Relations
    class Books < Bookshelf::DB::Relation
      schema :books, infer: true
    end
  end
end
```

### Fetching books from the database

Now we need to update our books index action to retrieve books from our database along with their authors.

For this, we can generate a book repo:

```shell
$ bundle exec hanami generate repo book
```

Repos serve as the interface to our persisted data from our domain layer. Let's edit the repo to add a method that returns all books ordered by title:

```ruby
# app/repos/book_repo.rb

module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      def all_by_title
        books
          .select(:title, :author)
          .order(books[:title].asc)
          .to_a
      end
    end
  end
end
```

To access this book repo from the action, we can use Hanami's Deps mixin. Covered in detail in the [container and components](/v2.3/app/container-and-components/) section of the Architecture guide, the Deps mixin gives each of your app's components easy access to the other components it depends on to achieve its work. We'll see this in more detail as these guides progress.

For now however, it's enough to know that we can use `include Deps["repos.book_repo"]` to make the repo available via a `book_repo` method within our action.

We can now call this repo to prepare the action's response:

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["repos.book_repo"]

        def handle(request, response)
          books = book_repo.all_by_title

          response.format = :json
          response.body = books.map(&:to_h).to_json
        end
      end
    end
  end
end
```

### Verifying the database integration

With our books table created and our app configured to read from it, let's add some books to the database and verify everything is working.

Start Hanami's interactive console:

```shell
$ bundle exec hanami console
```

Then create a few books:

```ruby
bookshelf[development]> books_relation = app["relations.books"]
bookshelf[development]> books_relation.insert(title: "Test Driven Development", author: "Kent Beck")
bookshelf[development]> books_relation.insert(title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz")
bookshelf[development]> books_relation.insert(title: "The Pragmatic Programmer", author: "Dave Thomas and Andy Hunt")
```

Now test your endpoint with curl:

```shell
$ curl http://localhost:2300/books
[{"title":"Practical Object-Oriented Design in Ruby","author":"Sandi Metz"},{"title":"Test Driven Development","author":"Kent Beck"},{"title":"The Pragmatic Programmer","author":"Dave Thomas and Andy Hunt"}]
```

You should see your books returned as JSON, ordered alphabetically by title.

## Parameter validation

Of course, returning _every_ book in the database when a visitor makes a request to `/books` is not going to be a good strategy for very long. Luckily relations offer pagination support. Let's add pagination with a default page size of 5:

```ruby
# app/relations/books.rb

module Bookshelf
  module Relations
    class Books < Bookshelf::DB::Relation
      schema :books, infer: true

      use :pagination
      per_page 5
    end
  end
end
```

This will enable our books index to accept `page` and `per_page` params.

Now we can use the request object in our action to extract the relevant params from the incoming request, and then pass them to our repo method:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["repos.book_repo"]

        def handle(request, response)
          books = book_repo.all_by_title(
            page: request.params[:page] || 1,
            per_page: request.params[:per_page] || 5
          )

          response.format = :json
          response.body = books.map(&:to_h).to_json
        end
      end
    end
  end
end
```

And in the repo, we can use these to control the pagination:

```ruby
# app/repos/book_repo.rb

module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      def all_by_title(page:, per_page:)
        books
          .select(:title, :author)
          .order(books[:title].asc)
          .page(page)
          .per_page(per_page)
          .to_a
      end
    end
  end
end
```

Accepting parameters from the internet without validation is never a good idea, however. Hanami actions offer built-in parameter validation, which we can use here to ensure that both `page` and `per_page` are positive integers, and that `per_page` is at most 100:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["repos.book_repo"]

        params do
          optional(:page).value(:integer, gt?: 0)
          optional(:per_page).value(:integer, gt?: 0, lteq?: 100)
        end

        def handle(request, response)
          halt 422 unless request.params.valid?

          books = book_repo.all_by_title(
            page: request.params[:page] || 1,
            per_page: request.params[:per_page] || 5
          )

          response.format = :json
          response.body = books.map(&:to_h).to_json
        end
      end
    end
  end
end
```

In this instance, the `params` block specifies the following:

- `page` and `per_page` are optional parameters
- if `page` is present, it must be an integer greater than 0
- if `per_page` is present, it must be an integer greater than 0 and less than or equal to 100

At the start of the handle method, the line `halt 422 unless request.params.valid?` ensures that the action halts and returns `422 Unprocessable` if an invalid parameter was given.

A helpful response revealing why parameter validation failed can also be rendered by passing a body when calling halt:

```ruby
halt 422, {errors: request.params.errors}.to_json unless request.params.valid?
```

Validating parameters in actions is useful for performing parameter coercion and type validation. More complex domain-specific validations, or validations concerned with things such as uniqueness, however, are usually better performed at layers deeper than your HTTP actions.

You can find more details on actions and parameter validation in the [Actions guide](/v2.3/actions/overview/).

Test pagination with curl:

```shell
$ curl http://localhost:2300/books?page=2
$ curl http://localhost:2300/books?per_page=2
$ curl http://localhost:2300/books?page=invalid
{"errors":{"page":[{"text":"must be an integer","code":"int?","path":["page"],"input":"invalid"}]}}
```

The first request shows the second page of books, the second shows just 2 books per page, and the third demonstrates the validation error for an invalid parameter.

## Showing a book

In addition to our books index, we also want to provide an endpoint for viewing the details of a particular book.

First, let's update our routes to add the `:show` action:

```ruby
# config/routes.rb
resources :books, only: [:index, :show]
```

This adds a route for showing individual books at `GET /books/:id`, which will invoke the `"books.show"` action.

Now let's generate that action:

```shell
$ bundle exec hanami generate action books.show --skip-view --skip-route --skip-tests
```

To fetch a single book from our database, we can add a new method to our book repo:

```ruby
# app/repos/book_repo.rb

def get(id)
  books.by_pk(id).one
end
```

We can now edit the new action at `app/actions/books/show.rb` to add the required behaviour. Here, we use param validation to coerce `params[:id]` to an integer, render a book via the repo if there's one with a matching primary key, or return a 404 response.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Deps["repos.book_repo"]

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          book = book_repo.get(request.params[:id])

          response.format = :json

          if book
            response.body = book.to_h.to_json
          else
            response.status = 404
            response.body = {error: "not_found"}.to_json
          end
        end
      end
    end
  end
end
```

### Handling missing books

What happens if someone requests a book that doesn't exist? Currently our repo's `get` method uses `#one`, which returns `nil` when no record is found. Relations also provide a `#one!` method, which instead raises a `ROM::TupleCountMismatchError` exception when no record is found.

Let's use `#one!` in our repo:

```ruby
# app/repos/book_repo.rb

def get(id)
  books.by_pk(id).one!
end
```

We can handle this exception via Hanami's action exception handling: `config.handle_exception`. This action configuration takes the name of a method to invoke when a particular exception occurs.

Let's add this to the base `Bookshelf::Action` class at `app/action.rb`, so that any action inheriting from `Bookshelf::Action` will handle `ROM::TupleCountMismatchError` by returning a 404 response:

```ruby
# app/action.rb

# auto_register: false
require "hanami/action"
require "dry/monads"

module Bookshelf
  class Action < Hanami::Action
    # Provide `Success` and `Failure` for pattern matching on operation results
    include Dry::Monads[:result]

    config.handle_exception ROM::TupleCountMismatchError => :handle_not_found

    private

    def handle_not_found(_request, response, _exception)
      response.status = 404
      response.format = :json
      response.body = {error: "not_found"}.to_json
    end
  end
end
```

With this in place, our `Books::Show` action can remain focused on the happy path, and will automatically return a 404 response when a book isn't found.

Test your show endpoint with curl:

```shell
$ curl http://localhost:2300/books/1
{"id":1,"title":"Test Driven Development","author":"Kent Beck"}
$ curl http://localhost:2300/books/999
{"error":"not_found"}
```

The first request returns the book with ID 1, while the second returns a 404 error for a non-existent book.

## Creating a book

Now that our visitors can list and view books, let's allow them to create books too.

First, let's update our routes to add the `:create` action:

```ruby
# config/routes.rb

resources :books, only: [:index, :show, :create]
```

This adds a route for creating books at `POST /books`, which will invoke the `"books.create"` action.

Now let's generate that action:

```shell
$ bundle exec hanami generate action books.create --skip-view --skip-route --skip-tests
```

This generates an action at `app/actions/books/create.rb`:

```ruby
# app/actions/books/create.rb

module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        def handle(request, response)
        end
      end
    end
  end
end
```

To enable convenient parsing of params from JSON request bodies, Hanami includes a body parser middleware that can be enabled through a config option on the app class. Enable it by adding the following to the `Bookshelf::App` class in `config/app.rb`:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    config.middleware.use :body_parser, :json
  end
end
```

With this parser in place, the `book` key from the JSON body will be available in the action via `request.params[:book]`.

First, let's add a method to our book repo to create new books:

```ruby
# app/repos/book_repo.rb

def create(attributes)
  books.changeset(:create, attributes).commit
end
```

We can now complete our create action by creating a book via the repo if the posted params are valid:

```ruby
module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        include Deps["repos.book_repo"]

        params do
          required(:book).hash do
            required(:title).filled(:string)
            required(:author).filled(:string)
          end
        end

        def handle(request, response)
          if request.params.valid?
            book = book_repo.create(request.params[:book])

            response.status = 201
            response.body = book.to_json
          else
            response.status = 422
            response.format = :json
            response.body = request.params.errors.to_json
          end
        end
      end
    end
  end
end
```

In addition to validating title and author are present, the `params` block in the action also serves to prevent mass assignment - params not included in the schema (for example an attempt to inject a price of 0) will be discarded.

Test your create endpoint with curl:

```shell
$ curl -X POST http://localhost:2300/books \
  -H "Content-Type: application/json" \
  -d '{"book":{"title":"Refactoring","author":"Martin Fowler"}}'
{"id":4,"title":"Refactoring","author":"Martin Fowler"}
```

Try creating a book with missing data to see the validation errors:

```shell
$ curl -X POST http://localhost:2300/books \
  -H "Content-Type: application/json" \
  -d '{"book":{"title":""}}'
{"title":[{"text":"must be filled","code":"filled?","path":["book","title"],"input":""}],"author":[{"text":"is missing","code":"required","path":["book","author"]}]}
```

## What's next

So far we've seen how to create a new Hanami app, explored some of the basics of how an app is structured, and seen how we can list, display and create a simple book entity while validating user input.

Still, we've barely touched the surface of what Hanami offers.

From here you might want to look in more detail at [routing](/v2.3/routing/overview/) and [actions](/v2.3/actions/overview/), or explore Hanami's [app architecture](/v2.3/app/container-and-components/), starting with its [component management](/v2.3/app/container-and-components/) and [dependency injection](/v2.3/app/container-and-components/) systems.
