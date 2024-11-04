---
title: "Building an API"
order: 30
---

Now that we've [created our app](/v2.2/introduction/getting-started/), let's turn it into an API.

## Adding our first functionality

Let's take a look at Hanami by creating the beginnings of a bookshelf app.

In the file `spec/requests/root_spec.rb`, Hanami provides a request spec expecting the error we receive as an app with no routes.

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is not found" do
    get "/"

    # Generate new action via:
    #   `bundle exec hanami generate action home.index --url=/`
    expect(last_response.status).to be(404)
  end
end
```

We can run that spec now to prove that it works:

```shell
$ bundle exec rspec spec/requests/root_spec.rb
```

You should see:

```shell
Root
  is not found

Finished in 0.01986 seconds (files took 0.70103 seconds to load)
1 example, 0 failures
```

Let's change this spec to expect a "Welcome to Bookshelf" message on the app's root:

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    get "/"

    expect(last_response.body).to eq("Welcome to Bookshelf")
    expect(last_response).to be_successful
  end
end
```

As we expect, this spec now fails:

```shell
$ bundle exec rspec spec/requests/root_spec.rb

Root
  is successful (FAILED - 1)

Failures:

  1) Root is successful
     Failure/Error: expect(last_response.body).to eq("Welcome to Bookshelf")

       expected: #<Encoding:UTF-8> "Welcome to Bookshelf"
            got: #<Encoding:ASCII-8BIT> "Not Found"

       (compared using ==)
     # ./spec/requests/root_spec.rb:7:in `block (2 levels) in <top (required)>'

Finished in 0.02525 seconds (files took 0.58635 seconds to load)
1 example, 1 failure
```

To fix this, let's look at our app's routes file at `config/routes.rb`:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    # Add your routes here. See https://guides.hanamirb.org/routing/overview/ for details.
  end
end
```

This `Bookshelf::Routes` class contains the configuration for our app's router. Routes in Hanami are comprised of a HTTP method, a path, and an endpoint to be invoked, which is usually a Hanami action. (See the [Routing guide](/v2.2/routing/overview/) for more information).

Let's update our routes to invoke an action for our app's root, which handles `GET` requests for `"/"`.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
  end
end
```

If we run our test again, we'll see a `Hanami::Routes::MissingActionError`:

```shell
$ bundle exec rspec spec/requests/root_spec.rb

Failures:

  1) Root is successful
     Failure/Error: get "/"

     Hanami::Routes::MissingActionError:
       Could not find action with key "actions.home.index" in Bookshelf::App

       To fix this, define the action class Bookshelf::Actions::Home::Index in app/actions/home/index.rb
     # ./spec/requests/root_spec.rb:5:in `block (2 levels) in <top (required)>'

Finished in 0.01871 seconds (files took 0.62516 seconds to load)
1 example, 1 failure
```

As this error suggests, we need to create the home show action the route is expecting to be able to call.

Hanami provides an action generator we can use to create this action. Running this command will create the home show action:

```shell
$ bundle exec hanami generate action home.index --skip-view --skip-route --skip-tests
```

We can find this action in our `app` directory at `app/actions/home/index.rb`:

```ruby
# app/actions/home/show.rb

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

For more details on actions, see the [Actions guide](/v2.2/actions/overview/).

For now, let's adjust our home action to return our desired "Welcome to Bookshelf" message.

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

With this change, our root spec will now pass:

```shell
$ bundle exec rspec spec/requests/root_spec.rb

Root
  is successful

Finished in 0.03029 seconds (files took 0.72932 seconds to load)
1 example, 0 failures
```

## Adding a new route and action

As the next step in our bookshelf project, let's add the ability to display an index of all books in the system, delivered as a JSON API.

First we'll create a request spec for listing books that expects a successful JSON formatted response, listing two books:

```ruby
# spec/requests/books/index_spec.rb

RSpec.describe "GET /books", type: :request do
  it "returns a list of books" do
    get "/books"

    expect(last_response).to be_successful
    expect(last_response.content_type).to eq("application/json; charset=utf-8")

    response_body = JSON.parse(last_response.body)

    expect(response_body).to eq [
      {"title" => "Test Driven Development"},
      {"title" => "Practical Object-Oriented Design in Ruby"}
    ]
  end
end
```

