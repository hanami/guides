---
title: Middleware
order: 100
---

## hanami middleware

Displays the Rack middleware stack as currently configured.

```shell
$ bundle exec hanami middleware

/    Dry::Monitor::Rack::Middleware (instance)
/    Rack::Session::Cookie
/    Hanami::Middleware::BodyParser
```

This command accepts a `--with-arguments` option that will include initialization arguments:

```shell
$ bundle exec hanami middleware --with-arguments

/    Dry::Monitor::Rack::Middleware (instance) args: []
/    Rack::Session::Cookie args: [{:key=>"my_app.session", :secret=>"secret", :expire_after=>31536000}]
/    Hanami::Middleware::BodyParser args: [:json]
```
