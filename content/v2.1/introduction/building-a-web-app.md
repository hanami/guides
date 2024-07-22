---
title: "Building a web app"
order: 20
---

Now that we've [created our app](/v2.1/introduction/getting-started/), let's turn it into a web app.

## Adding our first functionality

Let's take a look at Hanami by creating the beginnings of a bookshelf app.

In the file `spec/requests/root_spec.rb`, Hanami provides a request spec confirming the absence of a defined root page (which is why the welcome screen shows instead).

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

1 example, 0 failures
```

Let's change this to expect a page showing "Welcome to Bookshelf". First, we'll adjust our spec:

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    get "/"

    expect(last_response.body).to include "Welcome to Bookshelf"
    expect(last_response).to be_successful
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
     Failure/Error: expect(last_response.body).to include "Welcome to Bookshelf"
       expected "Not Found" to include "Welcome to Bookshelf"

1 example, 1 failure
```

To fix this, let's open our app's routes file at `config/routes.rb`:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    # Add your routes here. See https://guides.hanamirb.org/routing/overview/ for details.
  end
end
```

This `Bookshelf::Routes` class contains the configuration for our app's router. Routes in Hanami are comprised of a HTTP method, a path, and an endpoint to be invoked, which is usually a Hanami action. (See the [Routing guide](/v2.1/routing/overview/) for more information).

To help make our spec pass, let's add a route to invoke a new action.

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

       To fix this, define the action class Bookshelf::Actions::Home::Show in /Users/jane/bookshelf/actions/home/show.rb

1 example, 1 failure
```

As this error suggests, we need to create the home show action the route is expecting to be able to call.

Hanami provides an action generator we can use to create this action. Running this command will create the home show action:

```shell
$ bundle exec hanami generate action home.show
```

We can find this action in our `app` directory at `app/actions/home/show.rb`:

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(request, response)
        end
      end
    end
  end
end
```

In a Hanami app, every action is an individual class. Actions decide what HTTP response (body, headers and status code) to return for a given request.

Actions define a `#handle` method that accepts a `request` object, representing the incoming request, and a `response` object, representing the outgoing response.

```ruby
def handle(request, response)
  # ...
end
```

For more details on actions, see the [Actions guide](/v2.1/actions/overview/).

By default, an action will render its equivalent view. We can find our new view in our `app` directory at `app/views/home/show.rb`:

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

Just like actions, every view in a Hanami app is an individual class. Views prepare the values to be passed to a template, then render that template to generate their output.

We can find this view's template in our `app` directory at `app/templates/home/show.html.erb`. Let's adjust this template to include our desired "Welcome to Bookshelf" text.

```sql
# app/templates/home/show.html.erb

<h1>Welcome to Bookshelf</h1>
```

With this change, our root spec will now pass!

```shell
$ bundle exec rspec spec/requests/root_spec.rb

Root
  is successful

1 example, 0 failures
```

Request specs like these are suitable for testing API endpoints, but since we'll be creating HTML pages in our app, we'll want a more appropriate testing tool. For this, we'll use [Capybara](https://github.com/teamcapybara/capybara) feature specs.

Delete the `spec/requests/root_spec.rb` and replace it with a Capybara-driven test at `spec/features/home_spec.rb`:

```ruby
RSpec.feature "Home" do
  scenario "visiting the home page shows a welcome message" do
    visit "/"

    expect(page).to have_content "Welcome to Bookshelf"
  end
end
```

This new test should also pass:

```shell
$ bundle exec rspec spec/features/home_spec.rb

Home
  visiting the home page shows a welcome message

1 example, 0 failures
```

## Adding a new route and action

As the next step in our bookshelf project, let's add the ability to show an index of all books in the system.

First we'll create a request spec for listing books that expects a successful response, listing two books:

```ruby
# spec/features/books/index_spec.rb

RSpec.feature "Books index" do
  it "shows a list of books" do
    visit "/books"

    expect(page).to have_selector "li", text: "Test Driven Development"
    expect(page).to have_selector "li", text: "Practical Object-Oriented Design in Ruby"
  end
end
```

If you run this test, you'll see that it fails because the page doesn't have the expected content. This is because our app currently returns a 404 error page for the `/books` route.

Let's fix that by generating an action for a books index:

```shell
$ bundle exec hanami generate action books.index
```

