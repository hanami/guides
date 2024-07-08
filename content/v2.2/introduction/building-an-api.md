---
title: "Building an API"
order: 30
---

Now that we've [created our app](/v2.1/introduction/getting-started/), let's turn it into an API.

## Adding our first functionality

Let's take a look at Hanami by creating the beginnings of a bookshelf app.

In the file `spec/requests/root_spec.rb`, Hanami provides a request spec for the "Hello from Hanami" message we've seen in the browser.

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    get "/"

    # Find me in `config/routes.rb`
    expect(last_response).to be_successful
    expect(last_response.body).to eq("Hello from Hanami")
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
  is successful

Finished in 0.01986 seconds (files took 0.70103 seconds to load)
1 example, 0 failures
```

Let's change the "Hello from Hanami" message to "Welcome to Bookshelf". First, we'll adjust our spec:

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    get "/"

    # Find me in `config/routes.rb`
    expect(last_response).to be_successful
    expect(last_response.body).to eq("Welcome to Bookshelf")
  end
end
```

As we expect, when we run the spec again, it fails:

```shell
$ bundle exec rspec spec/requests/root_spec.rb

Root
  is successful (FAILED - 1)

Failures:

  1) Root is successful
     Failure/Error: expect(last_response.body).to eq("Welcome to Bookshelf")

       expected: "Welcome to Bookshelf"
            got: "Hello from Hanami"

       (compared using ==)
     # ./spec/requests/root_spec.rb:9:in `block (2 levels) in <top (required)>'

Finished in 0.04572 seconds (files took 0.72148 seconds to load)
1 example, 1 failure
```

To fix this, let's open our app's routes file at `config/routes.rb`:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root { "Hello from Hanami" }
  end
end
```

This `Bookshelf::Routes` class contains the configuration for our app's router. Routes in Hanami are comprised of a HTTP method, a path, and an endpoint to be invoked, which is usually a Hanami action. (See the [Routing guide](/v2.1/routing/overview/) for more information).

We'll take a look at adding more routes in a moment, but for now let's get our spec to pass. The above `Bookshelf::Routes` class contains only one route, the `root` route, which handles `GET` requests for `"/"`.

Rather than invoking an action, this route is configured to invoke a block, which returns "Hello from Hanami".

Blocks are convenient, but let's adjust our route to invoke an action instead:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
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
       Could not find action with key "actions.home.show" in Bookshelf::App

       To fix this, define the action class Bookshelf::Actions::Home::Show in app/actions/home/show.rb
     # ./spec/requests/root_spec.rb:5:in `block (2 levels) in <top (required)>'

Finished in 0.01871 seconds (files took 0.62516 seconds to load)
1 example, 1 failure
```

As this error suggests, we need to create the home show action the route is expecting to be able to call.

Hanami provides an action generator we can use to create this action. Running this command will create the home show action:

```shell
$ bundle exec hanami generate action home.show --skip-view
```

We can find this action in our `app` directory at `app/actions/home/show.rb`:

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(*, response)
          response.body = self.class.name
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

In the automatically generated home show action above, `*` is used for the `request` argument because the action does not currently use the request.

For more details on actions, see the [Actions guide](/v2.1/actions/overview/).

For now, let's adjust our home action to return our desired "Welcome to Bookshelf" message.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(*, response)
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
    expect(last_response.content_type).to eq("app/json; charset=utf-8")

    response_body = JSON.parse(last_response.body)

    expect(response_body).to eq([
      { "title" => "Test Driven Development" },
      { "title" => "Practical Object-Oriented Design in Ruby" }
    ])
  end
end
```

If you run this test, you'll see that it fails because our app currently returns a 404 response for the `/books` route.

Let's fix that by generating an action for a books index:

```shell
$ bundle exec hanami generate action books.index --skip-view
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
     Failure/Error: expect(last_response.content_type).to eq("app/json; charset=utf-8")

       expected: "app/json; charset=utf-8"
            got: "app/octet-stream; charset=utf-8"

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
        def handle(*, response)
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

## Persisting books

Of course, returning a static list of books is not particularly useful.

Let's address this by retrieving books from a database.

<p class="notice">
  Integrated support for persistence based on <a href="https://rom-rb.org/">ROM</a> is coming in Hanami's 2.2 release. For now, we can bring our own simple ROM configuration to allow us to store books in a database.
</p>

### Adding persistence using ROM

Let's add just enough ROM to get persistence working using Postgres.

First, add these gems to the Gemfile and run `bundle install`:

```ruby
# Gemfile
gem "rom", "~> 5.3"
gem "rom-sql", "~> 3.6"
gem "pg"

group :test do
  gem "database_cleaner-sequel"
