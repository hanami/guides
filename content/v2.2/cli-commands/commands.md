---
title: Commands
order: 10
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

## App commands

When executed from within a Hanami app, hanami offers a different set of commands.

These commands can be listed using the `--help` flag.

```shell
$ bundle exec hanami --help
Commands:
  hanami assets [SUBCOMMAND]
  hanami console                              # Start app console (REPL)
  hanami db [SUBCOMMAND]
  hanami dev                                  # Start the application in development mode
  hanami generate [SUBCOMMAND]
  hanami install                              # Install Hanami third-party plugins
  hanami middleware                           # Print app Rack middleware stack
  hanami routes                               # Print app routes
  hanami server                               # Start Hanami app server
  hanami version                              # Print Hanami app version
```
