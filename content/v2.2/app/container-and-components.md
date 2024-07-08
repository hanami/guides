---
title: Container and components
order: 20
---

In Hanami, the application code you add to your `app` directory is automatically organised into a **container**, which forms the basis of a **component management system**.

The **components** within that system are the objects you create to get things done within your application. For example, a HTTP action for responding to requests, a validation contract for verifying data, an operation for writing to the database, or a client that calls an external API.

Ideally, each component in your application has a single responsibility. Very often, one component will need to use other components to achieve its work. When this happens, we call the latter components **dependencies**.

Hanami is designed to make it easy to create applications that are systems of well-formed components with clear dependencies.

Let's take a look at how this works in practice!

Imagine we want our Bookshelf application to send welcome emails to new users. Assuming that we're already handling user sign ups, our task is now to create an operation for sending the welcome email. We're going to use an external mail delivery service, while sending email in both html and plain text.

To achieve this, we first add two new components to our application: a _send welcome email operation_, and a _welcome email renderer_.

On the file system, this looks like:

```shell
app
├── operations
│   └── send_welcome_email.rb
└── renderers
    └── welcome_email.rb
```

Sketching out a send welcome email operation component:

```ruby
# app/operations/send_welcome_email.rb

module Bookshelf
  module Operations
    class SendWelcomeEmail
      def call(name:, email_address:)
        # Send a welcome email to the user here...
      end
    end
  end
end
```

And a welcome email renderer component:

```ruby
# app/renderers/welcome_email.rb

module Bookshelf
  module Renderers
    class WelcomeEmail
      def render_html(name:)
        "<p>Welcome to Bookshelf #{name}!</p>"
      end

      def render_text(name:)
        "Welcome to Bookshelf #{name}!"
      end
    end
  end
end
```

When our application boots, Hanami will automatically register these classes as components in its __app container__, each under a __key__ based on their Ruby class name.

This means that an instance of the `Bookshelf::Operations::SendWelcomeEmail` class is available in the container under the key `"operations.send_welcome_email"`, while an instance of `Bookshelf::Renderers::WelcomeEmail` is available under the key `"renderers.welcome_email"`.

We can see this in the Hanami console if we boot our application and ask what keys are registered with the app container:

```ruby
bundle exec hanami console

bookshelf[development]> Hanami.app.boot
=> Bookshelf::App

bookshelf[development]> Hanami.app.keys
=> ["notifications",
 "settings",
 "routes",
 "inflector",
 "logger",
 "rack.monitor",
 "operations.send_welcome_email",
 "renderers.welcome_email"]
 ```

To fetch our welcome email send operation from the container, we can ask for it by its `"operations.send_welcome_email"` key:

```ruby
bookshelf[development]> Hanami.app["operations.send_welcome_email"]
=> #<Bookshelf::Operations::SendWelcomeEmail:0x00000001055dadd0>
```

Similarly we can fetch and call the renderer via the `"renderers.welcome_email"` key:

```ruby
bookshelf[development]> Hanami.app["renderers.welcome_email"]
=> #<Bookshelf::Renderers::WelcomeEmail:0x000000010577afc8>

bookshelf[development]> Hanami.app["renderers.welcome_email"].render_html(name: "Ada")
=> "<p>Welcome to Bookshelf Ada!</p>"
```

Most of the time however, you won't work with components directly through the container via `Hanami.app`. Instead, you'll work with components through the convenient __dependency injection__ system that having your components in a container supports. Let's see how that works!

## Dependency injection

Dependency injection is a software pattern where, rather than a component knowing how to instantiate its dependencies, those dependencies are instead provided to it. This means the dependencies can be abstract rather than hard coded, making the component more flexible, reusable and easier to test.

To illustrate, here's an example of a send welcome email operation which **doesn't** use dependency injection:

```ruby
# app/operations/send_welcome_email.rb

require "acme_email/client"

module Bookshelf
  module Operations
    class SendWelcomeEmail
      def call(name:, email_address:)
        email_client = AcmeEmail::Client.new

        email_renderer = Renderers::WelcomeEmail.new

        email_client.deliver(
          to: email_address,
          subject: "Welcome!",
          text_body: email_renderer.render_text(name: name),
          html_body: email_renderer.render_html(name: name)
        )
      end
    end
  end
end
```

This component has two dependencies, each of which is a "hard coded" reference to a concrete Ruby class:

- `AcmeEmail::Client`, used to send an email via the third party Acme Email service.
- `Renderers::WelcomeEmail`, used to render text and html versions of the welcome email.

To make this send welcome email operation more resuable and easier to test, we could instead _inject_ its dependencies when we initialize it:

```ruby
# app/operations/send_welcome_email.rb

require "acme_email/client"

module Bookshelf
  module Operations
    class SendWelcomeEmail
      attr_reader :email_client
      attr_reader :email_renderer

      def initialize(email_client:, email_renderer:)
        @email_client = email_client
        @email_renderer = email_renderer
      end

      def call(name:, email_address:)
        email_client.deliver(
          to: email_address,
          subject: "Welcome!",
          text_body: email_renderer.render_text(name: name),
          html_body: email_renderer.render_html(name: name)
        )
      end
    end
  end
end
```

As a result of injection, this component no longer has rigid dependencies - it's able to use any email client and email renderer it's provided.

Hanami makes this style of dependency injection simple through its `Deps` mixin. Built into the component management system, and invoked through the use of `include Deps["key"]`, the `Deps` mixin allows a component to use any other component in its container as a dependency, while removing the need for any attr_reader or initializer boilerplate:

```ruby
# app/operations/send_welcome_email.rb

module Bookshelf
  module Operations
    class SendWelcomeEmail
      include Deps[
        "email_client",
        "renderers.welcome_email"
      ]

      def call(name:, email_address:)
        email_client.deliver(
          to: email_address,
          subject: "Welcome!",
          text_body: welcome_email.render_text(name: name),
          html_body: welcome_email.render_html(name: name)
        )
      end
    end
  end
end
```

## Injecting dependencies via `Deps`

In the above example, the `Deps` mixin takes each given key and makes the relevant component from the app container available within the current component via an instance method.

i.e. this code:

```ruby
include Deps[
  "email_client",
  "renderers.welcome_email"
]
```

makes the `"email_client"` component from the container available via an `#email_client` method, and the `"renderers.welcome_email"` component available via `#welcome_email`.

By default, dependencies are made available under a method named after the last segment of their key. So `include Deps["renderers.welcome_email"]` allows us to call `#welcome_email` anywhere in our `SendWelcomeEmail` class access the welcome email renderer.

We can see `Deps` in action in the console if we instantiate an instance of our send welcome email operation:

```ruby
bookshelf[development]> Bookshelf::Operations::SendWelcomeEmail.new
=> #<Bookshelf::Operations::SendWelcomeEmail:0x0000000112a93090
 @email_client=#<AcmeEmail::Client:0x0000000112aa82d8>,
 @welcome_email=#<Bookshelf::Renderers::WelcomeEmail:0x0000000112a931d0>>
```

We can choose to provide different dependencies during initialization:

```ruby
bookshelf[development]> Bookshelf::Operations::SendWelcomeEmail.new(email_client: "another client")
=> #<Bookshelf::Operations::SendWelcomeEmail:0x0000000112aba8c0
 @email_client="another client",
 @welcome_email=#<Bookshelf::Renderers::WelcomeEmail:0x0000000112aba9b0>>
```

This behaviour is particularly useful when testing, as you can substitute one or more components to test behaviour.

In this unit test, we substitute each of the operation's dependencies in order to unit test its behaviour:

```ruby
# spec/unit/operations/send_welcome_email_spec.rb

RSpec.describe Bookshelf::Operations::SendWelcomeEmail, "#call" do
  subject(:send_welcome_email) {
    described_class.new(email_client: email_client, welcome_email: welcome_email)
  }

  let(:email_client) { double(:email_client) }
  let(:welcome_email) { double(:welcome_email) }

  before do
    allow(welcome_email).to receive(:render_text).and_return("Welcome to Bookshelf Ada!")
    allow(welcome_email).to receive(:render_html).and_return("<p>Welcome to Bookshelf Ada!</p>")
  end

  it "sends a welcome email" do
    expect(email_client).to receive(:deliver).with(
      to: "ada@example.com",
      subject: "Welcome!",
      text_body: "Welcome to Bookshelf Ada!",
      html_body: "<p>Welcome to Bookshelf Ada!</p>"
    )

    send_welcome_email.call(name: "Ada!", email_address: "ada@example.com")
  end
end
```

Exactly which dependency to stub using RSpec mocks is up to you - if a depenency is left out of the constructor within the spec, then the real dependency is resolved from the container. This means that every test can decide exactly which dependencies to replace.

## Renaming dependencies

