---
title: Testing
order: 140
---

Hanami pays a lot of attention to code testability and it offers advanced features to make our lives easier.
The framework supports RSpec (default) and Minitest.

## Unit Tests

First of all, actions can be unit tested.
That means we can instantiate, exercise and verify expectations **directly on actions instances**.

```ruby
# spec/app/actions/books/index_spec.rb

RSpec.describe Bookshelf::Actions::Books::Index do
  let(:params) { Hash[] }

  it "works" do
    response = subject.call(params)
    expect(response).to be_successful
  end
end

```

In the example above, `action` is an instance of `Bookshelf::Actions::Books::Index`. We can invoke `#call` on it, passing a Hash of parameters.
The [implicit returning value](/actions/rack-integration) is a serialized Rack response.
We're asserting that the returned response is successful (status is in `2XX` range).

## Running Tests

We can run the entire test suite or a single file.

```ruby
# Run the whole tests suite
bundle exec rspec

# Run all tests from the single file
bundle exec rspec spec/actions/books/index_spec.rb
```

When we run tests, only minimal number of files are loaded to process the test. All the required dependencies and the application code (actions, repositories, etc..) are loaded on-demand, which makes it very fast to re-run test suits during programming.

## Params

When testing an action, we can easily simulate parameters and headers coming from the request.
We just need to pass them as a Hash.
Headers for Rack env such as `HTTP_ACCEPT` can be mixed with params like `:id`.

The following test example uses both.

```ruby
# spec/actions/books/show_spec.rb


RSpec.describe Bookshelf::Actions::Books::Show do
  let(:format)  { 'application/json' }
  let(:user_id) { '23' }
  let(:params) do
    { id: user_id, 'HTTP_ACCEPT' => format}
  end

  it "works" do
    response = subject.call(params)

    expect(response).to be_successful
    expect(response.headers['Content-Type']).to eq("#{ format }; charset=utf-8")
    expect(response.body).to eq(["ID: #{ user_id }"])
  end
end
```

Here the corresponding production code.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Users
      class Show < Action
        def handle(request, response)
          response.body = "ID: #{ request.params[:id] }"
        end
      end
    end
  end
end
```

<p class="notice">
Simulating request params and headers is simple for Hanami actions. We pass them as a <code>Hash</code> and they are transformed into an instance of <code>Hanami::Action::Params</code>.
</p>

## Dependency Injection

During unit testing, we may want to use mocks to make tests faster or to avoid hitting external systems like databases, file system or remote services.
Because we can instantiate actions during tests, we can  specify which collaborators we want to use via _dependency injection_.

Let's rewrite the test to the action fetching a user so that it does not hit the database.

```ruby
# spec/actions/books/show_spec.rb

RSpec.describe Bookshelf::Actions::Books::Show do
  let(:subject) { described_class.new(repository: repository) }
  let(:book) { { id: 23, name: 'Hanami Guides' } }
  let(:repository) { double('repository', find: user) }

  it "is successful" do
    response = subject.call(id: user.id)

    expect(response).to be_successful
    expect(subject.body).to eq(user.to_json)
  end
end
```

We have injected the repository dependency which is a mock in our case.
Here how to adapt our action.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Action
        include Deps[repository: 'repositories.books']

        def handle(request, response)
          response.body = repository.find(request.params[:id]).to_json
        end
      end
    end
  end
end
```

<p class="warning">
Please be careful using doubles in unit tests. Always verify that the mocks are in a true representation of the corresponding production code.
</p>

## Requests Tests

Unit tests are a great tool to assert that low level interfaces work as expected.
We always advise combining them with integration tests.

In the case of Hanami web applications, we can write features (aka acceptance tests) with Capybara, but what do we use when we are building HTTP APIs?
The tool that we suggest is `rack-test`.

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

<p class="notice">
We suggest to avoid <em>test doubles</em> when writing full integration tests, as we want to verify that the whole stack is behaving as expected.
</p>
