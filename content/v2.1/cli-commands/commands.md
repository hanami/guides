---
title: Commands
order: 50
---

Hanami provides a command line interface with helpful commands for generating a new application, starting a console, starting a development server, displaying routes and more.

## Gem commands

After an initial install via `gem install hanami`, hanami offers two commands:

```shell
$ hanami --help

Commands:
  hanami new APP         # Generate a new Hanami app
  hanami version         # Hanami version
```

### hanami new

Generates a Hanami application with the given APP name, in a new directory from the current location.

```shell
$ hanami new bookshelf # generates a new Bookshelf application in ./bookshelf
$ hanami new my_app # generates a new MyApp application in ./my_app
```


### hanami version

Displays the Hanami version of the currently installed gem.

```shell
$ hanami version
v2.0.0
```


## Project commands

When executed from within a hanami project, hanami offers a different set of commands.

These commands can be listed using the `--help` flag.

```shell
$ bundle exec hanami --help

Commands:
  hanami console                              # Start app console (REPL)
  hanami generate [SUBCOMMAND]
  hanami middleware                           # Print app Rack middleware stack
  hanami routes                               # Print app routes
  hanami server                               # Start Hanami app server
  hanami version                              # Print Hanami app version
```

## hanami console

Starts the Hanami console.

```shell
$ bundle exec hanami console

bookshelf[development]>
```

This command accepts an `engine` argument that can start the console using IRB or Pry.

```shell
$ bundle exec hanami console --engine=irb # (the default)
$ bundle exec hanami console --engine=pry
```

## hanami generate

Hanami 2.0 provides two generators, one for actions and one for slices.

```shell
$ bundle exec hanami generate --help

Commands:
  hanami generate action NAME
  hanami generate slice NAME
```

These can be invoked as follows:

```shell
$ hanami generate action books.show
$ hanami generate slice api
```

See the [actions](/v2.1/actions/overview/) and [slices](/v2.1/app/slices/) guides for example usage.

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

## hanami routes

Displays your application's routes.

```shell
$ bundle exec hanami routes

GET     /                             home.index                    as :root
GET     /books                        books.index
GET     /books/:id                    books.show
POST    /books                        books.create
```

By default, routes are displayed in "human friendly" format. Routes can be inspected in csv format via the format option:

```shell
$ bundle exec hanami routes --format=csv

METHOD,PATH,TO,AS,CONSTRAINTS
GET,/,home.index,:root,""
GET,/books,books.index,"",""
GET,/books/:id,books.show,"",""
POST,/books,books.create,"",""
```

## hanami server

Launches hanami's development server for developing against your application locally.

```shell
$ bundle exec hanami server

14:33:28 - INFO - Using Guardfile at bookshelf/Guardfile.
14:33:28 - INFO - Puma starting on port 2300 in development environment.
14:33:28 - INFO - Guard is now watching at 'bookshelf'
[43884] Puma starting in cluster mode...
[43884] * Puma version: 6.0.0 (ruby 3.1.0-p0) ("Sunflower")
[43884] *  Min threads: 5
[43884] *  Max threads: 5
[43884] *  Environment: development
[43884] *   Master PID: 43884
[43884] *      Workers: 2
[43884] *     Restarts: (✔) hot (✖) phased
[43884] * Preloading application
[43884] * Listening on http://0.0.0.0:2300
[43884] Use Ctrl-C to stop
```

This server is for local development only. In production, use the following to start your application serving web requests with Puma:

```shell
$ bundle exec puma -C config/puma.rb
```

### Debugging 

Since Hanami uses code reloading by default, placing a `binding.irb`
call in your code won't open an IRB debugging session in the server 
logs as you might expect. 

Within your own application code, you call `raise` to trigger the 
[hanami-webconsole][wc] interactive error page and interact with 
the execution context in an IRB-like REPL.

[webconsole]: https://github.com/hanami/webconsole

However, this will not work with third-party code like gems. In that 
case you can disable code reloading by starting the server with: 

```shell
bundle exec hanami server --no-code-reloading
```

Calls to `binding.irb` (or `binding.pry` for Pry) should now 
work, not only in your Hanami application code. The IRB debugging 
console will open your shell wherever you started the Hanami server.

## hanami version

Prints the version of the installed hanami gem.

```shell
$ bundle exec hanami version
v2.0.0
```
