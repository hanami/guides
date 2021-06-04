---
title: "Mailers"
section: "Generators"
order: 60
---

## Mailers

Generate a mailer

```shell
$ bundle exec hanami generate mailer welcome
```

It creates the following files:

```shell
$ tree lib/
lib
├── bookshelf
│   # ...
│   ├── mailers
│   │   ├── templates
│   │   │   ├── welcome.html.erb
│   │   │   └── welcome.txt.erb
│   │   └── welcome.rb # Mailers::Welcome
# ...
```