If you run this test, you'll see that it fails because our app currently returns a 404 response for the `/books` route.

Let's fix that by generating an action for a books index:

```shell
$ bundle exec hanami generate action books.index --skip-view --skip-tests
```

In addition to generating an action at `app/actions/books/index.rb`, the generator has also added a route in `config/routes.rb`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
    get "/books", to: "books.index"
  end
end
```

If we run our spec again, our expectation for a successful response is now satisfied, but there's a different failure:

```shell
$ bundle exec rspec spec/requests/books/index_spec.rb

GET /books
  returns a list of books (FAILED - 1)

Failures:

  1) GET /books returns a list of books
     Failure/Error: expect(last_response.content_type).to eq("application/json; charset=utf-8")

       expected: "application/json; charset=utf-8"
            got: "application/octet-stream; charset=utf-8"

       (compared using ==)
     # ./spec/requests/books/index_spec.rb:7:in `block (2 levels) in <top (required)>'
```

Our response doesn't have the expected format. Let's adjust our action to return a JSON formatted response using `response.format = :json`. We'll also set the response body to what our test expects:

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

If we run our spec, it now passes!

```shell
$ bundle exec rspec spec/requests/books/index_spec.rb

GET /books
  returns a list of books

Finished in 0.02378 seconds (files took 0.49411 seconds to load)
1 example, 0 failures
```

## Listing books from a database

Of course, returning a static list of books is not particularly useful. Let's address this by retrieving books from a database.

### Preparing a books table

To create a books table, we need to generate a migration:

```shell
$ hanami generate migration create_books
```

Edit the migration file to create a books table with title and author columns and a primary key:

```ruby
# config/db/migrate/20221113050928_create_books.rb

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

### Updating our test

With our books table ready to go, let's adapt our books index spec to expect an index of persisted books, including authors as well as titles:

```ruby
RSpec.describe "GET /books", type: [:request, :db] do
  let(:books) { Hanami.app["relations.books"] }

  before do
    books.insert(title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz")
    books.insert(title: "Test Driven Development", author: "Kent Beck")
  end

  it "returns a list of books" do
    get "/books"

    expect(last_response).to be_successful
    expect(last_response.content_type).to eq("application/json; charset=utf-8")

    response_body = JSON.parse(last_response.body)

    expect(response_body).to eq [
      {"title" => "Practical Object-Oriented Design in Ruby", "author" => "Sandi Metz"},
      {"title" => "Test Driven Development", "author" => "Kent Beck"}
    ]
  end
end
```

If we run this spec, we see that it fails because we're not returning the authors for each book.

To get this spec to pass, we'll need to update our books index action to retrieve books from our database along with their authors.

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

To access this book repo from the action, we can use Hanami's Deps mixin. Covered in detail in the [container and components](/v2.2/app/container-and-components/) section of the Architecture guide, the Deps mixin gives each of your app's components easy access to the other components it depends on to achieve its work. We'll see this in more detail as these guides progress.

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

With this action in place, the spec passes once more:

```shell
$ bundle exec rspec spec/requests/books/index_spec.rb

GET /books
  returns a list of books

Finished in 0.05765 seconds (files took 1.36 seconds to load)
1 example, 0 failures
```

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

Let's add a request spec verifying pagination:

```ruby
# spec/requests/books/index/pagination_spec.rb

RSpec.describe "GET /books pagination", type: [:request, :db] do
  let(:books) { Hanami.app["relations.books"] }

  before do
    10.times do |n|
      books.insert(title: "Book #{n}", author: "Author #{n}")
    end
  end

  context "given valid page and per_page params" do
    it "returns the correct page of books" do
      get "/books?page=1&per_page=3"

      expect(last_response).to be_successful

      response_body = JSON.parse(last_response.body)

      expect(response_body).to eq [
        {"title" => "Book 0", "author" => "Author 0"},
        {"title" => "Book 1", "author" => "Author 1"},
        {"title" => "Book 2", "author" => "Author 2"}
      ]
    end
  end
end
```

In our action class, we can use the request object to extract the relevant params from the incoming request, and then pass them to our repo method:

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

This allows our spec to pass!

```shell
$ bundle exec rspec spec/requests/books/index/pagination_spec.rb

GET /books pagination
  given valid page and per_page params
    returns the correct page of books

Finished in 0.0807 seconds (files took 0.60344 seconds to load)
1 example, 0 failures
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

We can also add a test to verify this:

```ruby
# spec/requests/books/index/pagination_spec.rb

