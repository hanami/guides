---
title: Server
order: 50
---

## hanami server

Launches Hanami's development server for developing against your application locally.

```shell
$ bundle exec hanami server

12:30:50 - INFO - Using Guardfile at bookshelf/Guardfile.
12:30:50 - INFO - Puma starting on port 2300 in development environment.
12:30:50 - INFO - Guard is now watching at 'bookshelf'
Puma starting in single mode...
* Puma version: 6.4.0 (ruby 3.2.2-p53) ("The Eagle of Durango")
*  Min threads: 5
*  Max threads: 5
*  Environment: development
*          PID: 93401
* Listening on http://0.0.0.0:2300
* Starting control server on http://127.0.0.1:9293
* Starting control server on http://[::1]:9293
Use Ctrl-C to stop
```

**This server is for local development only**. In production, use the following to start your application serving web requests with Puma:

```shell
$ bundle exec puma -C config/puma.rb
```

### Code Reloading

Hanami offers a useful development feature: code reloading.

When the application code changes, the application is reloaded, so for new incoming HTTP requests, the app works with the most recent version of the code.
It's convenient feature to avoid developers to stop and start the web server for each code change.

This feature is provided by the `hanami-reloader` Ruby gem.

In case you want to disable permanently this feature, remove the gem from the app's `Gemfile`.

In case you want to disable temporarly, start the server with the `--no-code-reloading` CLI option.

```shell
$ bundle exec hanami server --no-code-reloading
```

<p class="notice">
  Disabling code reloading is essential to debug application code with debuggin Ruby gems like <code>byebug</code>, <code>debug</code>, or <code>pry</code>.
</p>
