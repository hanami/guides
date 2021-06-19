---
title: "Routes"
section: "Generators"
order: 30
---

### Routes

The generated route is named after the controller name.

```ruby
# apps/web/config/routes.rb
get '/books', to: 'books#show'
```

If we want to customize the route URL, without editing our routes file, we can specify a `--url` argument.

```shell
$ bundle exec hanami generate action web books#show --url=/books/:id
```

This will generate the following route:

```ruby
# apps/web/config/routes.rb
get '/books/:id', to: 'books#show'
```

The default HTTP method is `GET`, except for actions named:

<table class="table table-bordered table-striped">
  <tr>
    <th>Action name</th>
    <th>HTTP verb</th>
  </tr>
  <tr>
    <td><code>create</code></td>
    <td><code>POST</code></td>
  </tr>
  <tr>
    <td><code>update</code></td>
    <td><code>PATCH</code></td>
  </tr>
  <tr>
    <td><code>destroy</code></td>
    <td><code>DELETE</code></td>
  </tr>
</table>

This should help you route using [RESTful resources](/routing/restful-resources).

You can also set the HTTP method by specifying a `--method` argument when calling `hanami generate action`.