context "given invalid page and per_page params" do
  it "returns a 422 unprocessable response" do
    get "/books?page=-1&per_page=3000"

    expect(last_response).to be_unprocessable

    response_body = JSON.parse(last_response.body)

    expect(response_body).to eq(
      "errors" => {
        "page" => ["must be greater than 0"],
        "per_page" => ["must be less than or equal to 100"]
      }
    )
  end
end
```

Validating parameters in actions is useful for performing parameter coercion and type validation. More complex domain-specific validations, or validations concerned with things such as uniqueness, however, are usually better performed at layers deeper than your HTTP actions.

You can find more details on actions and parameter validation in the [Actions guide](/v2.2/actions/overview/).

## Showing a book

In addition to our books index, we also want to provide an endpoint for viewing the details of a particular book.

Let's specify a `/books/:id` request that renders a book for a given ID, or returns 404 if there's no book with the ID.

```ruby
# spec/requests/books/show_spec.rb

RSpec.describe "GET /books/:id", type: [:request, :db] do
  let(:books) { Hanami.app["relations.books"] }

  context "when a book matches the given ID" do
    let!(:book_id) do
      books.insert(title: "Test Driven Development", author: "Kent Beck")
    end

    it "renders the book" do
      get "/books/#{book_id}"

      expect(last_response).to be_successful
      expect(last_response.content_type).to eq("application/json; charset=utf-8")

      response_body = JSON.parse(last_response.body)

      expect(response_body).to eq(
        "id" => book_id, "title" => "Test Driven Development", "author" => "Kent Beck"
      )
    end
  end

  context "when no book matches the given ID" do
    it "returns not found" do
      get "/books/#{books.max(:id).to_i + 1}"

      expect(last_response).to be_not_found
      expect(last_response.content_type).to eq("application/json; charset=utf-8")

      response_body = JSON.parse(last_response.body)

      expect(response_body).to eq(
        "error" => "not_found"
      )
    end
  end
end
```

Because there's no matching route yet, this spec immediately fails:

```shell
$ bundle exec rspec spec/requests/books/show_spec.rb

GET /books/:id
  when a book matches the given id
    renders the book (FAILED - 1)
  when no book matches the given id
    returns not found (FAILED - 2)

Failures:

  1) GET /books/:id when a book matches the given id renders the book
     Failure/Error: expect(last_response).to be_successful
       expected `#<Rack::MockResponse:0x000000010c9f5788 @original_headers={"Content-Length"=>"9"}, @errors="", @cooki...ms/rack-2.2.4/lib/rack/response.rb:287>, @block=nil, @body=["Not Found"], @buffered=true, @length=9>.successful?` to be truthy, got false
     # ./spec/requests/books/show_spec.rb:14:in `block (3 levels) in <top (required)>'

  2) GET /books/:id when no book matches the given id returns not found
     Failure/Error: expect(last_response.content_type).to eq("application/json; charset=utf-8")

       expected: "application/json; charset=utf-8"
            got: nil

       (compared using ==)
     # ./spec/requests/books/show_spec.rb:30:in `block (3 levels) in <top (required)>'

Finished in 0.05427 seconds (files took 0.88631 seconds to load)
2 examples, 2 failures
```

We can use Hanami's action generator to create both a route and an action. Run:

```shell
$ bundle exec hanami generate action books.show --skip-view --skip-tests
```

If you inspect `config/routes.rb` you will see the generator has automatically added a new `get "/books/:id", to: "books.show"` route:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
    get "/books", to: "books.index"
    get "/books/:id", to: "books.show"
  end
end
```

For the action to fetch a single book from our database, we can add a new method to our book repo:

```ruby
# app/repos/book_repo.rb

module Bookshelf
  module Repos
    class BookRepo < Bookshelf::Repo
      def get(id)
        books.by_pk(id).one
      end
    end
  end
end
```

We can now edit the new action at `app/actions/books/show.rb` to add the required behaviour. Here, we use param validation to coerce `params[:id]` to an integer, render a book via the repo if there's one with a matching primary key, or return a 404 response. With this, our test passes.

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

In our repo, we used the relation's `#one` method to return our book, which will return `nil` if there's no book with the requisite ID.

