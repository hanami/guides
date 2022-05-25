---
title: Testing
order: 40
---

Hanami has built-in facilities for routing unit tests.

## Path Generation

We can assert the generated routes. To do so, we're gonna create a spec file for the purpose.
`Web::Application.router` is the object that holds all the routes for the application named `Web`.

It exposes a method to generate a path, which takes the as a symbol. [name of a route](v2.0/router/basic-usage#named-routes).

Here's how to test it.

Given we have the definition of routes as follows:

```ruby
module Web
  class Routes < Hanami::Application::Routes
    define do
      slice :main, at: "/" do
        root to: "home.show"

        get "/hello", as: :hello_dashboard, to: ->(env) { [200, {}, ["Hello from Hanami!"]] }
        get "/hello/:id", to: ->(env) { [200, {}, ["Hello with ID!"]] }, as: :hello
      end
    end
  end
end
```

We can test the routes by checking the path generation:

```ruby
# spec/web/routes.rb

require "spec_helper"

RSpec.describe "Routes" do
  let(:router) { Web:Application.router }

  it 'recognizes root url' do
    expect(router.path(:root)).to eq('/')
  end

  it 'recognizes root url' do
    expect(router.path(:hello_dashboard)).to eq('/hello')
  end

  it 'does not route to /farewell', pending: true do
    expect(router.path(:farewell)).to eq('/farewell')
  end
end
```

## Route Recognition

We can also do the opposite: starting from a raw path or fake Rack env, we can assert that the recognized route is correct.

```ruby
# spec/web/routes.rb

require "spec_helper"

RSpec.describe "Routes" do
  let(:router) { Web:Application.router }

  it 'recognizes "/hello/:id"' do
    route = router.recognize('/hello/1')
    aggregate_failures do
      expect(route).to be_routable
      expect(route.path).to eq('/hello/1')
      expect(route.verb).to eq('GET')
      expect(route.params).to eq({ id: "1" })
    end
  end

  it 'does not recognize /world' do
    expect(router.recognize('/world')).not_to be_routable
  end
end
```

the `recognize` method accepts the `Rack` env too.

```ruby
it 'recognizes "/hello/:id"' do
  env = Rack::MockRequest.env_for("/hello")
  expect(router.recognize(env)).to be_routable
end
```

When we use `.recognize`, the router returns a recognized route, which is an **object designed only for testing purposes**.
It carries on all the important information about the route that we have hit.
