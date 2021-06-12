---
title: "Router: Advanced Usage"
order: 30
---


[Refer](https://github.com/hanami/router/blob/unstable/spec/integration/hanami/router/mount_spec.rb)

## Mounting an application

In Hanami, you can mount any rack application in desired route. If we want to do it, you should use the `mount` keyword.

```ruby
mount Api::App.new, at: "/api"
mount Backend::App, at: "/backend"
mount \->(\*) { \[200, {"Content-Length" => "4"}, \["proc"\]\] }, at: "/proc"
mount \->(\*) { \[200, {"Content-Length" => "8"}, \["trailing"\]\] }, at: "/trailing/"
```

#### Mounting To A Path

```ruby
mount SinatraApp.new, at: '/sinatra'
```

All the HTTP requests starting with `/sinatra` will be routed to `SinatraApp`.

#### Mounting On A Subdomain

```ruby
mount Blog.new, host: 'blog'
```

All the HTTP requests to `http://blog.example.com` will be routed to `Blog`.

<p class="notice">
  TODO: Update this notice to meet 2.0 behaviour
  In development, you will NOT be able to access <code>http://blog.localhost:2300</code>,
  so you should specify a host when running the server:
  <code>bundle exec hanami server --host=lvh.me</code>.
  Then your application can be visited at <code>http://blog.lvh.me:2300</code>
</p>

### RESTful Resources

<!-- TODO: Check the v1.3 docs and adapt what's needed. -->
