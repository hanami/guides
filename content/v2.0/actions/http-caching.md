---
title: HTTP Caching
order: 120
---

Actions provide several features to help you take advantage of [HTTP caching][mdn-http-caching].

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
          # Sets a `Cache-Control: public, max-age: 600` header
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

The [Expires response header][mdn-expires] contains the date and time after which the response is considered expired. You can use the `#expires` method on your action's response object to set this header.

Hanami's solution for _expire_ combines support for all the browsers by sending both the headers.

```ruby
# app/actions/books/index.rb
require 'hanami/action/cache'

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
        include Hanami::Action::Cache

        def handle(request, response)
          response.expires 60, :public, max_age: 600
            # => Expires: Sun, 20 Nov 2022 17:47:02 GMT, Cache-Control: public, max-age=600
          # ...
        end
      end
    end
  end
end
```

## Conditional GET

_Conditional GET_ is a two step workflow to inform browsers that a resource hasn't changed since the last visit.
At the end of the first request, the response includes special HTTP response headers that the browser will use next time it comes back.
If the header matches the value that the server calculates, then the resource is still cached and a `304` status (Not Modified) is returned.

### ETag

The first way to match a resource freshness is to use an identifier (usually an MD5 token).
Let's specify it with `fresh etag:`.

If the given identifier does NOT match the `If-None-Match` request header, the request will return a `200` with an `ETag` response header with that value.
If the header does match, the action will be halted and a `304` will be returned.

```ruby
# app/actions/books/show.rb
require 'hanami/action/cache'

module Bookshelf
  module Actions
    module Books
      class Show < Bookshelf::Action
        include Hanami::Action::Cache
        include Deps['repositories.users']

        def handle(request, response)
          user = users.find(params[:id])
          fresh etag: etag(user)

          # ...
        end

        private

        def etag(user)
          "#{ user.id }-#{ user.updated_at }"
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

### Last Modified

The second way is to use a timestamp via `fresh last_modified:`.

If the given timestamp does NOT match `If-Modified-Since` request header, it will return a `200` and set the `Last-Modified` response header with the timestamp value.
If the timestamp does match, the action will be halted and a `304` will be returned.

```ruby
# app/actions/books/show.rb
require 'hanami/action/cache'

module Bookshelf
  module Actions
    module Show
      class Index < Bookshelf::Action
        include Hanami::Action::Cache
        include Deps['repositories.users']

        def handle(request, response)
          user = users.find(params[:id])
          fresh last_modified: user.updated_at

          # ...
        end
      end
    end
  end
end

# Case 1 (missing or non-matching Last-Modified)
# GET /users/23
#  => 200, Last-Modified: Mon, 18 May 2015 10:04:30 GMT

# Case 2 (matching Last-Modified)
# GET /users/23, If-Modified-Since: Mon, 18 May 2015 10:04:30 GMT
#  => 304
```
