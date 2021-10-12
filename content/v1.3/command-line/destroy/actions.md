---
title: "Actions"
section: "Destroy"
order: 20
---

## Actions

We can destroy an action along with the corresponding view, template, route and test code with one command.

```shell
$ bundle exec hanami destroy action web books#show
```

The first argument, `web`, is the name of the target application in a Container architecture.
**It must be omitted if used within an Application architecture:**

```shell
$ bundle exec hanami destroy action books#show
```

The argument `books#show` is the name of the controller and the action separated by the number sign (`#`).