end
```

<p class="notice">
  If you do not have Postgres installed, you can install it using <a href="https://brew.sh/">Homebrew</a>,  <a href="https://asdf-vm.com/">asdf</a> or by following the installation instruction on the <a href="https://www.postgresql.org/">PostgreSQL website</a>.
</p>

With Postgres running, create databases for development and test using PostgreSQL's `createdb` command:

```shell
$ createdb bookshelf_development
$ createdb bookshelf_test
```

In Hanami, [providers](/v2.1/app/providers/) offer a mechanism for configuring and using dependencies, like databases, within your app.

Copy and paste the following provider into a new file at `config/providers/persistence.rb`:

```ruby
Hanami.app.register_provider :persistence, namespace: true do
  prepare do
    require "rom"

    config = ROM::Configuration.new(:sql, target["settings"].database_url)

    register "config", config
    register "db", config.gateways[:default].connection
  end

  start do
    config = target["persistence.config"]

    config.auto_registration(
      target.root.join("lib/bookshelf/persistence"),
      namespace: "Bookshelf::Persistence"
    )

    register "rom", ROM.container(config)
  end
end
```

For this persistence provider to function, we need to establish a `database_url` setting.

Settings in Hanami are defined by a `Settings` class in `config/settings.rb`:

```ruby
# config/settings.rb

module Bookshelf
  class Settings < Hanami::Settings
    # Define your app settings here, for example:
    #
    # setting :my_flag, default: false, constructor: Types::Params::Bool
  end
end
```

Settings can be strings, booleans, integers and other types. Each setting can be either optional or required (meaning the app won't boot without them), and each can also have a default.

Each setting is sourced from an environment variable matching its name. For example `my_flag` will be sourced from `ENV["MY_FLAG"]`.

You can read more about Hanami's settings in the [app guide](/v2.1/app/settings/).

Let's add `database_url` and make it a required setting by using the `Types::String` constructor:

```ruby
# config/settings.rb

module Bookshelf
  class Settings < Hanami::Settings
    # Define your app settings here, for example:
    #
    # setting :my_flag, default: false, constructor: Types::Params::Bool

    setting :database_url, constructor: Types::String
  end
end
```

Our bookshelf app will now raise an invalid settings error when it boots, unless a `DATABASE_URL` environment variable is present.

In development and test environments, Hanami uses the [dotenv gem](https://github.com/bkeepers/dotenv) to load environment variables from `.env` files.

We can now create `.env` and `.env.test` files in order to set `database_url` appropriately in development and test environments:

```shell
# .env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bookshelf_development
```

```shell
# .env.test
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bookshelf_test
```

<p class="notice">
  You might need to adjust these connection strings based on your local postgres configuration.
</p>

<p class="notice">
  See <a href="/v2.1/app/settings/#using-dotenv-to-manage-environment-variables">Using dotenv to manage environment variables</a> for recommendations on handling these files.
</p>

To confirm that the `database_url` setting is working as expected, you can run `bundle exec hanami console` to start a console, then call the `database_url` method on your app's settings object.

```shell
$ bundle exec hanami console
```

```ruby
bookshelf[development]> Hanami.app["settings"].database_url
=> "postgres://postgres:postgres@localhost:5432/bookshelf_development"
```

And in test:

```shell
$ HANAMI_ENV=test bundle exec hanami console
```

```ruby
bookshelf[test]> Hanami.app["settings"].database_url
=> "postgres://postgres:postgres@localhost:5432/bookshelf_test"
```

To ensure the database is cleaned between tests, add the following to a `spec/support/database_cleaner.rb` file:

```ruby
# spec/support/database_cleaner.rb

require "database_cleaner-sequel"

Hanami.app.prepare(:persistence)
DatabaseCleaner[:sequel, db: Hanami.app["persistence.db"]]

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around(:each, type: :database) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end
```

And then append the following line to `spec/spec_helper.rb`:

```ruby
require_relative "support/database_cleaner"
```

Finally, enable ROM's rake tasks for database migrations by appending the following to the `Rakefile`:

```ruby
# Rakefile

require "rom/sql/rake_task"

task :environment do
  require_relative "config/app"
  require "hanami/prepare"
end

namespace :db do
  task setup: :environment do
    Hanami.app.prepare(:persistence)
    ROM::SQL::RakeSupport.env = Hanami.app["persistence.config"]
  end
end
```

<p class="notice">
  Hanami's 2.2 release will bring persistence as a first class feature, after which none of the above set up will be required.
</p>

### Creating a books table

With persistence ready, we can now create a books table.

To create a migration run:

```shell
$ bundle exec rake db:create_migration[create_books]
```

<p class="notice">
  If your shell is zsh you will need to escape the square brackets:
</p>

```shell
bundle exec rake db:create_migration\[create_books\]
```

Edit the migration file in order to create a books table with title and author columns and a primary key:

```ruby
# db/migrate/20221113050928_create_books.rb

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

