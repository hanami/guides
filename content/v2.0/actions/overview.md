---
title: Overview
order: 10
aliases:
  - "/actions/overview"
---

## Actions

In a Hanami application, actions are responsible for handling HTTP requests. Actions decide what HTTP response your application returns for a given request - its status, body, headers, whether to issue a redirect, and so on.

Every action in your Hanami application is an individual class. Actions define a `#handle` method which takes two arguments: `request`, an object representing the incoming request, and `response`, an object representing the outgoing response.

Modifying the response object allows you to control how your application responds to a request.

```ruby
# app/actions/books/show.rb

# frozen_string_literal: true

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        def handle(request, response)
          id = request.params[:id]

          response.body = "You requested book #{id}"
        end
      end
    end
  end
end
```

Let's take a deeper look.

## Parameters

The parameters associated with an incoming request are available via the `#params` method on the `request` object.

Available parameters are surfaced from variables specified in the router (`/books/:id`), query strings (`/books?page=2`), and request bodies (for example a `POST` request to `/books` from a form submission).

```ruby
def handle(request, response)
  # GET /books/1
  request.params[:id] # => "1"

  # GET /books?category=history&page=2
  request.params[:category] # => "history"
  request.params[:page] # => "2"
end
```

**Remainder of parameters under construction**


## Under construction

Topics to cover:

- request and response
- mime types and format
- params (including req.ar.to_h) and query string parameters.
- param validation
- request headers
- response headers
- exception handling
- HTTP caching
- inheritence
- Testing

Relevant PRs:

[https://github.com/hanami/guides/pull/101](https://github.com/hanami/guides/pull/101)
