---
title: "Applications"
section: "Destroy"
order: 10
---

## Applications

With the Container architecture, we can have multiple Hanami applications running under `apps/`.
We can [generate new applications](/command-line/generators/#applications) for different components that we want to add to our project.

To destroy one of them:

```shell
$ bundle exec hanami destroy app admin
```

This removes an application named `Admin` under `apps/admin`.