In addition to generating an action at `app/actions/books/index.rb` and a view at `app/views/books/index.rb`, the generator has also added a route in `config/routes.rb`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
    get "/books", to: "books.index"
  end
end
```

If we run our spec again, our expectation for a successful response is now satisfied, but there's a different failure:

```shell
$ bundle exec rspec spec/features/books/index_spec.rb

Books index
  shows a list of books (FAILED - 1)

Failures:

  1) Books index shows a list of books
     Failure/Error: expect(page).to have_selector "li", text: "Test Driven Development"
       expected to find css "li" but there were no matches
     # ./spec/features/books/index_spec.rb:5:in `block (2 levels) in <top (required)>'

1 example, 1 failure
```

Our response is missing the list of books. Let's update our view to provide these books to our template:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        expose :books do
          [
            {title: "Test Driven Development"},
            {title: "Practical Object-Oriented Design in Ruby"}
          ]
        end
      end
    end
  end
end
```

Then we can update our template to present the books:

```sql
<!-- app/templates/books/index.html.erb -->

<h1>Books</h1>

<ul>
  <% books.each do |book| %>
    <li><%= book[:title] %></li>
  <% end %>
</ul>
```

If we run our spec, it now passes:

```shell
$ bundle exec rspec spec/features/books/index_spec.rb

Books index
  shows a list of books

1 example, 0 failures
```

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
  If you do not have Postgres installed, you can install it using <a href="https://brew.sh/">Homebrew</a>, <a href="https://asdf-vm.com/">asdf</a> or by following the installation instruction on the <a href="https://www.postgresql.org/">PostgreSQL website</a>.
</p>

With Postgres running, create databases for development and test using PostgreSQL's `createdb` command:

```shell
$ createdb bookshelf_development
$ createdb bookshelf_test
```

In Hanami, [providers](/v2.1/app/providers/) offer a mechanism for configuring and using complex dependencies, like database connections, within your app.

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

You can read more about Hanami's settings in the [App guide](/v2.1/app/settings/).

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
bookshelf[development]> app["settings"].database_url
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
  Hanami's 2.2 release, slated for 2024, will bring persistence as a first class feature, after which none of the above set up will be required.
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
$ bundle exec rake db:create_migration\[create_books\]
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
# spec/features/books/index_spec.rb

