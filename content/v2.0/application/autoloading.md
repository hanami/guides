---
title: Autoloading
order: 50
---

Hanami uses the [Zeitwerk](https://github.com/fxn/zeitwerk) code loader to support autoloading.

This means that you do not need to require the classes and modules you write before you use them. Instead, your classes and modules are automatically available across your application.

For example, the `Bookshelf::Entities::Book` class defined in the file `app/entities/book.rb` can be used in another class by simply using the constant `Bookshelf::Entities::Book`.


```ruby
# app/entities/book.rb

module Bookshelf
  module Entities
    class Book
      attr_reader :title, :author

      def initialize(title:, author:)
        @title = title
        @author = author
      end
    end
  end
end
```

While this is convenient, it does mean you must adhere to Zeitwerk's expectations around file structure, in which file paths match constant paths.

If `class Book` was changed to `class Novel` in the above file, the following error would be raised:

```shell
Zeitwerk::NameError: expected file bookshelf/app/entities/book.rb to define constant Bookshelf::Entities::Book, but didn’t
```

Moving the file from `app/entities/book.rb` to `app/entities/movie.rb` would address this error.

## Autoloading in the app directory

The `app/` directory is where you’ll put the majority of your application’s code.

When namespacing classes and modules in your `app/` directory, use a top-level module namespace named after your app.

Assuming an app created via `hanami new bookshelf` (which would have a top-level module `Bookshelf`), this means abiding by the following structure:

| Filename                       | Expected class or module             |
|--------------------------------|--------------------------------------|
| app/entities/book.rb           | Bookshelf::Entities::Book            |
| app/entities/author.rb         | Bookshelf::Entities::Author          |
| app/actions/books/create.rb    | Bookshelf::Actions::Books::Create    |
| app/books/operations/create.rb | Bookshelf::Books::Operations::Create |
| app/book_binder.rb             | Bookshelf::BookBinder                |


None of the above classes or modules need a require statement before use.

## Autoloading in the lib directory

Similarly, code placed in `lib/bookshelf` (i.e. `lib/<app_name>`) does not need to be required.

This `SlackNotifier` class from `lib/bookshelf` for instance can be used in app components without a require statement:


```ruby
# lib/bookshelf/slack_notifier.rb

module Bookshelf
  class SlackNotifier
    def self.notify(message)
      # ...
    end
  end
end
```

However, code placed in **other directories** within `lib/` **does** need a require statement. The  redis client below needs to be required (via `require "my_client/redis"`) when being used:

```ruby
# lib/my_redis/client.rb

module MyRedis
  class Client
  end
end
```

```ruby
# config/providers/redis.rb

Hanami.app.register_provider :redis do
  start do
    require "my_redis/client"

    redis = MyRedis::Client.new(url: target["settings"].redis_url)

    register "redis", redis
  end
end
```


| Constant location               | Usage                                      |
|---------------------------------|--------------------------------------------|
| lib/bookshelf/slack_notifier.rb | Bookshelf::SlackNotifier                   |
| lib/my_redis/client.rb          | require "my_redis/client"<br /><br />  MyRedis::Client |


## Requiring gems

Autoloading does not apply to any Ruby gems you include in your project via its Gemfile. Like in any regular Ruby project, require external gems before using their constants in each file.

```ruby
# Gemfile
gem "kramdown", "~> 2.4"
```

```ruby

require "kramdown"

module Bookshelf
  class Markdown
    def to_html(markdown)
      Kramdown::Document.new(markdown).to_html
    end
  end
end
```


## Inflections

If you need to configure acronyms like "DB" or "WNBA", add them to the infector configuration in the app class:

```ruby
# config/app.rb

# frozen_string_literal: true

require "hanami"

module Bookshelf
  class App < Hanami::App
    config.inflections do |inflections|
      inflections.acronym "DB", "WNBA"
    end
  end
end
```

Autoloading will now expect constants like `Bookshelf::DB::Connection` instead of `Bookshelf::Db::Connection`.
