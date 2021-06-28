---
title: "Architecture: Overview"
order: 10
---

Hanami is based on two principles: 
- Clean Architecture
- [Monolith First](http://martinfowler.com/bliki/MonolithFirst.html).

The reason for this is to encourage **building applications easily and efficiently at the beginning**, but at the same time, that our** projects scale well when they grow**.

This is written pretty fast, but I can't see what I'm writing, so any corrections are pretty hard.


## Clean Architecture

The main purpose of this architecture is to enforce a **separation of concerns** between the **core** of our product and the **delivery mechanisms**.
The first is expressed by the set of **use cases** that our product implements, while the latter are interfaces to make these features available to the outside world.

When we generate a new project we can find two important directories: `lib/` and `slices/`.
They are home to the main parts described above.

### Application Core

We implement a set of functionalities, without worrying about how they can be exposed to the outside world.
This is the **cornerstone** of our product, and we want to be careful on how we manage dependencies for it.

Within the `/lib` folder, you can place the code common for the whole application, like base classes and core logic.

Let's have a look at how the `lib/` directory appears for a new generated project called `bookshelf` that uses `Hanami::Model`.

```shell
lib/
├── bookshelf/
│   ├── persistence/
│   │   └── relations/
│   ├── validation/
│   │   └── contract.rb
│   ├── view/
│   │   └── context.rb
│   ├── action.rb
│   ├── functions.rb
│   ├── operation.rb
│   ├── repository.rb
│   └── types.rb
├── framework/
│   └── web/
│       └── assets.rb
└── tasks/
```

The idea is to develop our application like a **Ruby gem**.

We want to keep this `lib/` folder slim, placing here mostly the general configuration rules.

For a persistence purpose you mostly want to store here [relations](/v2.0/persistence/relations), as those are closely tight to the database, not the business logic.

You can find more about the persistance layer in the [persistance section](/v2.0/persistance)

### Slices

The other core part of Hanami application is `slices` directory. *Slices* are the fragments of our application that are fairly independent, can implement different processes or different business logic.

Keep as an example a single library application. You can have a part of the application, where people can browse and reserve books, but the other part may be related to the **admin panel**, where you can list reserved books, order new books to the library, manage reservations, etc. Then you cold end up with two slices for your application

```shell
slices
└── main
└── admin
```

This would end up in two micro-applications built into your project, with completely separate components, like assets, views, layouts, and persistance. You can of course extract the shared components into a root `lib` folder if you wish.

Hanami generates a default "main" slice, which lives under `slices/main`.
This application **depends** on the core of our product, as it uses entities, repositories and all the other objects defined there.

It's used as web delivery mechanism, for our features. Below you can see the full file tree of the single, default slice of our project.

```shell
slices
└── main
    ├── actions
    │   └── home
    │       └── show.rb
    ├── assets
    │   └── public
    │       ├── entry.ts
    │       ├── index.css
    │       └── index.ts
    ├── entities
    ├── lib
    │   ├── action.rb
    │   ├── repository.rb
    │   └── view
    │       ├── base.rb
    │       └── parts
    ├── views
    │   └── home
    │       └── show.rb
    └── web
        └── templates
            ├── home
            │   └── show.html.slim
            └── layouts
                └── application.html.slim

15 directories, 10 files
```

You can clearly see, that it has it's own set of public assets, it's own semi-core logic, placed within the `lib` folder, and the presentation logic for the `web` delivery mechanism.

You can add different delivery mechanisms, like `api` here too.

**Let's have a quick look at this code.**

Web assets such as javascripts and stylesheets will be automatically served by the application.

Directories such as `main/actions` and `main/views` will contain our [actions](/v2.0/actions/overview), and [views](v2.0/views/overview) for this slice of the application. 

The [templates](/v2.0/views/templates) are stored in the `web` folder.

Learn more about slices in the [Slices section](/v2.0/slices/overview)

#### Example of using slice in a  monolith-first application

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

