---
title: "Router: Advanced Usage"
order: 30
---


[Refer](https://github.com/hanami/router/blob/unstable/spec/integration/hanami/router/mount_spec.rb)

## Mounting an application

In Hanami, you can mount any rack application in desired route. If we want to do it, you should use the `mount` keyword.

```ruby
# /config/routes.rb

Hanami.application.routes do
  mount Api::App.new, at: "/api"
  mount Backend::App, at: "/backend"
  mount \->(\*) { \[200, {"Content-Length" => "4"}, \["proc"\]\] }, at: "/proc"
  mount \->(\*) { \[200, {"Content-Length" => "8"}, \["trailing"\]\] }, at: "/trailing/"
end
```

#### Mounting To A Path

```ruby
# /config/routes.rb

Hanami.application.routes do
  mount SinatraApp.new, at: "/sinatra"
end
```

All the HTTP requests starting with `/sinatra` will be routed to `SinatraApp`.

#### Mounting On A Subdomain

```ruby
# /config/routes.rb

Hanami.application.routes do
    mount Blog.new, host: "blog"
end
```

All the HTTP requests to `http://blog.example.com` will be routed to `Blog`.

<!--   TODO: Update this notice to meet 2.0 behaviour
<p class="notice">
  In development, you will NOT be able to access <code>http://blog.localhost:2300</code>,
  so you should specify a host when running the server:
  <code>bundle exec hanami server --host=lvh.me</code>.
  Then your application can be visited at <code>http://blog.lvh.me:2300</code>
</p>
-->

### RESTful Resources

Hanami has native [REST](http://en.wikipedia.org/wiki/Representational_state_transfer) support.

At the routing level, there are two methods that can be used to declare them: `resources` and `resource`.
The former is for plural resources, the latter for singular ones.

Declaring a resource means to generate **several default routes** with just one line of code.

## RESTful Resources

### Default Routes

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books
end

```

It generates:

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books</td>
    <td>Books::Index</td>
    <td>:index</td>
    <td>:books</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:id</td>
    <td>Books::Show</td>
    <td>:show</td>
    <td>:book</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/new</td>
    <td>Books::New</td>
    <td>:new</td>
    <td>:new_book</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/books</td>
    <td>Books::Create</td>
    <td>:create</td>
    <td>:books</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:id/edit</td>
    <td>Books::Edit</td>
    <td>:edit</td>
    <td>:edit_book</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/books/:id</td>
    <td>Books::Update</td>
    <td>:update</td>
    <td>:book</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/books/:id</td>
    <td>Books::Destroy</td>
    <td>:destroy</td>
    <td>:book</td>
  </tr>
</table>

### Remove Routes

In case we don't need all the default routes we can use `:only` and pass one or more action names.
We can also exclude routes with `:except`.

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books, only: [:new, :create, :show]

  # equivalent to

  resources :books, except: [:index, :edit, :update, :destroy]
end
```

### Add Routes

Alongside with default routes we can specify extra routes for single (`member`) or multiple (`collection`) resources.

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books do
    member do
      # Generates /books/1/toggle, maps to Books::Toggle, named :toggle_book
      get "toggle"
    end

    collection do
      # Generates /books/search, maps to Books::Search, named :search_books
      get "search"
    end
  end
end
```

### Configure Controller

Imagine we have a controller named `manuscripts`, where we have actions like `Manuscripts::Index`, but we still want to expose those resources as `/books`.
Using the `:controller` option will save our day.

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books, controller: "manuscripts"

  # GET /books/1 will route to Manuscripts::Show, etc.
end
```

## RESTful Resource

You can also use the `resource` helper, to generate routes for a singular resource.

```ruby
# /config/routes.rb

Hanami.application.routes do
  resource :account
end
```

It generates:

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account</td>
    <td>Account::Show</td>
    <td>:show</td>
    <td>:account</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/new</td>
    <td>Account::New</td>
    <td>:new</td>
    <td>:new_account</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/account</td>
    <td>Account::Create</td>
    <td>:create</td>
    <td>:account</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/edit</td>
    <td>Account::Edit</td>
    <td>:edit</td>
    <td>:edit_account</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/account</td>
    <td>Account::Update</td>
    <td>:update</td>
    <td>:account</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/account</td>
    <td>Account::Destroy</td>
    <td>:destroy</td>
    <td>:account</td>
  </tr>
</table>

### Remove Routes

```ruby
# /config/routes.rb

Hanami.application.routes do
  resource :account, only: [:show, :edit, :update, :destroy]

  # equivalent to

  resource :account, except: [:new, :create]
end
```

### Add Routes

```ruby
# /config/routes.rb

Hanami.application.routes do
  resource :account do
    member do
      # Generates /account/avatar, maps to Account::Avatar, named :avatar_account
      get "avatar"
    end

    collection do
      # Generates /account/authorizations, maps to Account::Authorizations, named :authorizations_account
      get "authorizations"
    end
  end
end
```

### Configure Controller

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resource :account, controller: "customer"
end
```

## Nested Resource(s)

RESTful resource(s) can be nested in order to make available inner resources inside the scope of their parents.

### Plural to plural

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books do
    resources :reviews
  end
end
```

**It generates default routes for books and the following ones.**

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/reviews</td>
    <td>Books::Reviews::Index</td>
    <td>:index</td>
    <td>:book_reviews</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/reviews/:id</td>
    <td>Books::Reviews::Show</td>
    <td>:show</td>
    <td>:book_review</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/reviews/new</td>
    <td>Books::Reviews::New</td>
    <td>:new</td>
    <td>:new_book_review</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/books/:book_id/reviews</td>
    <td>Books::Reviews::Create</td>
    <td>:create</td>
    <td>:book_reviews</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/reviews/:id/edit</td>
    <td>Books::Reviews::Edit</td>
    <td>:edit</td>
    <td>:edit_book_review</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/books/:book_id/reviews/:id</td>
    <td>Books::Reviews::Update</td>
    <td>:update</td>
    <td>:book_review</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/books/:book_id/reviews/:id</td>
    <td>Books::Reviews::Destroy</td>
    <td>:destroy</td>
    <td>:book_review</td>
  </tr>
</table>

### Plural to singular

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resources :books do
    resource :cover
  end
end
```

**It generates default routes for books and the following ones.**

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/cover</td>
    <td>Books::Cover::Show</td>
    <td>:show</td>
    <td>:book_cover</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/cover/new</td>
    <td>Books::Cover::New</td>
    <td>:new</td>
    <td>:new_book_cover</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/books/:book_id/cover</td>
    <td>Books::Cover::Create</td>
    <td>:create</td>
    <td>:book_cover</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/books/:book_id/cover/edit</td>
    <td>Books::Cover::Edit</td>
    <td>:edit</td>
    <td>:edit_book_cover</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/books/:book_id/cover</td>
    <td>Books::Cover::Update</td>
    <td>:update</td>
    <td>:book_cover</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/books/:book_id/cover</td>
    <td>Books::Cover::Destroy</td>
    <td>:destroy</td>
    <td>:book_cover</td>
  </tr>
</table>

### Singular To Plural

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resource :account do
    resources :api_keys
  end
end
```

**It generates default routes for account and the following ones.**

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/api_keys</td>
    <td>Account::ApiKeys::Index</td>
    <td>:index</td>
    <td>:account_api_keys</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/api_keys/:id</td>
    <td>Account::ApiKeys::Show</td>
    <td>:show</td>
    <td>:account_api_key</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/api_keys/new</td>
    <td>Account::ApiKeys::New</td>
    <td>:new</td>
    <td>:new_account_api_key</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/account/api_keys</td>
    <td>Account::ApiKeys::Create</td>
    <td>:create</td>
    <td>:account_api_keys</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/api_keys/:id/edit</td>
    <td>Account::ApiKeys::Edit</td>
    <td>:edit</td>
    <td>:edit_account_api_key</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/account/api_keys/:id</td>
    <td>Account::ApiKeys::Update</td>
    <td>:update</td>
    <td>:account_api_key</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/account/api_keys/:id</td>
    <td>Account::ApiKeys::Destroy</td>
    <td>:destroy</td>
    <td>:account_api_key</td>
  </tr>
</table>

### Singular To Singular

```ruby
# /config/routes.rb

Hanami.applicaton.routes do
  resource :account do
    resource :avatar
  end
end
```

**It generates default routes for account and the following ones.**

<table class="table table-bordered table-striped">
  <tr>
    <th>Verb</th>
    <th>Path</th>
    <th>Action</th>
    <th>Name</th>
    <th>Named Route</th>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/avatar</td>
    <td>Account::Avatar::Show</td>
    <td>:show</td>
    <td>:account_avatar</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/avatar/new</td>
    <td>Account::Avatar::New</td>
    <td>:new</td>
    <td>:new_account_avatar</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/account/avatar</td>
    <td>Account::Avatar::Create</td>
    <td>:create</td>
    <td>:account_avatar</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/account/avatar/edit</td>
    <td>Account::Avatar::Edit</td>
    <td>:edit</td>
    <td>:edit_account_avatar</td>
  </tr>
  <tr>
    <td>PATCH</td>
    <td>/account/avatar</td>
    <td>Account::Avatar::Update</td>
    <td>:update</td>
    <td>:account_avatar</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/account/avatar</td>
    <td>Account::Avatar::Destroy</td>
    <td>:destroy</td>
    <td>:account_avatar</td>
  </tr>
</table>

### Custom route handlers.

As the router works with any `Rack` compatible object or class, there is a possibility, to write custom route actions if there is a need to do so.

Here are different implementations of the same thing, check it out!

```ruby
# slices/main/actions/my_custom_action.rb

module Main
  module Actions
    module Custom
      class MyAction # custom action does not use Hanami::Action
        def self.call(env)
          [200, {}, ["Hello Hanami, rendered by class-level method"]]
        end

        def call(env)
          [200, {}, ["Hello Hanami, instance-level method"]]
        end
      end
    end
  end
end
```

```ruby
# /config/routes.rb

Hanami.application.routes do
  slice :main, at: "/" do
    root to: "home.show"

    get "/hello", to: ->(env) { [200, {}, ["Hello from Hanami"]] }
    get "/hello2", to: MyCustomAction # implements the self.call
    get "/hello3", to: "custom.my_action" # leverages the container usage
  end
end
```