RSpec.feature "Books index" do
  let(:books) { Hanami.app["persistence.rom"].relations[:books] }

  before do
    books.insert(title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz")
    books.insert(title: "Test Driven Development", author: "Kent Beck")
  end

  it "shows a list of books" do
    visit "/books"

    expect(page).to have_selector "li", text: "Test Driven Development, by Kent Beck"
    expect(page).to have_selector "li", text: "Practical Object-Oriented Design in Ruby, by Sandi Metz"
  end
end
```

To get this spec to pass, we'll need to update our books index view to return books from the books relation.

To access the books relation within the view, we can use Hanami's "Deps mixin". Covered in detail in the [container and components](/v2.1/app/container-and-components/) section of the Architecture guide, the Deps mixin gives each of your app's components easy access to the other components it depends on to achieve its work. We'll see this in more detail as these guides progress.

For now however, it's enough to know that we can use `include Deps["persistence.rom"]` to make ROM available via a `rom` method within our view. The books relation is then available via `rom.relations[:books]`.

To satisfy our spec, we need to meet a few requirements. Firstly, we want to render each book's _title_ and _author_. Secondly we want to return books alphabetically by title. We can achieve these requirements by querying for books in our exposure, and using the `select` and `order` methods offered by the books relation:

```ruby
module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["persistence.rom"]

        expose :books do
          rom.relations[:books]
            .select(:title, :author)
            .order(:title)
            .to_a
        end
      end
    end
  end
end
```

<p class="convention">
  Accessing relations directly from app components like views and actions is not a commonly recommended pattern. Instead, a <a href="https://rom-rb.org/5.0/learn/repositories/quick-start/">ROM repository</a> should be used. Here, however, the repository is ommitted for brevity. Hanami's 2.2 release will offer repositories out of the box.
</p>

Then we can update our template to include the author:

```sql
<!-- app/templates/books/index.html.erb -->

<h1>Books</h1>

<ul>
  <% books.each do |book| %>
    <li><%= book[:title] %>, by <%= book[:author] %></li>
  <% end %>
</ul>
```

With this action in place, the spec passes once more:

```shell
$ bundle exec rspec spec/features/books/index_spec.rb

Books index
  shows a list of books

1 example, 0 failures
```

## Using request parameters

Of course, returning _every_ book in the database when a visitor makes a request to `/books` is not going to be a good strategy for very long. Luckily, ROM relations offer pagination support. Let's add pagination with a default page size of 5:

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

This will enable our books index to vary based on `page` and `per_page` params.

Let's add a request spec verifying pagination:

```ruby
# spec/features/books/index/pagination_spec.rb

RSpec.feature "Books index pagination" do
  let(:books) { Hanami.app["persistence.rom"].relations[:books] }

  before do
    10.times do |n|
      books.insert(title: "Book #{n}", author: "Author #{n}")
    end
  end

  it "returns the correct page of books" do
    visit "/books?page=1&per_page=3"

    expect(page).to have_selector "li", count: 3
    expect(page.find("li:nth-child(1)")).to have_content "Book 0, by Author 0"
    expect(page.find("li:nth-child(2)")).to have_content "Book 1, by Author 1"
    expect(page.find("li:nth-child(3)")).to have_content "Book 2, by Author 2"
  end
end
```

In our index action, we can use the request object to extract the relevant params from the incoming request, and then pass them as inputs to its view:

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          response.render(
            view,
            page: request.params[:page] || 1,
            per_page: request.params[:per_page] || 5
          )
        end
      end
    end
  end
end
```

In the view, we can update our books exposure to take these inputs and use them for the database query:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["persistence.rom"]

        expose :books do |page:, per_page:|
          rom.relations[:books]
            .select(:title, :author)
            .order(:title)
            .page(page)
            .per_page(per_page)
            .to_a
        end
      end
    end
  end
end
```

This alows our spec to pass!

```shell
$ bundle exec rspec spec/features/books/index/pagination_spec.rb

Books index pagination
  returns the correct page of books

1 example, 0 failures
```

## Showing a book

In addition to our books index, we also want to provide an endpoint for viewing the details of a particular book.

Let's specify a `/books/:id` request that renders a book for a given ID, or returns 404 if there's no book for with the given ID.

```ruby
# spec/features/books/show_spec.rb

RSpec.feature "Showing a book" do
  let(:books) { Hanami.app["persistence.rom"].relations[:books] }

  context "when a book matches the given ID" do
    let!(:book_id) do
      books.insert(title: "Test Driven Development", author: "Kent Beck")
    end

    it "shows the book" do
      visit "/books/#{book_id}"

      expect(page).to have_content "Test Driven Development"
      expect(page).to have_content "Kent Beck"
    end
  end

  context "when no book matches the given ID" do
    it "returns not found" do
      visit "/books/#{books.max(:id).to_i + 1}"

      expect(page.status_code).to eq 404
    end
  end
end
```

Because there's no matching route yet, the “happy path” side of this spec immediately fails.

```shell
$ bundle exec rspec spec/features/books/show_spec.rb

Showing a book
  when no book matches the given ID
    returns not found
  when a book matches the given ID
    shows the book (FAILED - 1)

Failures:

  1) Showing a book when a book matches the given ID shows the book
     Failure/Error: expect(page).to have_content "Test Driven Development"
       expected to find text "Test Driven Development" in "Not Found"
     # ./spec/features/books/show_spec.rb:12:in `block (3 levels) in <top (required)>'

2 examples, 1 failure
```

We can use Hanami's action generator to create both a route and an action. Run:

```shell
$ bundle exec hanami generate action books.show
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

We can now edit the new action at `app/actions/books/show.rb` to begin adding the required behaviour, passing the id param to its view.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        def handle(request, response)
          response.render(view, id: request.params[:id])
        end
      end
    end
  end
end
```

Then we can edit the view at `app/views/books/show.rb` to take this ID and expose a book to the template.

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps["persistence.rom"]

        expose :book do |id:|
          rom.relations[:books].by_pk(id).one
        end
      end
    end
  end
end
```

Lastly, we can populate the template.

```sql
<!-- app/views/books/show.html.erb -->

<h1><%= book[:title] %></h1>

<p>By <%= book[:author] %></p>
```

With this, our happy path test passes, but the test for our 404 now fails:

