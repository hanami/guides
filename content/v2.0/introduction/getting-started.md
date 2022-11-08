---
title: "Getting Started"
order: 10
aliases:
  - "/getting-started"
  - "/introduction/getting-started"
---

<p id="getting-started-lead" class="lead">
  Hello. If you're reading this page, it's very likely that you want to learn more about Hanami.
  That's great, congrats! If you're looking for new ways to build maintainable, secure, faster and testable web applications, you're in good hands.
  <br><br>
  <strong>Hanami is built for people like you.</strong>
  <br><br>
  I warn you that whether you're a total beginner or an experienced developer <strong>this learning process can be hard</strong>.
  Over time, we build expectations about how things should be, and it can be painful to change. <strong>But without change, there is no challenge</strong> and without challenge, there is no growth.
  <br><br>
  Sometimes a feature doesn't look right, that doesn't mean it's you.
  It can be a matter of formed habits, a design fallacy or even a bug.
  <br><br>
  Myself and the rest of the Community are putting best efforts to make Hanami better every day.
  <br><br>
  In this guide we will set up our first Hanami project and build a simple bookshelf web application.
  We'll touch on all the major components of Hanami framework, all guided by tests.
  <br><br>
  <strong>If you feel alone, or frustrated, don't give up, jump in our <a href="http://chat.hanamirb.org">chat</a> and ask for help.</strong>
  There will be someone more than happy to talk with you.
  <br><br>
  Enjoy,<br>
  Luca Guidi<br>
  <em>Hanami creator</em>
</p>

<br>
<hr>


## Getting started

Hanami is a Ruby framework designed to create software that is well-architected, maintainable and a pleasure to work on.

These guides aim to introduce you to the Hanami framework and demonstrate how its components fit together to produce a coherent application.

Ideally, you already have some familiarity with web applications and the [Ruby language](https://www.ruby-lang.org/en/).

<p class="notice">
Please note: These guides are a work in progress for Hanami 2.0. Some sections are incomplete.
</p>


## Creating a Hanami application

### Prerequisites

To create a Hanami application, you will need Ruby 3.0 or greater. Check your ruby version:

```shell
ruby --version
```

If you need to install Ruby, follow with the instructions on [rubylang.org](https://www.ruby-lang.org/en/documentation/installation/).

### Installing the gem

In order to create a Hanami application, first install the hanami gem:

```shell
gem install hanami --pre
```

### Generating your first application

Hanami provides a `hanami new` command for generating a new application. Let's use it to create a new application called **bookshelf**:

```shell
hanami new bookshelf
```

Here's what was generated for us:

```shell
cd bookshelf
tree .
.
├── Gemfile
├── Gemfile.lock
├── Guardfile
├── README.md
├── Rakefile
├── app
│   ├── action.rb
│   └── actions
├── config
│   ├── app.rb
│   ├── puma.rb
│   ├── routes.rb
│   └── settings.rb
├── config.ru
├── lib
│   ├── bookshelf
│   │   └── types.rb
│   └── tasks
└── spec
    ├── requests
    │   └── root_spec.rb
    ├── spec_helper.rb
    └── support
        ├── requests.rb
        └── rspec.rb

9 directories, 16 files
```

As you can see, a new Hanami application has just 16 files in total. We'll look at each file as this guide progresses but for now let's get our new application running.

In the bookshelf directory, run:

```shell
hanami server
```

If all has gone well, you should see this output:

```shell
Puma starting in single mode...
* Puma version: 5.6.5
*  Min threads: 0
*  Max threads: 5
*  Environment: development
*          PID: 31634
* Listening on http://0.0.0.0:2300
Use Ctrl-C to stop
```

Visit your application in the browser at [http://localhost:2300](http://localhost:2300)

```shell
open http://localhost:2300
```

You should see "Hello from Hanami"!

## Commands

Hanami ships with useful commands for things like starting a console, inspecting routes and generating code.

To list available commands, run:

```shell
bundle exec hanami --help

Commands:
  hanami console                              # App REPL
  hanami generate [SUBCOMMAND]
  hanami install
  hanami middlewares                          # List all the registered middlewares
  hanami routes                               # Inspect application
  hanami server                               # Start Hanami server
  hanami version
```

We'll see these commands at play in this guide.

## Building your first application

Under construction - a walk through similar to the [introduction for v1.3](/v1.3/introduction/getting-started/)