However, in addition to `#one`, relations also provide a `#one!` method, which instead raises a `ROM::TupleCountMismatchError` exception when no record is found.

Let's update the repo to use `#one!`:

```ruby
# app/repos/book_repo.rb

def get(id)
  by_pk(id).one!
end
```

We can now use this to handle 404s via Hanami's action exception handling: `config.handle_exception`. This action configuration takes the name of a method to invoke when a particular exception occurs.

Taking this approach allows our handle method to concern itself only with the happy path:

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Deps["repos.book_repo"]

        config.handle_exception ROM::TupleCountMismatchError => :handle_not_found

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          book = book_repo.get(request.params[:id])

          response.format = :json
          response.body = book.to_h.to_json
        end

        private

        def handle_not_found(_request, response, _exception)
          response.status = 404
          response.format = :json
          response.body = {error: "not_found"}.to_json
        end
      end
    end
  end
end
```

This exception handling behaviour can also be moved into the base `Bookshelf::Action` class at `app/action.rb`, meaning that any action inheriting from `Bookshelf::Action` will handle `ROM::TupleCountMismatchError` in the same way.

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

With its base action configured to handle `ROM::TupleCountMismatchError` exceptions, the `Books::Show` action can now be as follows and our spec continues to pass:

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
          response.body = book.to_h.to_json
        end
      end
    end
  end
end
```

```shell
$ bundle exec rspec spec/requests/books/show_spec.rb

GET /books/:id
  when a book matches the given id
    renders the book
  when no book matches the given id
    returns not found

Finished in 0.07726 seconds (files took 1.29 seconds to load)
2 examples, 0 failures
```

## Creating a book

Now that our visitors can list and view books, let's allow them to create books too.

Here's a spec for POST requests to the `/books` path, where it's expected that only valid requests result in a book being created:

```ruby
# spec/requests/books/create_spec.rb

RSpec.describe "POST /books", type: [:request, :db] do
  let(:request_headers) do
    {"HTTP_ACCEPT" => "application/json", "CONTENT_TYPE" => "application/json"}
  end

  context "given valid params" do
    let(:params) do
      {book: {title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz"}}
    end

    it "creates a book" do
      post "/books", params.to_json, request_headers

      expect(last_response).to be_created
    end
  end

  context "given invalid params" do
    let(:params) do
      {book: {title: nil}}
    end

    it "returns 422 unprocessable" do
      post "/books", params.to_json, request_headers

      expect(last_response).to be_unprocessable
    end
  end
end
```

Executing this spec, we get the message `Method Not Allowed`, because there's no route or action for handling this request.

Hanami's action generator can add these for us:

```shell
$ bundle exec hanami generate action books.create --skip-view --skip-tests
```

The app's routes now include the expected route - invoking the `books.create` action for `POST` requests to `/books`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
    get "/books", to: "books.index"
    get "/books/:id", to: "books.show"
    post "/books", to: "books.create"
  end
end
```

And Hanami has generated an action at `app/actions/books/create.rb`:

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

Before we can update our action, we must first add a method to our book repo to create new books:

```ruby
# app/repos/book_repo.rb

module Bookshelf
  module Repos
    class BookRepo < Bookshelf::Repo
      def create(attributes)
        books.changeset(:create, attributes).commit
      end
    end
  end
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

Our request spec now passes!

```shell
$ bundle exec rspec spec/requests/books/create_spec.rb

POST /books
  given valid params
    creates a book
  given invalid params
    returns 422 unprocessable

Finished in 0.07143 seconds (files took 1.32 seconds to load)
2 examples, 0 failures
```

In addition to validating title and author are present, the `params` block in the action also serves to prevent mass assignment - params not included in the schema (for example an attempt to inject a price of 0) will be discarded.


## What's next

So far we've seen how to create a new Hanami app, explored some of the basics of how an app is structured, and seen how we can list, display and create a simple book entity while validating user input.

Still, we've barely touched the surface of what Hanami offers.

From here you might want to look in more detail at [routing](/v2.2/routing/overview/) and [actions](/v2.2/actions/overview/), or explore Hanami's [app architecture](/v2.2/app/container-and-components/), starting with its [component management](/v2.2/app/container-and-components/) and [dependency injection](/v2.2/app/container-and-components/) systems.
