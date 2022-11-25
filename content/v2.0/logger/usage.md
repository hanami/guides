---
title: Usage
order: 10
---

Hanami logger is compatible with the stdlib `Logger` but it supports structured logging by default. This means that you are encouraged to log *data*, which we refer to as *payloads* rather than plain text messages. This approach makes it much easier to process and understand your logs when running your system on production.

In non-production environments, structured logs are turned into easy read text log entries, but the underlying log entries are represented as struct-like objects, even if you pass a text message to your logger.

### Basic usage

To log a text entry, simply use a logger method with a name corresponding to the log level that you want to use. Let's say you want to log an entry with `INFO` level:

```ruby
bookshelf[development]> app["logger"].info "Hello World"
# [bookshelf] [INFO] [2022-11-20 13:47:13 +0100] Hello World
```

If you wanted to log an error:

```ruby
bookshelf[development]> app["logger"].error "Something's wrong"
# [bookshelf] [ERROR] [2022-11-20 13:48:05 +0100] Something's wrong
```

The following logging methods are available:

- `debug`
- `info`
- `warn`
- `error`
- `fatal`

### Logging data

In addition to plain text logging, you can log arbitrary data by passing a log entry *payload* to a log method:

```ruby
bookshelf[development]> app["logger"].info "Hello World", component: "admin"
# [bookshelf] [INFO] [2022-11-20 13:50:43 +0100] Hello World component="admin"
```

The text message argument *is not mandatory*, which means that you can only provide the *payload*:

```ruby
bookshelf[development]> app["logger"].info text: "Hello World", component: "admin"
# [bookshelf] [INFO] [2022-11-20 13:51:40 +0100] text="Hello World" component="admin"
```

Notice that the default development log formatting turns our payload into a `key=value` representation. It's easy to read or even parse programatically, but please remember that in any environment where logs are parsed and post-processing **using JSON** format is the recommended way, and this is how Hanami configures its logger in `production` environment by default.

### Logging exceptions

Hanami logger supports logging exceptions out of the box without the need to write custom formatters. Simply rescue from an exception and pass it to the `error` log method:

```ruby
bookshelf[development]> begin
bookshelf[development]>   raise "OH NOEZ!"
bookshelf[development]> rescue => e
bookshelf[development]>   app["logger"].error(e)
bookshelf[development]> end
# [bookshelf] [ERROR] [2022-11-20 13:54:55 +0100]
#   OH NOEZ! (RuntimeError)
#   (pry):7:in `__pry__'
#   ...
```

You can also pass in any additional information that should be helpful in a payload:

```ruby
bookshelf[development]> begin
bookshelf[development]>   raise "OH NOEZ!"
bookshelf[development]> rescue => e
bookshelf[development]>   app["logger"].error(e, component: "admin")
bookshelf[development]> end
# [bookshelf] [ERROR] [2022-11-20 13:56:36 +0100] component="console"
#   OH NOEZ! (RuntimeError)
#   (pry):12:in `__pry__'
```
