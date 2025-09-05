---
title: Testing
order: 140
---

Hanami actions are designed to be easy to test via a range of techniques.

The examples on this page use [RSpec](http://rspec.info), the test framework installed when you generate a new Hanami app.

## Testing actions

Actions are standalone objects with an interface that's easy to test. You can simply instantiate an action as your object under test and exercise its functionality.

```ruby
# spec/actions/books/index_spec.rb

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

In this example, `action` is an instance of `Bookshelf::Actions::Books::Index`. To make a request to the action, we can call it with an empty parameters hash. The return value is a serialized [Rack] response. In this test we're asserting that the returned response is successful (status is in `2XX` range).

[rack]: https://github.com/rack/rack

## Running Tests

To test your action, run `bundle exec rspec` with the path to your action's test file:

```shell
$ bundle exec rspec spec/actions/books/index_spec.rb
```

When you run the tests for a single action, Hanami will load only the smallest set of files required to run the test. The action's dependencies and any related app code is loaded on demand, which makes it very fast to run and re-run individual tests as part of your development flow.

Your action tests will also be included when you run the whole test suite:

```shell
$ bundle exec rspec
```

## Providing params and headers

When testing an action, you can simulate the parameters and headers coming from a request by passing them as a hash.

Rack expects the headers to be uppercased, underscored strings prefixed by `HTTP_` (like `"HTTP_ACCEPT" => "application/json"`), while your other request params can be regular keyword arguments.

The following test combines both params and headers.

```ruby
# spec/actions/books/show_spec.rb

RSpec.describe Bookshelf::Actions::Books::Show do
  subject(:action) do
    Bookshelf::Actions::Books::Index.new
  end

  it "returns a successful JSON response with book id" do
    response = subject.call(id: "23", "HTTP_ACCEPT" => "application/json")

    expect(response).to be_successful
    expect(response.headers["Content-Type"]).to eq("application/json; charset=utf-8")
    expect(JSON.parse(response.body[0])).to eq("id" => "23")
  end
end
```

Here's the example action that would make this test pass.

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Users
      class Show < Action
        format :json

        def handle(request, response)
          response.body = {id: request.params[:id]}.to_json
        end
      end
    end
  end
end
```

## Mocking action dependencies

You may wish to provide test doubles (also known as “mock objects”) to your actions under test to control their environment or avoid unwanted side effects.

Since we directly instantiate our actions in our tests, we can provide these test doubles via _dependency injection._

Let's write the test for an action that creates a book such that it does not hit the database.

```ruby
# spec/actions/books/create_spec.rb

RSpec.describe Bookshelf::Actions::Books::Create do
  subject(:action) do
    Bookshelf::Actions::Books::Create.new(user_repo: user_repo)
  end

  let(:user_repo) do
    instance_double(Bookshelf::UserRepo)
  end

  let(:book_params) do
    {title: "Hanami Guides"}
  end

  it "returns a successful response when valid book params are provided" do
    expect(user_repo).to receive(:create).with(book_params).and_return(book_params)

    response = action.call(book: book_params)

    expect(response).to be_successful
    expect(response.body[0]).to eq(book_params.to_json)
  end
end
```

We've injected the `user_repo` dependency with an RSpec test double. This would replace the default `"user_repo"` component for the following action.


```ruby
# app/actions/books/create.rb

module Bookshelf
  module Actions
    module Books
      class Create < Action
        include Deps["user_repo"]

        params do
          required(:book).hash do
            required(:title).value(:string)
          end
        end

        def handle(request, response)
          book = user_repo.create(request.params[:book])

          response.body = book.to_json
        end
      end
    end
  end
end
```

<p class="warning">
Use test doubles only when the side effects are difficult to handle in a test environment. Remember to <strong>mock only your own interfaces</strong> and <strong>always use verified doubles</strong>.
</p>

## Testing requests

Action tests are helpful for setting expectations on an action's low-level behavior. However, for many actions, testing end-to-end behavior may be more useful.

For this, you can write request specs using [rack-test](https://github.com/rack/rack-test), which comes included with your Hanami app.

```ruby
# spec/requests/root_spec.rb

RSpec.describe "Root", type: :request do
  it "is successful" do
    # Find me in `config/routes.rb`
    get "/"

    expect(last_response).to be_successful
    expect(last_response.body).to eq("Hello from Hanami")
  end
end
```

<p class="notice">
In many cases, you can rely on request tests and skip low-level action testing. Action tests only make sense when action logic becomes complex and you need to exercise many scenarios.
</p>

<p class="notice">
Avoid test doubles when writing request tests, since we want to verify that the whole stack is behaving as expected.
</p>
