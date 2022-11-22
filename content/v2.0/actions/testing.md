---
title: Testing
order: 140
---

Hanami pays a lot of attention to code testability and it offers advanced features to make our lives easier. The framework supports RSpec (default) and Minitest.

## Testing Actions

Actions are standalone objects with an interface that's easy to test. You can simply instantiate an action as your object under test and exercise its functionality.

```ruby
# spec/app/actions/books/index_spec.rb

RSpec.describe Bookshelf::Actions::Books::Index do
  subject(:action) do
    Bookshelf::Actions::Books::Index.new
  end

  it "returns a successful response with empty params" do
    response = action.call({})
    expect(response).to be_successful
  end
end

```

In the example above, `action` is an instance of `Bookshelf::Actions::Books::Index`. We can simply call it with an empty parameters hash. The [return value](/actions/rack-integration) is a serialized Rack response. We're asserting that the returned response is successful (status is in `2XX` range).

## Running Tests

We can run the entire test suite or a single file.

```ruby
# Run the whole tests suite
bundle exec rspec

# Run all tests from the single file
bundle exec rspec spec/actions/books/index_spec.rb
```

When we run tests, only minimal number of files are loaded to process the test. All the required dependencies and the application code (actions, repositories, etc..) are loaded on-demand, which makes it very fast to re-run individual tests during development cycles.

## Params

When testing an action, we can easily simulate parameters and headers coming from a request by passing them as a Hash. Headers for Rack env such as `HTTP_ACCEPT` can be mixed with params like `:id`.

The following test example uses both.

```ruby
# spec/actions/books/show_spec.rb

RSpec.describe Bookshelf::Actions::Books::Show do
  subject(:action) do
    Bookshelf::Actions::Books::Index.new
  end

  it "returns a successful JSON response with book id" do
    response = subject.call(id: "23", "HTTP_ACCEPT" => "application/json")

    expect(response).to be_successful
    expect(response.headers['Content-Type']).to eql("#{ format }; charset=utf-8")
    expect(JSON.parse(response.body)).to eql({"id" => "23"})
  end
end
```

Here's an example action class that would make this test pass:

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Users
      class Show < Action
        format :json

        def handle(request, response)
          response.body = {id: request.params[:id]}
        end
      end
    end
  end
end
```

<p class="notice">
Simulating request params and headers is simple for Hanami actions. We pass them as a <code>Hash</code> and they are transformed into an instance of <code>Hanami::Action::Params</code>.
</p>

## Mocking action dependencies

During testing, we may want to use mocks to avoid any unwanted side-effects. Because we can instantiate actions during tests, we can specify which collaborators we want to use via _dependency injection_.

Let's rewrite the test for an action that fetches a user so that it does not hit the database.

```ruby
# spec/actions/books/create_spec.rb

RSpec.describe Bookshelf::Actions::Books::Create do
  subject(:action) do
    Bookshelf::Actions::Books::Create.new(mailer: mailer)
  end

  let(:mailer) do
    instance_double(Bookshelf::Mailer, notify_users: book)
  end

  let(:book) do
    {title: "Hanami Guides"}
  end

  it "returns a successful response when valid book params are provided" do
    response = action.call(book: book)

    expect(response).to be_successful
    expect(response.body).to eql(book.to_json)
  end
end
```

We have injected the mailer dependency which is a mock in our case. Here's how you can adapt your action.

```ruby
# app/actions/books/create.rb

module Bookshelf
  module Actions
    module Books
      class Create < Action
        include Deps["user_repo", "mailer"]

        params do
          required(:book).hash do
            required(:title).value(:string)
          end
        end

        def handle(request, response)
          book = user_repo.create(request.params[:book])
          mailer.notify_users(book)

          response.body = book.to_json
        end
      end
    end
  end
end
```

<p class="warning">
It is recommended to use mocks only when the side-effects are difficult to handle in a test environment. Please also remember to only <strong>mock your own interfaces</strong> and <strong>always use verified doubles</strong>.
</p>

## Requests Tests

Action tests are a great tool to assert that low level interfaces work as expected. We always advise combining them with request tests as they exercise the entire stack.

In case of Hanami web applications, you can write features (aka acceptance tests) with Capybara, but what do we use when we are building HTTP APIs? The tool that we suggest is `rack-test`.

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    get "/"

    # Find me in `config/routes.rb`
    expect(last_response).to be_successful
    expect(last_response.body).to eql("Hello from Hanami")
  end
end
```

<p class="notice">
In many cases, you can rely on request tests and skip low level action testing. Action tests only make sense when action logic becomes complex and you need to exercise many scenarios.
</p>

<p class="notice">
It is recommended to avoid <em>test doubles</em> when writing full integration tests, as we want to verify that the whole stack is behaving as expected.
</p>
