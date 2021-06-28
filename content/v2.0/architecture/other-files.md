---
title: "Architecture: Overview"
order: 20
---

## Anatomy Of A Project

We have already examined `lib/` and `slices/`, but there are other parts of a newly generated project that deserve to be explained.

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


After this piece of theory, let's jump into the specific components!