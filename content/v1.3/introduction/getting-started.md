---
title: "Getting Started"
order: 10
aliases:
  - "/getting-started"
  - "/introduction/getting-started"
---

<p id="getting-started-lead" class="lead">
  Hello. If you're reading this page, it's very likely that you want to learn more about Hanami.
  That's great, congrats! If you're looking for new ways to build maintainable, secure, faster and testable web applications, you're in good hands.
  <br><br>
  <strong>Hanami is built for people like you.</strong>
  <br><br>
  I warn you that whether you're a total beginner or an experienced developer <strong>this learning process can be hard</strong>.
  Over time, we build expectations about how things should be, and it can be painful to change. <strong>But without change, there is no challenge</strong> and without challenge, there is no growth.
  <br><br>
  Sometimes a feature doesn't look right, that doesn't mean it's you.
  It can be a matter of formed habits, a design fallacy or even a bug.
  <br><br>
  Myself and the rest of the Community are putting best efforts to make Hanami better every day.
  <br><br>
  In this guide we will set up our first Hanami project and build a simple bookshelf web application.
  We'll touch on all the major components of Hanami framework, all guided by tests.
  <br><br>
  <strong>If you feel alone, or frustrated, don't give up, jump in our <a href="http://chat.hanamirb.org">chat</a> and ask for help.</strong>
  There will be someone more than happy to talk with you.
  <br><br>
  Enjoy,<br>
  Luca Guidi<br>
  <em>Hanami creator</em>
</p>

<br>
<hr>

## Prerequisites

Before we get started, let's get some prerequisites out of the way.
First, we're going to assume a basic knowledge of developing web applications.

