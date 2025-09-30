---
title: Console
order: 40
---

## hanami console

Starts the Hanami console (REPL).

```shell
$ bundle exec hanami console

bookshelf[development]>
```

This command accepts an `engine` argument that can start the console using IRB or Pry.

```shell
$ bundle exec hanami console --engine=irb # (the default)
$ bundle exec hanami console --engine=pry
```

## Customization

You can permanently change the engine setting in your config:

```ruby
# config/app.rb

module Bookshelf
  class < Hanami::App
    config.console.engine = :pry
  end
end
```

If you would like to install custom helper methods into the console:

```ruby
# config/app.rb

module Bookshelf
  class App < Hanami::App
    config.console.include ConsoleHelpers
  end
end
```

You can include as many custom modules as you like, and they will be automatically included into the console context when it starts up.
