---
title: "Overview"
order: 10
---

Hanami is based on two principles: 
- Clean Architecture
- [Monolith First](http://martinfowler.com/bliki/MonolithFirst.html).

And the reason for this is to encourage** building applications easily and efficiently at the beginning**, but at the same time, that our **projects scale well when they grow**.

## Clean Architecture

The main purpose of this architecture is to enforce a **separation of concerns** between the **core** of our product and the **delivery mechanisms**.
The first is expressed by the set of **use cases** that our product implements, while the latter are interfaces to make these features available to the outside world.

When we generate a new project we can find two important directories: `lib/` and `slices/`.
They are home to the main parts described above.

### Application Core

We implement a set of functionalities, without worrying about how they can be exposed to the outside world.
This is the **cornerstone** of our product, and we want to be careful on how we manage dependencies for it.

Within the `/lib` folder, you can place the code common for the whole application, like base classes and core logic.

> `Hanami::Model` is the default choice for persisting our Ruby objects.
This is a _soft-dependency_, it can be removed from our `Gemfile` and replaced with something else.

Let's have a look at how the `lib/` directory appears for a new generated project called `bookshelf` that uses `Hanami::Model`.

```shell
lib
├── bookshelf
│   ├── action.rb
│   ├── entities
│   ├── entities.rb
│   ├── functions.rb
│   ├── operation.rb
│   ├── persistence
│   │   └── relations
│   ├── repository.rb
│   ├── types.rb
│   ├── validation
│   │   └── contract.rb
│   └── view
│       └── context.rb
├── framework
│   └── web
│       └── assets.rb
└── tasks
```

The idea is to develop our application like a **Ruby gem**.

There are two important directories:
  * `lib/bookshelf/entities`
  * `lib/bookshelf/persistence`

They contain [entities](/v2.0/persistance/entities) that are Ruby objects at the core of our model domain, and they aren't aware of any persistence mechanism.
For a persistance purpose we have a separate concept, [repositories](/v2.0/persistance/repositories), which are a mediator between our entities and the underlying database.

For each entity named `Book` we can have a `BookRepository`.

We can add as many directories that we want, such as `lib/bookshelf/interactors` to implement our use cases.

You can find more about the persistance layer in the [persistance section](/v2.0/persistance)

### Slices

The other core part of Hanami application is `slices` directory. Slices are the fragments of our application that are fairly independent, can implement different processes or different business logic. In Domain Driven Design you can refer to them as: *contexts*.

<!-- TODO: Link the nice resource related to DDD and contexts -->

Keep as an example a single library application. You can have a part of the application, where people can browse and reserve books, but the other part may be related to the admin panel, where you can list reserved books, order new books to the library, manage reservations, etc. Then you cold end up with two slices for your application

```shell
slices
└── main
└── admin
```

This would end up in two micro-applications built into your project, with completely separate components, like assets, views, layouts, and persistance. You can of course extract the shared components into a root `lib` folder if you wish.

Hanami generates a default slice `Main`, which lives under `slices/main`.
This application **depends** on the core of our product, as it uses entities, repositories and all the other objects defined there.

It's used as web delivery mechanism, for our features. Below you can see the full file tree of the single, default slice of our project.

```shell
slices
└── main
    ├── assets
    │   └── public
    │       ├── entry.js
    │       ├── index.css
    │       └── index.js
    ├── lib
    │   └── main
    │       ├── action.rb
    │       ├── actions
    │       │   └── home
    │       │       └── show.rb
    │       ├── entities
    │       ├── entities.rb
    │       ├── repository.rb
    │       ├── view
    │       │   ├── base.rb
    │       │   ├── parts
    │       │   └── parts.rb
    │       └── views
    │           └── home
    │               └── show.rb
    └── web
        └── templates
            ├── home
            │   └── show.html.slim
            └── layouts
                └── application.html.slim

16 directories, 12 files
```

You can clearly see, that it has it's own set of public assets, it's own semi-core logic, placed within the lib folder, and the presentation logic for the `web` delivery mechanism.

You can add different delivery mechanisms, like `api` here too.

**Let's have a quick look at this code.**

Web assets such as javascripts and stylesheets will be automatically served by the application.

Directories such as `main/actions` and `views` and `templates` will contain our [actions](/v2.0/actions/overview), [views](v2.0/views/overview) for this slice of the application. 

The [templates](/v2.0/views/templates) are stored in the `web` folder.

Learn more about slices in the [Slices section](/v2.0/slices/overview)

## Monolith First

As we already pointed out, our default `Main`slice can be used as a UI interface for our customers.
At a certain point in our story, we want to manage our users with an admin panel.

We know that the set of features that we're going to introduce doesn't belong to our main UI (`Main`).
On the other hand, it's **too early** for us to implement a microservices architecture, only for the purpose of helping our users reset their password.

Hanami has a solution for our problem: we can generate a slice that lives in the same Ruby process, but it's a separated component.

```shell
$ bundle exec hanami generate slice admin
```

This command MUST be run from the root of our project. It will generate a new component (`Admin`) under `slices/admin`.

In the late stages of our product life-cycle, we could decide to extract this into a standalone component.
We would just need to move everything under `apps/admin` into another repository and deploy it separately.

## Anatomy Of A Project

We have already examined `lib/` and `apps/`, but there are other parts of a newly generated project that deserve to be explained.

```shell
tree -L 1                                                                      
.
├── Brewfile
├── Gemfile
├── Gemfile.lock
├── Guardfile
├── Procfile.dev
├── Procfile.support
├── README.app.md
├── README.md
├── Rakefile
├── babel.config.js
├── bin
├── config
├── config.ru
├── db
├── lib
├── log
├── package.json
├── script
├── slices
├── spec
└── yarn.lock

8 directories, 13 files
```

Let's quickly introduce them:

  * `Brewfile` a Gemfile, but for Homebrew, allowing you to easily install the suggested shell apps via `brew bundle` command.
  * `Gemfile` and `Gemfile.lock` are [Bundler](http://bundler.io) artifacts
  * `Procfile.*` files are used if you'd like to easily run your project via `foreman`
  * `README.md` is there to collect information about your 
  * `README.app.md` tells us how to setup and use the example project.
  * `Rakefile` describes Rake task for our project.
  * `babel.config.js` contains [configuration](https://babeljs.io/docs/en/configuration) for [babel](https://babeljs.io/docs/en/)
  * `bin` folder contains executable shell scripts.
  * `config/` contains an important file `config/environment.rb`, which is the **entry point** for our project. By requiring it, we'll preload our dependencies (Ruby gems), Hanami frameworks and our code.
  * `config.ru` is a file that describes how a Rack server must run our applications.
  * `db/` contains database files (for File System adapter or SQLite). When our project uses a SQL database it also contains `db/migrations` and `db/schema.sql`.
  * `package.json` and `yarn.lock` are [npm installer](https://www.npmjs.com/) artifacts
  * `spec/` contains all our test suits and configuration


After this piece of theory, let's jump into the actual implementations of specific compontents! 