```shell
$ bundle exec rspec spec/features/books/show_spec.rb

Showing a book
  when a book matches the given ID
    shows the book
  when no book matches the given ID
    returns not found (FAILED - 1)

Failures:

  1) Showing a book when no book matches the given ID returns not found
     Failure/Error: <h1><%= book[:title] %></h1>

     NoMethodError:
       undefined method `[]' for nil:NilClass
     # ./app/templates/books/show.html.erb:1:in `__tilt_8300'
     # ./app/actions/books/show.rb:8:in `handle'
     # ./spec/features/books/show_spec.rb:19:in `block (3 levels) in <top (required)>'

2 examples, 1 failure
```

This is because our relation's `#one` method returns `nil` if there's no book with the requisite ID, leading to this "undefined method on NilClass" error from the template.

However, in addition to `#one`, ROM relations also provide a `#one!` method, which instead raises a `ROM::TupleCountMismatchError` exception when no record is found.

Let's make that change in our view now:

```ruby
# app/views/books/show.rb

expose :book do |id:|
  rom.relations[:books].by_pk(id).one!
end
```

We can use this to handle 404s via Hanami's action exception handling: `handle_exception`, which takes the name of a method to invoke when a particular exception occurs.

Taking this approach allows our handle method to remain concerned only with the happy path:

```ruby
# app/actions/books/show.rb

require "rom"

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        handle_exception ROM::TupleCountMismatchError => :handle_not_found

        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          response.render(view, id: request.params[:id])
        end

        private

        def handle_not_found(request, response, exception)
          response.status = 404
          response.format = :html
          response.body = "Not found"
        end
      end
    end
  end
end
```

With this, our spec fully passes:

```shell
$ bundle exec rspec spec/features/books/show_spec.rb

Showing a book
  when no book matches the given ID
    returns not found
  when a book matches the given ID
    shows the book

2 examples, 0 failures
```

This exception handling behavior can also be moved into the base `Bookshelf::Action` class at `app/action.rb`, meaning that any action inheriting from `Bookshelf::Action` will handle `ROM::TupleCountMismatchError` in the same way.

```ruby
# app/action.rb

require "rom"

module Bookshelf
  class Action < Hanami::Action
    handle_exception ROM::TupleCountMismatchError => :handle_not_found

    private

    def handle_not_found(request, response, exception)
      response.status = 404
      response.format = :html
      response.body = "Not found"
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
        params do
          required(:id).value(:integer)
        end

        def handle(request, response)
          response.render(view, id: request.params[:id])
        end
      end
    end
  end
end
```

## Creating a book

Now that our visitors can list and view books, let's allow them to create books too.

Here's a feature spec that fills in and submits a new book book form, and expects that only valid submissions result in a book being created:

```ruby
# spec/features/books/create_spec.rb

RSpec.feature "Creating books" do
  it "creates a book when given valid attributes" do
    visit "/books/new"

    fill_in "Title", with: "Practical Object-Oriented Design in Ruby"
    fill_in "Author", with: "Sandi Metz"
    click_on "Create"

    expect(page).to have_content "Book created"
    expect(page).to have_selector "h1", text: "Practical Object-Oriented Design in Ruby"
    expect(page).to have_selector "p", text: "Sandi Metz"
  end

  it "shows errors and does not create the book when given invalid attributes" do
    visit "/books/new"

    fill_in "Title", with: "Practical Object-Oriented Design in Ruby"
    click_on "Create"

    expect(page).to have_content "Could not create book"
    expect(page).to have_field "Title", with: "Practical Object-Oriented Design in Ruby"
    expect(page).to have_field "Author", with: ""
  end
end
```

Running this spec, we get a database-level error about "new" being an "invalid input syntax for type integer". This is because we have no specific route for this new book page, so "new" is being interpreted as an ID for the books show action.

Hanami's action generator can take care of this for us:

```shell
$ bundle exec hanami generate action books.new
```

Let's also generate a matching create action:

```shell
$ bundle exec hanami generate action books.create
```

The app's routes now include the expected routes - invoking the `books.new` action for GET requests to `/books/new`, and the `books.create` action for `POST` requests to `/books`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
    get "/books", to: "books.index"
    get "/books/:id", to: "books.show"
    get "/books/new", to: "books.new"
    post "/books", to: "books.create"
  end
end
```

Let's add some name aliases to these routes so we can easily refer to them later:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.show"
    get "/books", to: "books.index"
    get "/books/:id", to: "books.show", as: :show_book
    get "/books/new", to: "books.new"
    post "/books", to: "books.create", as: :create_book
  end
end
```

