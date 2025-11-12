---
title: "Building a web app"
order: 20
---

Now that we've [created our app](/v2.3/introduction/getting-started/), let's turn it into a web app.

## Adding our first functionality

Let's take a look at Hanami by creating the beginnings of a bookshelf app.

We'll start by creating a home page that displays "Welcome to Bookshelf".

First, let's open our app's routes file at `config/routes.rb`:

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    # Add your routes here. See https://guides.hanamirb.org/routing/overview/ for details.
  end
end
```

This `Bookshelf::Routes` class contains the configuration for our app's router. Routes in Hanami are comprised of a HTTP method, a path, and an endpoint to be invoked, which is usually a Hanami action. (See the [Routing guide](/v2.3/routing/overview/) for more information).

Let's add a route for our home page that invokes a new action.

```ruby
# config/routes.rb

module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
  end
end
```

Hanami provides an action generator we can use to create this action. Running this command will create the home show action:

```shell
$ bin/hanami generate action home.index --skip-route --skip-tests
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

Actions define a `#handle` method that accepts a `request` object, representing the incoming request, and a `response` object, representing the outgoing response.

```ruby
def handle(request, response)
  # ...
end
```

For more details on actions, see the [Actions guide](/v2.3/actions/overview/).

By default, an action will render its matching view. We can find our new view at `app/views/home/index.rb`:

```ruby
# app/views/home/index.rb

module Bookshelf
  module Views
    module Home
      class Index < Bookshelf::View
      end
    end
  end
end
```

Just like actions, every view in a Hanami app is an individual class. Views prepare the values to be passed to a template, then render that template to generate their output.

We can find this view's template at `app/templates/home/index.html.erb`. Let's adjust this template to include our desired "Welcome to Bookshelf" text.

```sql
# app/templates/home/index.html.erb

<h1>Welcome to Bookshelf</h1>
```

### Seeing your changes

Now that we've created our first page, let's start the development server and see it in action.

Run the following command to start the server:

```shell
$ bin/hanami dev
```

This starts Hanami's development server, which watches for file changes and automatically reloads your app as you work.