Sometimes you want to use a dependency under another name, either because two dependencies end with the same suffix, or just because it makes things clearer in a different context.

This can be done by using the `Deps` mixin like so:

```ruby title="app/operations/send_welcome_email.rb"
module Bookshelf
  module Operations
    class SendWelcomeEmail
      include Deps[
        "email_client",
        email_renderer: "renderers.welcome_email"
      ]

      def call(name:, email_address:)
        email_client.deliver(
          to: email_address,
          subject: "Welcome!",
          text_body: email_renderer.render_text(name: name),
          html_body: email_renderer.render_html(name: name)
        )
      end
    end
  end
end
```

Above, the welcome email renderer is now available via the `#email_renderer` method, rather than via `#welcome_email`. When testing, the renderer can now be substituted by providing `email_renderer` to the constructor:

```ruby
subject(:send_welcome_email) {
  described_class.new(email_client: mock_email_client, email_renderer: mock_email_renderer)
}
```

## Opting out of the container

Sometimes it doesn’t make sense for something to be put in the container. For example, Hanami provides a base action class at `app/action.rb` from which all actions inherit. This type of class will never be used as a dependency by anything, and so registering it in the container doesn’t make sense.

For once-off exclusions like this Hanami supports a magic comment: `# auto_register: false`

```ruby
# auto_register: false
require "hanami/action"

module Bookshelf
  class Action < Hanami::Action
  end
end
```

If you have a whole class of objects that shouldn't be placed in your container, you can configure your Hanami application to exclude an entire directory from auto registration by adjusting its `no_auto_register_paths` configuration.

Here for example, the `app/structs` directory is excluded, meaning nothing in the `app/structs` directory will be registered with the container:

```ruby
# config/app.rb

require "hanami"

module Bookshelf
  class App < Hanami::App
    config.no_auto_register_paths << "structs"
  end
end
```

A third alternative for classes you do not want to be registered in your container is to place them in the `lib` directory at the root of your project.

For example, this `SlackNotifier` class can be used anywhere in your application, and is not registered in the container:

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

```ruby
# app/operations/send_welcome_email.rb

module Bookshelf
  module Operations
    class SendWelcomeEmail
      include Deps[
        "email_client",
        "renderers.welcome_email"
      ]

      def call(name:, email_address:)
        email_client.deliver(
          to: email_address,
          subject: "Welcome!",
          text_body: welcome_email.render_text(name: name),
          html_body: welcome_email.render_html(name: name)
        )

        SlackNotifier.notify("Welcome email sent to #{email_address}")
      end
    end
  end
end
```

### Autoloading and the lib directory

[Zeitwerk](https://github.com/fxn/zeitwerk) autoloading is in place for code you put in `lib/<app_name>`, meaning that you do not need to use a `require` statement before using it.

Code that you place in other directories under `lib` needs to be explicitly required before use.

| Constant location               | Usage                                      |
|---------------------------------|--------------------------------------------|
| lib/bookshelf/slack_notifier.rb | Bookshelf::SlackNotifier                   |
| lib/my_redis/client.rb          | require "my_redis/client"<br /><br />  MyRedis::Client |


## Container compontent loading

Hanami applications support a **prepared** state and a **booted** state.

Whether your app is prepared or booted determines whether components in your app container are _lazily_ loaded on demand, or _eagerly_ loaded up front.

### Hanami.prepare

When you call `Hanami.prepare` (or use `require "hanami/prepare"`) Hanami will make its app available, but components within the app container will be **lazily loaded**.

This is useful for minimizing load time. It's the default mode in the Hanami console and when running tests.

### Hanami.boot

When you call `Hanami.boot` (or use `require "hanami/boot"`) Hanami will go one step further and **eagerly load** all components up front.

This is useful in contexts where you want to incur initialization costs at boot time, such as when preparing your application to serve web requests. It's the default when running via Hanami's puma setup (see `config.ru`).

## Standard components

Hanami provides several standard app components for you to use.

### `"settings"`

These are your settings defined in `config/settings.rb`. See the [settings guide](/v2.1/app/settings) for more detail.

### `"logger"`

The app's standard logger. See the [logger guide](/v2.1/logger/usage) for more detail.

### `"inflector"`

The app's inflector. See the [inflector guide](/v2.1/app/inflector) for more detail.

### `"routes"`

An object providing URL helpers for your named routes. See the [routing guide](/v2.1/routing/overview/#named-routes) for more detail.
