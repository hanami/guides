---
title: Booting
order: 10
---

Hanami applications support a **prepared** state and a **booted** state.

Whether your app is prepared or booted determines whether its components are **lazily loaded** on demand (for a prepared app), or **eagerly loaded** up front (for a booted app).

This difference may not sound like much, but the ability of a prepared app to load _just enough_ of the app to undertake a particular task can be a huge performance advantage when it comes to testing, worker processes and other use cases where your app doesn't need every component to perform the job at hand. A rake task that precompiles assets or migrates the database can execute quickly when is not delayed by loading the entire application.

Conversely, a booted app is fully initialized, with every component loaded and ready to do its work. This is ideal whenever you want to incur initialization costs at boot time, such as when serving web requests.

## Hanami.prepare

When you call `Hanami.prepare` (or use `require "hanami/prepare"`), Hanami will prepare your app for use.

This process makes the Ruby source files in `app/` autoloadable and makes your components (from the same classes defined in `app/`) lazily loadable.

This approach keeps load time to a minimum. As such, it’s the default mode in the Hanami console and when running tests.

<p class="notice">
  A prepared application will do everything a booted one can, it will just lazily load only the components it needs to perform a particular task on demand.
</p>

## Hanami.boot

When you call `Hanami.boot` (or use `require "hanami/boot"`) Hanami will do everything it does when `Hanami.prepare` is called, but then go further, starting each of your app's providers, while also eagerly loading all of your app's components up front.

This is useful when you want to incur all initialization costs at boot time.

Booting is the approach taken in Hanami's standard Puma setup. Thus, in Hanami's `config.ru` file you will see:

```ruby
require "hanami/boot"

run Hanami.app
```

## Stepping through the boot process

Purely as an exercise, we can explore both preparing and booting by starting `irb` in a directory containing a Hanami project. This is not something that's needed in day to day development with Hanami - it's useful here as a demonstration of the booting behaviour.

Assuming we have run `hanami new bookshelf` to generate a new app (see [Getting started](/v2.3/introduction/getting-started/) for a full guide to creating your first Hanami application), let's create a hello world component in `app/hello_world.rb`:

```ruby
# app/hello_world.rb

module Bookshelf
  class HelloWorld
    def say_hello
      "Hello world!"
    end
  end
end
```

And now, in our project directory, let's run `irb`:

```ruby
bundle exec irb

irb(main)>
```

Typing `Hanami` here will result in a `NameError`:

```ruby
irb(main)> Hanami
(irb):1:in `<main>': uninitialized constant Hanami (NameError)
```

Let's address that by running `require "hanami"`.

Once the Hanami module is available, calling `Hanami.setup` will load the Hanami app defined in `config/app.rb`:

```ruby
irb(main)> require "hanami"
=> true

irb(main)> Hanami.setup
=> Bookshelf::App

irb(main)> Hanami.app
=> Bookshelf::App
```

We can now ask our app whether it's prepared or booted:

```ruby
irb(main)> Hanami.app.prepared?
=> false

irb(main)> Hanami.app.booted?
=> false
```

We can also see what components are registered with the app by calling `#keys`:

```ruby
irb(main)> Hanami.app.keys
=> []
```

This makes sense, as the app hasn't even been prepared yet, meaning component registration hasn't begun!

Let's prepare the app now, then ask what component keys are registered:

```ruby
irb(main)> Hanami.prepare
=> Bookshelf::App

irb(main)> Hanami.app.prepared?
=> true

irb(main)> Hanami.app.keys
=> ["settings", "notifications"]
```

Two components are now present: `settings` and `notifications`.

`notifications` is an instance of `Dry::Monitor::Notifications` that's registered early in the prepare process to support inter-component notifications (for now mostly a framework-internal concern).

The `settings` component has been loaded in order to ensure that necessary settings are present. If a setting wasn't satisfied, the app would have raised an invalid settings error at this point.

You'll notice that our hello world component does not appear under the key `"hello_world"`. If we called `Hanami.boot` at this point, the eager component loading would register it for us.

Rather than do that though, let's see what happens if we just try to use our component.

```ruby
irb(main):011:0> Hanami.app["hello_world"].say_hello
=> "Hello world!"
```

Success! Even though the component wasn't yet registered, it was lazily loaded when we used it!

If we now check what components have been registered in the app container, we'll see `"hello_world"`.

```ruby
irb(main)> Hanami.app.keys
=> ["settings", "notifications", "hello_world"]
```

From here, calling `Hanami.boot` will register the remainder of our application's components, which in this case are just the components registered by Hanami's default providers: `"routes"`, `"inflector"`, `"logger"` and `"rack.monitor"`.

```ruby
irb(main)> Hanami.boot
=> Bookshelf::App

irb(main)> Hanami.app.keys
["settings",
 "notifications",
 "hello_world",
 "routes",
 "inflector",
 "logger",
 "rack.monitor"]
```

You can read more about components and containers in more detail in the [container and components guide](/v2.3/app/container-and-components/). Providers are covered in the [providers guide](/v2.3/app/providers/).