Once the server is running, visit [http://localhost:2300](http://localhost:2300) in your browser. You should see "Welcome to Bookshelf" displayed on the page.

Keep the dev server running as you continue through this guide - you'll be able to refresh your browser to see your changes as you make them.

## Adding a new route and action

As the next step in our bookshelf project, let's add the ability to show an index of all books in the system.

First, let's set up a RESTful route for listing books by using the `resources` helper in `config/routes.rb`:

```ruby
module Bookshelf
  class Routes < Hanami::Routes
    root to: "home.index"
    resources :books, only: [:index]
  end
end
```

The `resources` helper can create seven standard RESTful routes for a resource:

- `GET /books` → `"books.index"` (list all books)
- `GET /books/new` → `"books.new"` (form for a new book)
- `POST /books` → `"books.create"` (create a book)
- `GET /books/:id` → `"books.show"` (show a specific book)
- `GET /books/:id/edit` → `"books.edit"` (form for editing a book)
- `PATCH /books/:id` → `"books.update"` (update a book)
- `DELETE /books/:id` → `"books.destroy"` (delete a book)

In this guide, we'll implement the index, show, new, and create actions. We use the `only:` option to specify which routes to create, adding each action as we implement it.

Now let's generate an action for the books index:

```shell
$ bin/hanami generate action books.index --skip-route --skip-tests
```

Since we've already defined our routes using `resources`, we use the `--skip-route` flag to prevent the generator from adding a duplicate route.

Let's update our view to provide the books to our template:

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

Now visit [http://localhost:2300/books](http://localhost:2300/books) to see your books index. You should see the two hardcoded books displayed.

## Listing books from a database

Of course, returning a static list of books is not particularly useful. Let's address this by retrieving books from a database.

### Preparing a books table

To create a books table, we need to generate a migration:

```shell
$ bin/hanami generate migration create_books
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
$ bin/hanami db migrate
```

Next, let's generate a relation to allow our app to interact with our books table. To generate a relation:

```shell
$ bin/hanami generate relation books
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

Now we need to update our books index view to retrieve books from our database. For this we can generate a book repo:

```shell
$ bin/hanami generate repo book
```

Repos serve as the interface to our persisted data from our domain layer. Let's edit the repo to add a method that returns all books ordered by title:

```ruby
# app/repos/book_repo.rb

module Bookshelf
  module Repos
    class BookRepo < Bookshelf::DB::Repo
      def all_by_title
        books.order(books[:title].asc).to_a
      end
    end
  end
end
```

To access this book repo from the view, we can use Hanami's Deps mixin. Covered in detail in the [container and components](/v2.3/app/container-and-components/) section of the Architecture guide, the Deps mixin gives each of your app's components easy access to the other components it depends on to achieve its work. We'll see this in more detail as these guides progress.

For now however, it's enough to know that we can use `include Deps["repos.book_repo"]` to make the repo available via a `book_repo` method within our view.

We can now call this repo from our exposure:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :books do
          book_repo.all_by_title
        end
      end
    end
  end
end
```

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

### Verifying the database integration

With our books table created and our app configured to read from it, let's add some books to the database and verify everything is working.

Start Hanami's interactive console:

```shell
$ bin/hanami console
```

Then create a few books:

```ruby
bookshelf[development]> books_relation = app["relations.books"]
bookshelf[development]> books_relation.insert(title: "Test Driven Development", author: "Kent Beck")
bookshelf[development]> books_relation.insert(title: "Practical Object-Oriented Design in Ruby", author: "Sandi Metz")
bookshelf[development]> books_relation.insert(title: "The Pragmatic Programmer", author: "Dave Thomas and Andy Hunt")
```

Now refresh [http://localhost:2300/books](http://localhost:2300/books) in your browser. You should see your books listed with their authors, ordered alphabetically by title.

## Using request parameters

Of course, returning _every_ book in the database when a visitor makes a request to `/books` is not going to be a good strategy for very long. Luckily, relations offer pagination support. Let's add pagination with a default page size of 5:

```ruby
# app/relations/books.rb

module Bookshelf
  module Relations
    class Books < Bookshelf::DB::Relation
      schema :books, infer: true

      use :pagination
      per_page 2
    end
  end
end
```

This will enable our books index to vary based on `page` and `per_page` params.

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
            per_page: request.params[:per_page] || 2
          )
        end
      end
    end
  end
end
```

In the view, we can update our books exposure to take these inputs and pass them to the repo method:

```ruby
# app/views/books/index.rb

module Bookshelf
  module Views
    module Books
      class Index < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :books do |page:, per_page:|
          book_repo.all_by_title(page:, per_page:)
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
          .order(books[:title].asc)
          .page(page)
          .per_page(per_page)
          .to_a
      end
    end
  end
end
```

Now refresh [http://localhost:2300/books](http://localhost:2300/books) and you'll see only the first two books. Try visiting [http://localhost:2300/books?page=2](http://localhost:2300/books?page=2) to see the second page.

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
$ bin/hanami generate action books.show --skip-route --skip-tests
```

We can now edit the action at `app/actions/books/show.rb` to begin adding the required behaviour, passing the id param to its view.

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

To fetch a single book from our database, we can add a new method to our book repo:

```ruby
# app/repos/book_repo.rb

def get(id)
  books.by_pk(id).one
end
```

Then we can edit the view at `app/views/books/show.rb` to get the book via the repo and expose it to the template:

```ruby
# app/views/books/show.rb

module Bookshelf
  module Views
    module Books
      class Show < Bookshelf::View
        include Deps["repos.book_repo"]

        expose :book do |id:|
          book_repo.get(id)
        end
      end
    end
  end
end
```

Lastly, we can populate the template.

```sql
<!-- app/templates/books/show.html.erb -->

<h1><%= book.title %></h1>

<p>By <%= book.author %></p>
```

Visit [http://localhost:2300/books/1](http://localhost:2300/books/1) to see the details for the first book. You can replace the `1` with any book ID from your database.

### Handling missing books

What happens if someone requests a book that doesn't exist? Currently our repo's `get` method uses `#one`, which returns `nil` when no record is found. Relations also provide a `#one!` method, which instead raises a `ROM::TupleCountMismatchError` exception when no record is found.

Let's use `#one!` in our repo:

```ruby
# app/repos/book_repo.rb

def get(id)
  books.by_pk(id).one!
end
```

We can handle this exception via Hanami's action exception handling: `handle_exception`, which takes the name of a method to invoke when a particular exception occurs.

Let's add this to the base `Bookshelf::Action` class at `app/action.rb`, so that any action inheriting from `Bookshelf::Action` will handle `ROM::TupleCountMismatchError` by returning a 404 response:

```ruby
# app/action.rb

module Bookshelf
  class Action < Hanami::Action
    # Provide `Success` and `Failure` for pattern matching on operation results
    include Dry::Monads[:result]

    handle_exception "ROM::TupleCountMismatchError" => :handle_not_found

    private

    def handle_not_found(request, response, exception)
      response.status = 404
      response.format = :html
      response.body = "Not found"
    end
  end
end
```

With this in place, our `Books::Show` action can remain focused on the happy path, and will automatically return a 404 response when a book isn't found.

Try visiting [http://localhost:2300/books/999](http://localhost:2300/books/999) in your browser. You should see a "Not found" message with a 404 status code.

## Creating a book

Now that our visitors can list and view books, let's allow them to create books too.

First, let's update our routes to add the `:new` and `:create` actions:

```ruby
# config/routes.rb

resources :books, only: [:index, :show, :new, :create]
```

This adds routes for creating books:

- `GET /books/new` → `books.new` (to show the form)
- `POST /books` → `books.create` (to handle the form submission)

Now let's generate both actions:

```shell
$ bin/hanami generate action books.new --skip-route --skip-tests
$ bin/hanami generate action books.create --skip-route --skip-tests
```

To show a form for creating a new book, we don't need any special handling in either its action or view classes, so we can jump straight to the template:

```sql
<!-- app/templates/books/new.html.erb -->

<h1>New book</h1>

<%= form_for :book, routes.path(:books) do |f| %>
  <div>
    <%= f.label "Title", for: :title %>
    <%= f.text_field :title %>
  </div>
  <div>
    <%= f.label "Author", for: :author %>
    <%= f.text_field :author %>
  </div>
  <div>
    <%= f.submit "Create" %>
  </div>
<% end %>
```

### Handling form submissions

Now that we have a form for creating books, we need to handle what happens when the form is submitted.

We'll use flash messages to display notices about successful or failed book creation. To support these, we first need to enable cookie sessions for our app. To do this, add this to `config/app.rb`:

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
    setting :session_secret, constructor: Types::String
  end
end
```

And add a dummy secret to your `.env`:

```
SESSION_SECRET=__local_dev_secret_only_______________________________64_chars__
```

<p class="notice">
  See <a href="/v2.3/app/settings/#using-dotenv-to-manage-environment-variables">Using dotenv to manage environment variables</a> for recommendations on handling these files.
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

To complete our create action, we can add a method to our book repo to create new books:

```ruby
# app/repos/book_repo.rb

def create(attributes)
  books.changeset(:create, attributes).commit
end
```

In the action, we can then create this book if the posted params are valid, then setting flash messages and redirecting as required:

```ruby
# app/actions/books/create.rb

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

            response.flash[:notice] = "Book created"
            response.redirect_to routes.path(:book, id: book[:id])
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

Now visit [http://localhost:2300/books/new](http://localhost:2300/books/new) to see your new book form. Try creating a book - if you fill in both fields and submit, you'll be redirected to the newly created book's page with a success message. If you try to submit an empty form, you'll see an error message.

## What's next

So far we've seen how to create a new Hanami app, explored some of the basics of how an app is structured, and seen how we can list, display and create a simple book entity while validating user input.

Still, we've barely touched the surface of what Hanami offers.

From here you might want to look in more detail at [routing](/v2.3/routing/overview/) and [actions](/v2.3/actions/overview/), or explore Hanami's [app architecture](/v2.3/app/container-and-components/), starting with its [component management](/v2.3/app/container-and-components/) and [dependency injection](/v2.3/app/container-and-components/) systems. Or you may want to head straight to the front end and learn more about Hanami's [views](/v2.3/views/overview/) and [assets management](/v2.3/assets/overview/)