You should also be familiar with [Bundler](http://bundler.io), [Rake](http://rake.rubyforge.org), working with a terminal and building apps using the [Model, View, Controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) paradigm.

Lastly, in this guide, we'll be using an [SQLite](https://sqlite.org/) database.
If you want to follow along, make sure you have a working installation of Ruby 2.3+ and SQLite 3+ on your system.

## Create a New Hanami Project

To create a new Hanami project, we need to install the Hanami gem from Rubygems.
Then we can use the new `hanami` executable to generate a new project:

```shell
$ gem install hanami
$ hanami new bookshelf
```

<p class="notice">
  By default, the project will be setup to use a SQLite database. For real-world projects, you can specify your engine:
  <br>
  <code>
    $ hanami new bookshelf --database=postgres
  </code>
</p>

This creates a new directory `bookshelf` in our current location.
Let's see what it contains:

```shell
$ cd bookshelf
$ tree -L 1
.
├── Gemfile
├── README.md
├── Rakefile
├── apps
├── config
├── config.ru
├── db
├── lib
├── public
└── spec

6 directories, 4 files
```

Here's what we need to know:

* `Gemfile` defines our Rubygems dependencies (using Bundler).
* `README.md` tells us how to set up and use the project.
* `Rakefile` describes our Rake tasks.
* `apps` contains one or more web applications compatible with Rack, where we can find the first generated Hanami application called `web`.
  It's the place where we find our controllers, views, routes and, templates.
* `config` contains configuration files.
* `config.ru` is for Rack servers.
* `db` contains our database schema and migrations.
* `lib` contains our business logic and domain model, including entities and repositories.
* `public` will contain compiled static assets.
* `spec` contains our tests.

Go ahead and install our gem dependencies with Bundler; then we can launch a development server:

```shell
$ bundle install
$ bundle exec hanami server
```

And... bask in the glory of your first Hanami project at
[http://localhost:2300](http://localhost:2300)! We should see a screen similar to this:

<p><img src="/introduction/welcome-page.png" alt="Hanami welcome page" class="img-responsive"></p>

## Hanami's Architecture

Hanami's architecture revolves around your project containing many `apps`.
These all live together in the same codebase, and exist in the same Ruby process.

They live under `apps/`.

By default, we have a `web` app, which can be thought of as the standard, user-facing web interface.
This is the most popular, so you'll probably want to keep it in your future Hanami projects.
However, there's nothing unique about this app, it's just so common that Hanami generates it for us.

Later (in a real project), we would add other apps, such as an `admin` panel, a JSON `api`, or an analytics `dashboard`.
We could also break our `web` app into smaller parts, extracting isolated pieces of functionality.
Hanami fully supports that, too!

Different `apps` represent __delivery mechanisms__.
That means they're different ways of interacting with the core of your project, or the "business logic".

Hanami doesn't want us to [repeat ourselves](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) therefore "business logic" is shared.
Web applications almost always store and interact with data stored in a database.
Both our "business logic" and our persistence live in `lib/`.

_(Hanami architecture is heavily inspired by [Clean Architecture](https://blog.8thlight.com/uncle-bob/2012/08/13/the-clean-architecture.html).)_

## Writing Our First Test

The opening screen we see when we point our browser at our app is a default page which is displayed when there are no routes defined.

Hanami encourages [Behavior Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development) (BDD) as a way to write web applications.
To get our first custom page to display, we'll write a high-level feature test:

```ruby
# spec/web/features/visit_home_spec.rb
require 'features_helper'

RSpec.describe 'Visit home' do
  it 'is successful' do
    visit '/'

    expect(page).to have_content('Bookshelf')
  end
end
```

Hanami is ready for a Behavior Driven Development (BDD) workflow out of the box, but **it is in no way bound to any particular testing framework**.
It does not come with any special testing integrations or libraries, so if you know RSpec (or Minitest), there's nothing new to learn there.

We have to migrate our schema in the test database by running:

```shell
$ HANAMI_ENV=test bundle exec hanami db prepare
```

The `HANAMI_ENV` at the beginning is an environment variable, which tells Hanami to use the `test` environment.
This is necessary here because the default is `HANAMI_ENV=development`.

<p class="notice">
If you have trouble, your <tt>DATABASE_URL</tt> is defined in <tt>.env.test</tt>
</p>


### Following a Request

Now we have a test; we can see it fail:

```shell
$ bundle exec rake
F.

Failures:

  1) Visit home is successful
     Failure/Error: expect(page).to have_content('Bookshelf')
       expected to find text "Bookshelf" in "404 - Not Found"
     # ./spec/web/features/visit_home_spec.rb:7:in `block (2 levels) in <top (required)>'

Finished in 0.02604 seconds (files took 1.14 seconds to load)
2 examples, 1 failure

Failed examples:

rspec ./spec/web/features/visit_home_spec.rb:4 # Visit home is successful
```

Now let's make it pass.
We'll add the code required to make this test pass, step-by-step.

The first thing we need to add is a route:

```ruby
# apps/web/config/routes.rb
root to: 'home#index'
```

We pointed our app's root URL to the `index` action of the `home` controller (see the [routing guide](/routing/overview) for more information).

If we run our tests, we'll get a `Hanami::Routing::EndpointNotFound` error.

That makes sense because we need to create the `home#index` action.

```ruby
# apps/web/controllers/home/index.rb
module Web
  module Controllers
    module Home
      class Index
        include Web::Action

        def call(params)
        end
      end
    end
  end
end
```

This is an empty action that doesn't do anything special.
Each action in Hanami is defined by [a single class](https://en.wikipedia.org/wiki/Single_responsibility_principle), which makes it simple to test.
Moreover, each action has a corresponding view, which is also defined by its class.
This one needs to be added in order to complete the request.

```ruby
# apps/web/views/home/index.rb
module Web
  module Views
    module Home
      class Index
        include Web::View
      end
    end
  end
end
```

It's also empty and doesn't do anything special.
Its only responsibility is to render a template, which is what views do by default.

This template is what we need to add, to make our tests pass.
All we need to do is add the bookshelf heading.

```erb
# apps/web/templates/home/index.html.erb
<h1>Bookshelf</h1>
```

Now let's run our test suite again.

```shell
$ bundle exec rake

Finished in 0.01394 seconds (files took 1.03 seconds to load)
2 examples, 0 failures
```

This means all our tests pass!

## Generating New Actions

Let's use our new knowledge about Hanami __routes__, __actions__, __views__, and __templates__.

The purpose of our sample Bookshelf project is to manage books.

We'll store books in our database and let the user manage them with our project.

Our first step is to list out all the books we know about.

Let's write a new feature test describing what we want to achieve:

```ruby
# spec/web/features/list_books_spec.rb
require 'features_helper'

RSpec.describe 'List books' do
  it 'displays each book on the page' do
    visit '/books'

    within '#books' do
      expect(page).to have_css('.book', count: 2)
    end
  end
end
```

This test means that when we go to [/books](http://localhost:2300/books),
we'll see two HTML elements that have class `book`,
and both will be inside of an HTML element that has an id of `books`.

Our test suite is `Unable to find visible css "#books"`.

Not only are we missing that element,
we don't even have a page to put that element on!

Let's create a new action to fix that.

### Hanami Generators

Hanami ships with a number of **generators**, which are tools that write some code for you.

In our terminal, let's run:

```shell
$ bundle exec hanami generate action web books#index
```

<p class="notice">
  If you're using ZSH and that doesn't work
  (with an error like <tt>zsh: no matches found: books#index</tt>),
  Hanami lets us write this instead: <tt>hanami generate action web books/index</tt>
</p>

This does a lot for us:

- Creating an action at `apps/web/controllers/books/index.rb` (and spec for it),
- Creating a view at `apps/web/views/books/index.rb` (and a spec for it),
- Creating a template at `apps/web/templates/books/index.html.erb`.

_(If you're confused by 'action' vs. 'controller': Hanami only has `action` classes, so a controller is just a module to group several related actions together.)_

These files are all pretty much empty.
They have some basic code in there, so Hanami knows how to use the class.
Thankfully we don't have to manually create those five files,
with that specific code in them.

The generator also adds a new route for us in the `web` app's routes file (`apps/web/config/routes.rb`).

```ruby
get '/books', to: 'books#index'
```

To make our tests pass,
we need to edit our newly generated template file in `apps/web/templates/books/index.html.erb`:

```html
<h1>Bookshelf</h1>
<h2>All books</h2>

<div id="books">
  <div class="book">
    <h3>Patterns of Enterprise Application Architecture</h3>
    <p>by <strong>Martin Fowler</strong></p>
  </div>

  <div class="book">
    <h3>Test Driven Development</h3>
    <p>by <strong>Kent Beck</strong></p>
  </div>
</div>
```

Now our tests pass!

We've used a generator to create a new end-point (page) in our application.

But, we've started to repeat ourselves.

In both our `books/index.html.erb` template,
and our `home/index.html.erb` template from above,
we have `<h1>Bookshelf</h1>`.

This is not a huge deal, but in a real application,
we'll likely have a logo or common navigation shared across all of the pages in our `app`.

Let's fix that repetition, to show how that works.

### Layouts

To avoid repeating ourselves in every single template, we can modify our layout template.
Let's edit `apps/web/templates/application.html.erb` to look like this:

```rhtml
<!DOCTYPE html>
<html>
  <head>
    <title>Web</title>
    <%= favicon %>
  </head>
  <body>
    <h1>Bookshelf</h1>
    <%= yield %>
  </body>
</html>
```

And remove the duplicate lines from the other templates,
since they're duplicated now.

A **layout template** is like any other template, but it is used to wrap your regular templates.
The `yield` line is replaced with the contents of our regular template.
It's the perfect place to put our repeating headers and footers.

## Modeling Our Data With Entities

Hard-coding books in our templates is, admittedly, kind of cheating.
Let's add some dynamic data to our application!

We'll store books in our database and display them on our page.
To do so, we need a way to read and write to our database.
There are two types of objects that we'll use for this:

* an **entity** is a domain object (a `Book`) that is uniquely identified by its identity,
* a **repository** is what we use to persist, retrieve, and delete data for an entity, in the persistence layer.

Entities are entirely unaware of the database.
This makes them **lightweight** and **easy to test**.

Since entities are completely decoupled from the database,
we use repositories to persist the data behind a `Book`.

_(We also use repositories to turn the data from the database back into a `Book`, and delete that data, too.)_

Read more about entities and repositories in the [models guide](/models/overview).

Hanami ships with a generator for models,
so let's use it to create a `Book` entity and its corresponding repository:

```shell
$ bundle exec hanami generate model book
create  lib/bookshelf/entities/book.rb
create  lib/bookshelf/repositories/book_repository.rb
create  db/migrations/20181024110038_create_books.rb
create  spec/bookshelf/entities/book_spec.rb
create  spec/bookshelf/repositories/book_repository_spec.rb
```

The generator gives us an entity, a repository, and their associated test files.

It also gives a database migration.

### Migrations To Change Our Database Schema

Let's modify the generated migration to include `title` and `author` fields:

```ruby
# db/migrations/20181024110038_create_books.rb

Hanami::Model.migration do
  change do
    create_table :books do
      primary_key :id

      column :title,  String, null: false
      column :author, String, null: false

      column :created_at, DateTime, null: false
      column :updated_at, DateTime, null: false
    end
  end
end
```

Hanami provides a DSL to describe changes to our database schema. You can read more
about how migrations work in the [migrations' guide](/migrations/overview).

In this case, we define a new table with columns for each of our entities' attributes.
Let's prepare our database for the development and test environments:

```shell
$ bundle exec hanami db prepare
$ HANAMI_ENV=test bundle exec hanami db prepare
```

### Working With Entities

An entity is something really close to a plain Ruby object.
We should focus on the behaviors that we want from it and only then, how to save it.

For now, we need to create a simple entity class:

```ruby
# lib/bookshelf/entities/book.rb
class Book < Hanami::Entity
end
```

This class will generate getters and setters for each attribute we pass to initialize `params`.
We can verify it all works as expected with a unit test:

```ruby
# spec/bookshelf/entities/book_spec.rb

RSpec.describe Book do
  it 'can be initialized with attributes' do
    book = Book.new(title: 'Refactoring')
    expect(book.title).to eq('Refactoring')
  end
end
```

### Using Repositories

Now we are ready to play around with our repository.
We can use Hanami's `console` command to launch `irb` with our application pre-loaded, so we can use our objects:

```shell
$ bundle exec hanami console
>> repository = BookRepository.new
=> #<BookRepository relations=[:books]>
>> repository.all
=> []
>> book = repository.create(title: 'TDD', author: 'Kent Beck')
=> #<Book:0x007f9ab61c23b8 @attributes={:id=>1, :title=>"TDD", :author=>"Kent Beck", :created_at=>2018-10-24 11:11:38 UTC, :updated_at=>2018-10-24 11:11:38 UTC}>
>> repository.find(book.id)
=> #<Book:0x007f9ab6181610 @attributes={:id=>1, :title=>"TDD", :author=>"Kent Beck", :created_at=>2018-10-24 11:11:38 UTC, :updated_at=>2018-10-24 11:11:38 UTC}>
```

Hanami repositories have methods to load one or more entities from our database, and to create and update existing records.
The repository is also the place where you would define new methods to implement custom queries.

To recap, we've seen how Hanami uses entities and repositories to model our data.
Entities represent our behavior, while repositories use mappings to translate our entities to our data store.
We can use migrations to apply changes to our database schema.

### Displaying Dynamic Data

With our new experience modeling data, we can get to work displaying dynamic data on our book listing page.
Let's adjust the feature test we created earlier:

```ruby
# spec/web/features/list_books_spec.rb
require 'features_helper'

RSpec.describe 'List books' do
  let(:repository) { BookRepository.new }
  before do
    repository.clear

    repository.create(title: 'PoEAA', author: 'Martin Fowler')
    repository.create(title: 'TDD',   author: 'Kent Beck')
  end

  it 'displays each book on the page' do
    visit '/books'

    within '#books' do
      expect(page).to have_selector('.book', count: 2), 'Expected to find 2 books'
    end
  end
end
```

We create the required records in our test and then assert the correct number of book classes on the page.
When we run this test, it should pass. If it does not pass, a likely reason is that the test database was not migrated.

Now we can change our template and remove the static HTML.
Our view needs to loop over all available records and render them.
Let's write a test to force this change in our view:

```ruby
# spec/web/views/books/index_spec.rb

RSpec.describe Web::Views::Books::Index do
  let(:exposures) { Hash[books: []] }
  let(:template)  { Hanami::View::Template.new('apps/web/templates/books/index.html.erb') }
  let(:view)      { described_class.new(template, exposures) }
  let(:rendered)  { view.render }

  it 'exposes #books' do
    expect(view.books).to eq(exposures.fetch(:books))
  end

  context 'when there are no books' do
    it 'shows a placeholder message' do
      expect(rendered).to include('<p class="placeholder">There are no books yet.</p>')
    end
  end

  context 'when there are books' do
    let(:book1)     { Book.new(title: 'Refactoring', author: 'Martin Fowler') }
    let(:book2)     { Book.new(title: 'Domain Driven Design', author: 'Eric Evans') }
    let(:exposures) { Hash[books: [book1, book2]] }

    it 'lists them all' do
      expect(rendered.scan(/class="book"/).length).to eq(2)
      expect(rendered).to include('Refactoring')
      expect(rendered).to include('Domain Driven Design')
    end

    it 'hides the placeholder message' do
      expect(rendered).to_not include('<p class="placeholder">There are no books yet.</p>')
    end
  end
end
```

We specify that our index page will show a simple placeholder message when there are no books to display; when there are, it lists every one of them.
Note how rendering a view with some data is relatively straight-forward.
Hanami is designed around simple objects with minimal interfaces that are easy to test in isolation, yet still work great together.

Let's rewrite our template to implement these requirements:

```erb
# apps/web/templates/books/index.html.erb
<h2>All books</h2>

<% if books.any? %>
  <div id="books">
    <% books.each do |book| %>
      <div class="book">
        <h2><%= book.title %></h2>
        <p><%= book.author %></p>
      </div>
    <% end %>
  </div>
<% else %>
  <p class="placeholder">There are no books yet.</p>
<% end %>
<a href="/books/new">New book</a>
```

If we run our feature test now, we'll see it fails — because our controller
action does not [_expose_](/actions/exposures) the books to our view. We can write a test for
that change:

```ruby
# spec/web/controllers/books/index_spec.rb

RSpec.describe Web::Controllers::Books::Index do
  let(:action) { described_class.new }
  let(:params) { Hash[] }
  let(:repository) { BookRepository.new }

  before do
    repository.clear

    @book = repository.create(title: 'TDD', author: 'Kent Beck')
  end

  it 'is successful' do
    response = action.call(params)
    expect(response[0]).to eq(200)
  end

  it 'exposes all books' do
    action.call(params)
    expect(action.exposures[:books]).to eq([@book])
  end
end
```

Writing tests for controller actions is basically two-fold: you either assert on the response object, which is a Rack-compatible array of status, headers, and content; or on the action itself, which will contain exposures after we've called it.
Now we've specified that the action exposes `:books`, we can implement our action:

```ruby
# apps/web/controllers/books/index.rb
module Web
  module Controllers
    module Books
      class Index
        include Web::Action

        expose :books

        def call(params)
          @books = BookRepository.new.all
        end
      end
    end
  end
end
```

By using the `expose` method in our action class, we can expose the contents of our `@books` instance variable to the outside world, so that Hanami can pass it to the view.
That's enough to make all our tests pass again!

```shell
$ bundle exec rake
Run options: --seed 59133

# Running:

.........

Finished in 0.042065s, 213.9543 runs/s, 380.3633 assertions/s.

6 runs, 7 assertions, 0 failures, 0 errors, 0 skips
```

## Building Forms To Create Records

One of the last remaining steps is to make it possible to add new books to the system.
The plan is simple: we build a page with a form to enter details.

When the user submits the form, we build a new entity, save it, and redirect the user back to the book listing.
Here's that story expressed in a test:

```ruby
# spec/web/features/add_book_spec.rb
require 'features_helper'

RSpec.describe 'Add a book' do
  after do
    BookRepository.new.clear
  end

  it 'can create a new book' do
    visit '/books/new'

    within 'form#book-form' do
      fill_in 'Title',  with: 'Example book'
      fill_in 'Author', with: 'Some author'

      click_button 'Create'
    end

    expect(page).to have_current_path('/books')
    expect(page).to have_content('Example book')
  end
end
```

### Laying The Foundations For A Form

By now, we should be familiar with the working of actions, views, and templates.

We'll speed things up a little, so we can quickly get to the good parts.
First, create a new action for our "New Book" page:

```shell
$ bundle exec hanami generate action web books#new
```

This adds a new route to our app:

```ruby
# apps/web/config/routes.rb
get '/books/new', to: 'books#new'
```

The interesting bit will be our new template, because we'll be using Hanami's form builder to construct a HTML form around our `Book` entity.

### Using Form Helpers

Let's use [form helpers](/helpers/forms) to build this form in `apps/web/templates/books/new.html.erb`:

```erb
# apps/web/templates/books/new.html.erb
<h2>Add book</h2>

<%=
  form_for :book, '/books' do
    div class: 'input' do
      label      :title
      text_field :title
    end

    div class: 'input' do
      label      :author
      text_field :author
    end

    div class: 'controls' do
      submit 'Create Book'
    end
  end
%>
```

We've added `<label>` tags for our form fields, and wrapped each field in a
container `<div>` using Hanami's [HTML builder helper](/helpers/html5).

### Submitting Our Form

To submit our form, we need yet another action.
Let's create a `Books::Create` action:

```shell
$ bundle exec hanami generate action web books#create
```

This adds a new route to our app:

```ruby
# apps/web/config/routes.rb
post '/books', to: 'books#create'
```

### Implementing Create Action

Our `books#create` action needs to do two things.
Let's express them as unit tests:

```ruby
# spec/web/controllers/books/create_spec.rb

RSpec.describe Web::Controllers::Books::Create do
  let(:action) { described_class.new }
  let(:params) { Hash[book: { title: 'Confident Ruby', author: 'Avdi Grimm' }] }
  let(:repository) { BookRepository.new }

  before do
    repository.clear
  end

  it 'creates a new book' do
    action.call(params)
    book = repository.last

    expect(book.id).to_not be_nil
  end

  it 'redirects the user to the books listing' do
    response = action.call(params)

    expect(response[0]).to eq(302)
    expect(response[1]['Location']).to eq('/books')
  end
end
```

Making these tests pass is easy enough.
We've already seen how we can write entities to our database, and we can use `redirect_to` to implement our redirection:

```ruby
# apps/web/controllers/books/create.rb
module Web
  module Controllers
    module Books
      class Create
        include Web::Action

        def call(params)
          BookRepository.new.create(params[:book])

          redirect_to '/books'
        end
      end
    end
  end
end
```

This minimal implementation should suffice to make our tests pass.

```shell
$ bundle exec rake
Run options: --seed 63592

# Running:

...............

Finished in 0.081961s, 183.0142 runs/s, 305.0236 assertions/s.

12 runs, 14 assertions, 0 failures, 0 errors, 2 skips
```

Congratulations!

### Securing Our Form With Validations

Hold your horses! We need some extra measures to build a truly robust form.
Imagine what would happen if the user were to submit the form without entering any values?

We could fill our database with bad data or see an exception for data integrity violations.
We clearly need a way of keeping invalid data out of our system!

To express our validations in a test, we need to wonder: what _would_ happen if our validations failed?
One option would be to re-render the `books#new` form, so we can give our users another shot at completing it correctly.
Let's specify this behaviour as unit tests:

```ruby
# spec/web/controllers/books/create_spec.rb

RSpec.describe Web::Controllers::Books::Create do
  let(:action) { described_class.new }
  let(:repository) { BookRepository.new }

  before do
    repository.clear
  end

  context 'with valid params' do
    let(:params) { Hash[book: { title: 'Confident Ruby', author: 'Avdi Grimm' }] }

    it 'creates a new book' do
      action.call(params)
      book = repository.last

      expect(book.id).to_not be_nil
      expect(book.title).to eq(params.dig(:book, :title))
    end

    it 'redirects the user to the books listing' do
      response = action.call(params)

      expect(response[0]).to eq(302)
      expect(response[1]['Location']).to eq('/books')
    end
  end

  context 'with invalid params' do
    let(:params) { Hash[book: {}] }

    it 'returns HTTP client error' do
      response = action.call(params)
      expect(response[0]).to eq(422)
    end

    it 'dumps errors in params' do
      action.call(params)
      errors = action.params.errors

      expect(errors.dig(:book, :title)).to eq(['is missing'])
      expect(errors.dig(:book, :author)).to eq(['is missing'])
    end
  end
end
```

Now our tests specify two alternative scenarios: our original happy path, and a new scenario in which validations fail.
To make our tests pass, we need to implement validations.

Although you can add validation rules to the entity, Hanami also allows you to define validation rules as close to the source of the input as possible, i.e., the action.
Hanami controller actions can use the `params` class method to define acceptable incoming parameters.

This approach both whitelists what `params` are used (others are discarded to prevent mass-assignment vulnerabilities from untrusted user input) _and_ adds rules to define what values are acceptable — in this case, we've specified that the nested attributes for a book's title and author should be present.

With our validations in place, we can limit our entity creation and redirection to cases where the incoming `params` are valid:

```ruby
# apps/web/controllers/books/create.rb
module Web
  module Controllers
    module Books
      class Create
        include Web::Action

        expose :book

        params do
          required(:book).schema do
            required(:title).filled(:str?)
            required(:author).filled(:str?)
          end
        end

        def call(params)
          if params.valid?
            @book = BookRepository.new.create(params[:book])

            redirect_to '/books'
          else
            self.status = 422
          end
        end
      end
    end
  end
end
```

When the `params` are valid, the Book is created, and the action redirects to a different URL.
However, when the `params` are not valid, what happens?

First, the HTTP status code is set to
[422 (Unprocessable Entity)](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#422).
Then the control will pass to the corresponding view, which needs to know which template to render.
In this case, `apps/web/templates/books/new.html.erb` will be used to render the form again.

```ruby
# apps/web/views/books/create.rb
module Web
  module Views
    module Books
      class Create
        include Web::View
        template 'books/new'
      end
    end
  end
end
```

This approach will work nicely because Hanami's form builder is smart enough to inspect the `params` in this action and populate the form fields with values found in the `params`.
If the user fills in only one field before submitting, they are presented with their original input, saving them the frustration of typing it again.

Run your tests again and see they are all passing again!

### Displaying Validation Errors

Rather than just shoving the user a form under their nose when something has gone wrong, we should give them a hint of what's expected of them. Let's adapt our form to show a notice about invalid fields.

First, we expect a list of errors to be included in the page when `params` contains errors:

```ruby
# spec/web/views/books/new_spec.rb

RSpec.describe Web::Views::Books::New do
  let(:params)    { OpenStruct.new(valid?: false, error_messages: ['Title must be filled', 'Author must be filled']) }
  let(:exposures) { Hash[params: params] }
  let(:template)  { Hanami::View::Template.new('apps/web/templates/books/new.html.erb') }
  let(:view)      { described_class.new(template, exposures) }
  let(:rendered)  { view.render }

  it 'displays list of errors when params contains errors' do
    expect(rendered).to include('There was a problem with your submission')
    expect(rendered).to include('Title must be filled')
    expect(rendered).to include('Author must be filled')
  end
end
```

We should also update our feature spec to reflect this new behavior:

```ruby
# spec/web/features/add_book_spec.rb
require 'features_helper'

RSpec.describe 'Add a book' do
  # Spec written earlier omitted for brevity

  it 'displays list of errors when params contains errors' do
    visit '/books/new'

    within 'form#book-form' do
      click_button 'Create'
    end

    expect(current_path).to eq('/books')

    expect(page).to have_content('There was a problem with your submission')
    expect(page).to have_content('Title must be filled')
    expect(page).to have_content('Author must be filled')
  end
end
```

In our template, we can loop over `params.error_messages` (if there are any) and display a friendly message.
Open up `apps/web/templates/books/new.html.erb`:

```erb
<% unless params.valid? %>
  <div class="errors">
    <h3>There was a problem with your submission</h3>
    <ul>
      <% params.error_messages.each do |message| %>
        <li><%= message %></li>
      <% end %>
    </ul>
  </div>
<% end %>
```

Run your tests again and see they are all passing again!

```shell
$ bundle exec rake
Run options: --seed 59940

# Running:

..................

Finished in 0.078112s, 230.4372 runs/s, 473.6765 assertions/s.

15 runs, 27 assertions, 0 failures, 0 errors, 1 skips
```

### Improving Our Use Of The Router

The last improvement we are going to make is in the use of our router.
Open up the routes file for the "web" application:

```ruby
# apps/web/config/routes.rb
post '/books',    to: 'books#create'
get '/books/new', to: 'books#new'
get '/books',     to: 'books#index'
root              to: 'home#index'
```

Hanami provides a convenient helper method to build these REST-style routes that we can use to simplify our router a bit:

```ruby
root to: 'home#index'
resources :books, only: [:index, :new, :create]
```

To get a sense of what routes are defined, now we've made this change, you can
use the special command-line task `routes` to inspect the end result:

```shell
$ bundle exec hanami routes
     Name Method     Path                           Action

     root GET, HEAD  /                              Web::Controllers::Home::Index
    books GET, HEAD  /books                         Web::Controllers::Books::Index
 new_book GET, HEAD  /books/new                     Web::Controllers::Books::New
    books POST       /books                         Web::Controllers::Books::Create
```

The output for `hanami routes` shows you the name of the defined helper method (you can suffix this name with `_path` or `_url` and call it on the `routes` helper), the allowed HTTP method, the path and finally the controller action that will be used to handle the request.

Now we've applied the `resources` helper method; we can take advantage of the named route methods.
Remember how we built our form using `form_for`?

```erb
# apps/web/templates/books/new.html.erb
<h2>Add book</h2>

<%=
  form_for :book, '/books' do
    # ...
  end
%>
```

It's silly to include a hard-coded path in our template when our router is already perfectly aware of which route to point the form to.
We can use the `routes` helper method that is available in our views and actions to access route-specific helper methods:

```erb
# apps/web/templates/books/new.html.erb
<h2>Add book</h2>

<%=
  form_for :book, routes.books_path do
    # ...
  end
%>
```

We can make a similar change in `apps/web/controllers/books/create.rb`:

```ruby
redirect_to routes.books_path
```

## Wrapping Up

**Congratulations on completing your first Hanami project!**

Let's review what we've done: we've traced requests through Hanami's major frameworks to understand how they relate to each other; we've seen how we can model our domain using entities and repositories; we've seen solutions for building forms, maintaining our database schema, and validating user input.

We've come a long way, but there's still plenty more to explore.
Explore the [other guides](/), the [Hanami API documentation](https://docs.hanamirb.org), read the [source code](https://github.com/hanami) and follow the [blog](http://hanamirb.org/blog).

**Above all, enjoy building amazing things!**
