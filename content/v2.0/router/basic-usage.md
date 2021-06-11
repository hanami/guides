---
title: "Router: Basic Usage"
order: 20
---

So far we've only created a very basic endpoint, but usually, our applications will need much more logic to render the page's content.

## Rack

Hanami is compatible with [Rack SPEC](http://www.rubydoc.info/github/rack/rack/master/file/SPEC), and so the endpoints that we use MUST be compliant as well.
In the example [from the previous section](/v2.0/router/overview) we used a `Proc` that was fitting our requirements.

A valid endpoint can be an object, a class, an action, or an **application** that responds to `#call` and returns the proper value.

```ruby
get '/proc',       to: ->(env) { [200, {}, ['Hello from Hanami!']] }
get '/action',     to: "home.index"
get '/middleware', to: Middleware
get '/rack-app',   to: RackApp.new
get '/rails',      to: ActionControllerSubclass.action(:new)
```

When we use a string, it tries to instantiate a class from it:

```ruby
get '/rack-app', to: 'rack_app' # it will map to RackApp.new
```

## Actions

Full Rack integration is great, but the most common endpoint that we'll use in our web applications is an **action**.
Actions are objects responsible for responding to incoming HTTP requests.
They have a nested naming like `Main::Actions::Home::Index`.
This is a really long name to write, that's why Hanami has a **naming convention** for it: `"home.index"`.

```ruby
# /config/routes.rb

slice :main, at: '/' do
  root to: "home.index" # => will route to Web::Controllers::Home::Index
end
```

The first token is the name of the controller `"home"` is translated to `Home`.
The same transformation will be applied to the name after the `.`: `"index"` to `Index`.

Hanami can figure out the namespace (`Main::Actions`) based on the slice the route belongs to, and compose the full class name.

```ruby
# /slices/main/lib/main/actions/home/index.rb

module Main
  module Actions
    module Home
      class Index < Hanami::Action
      end
    end
  end
end
```

`Home::Index` action of the `Main` slice, will call a corresponding view object with prepared parameters. The view then will render the prepared `slim` template.

```ruby
# /slices/main/lib/main/views/home/index.rb

module Main
  module Views
    module Home
      class Index < Main::View
      end
    end
  end
end
```

```ruby
# /slices/main/lib/main/templates/home/index.html.slim

h1 Hello, Hanami!
```

This is great, as it allows us to write our templates in the `HTML` or `Slim` files, or serialize our `JSON` responses using serializers instead of using raw strings everywhere!

Read more about [Hanami::Actions](/v2.0/actions/overview) and [rendering views](/v2.0/views/overview)!.

# Features

`Hanami::Router` comes with a full set of features helping to organize your routes, no matter how big or complex your application is. It's designed to scale!

## Slices

One of the unique Hanami features is how it encourages modularizing your application into multiple, self-contained building blocks. We call it [slices](/v2.0/slices/overview).

A slice is an independent piece of application. Think of it as different entry points to your domain.

```ruby
Hanami.application.routes do
  slice :main, at: "/" do
    root to: "home.show"  # slices/main/lib/actions/home/show.rb
    get '/hello', to: 'hello.index' # slices/main/lib/actions/hello/index.rb
  end
  
  slice :admin, at: "/" do
    root to: "dashboard.show" # slices/admin/lib/actions/dashboard/show.rb
    get '/users', to: 'users.index' # slices/admin/lib/actions/users/index.rb
  end
end
```

Read more about [slices](/v2.0/slices/overview)!

## URLs

### Path matching

In [our initial example](/v2.0/router/overview) we have introduced a really basic relative URI: `/hello`.
This is what we call _fixed path matching_.
It is called this because the segment is responsible for responding only to an **exact match**.
If we visit `/hello`, we get a response.
If we hit `/foo`, a `404` (Not Found) is returned.

### Fixed Matching

```ruby
# config/routes.rb

get '/dashboard', to: "dashboard.index"
```

### Variables

When we have dynamic content to serve, we want our URI to be dynamic as well.
This can be easily achieved via path variables.
They are defined with a colon, followed by a name (eg. `:id`).

Once an incoming request is forwarded to our endpoint, we can access the current value in our param's action (`params[:id]`).

```ruby
get '/books/:id', to: 'books.show'
```

Multiple variables can be used in a path.

```ruby
get '/books/:book_id/reviews/:id', to: 'reviews.show'
```

### Variables Constraints

It's possible to specify constraints for each variable.
The rule MUST be expressed as a regular expression.
If a request can satisfy all of them, we're good, otherwise, a `404` is returned.

```ruby
get '/authors/:id', id: /\d+/, to: 'authors.show'
```

### Optional Tokens

Sometimes we want to specify an optional token as part of our URI.
It should be expressed between round parentheses.
If present, it will be available as param in the Rack env, otherwise it will be missing, but the endpoint will be still hit.

```ruby
get '/books(.:format)', to: 'books.show'
```

### Wildcard Matching

Imagine we want to serve static files from a user repository.
It would be impossible to know in advance which files are stored and to prepare routes accordingly.

To solve this problem, Hanami supports _wildcard matching_.

```ruby
get '/files/*', to: 'files.show'
```

### Named Routes

We can specify a unique name for each route, in order to generate paths from the router or to test them.

```ruby
root              to: 'home.index'
get '/hello',     to: 'greet.index', as: :greeting
get '/books/:id', to: 'books.show',  as: :book
```

> TODO: Add Helper usage to access named paths and URLs. It's not yet ready.

Absolute URL generation is dependent on `scheme`, `host` and `port` settings in `config/application.rb`.


## Redirects

In the case of legacy routes, we can handle HTTP redirects at the routing level.

```ruby
redirect '/old', to: '/new'
```

## Scopes

https://github.com/hanami/router/blob/unstable/spec/integration/hanami/router/scope_spec.rb

If we want to group a set of resources under a common prefix we can use `scopes`.

```ruby
scope 'docs' do
  get '/installation', to: 'docs.installation'
  get '/usage',        to: 'docs.usage'
end

# This will generate:
#
#   /docs/installation
#   /docs/usage
```

That's it for basic usage. If you're keen to expertise this part. Check out the next chapter!