Migrate both the development and test databases:

```shell
$ bundle exec rake db:migrate
$ HANAMI_ENV=test bundle exec rake db:migrate
```

Lastly, let's add a ROM relation to allow our app to interact with our books table. Create the following file at `lib/bookshelf/persistence/relations/books.rb`:

```ruby
# lib/bookshelf/persistence/relations/books.rb

module Bookshelf
  module Persistence
    module Relations
      class Books < ROM::Relation[:sql]
        schema(:books, infer: true)
      end
    end
  end
end
```

## Listing books

With our books table ready to go, let's adapt our books index spec to expect an index of persisted books:

```ruby
RSpec.describe "GET /books", type: [:request, :database] do
  let(:books) { app["persistence.rom"].relations[:books] }

  before do
    books.insert(title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz")
    books.insert(title: "Test Driven Development", author: "Kent Beck")
  end

  it "returns a list of books" do
    get "/books"

    expect(last_response).to be_successful
    expect(last_response.content_type).to eq("app/json; charset=utf-8")

    response_body = JSON.parse(last_response.body)

    expect(response_body).to eq([
      { "title" => "Practical Object-Oriented Design in Ruby", "author" => "Sandi Metz" },
      { "title" => "Test Driven Development", "author" => "Kent Beck" }
    ])
  end
end
```

To get this spec to pass, we'll need to update our books index action to return books from the books relation.

To access the books relation within the action, we can use Hanami's "Deps mixin". Covered in detail in the [container and components](/v2.1/app/container-and-components/) section of the Architecture guide, the Deps mixin gives each of your app's components easy access to the other components it depends on to achieve its work. We'll see this in more detail as these guides progress.

For now however, it's enough to know that we can use `include Deps["persistence.rom"]` to make ROM available via a `rom` method within our action. The books relation is then available via `rom.relations[:books]`.

To satisfy our spec, we need to meet a few requirements. Firstly, we want to render each book's _title_ and _author_, but not its _id_. Secondly we want to return books alphabetically by title. We can achieve these requirements using the `select` and `order` methods offered by the books relation:

```ruby
module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["persistence.rom"]

        def handle(*, response)
          books = rom.relations[:books]
            .select(:title, :author)
            .order(:title)
            .to_a

          response.format = :json
          response.body = books.to_json
        end
      end
    end
  end
end
```

<p class="convention">
  Accessing relations directly from actions is not a commonly recommended pattern. Instead, a <a href="https://rom-rb.org/5.0/learn/repositories/quick-start/">rom repository</a> should be used. Here, however, the repository is ommitted for brevity. Hanami's 2.2 release will offer repositories out of the box.
</p>

With this action in place, the spec passes once more:

```shell
$ bundle exec rspec spec/requests/books/index_spec.rb

GET /books
  returns a list of books

Finished in 0.05765 seconds (files took 1.36 seconds to load)
1 example, 0 failures
```

## Parameter validation

Of course, returning _every_ book in the database when a visitor makes a request to `/books` is not going to be a good strategy for very long. Luckily ROM relations offer pagination support. Let's add pagination with a default page size of 5:

```ruby
# lib/bookshelf/persistence/relations/books.rb

module Bookshelf
  module Persistence
    module Relations
      class Books < ROM::Relation[:sql]
        schema(:books, infer: true)

        use :pagination
        per_page 5
      end
    end
  end
end
```

This will enable our books index to accept `page` and `per_page` params.

Let's add a request spec verifying pagination:

```ruby
# spec/requests/books/index/pagination_spec.rb

RSpec.describe "GET /books pagination", type: [:request, :database] do
  let(:books) { app["persistence.rom"].relations[:books] }

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

      expect(response_body).to eq([
        { "title" => "Book 0", "author" => "Author 0" },
        { "title" => "Book 1", "author" => "Author 1" },
        { "title" => "Book 2", "author" => "Author 2" }
      ])
    end
  end
end
```

In our action class, we can use the request object to extract the relevant params from the incoming request, which allows our spec to pass:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["persistence.rom"]

        def handle(request, response)
          books = rom.relations[:books]
            .select(:title, :author)
            .order(:title)
            .page(request.params[:page] || 1)
            .per_page(request.params[:per_page] || 5)
            .to_a

          response.format = :json
          response.body = books.to_json
        end
      end
    end
  end