To show a form for creating a new book, we don't need any special handling in either its action or view classes, so we can jump straight to the template:

```sql
<!-- app/templates/books/new.html.erb -->

<h1>New book</h1>

<%= form_for :book, routes.path(:create_book) do |f| %>
  <p>
    <%= f.label "Title", for: :title %>
    <%= f.text_field :title %>
  </p>
  <p>
    <%= f.label "Author", for: :author %>
    <%= f.text_field :author %>
  </p>
  <p>
    <%= f.submit "Create" %>
  </p>
<% end %>
```

At this point, running the test hints at our next step:

```shell
$ bundle exec rspec spec/features/books/create_spec.rb

Creating books
  creates a book when given valid attributes (FAILED - 1)
  shows errors and does not create the book when given invalid attributes (FAILED - 2)

Failures:

  1) Creating books creates a book when given valid attributes
     Failure/Error: expect(page).to have_content "Book created"
       expected to find text "Book created" in "New book\nTitle\nAuthor\nCreate"
     # ./spec/features/books/create_spec.rb:9:in `block (2 levels) in <top (required)>'

  2) Creating books shows errors and does not create the book when given invalid attributes
     Failure/Error: expect(page).to have_content "Could not create book"
       expected to find text "Could not create book" in "New book\nTitle\nAuthor\nCreate"
     # ./spec/features/books/create_spec.rb:19:in `block (2 levels) in <top (required)>'

2 examples, 2 failures
```

The form submission appears to be proceeding, and now we need to handle what happens afterwards.

Our plan here is to use flash messages for displaying the notices about successful or failed book creation. To support these, we first need to enable cookie sessions for our app. To do this, add this to `config/app.rb`:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.actions.sessions = :cookie, {
      key: "bookshelf.session",
      secret: settings.session_secret,
      expire_after: 60*60*24*365
    }
  end
end
```

Then add a `session_secret` to your app's settings:

```ruby
# config/settings.rb

module Bookshelf
  class Settings < Hanami::Settings
    setting :database_url, constructor: Types::String
    setting :session_secret, constructor: Types::String
  end
end
```

And add a dummy secret to your `.env`:

```
SESSION_SECRET=__local_development_secret_only__
```

<p class="notice">
  See <a href="/v2.1/app/settings/#using-dotenv-to-manage-environment-variables">Using dotenv to manage environment variables</a> for recommendations on handling these files.
</p>

Next we can update the app layout to show the flash messages, if there are any:

```sql
<!-- app/templates/layouts/app.html.erb -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bookshelf</title>
    <%= favicon_tag %>
    <%= stylesheet_tag "app" %>
  </head>
  <body>
    <% if flash[:alert] %>
      <p><%= flash[:alert] %></p>
    <% end %>
    <% if flash[:notice] %>
      <p><%= flash[:notice] %></p>
    <% end %>

    <%= yield %>
    <%= javascript_tag "app" %>
  </body>
</html>
```

We can now complete our create action by inserting a book record into the books relation if the posted params are valid, then setting flash messages and redirecting as required:

```ruby
# app/actions/books/create.rb

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

            response.flash[:notice] = "Book created"
            response.redirect_to routes.path(:show_book, id: book[:id])
          else
            response.flash.now[:alert] = "Could not create book"
            # Implicitly re-renders the "new" view
          end
        end
      end
    end
  end
end
```

And our feature spec now passes!

```shell
$ bundle exec rspec spec/features/books/create_spec.rb

Creating books
  shows errors and does not create the book when given invalid attributes
  creates a book when given valid attributes

2 examples, 0 failures
```

## What's next

So far we've seen how to create a new Hanami app, explored some of the basics of how an app is structured, and seen how we can list, display and create a simple book entity while validating user input.

Still, we've barely touched the surface of what Hanami offers.

From here you might want to look in more detail at [routing](/v2.1/routing/overview/) and [actions](/v2.1/actions/overview/), or explore Hanami's [app architecture](/v2.1/app/container-and-components/), starting with its [component management](/v2.1/app/container-and-components/) and [dependency injection](/v2.1/app/container-and-components/) systems. Or you may want to head straight to the front end and learn more about Hanami's [views](/v2.1/views/overview/) and [assets management](/v2.1/assets/overview/)
