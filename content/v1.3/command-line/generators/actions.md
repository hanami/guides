---
title: "Actions"
section: "Generators"
order: 20
---

## Actions

Generate an action along with the corresponding view, template, route and test code with one command.

```shell
$ bundle exec hanami generate action web books#show
```

This generates the action `Web::Controllers::Books::Show`.

The first argument, `web`, is the name of the target application in a Hanami project.

The argument `books#show` is the name of the controller and the action separated by the number sign (`#`).

For nested actions, use a slash (`/`) to separate the modules. Nested actions work in conjunction with nested resourceful routes. For example:

```shell
$ bundle exec hanami generate action web books/editions#show
```

This generates the action `Web::Controllers::Books::Editions::Show`.

If you wish to generate only the action, without the view and template, you can do that by using the `--skip-view`.

```shell
$ bundle exec hanami generate action web books#show --skip-view
```

If you wish to generate an action with a specific method, you can do that by using the `--method`.

```shell
$ bundle exec hanami generate action web books#create --method=post
```