end
```

Accepting parameters from the internet without validation is never a good idea however. Hanami actions offer built-in parameter validation, which we can use here to ensure that both `page` and `per_page` are positive integers, and that `per_page` is at most 100:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Deps["persistence.rom"]

        params do
          optional(:page).value(:integer, gt?: 0)
          optional(:per_page).value(:integer, gt?: 0, lteq?: 100)
        end

        def handle(request, response)
          halt 422 unless request.params.valid?

          books = rom.relations[:books]
            .select(:title, :author)
            .order(:title)
            .page(request.params[:page] || 1)
            .per_page(request.params[:per_page] || 5)
            .to_a

          response.format = :json
          response.body = books.to_json
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

You can find more details on actions and parameter validation in the [Actions guide](/v2.1/actions/overview/).

## Showing a book

In addition to our books index, we also want to provide an endpoint for viewing the details of a particular book.

Let's specify a `/books/:id` request that renders a book for a given id, or returns 404 if there's no book with the provided id.

```ruby
# spec/requests/books/show_spec.rb

RSpec.describe "GET /books/:id", type: [:request, :database] do
  let(:books) { app["persistence.rom"].relations[:books] }

  context "when a book matches the given id" do
    let!(:book_id) do
      books.insert(title: "Test Driven Development", author: "Kent Beck")
    end

    it "renders the book" do
      get "/books/#{book_id}"

      expect(last_response).to be_successful
      expect(last_response.content_type).to eq("app/json; charset=utf-8")

      response_body = JSON.parse(last_response.body)

      expect(response_body).to eq(
        "id" => book_id, "title" => "Test Driven Development", "author" => "Kent Beck"
      )
    end
  end

  context "when no book matches the given id" do
    it "returns not found" do
      get "/books/#{books.max(:id).to_i + 1}"

      expect(last_response).to be_not_found
      expect(last_response.content_type).to eq("app/json; charset=utf-8")

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
     # ./spec/support/database_cleaner.rb:15:in `block (3 levels) in <top (required)>'
     # ./spec/support/database_cleaner.rb:14:in `block (2 levels) in <top (required)>'

  2) GET /books/:id when no book matches the given id returns not found
     Failure/Error: expect(last_response.content_type).to eq("app/json; charset=utf-8")

       expected: "app/json; charset=utf-8"
            got: nil

       (compared using ==)
     # ./spec/requests/books/show_spec.rb:30:in `block (3 levels) in <top (required)>'
     # ./spec/support/database_cleaner.rb:15:in `block (3 levels) in <top (required)>'
     # ./spec/support/database_cleaner.rb:14:in `block (2 levels) in <top (required)>'

Finished in 0.05427 seconds (files took 0.88631 seconds to load)
2 examples, 2 failures
```

We can use Hanami's action generator to create both a route and an action. Run:

```shell
$ bundle exec hanami generate action books.show --skip-view
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

We can now edit the new action at `app/actions/books/show.rb` to add the required behaviour. Here, we use param validation to coerce `params[:id]` to an integer, render a book if there's one with a matching primary key, or return a 404 response. With this, our test passes.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Deps["persistence.rom"]

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          book = rom.relations[:books].by_pk(
            request.params[:id]
          ).one

          response.format = :json

          if book
            response.body = book.to_json
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

In addition to the `#one` method, which will return `nil` if there's no book with the requisite id, ROM relations also provide a `#one!` method, which instead raises a `ROM::TupleCountMismatchError` exception when no record is found.

We can use this to handle 404s via Hanami's action exception handling: `config.handle_exception`. This action configuration takes the name of a method to invoke when a particular exception occurs.

Taking this approach allows our handle method to concern itself only with the happy path:

```ruby
# app/actions/books/show.rb

require "rom"

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Deps["persistence.rom"]

        config.handle_exception ROM::TupleCountMismatchError => :handle_not_found

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          book = rom.relations[:books].by_pk(
            request.params[:id]
          ).one!

          response.format = :json
          response.body = book.to_json
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

module Bookshelf
  class Action < Hanami::Action
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
        include Deps["persistence.rom"]

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          book = rom.relations[:books].by_pk(
            request.params[:id]
          ).one!

          response.format = :json
          response.body = book.to_json
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

RSpec.describe "POST /books", type: [:request, :database] do
  let(:request_headers) do
    {"HTTP_ACCEPT" => "app/json", "CONTENT_TYPE" => "app/json"}
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
$ bundle exec hanami generate action books.create --skip-view
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
        def handle(*, response)
          response.body = self.class.name
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

We can now complete our create action by inserting a record into the books relation if the posted params are valid:

```ruby
module Bookshelf
  module Actions
    module Books
      class Create < Bookshelf::Action
        include Deps["persistence.rom"]

        params do
          required(:book).hash do
            required(:title).filled(:string)
            required(:author).filled(:string)
          end
        end

        def handle(request, response)
          if request.params.valid?
            book = rom.relations[:books].changeset(:create, request.params[:book]).commit

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

From here you might want to look in more detail at [routing](/v2.1/routing/overview/) and [actions](/v2.1/actions/overview/), or explore Hanami's [app architecture](/v2.1/app/container-and-components/), starting with its [component management](/v2.1/app/container-and-components/) and [dependency injection](/v2.1/app/container-and-components/) systems.

