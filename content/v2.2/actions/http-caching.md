---
title: HTTP Caching
order: 120
---

Actions provide several features to help you make use of [HTTP caching][mdn-http-caching].

[mdn-http-caching]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching

## Cache control

The [Cache-Control response header][mdn-cache-control] is the main way to control HTTP caching behavior. You can use the `#cache_control` method on your action's response object to set this header.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          # Sets `Cache-Control: public, max-age: 600`
          response.cache_control :public, max_age: 600
        end
      end
    end
  end
end
```

The `cache_control` method accepts one or more of the following [Cache-Control directives][mdn-cache-control-directives] as its arguments.

- `:public`
- `:private`
- `:no_cache`
- `:no_store`
- `:must_validate`
- `:proxy_revalidate`
- `max_age: N` (`N` here and below should be an integer representing a period in seconds)
- `s_maxage: N`
- `min_fresh: N`
- `max_stale: N`

[mdn-cache-control]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
[mdn-cache-control-directives]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#cache_directives

## Expires

The [Expires response header][mdn-expires] sets the date and time after which the response is considered expired. The Expires header is an older standard, and Cache-Control is preferred by modern browsers.

You can use the `#expires` method on your action's response object to set this header along with a matching Cache-Control header.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        def handle(request, response)
          # Sets `Expires: Sun, 20 Nov 2022 17:47:02 GMT, Cache-Control: public, max-age=600`
          response.expires 60, :public, max_age: 600
        end
      end
    end
  end
end
```

[mdn-expires]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expires

## Conditional requests

[HTTP conditional requests][mdn-conditional-requests] are an interaction between the server and a client wherein the result of a request can be changed by comparing the related server resource with the value of a validator. These requests can be useful to validate the content of a client's cache for the given resource.

For example, for a conditional `GET` request, there is a two-step workflow:

1. The response to an initial request includes a “validator” in its headers, either the date of last modification for the resource (a Last-Modified response header and a subsequent If-Modified-Since request header), or an string identifying the version of the resource (an ETag response header and a subsequent If-None-Match request header)
2. On the next request, the client sends its counterpart request header, and if the server determines the client's cache is fresh, it can return a `304 Not Modified` response allowing the client to use its cached resource

For more detail on conditional requests, see the [MDN documentation][mdn-conditional-requests].

You can use the `#fresh` method on your action's response object to set the Last-Modified or ETag validator headers, as well as short circuit action execution when these are included in the request.

[mdn-conditional-requests]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests

### Last Modified

Use the `#fresh` response method with a `last_modified_at:` option to return a Last-Modified response header and validate a conditional request by its If-Modified-Since header.

In the below example:

1. The first request to the action (or a request with a stale cache) will see the action handle the request in full before returning its response with a Last-Modified header.
2. A subsequent request with a matching If-Modified-Since header will receive a `304 Not Modified` response, and the action will halt before its processing logic.

For more detail on action halting, see the [control flow guide](/v2.2/actions/control-flow).

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Show
      class Index < Bookshelf::Action
        include Deps["repos.user_repo"]

        def handle(request, response)
          user = user_repo.find(params[:id])

          response.fresh last_modified: user.updated_at

          # <request processing logic here>
        end
      end
    end
  end
end

# Case 1 (missing or non-matching Last-Modified)
# GET /users/23
#  => 200, Last-Modified: Tue, 22 Nov 2022 10:04:30 GMT

# Case 2 (matching Last-Modified)
# GET /users/23, If-Modified-Since: Tue, 22 Nov 2022 10:04:30 GMT
#  => 304
```

### ETag

Use the `#fresh` response method with an `etag:` option to return an ETag response header and validate a conditional request by its If-None-Match header.

In the below example:

1. The firsts request to the action (or a request with a stale cache) will see the action handle the request in full before returning its response with an ETag header.
2. A subsequent request with a matching If-None-Match header will receive a `304 Not Modified` response, and the action will halt before its processing logic.

For more detail on action halting, see the [control flow guide](/v2.2/actions/control-flow).

```ruby
# app/actions/books/show.rb

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Deps["user_repo"]

        def handle(request, response)
          user = user_repo.find(params[:id])

          response.fresh etag: "#{user.id}-#{user.updated_at}"

          # ...
        end
      end
    end
  end
end

# Case 1 (missing or non-matching If-None-Match)
# GET /users/23
#  => 200, ETag: 84e037c89f8d55442366c4492baddeae

# Case 2 (matching If-None-Match)
# GET /users/23, If-None-Match: 84e037c89f8d55442366c4492baddeae
#  => 304
```
