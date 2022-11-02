---
title: Overview
order: 10
---

An action is an endpoint that handles incoming HTTP requests for a specific [route](/v2.0/router/overview).

In a Hanami application, **an action is an object**.

This design provides self-contained actions that don't share their context accidentally with other actions. It also prevents gigantic controllers to appear in the project.
It has several advantages in terms of testability and control of a single action.

## A Simple Action

To generate an action, you can use the `hanami generate` shell command, passing the action identifier as an argument.

```shell
hanami g action books.index
```

This will do several things. 

1. Adds a new route to our `config/routes.rb` 

```ruby
# config/routes.rb

get "/books", to: "books.index"
```

Now we have the `/books` path recognized by our application, which points to a newly created action.

2. Creates the action file

```ruby
# app/actions/book/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(*, response)
          response.body = self.class.name
        end
      end
    end
  end
end
```

3. Creates the sample test file

Hanami uses RSpec by default, and using the actions generator will automatically set a sample test layout for the newly created action class.

```ruby
# spec/actions/books/index_spec.rb

RSpec.describe Books::Actions::Books::Index do
  let(:params) { Hash[] }

  it "works" do
    response = subject.call(params)
    expect(response).to be_successful
  end
end
```

With this, if we'll run our server, and check the browser URL, we should see in the response, the `"Bookshelf::Actions::Books::Index"`. Check out [router chapter](/v2.0/router/overview) for details on how routing works in Hanami applications.

## Anatomy of an action

### Naming

The file begins with a module declaration which is the name of our app or slice: `Bookshelf`. Check out [slices](/v2.0/slices) for more information about the slices

#### Component Name

The second module, `Actions` points to the type of component the action is kind of. Within a single app, Hanami application consists of different components, such as *actions*, *views*, *parts*, *serializers*, and so on.

### Controller Name

The last bit is `Books`, which is a module grouping several actions related to the same context. Within the same context, we could for example have all CRUD actions like `Books::Create` or `Books::Destroy`.

The whole action name is `Bookshelf::Actions::Books::Index`.

<p class="warning">
  You should avoid giving your action modules the same name as your slice or app e.g. avoid naming a controller <code>Main</code> in an app or slice named <code>Main</code>. If you're interested in details, check this <a href="/v2.0/extras/overview">reference</a>.
</p>

### Rendering

Empty action tries to look for a *view object* to render a template, according to a naming convention.

**TODO:** finish it up when views are ready

Action: `Sandbox::Actions::Dashboard::Index` will try to render a view: `Sandbox::Views::Dashboard::Index`.

> If you want to learn more about view objects, feel free to jump into the [views overview](/v2.0/views/overview) - you can always come back later!

To customize or extend the default action's behavior, let's visit the [basic usage](/v2.0/actions/basic_usage) section of actions guides!
