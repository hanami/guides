---
title: Overview
order: 10
---

## Actions

In a Hanami application, actions are responsible for handling HTTP requests. Actions decide what HTTP response your application returns for a given request - its status, body, headers, whether to issue a redirect, and so on.

Every action in your Hanami application is an individual class. Actions define a `#handle` method which takes two arguments: `request`, an object representing the incoming request, and `response`, an object representing the outgoing response.

Modifying the response object allows you to control how your application responds to a request.

```ruby
# app/actions/home/show.rb

module Bookshelf
  module Actions
    module Home
      class Show < Bookshelf::Action
        def handle(request, response)
          name = request.params[:name]

          response.body = "Welcome to Bookshelf #{name}!"
        end
      end
    end
  end
end
```

As the code above suggests, the `request` object provides access to the parameters associated with the incoming request through a `#params` method.

Let's start by taking a look at action [parameters](/v2.3/actions/parameters/).
