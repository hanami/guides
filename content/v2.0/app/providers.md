---
title: Providers
order: 30
---

Providers are a way to register components with your containers, outside of the automatic registration mechanism detailed in [containers and components](/v2.0/app/container-and-components/).

Providers are useful when:

- you want to register a specific instance of an object as a component, and have that very same instance be available as a dependency
- you need to set up a dependency that requires non-trivial configuration (often a third party library, or some library-like code in your `lib` directory)
- you want to take advantage of provider lifecycle methods (prepare, start and stop)

Providers should be placed in the `config/providers` directory. Here's an example provider for that registers a client for an imagined third-party Acme Email delivery service.

```ruby
# config/providers/email_client.rb

Hanami.app.register_provider(:email_client) do
  prepare do
    require "acme_email/client"
  end

  start do
    client = AcmeEmail::Client.new(
      api_key: target["settings"].acme_api_key,
      default_from: "no-reply@bookshelf.example.com"
    )

    register "email_client", client
  end
end
```

The above provider creates an instance of Acme's email client, using an API key from our application's settings, then registers the client in the app container with the key `"email_client"`.

The registered dependency can now become a dependency for other components, via `include Deps["email_client"]`:

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

Every provider has a name (`Hanami.app.register_provider(:my_provider_name)`) and will usually register _one or more_ related components with the relevant container.

Registered components can be any kind of object - they can be classes too.

To register an item with the container, providers call `register`, which takes two arguments: the _key_ to be used, and the _item_ to register under it.

```ruby
# config/providers/my_provider.rb

Hanami.app.register_provider(:my_provider) do
  start do
    register "my_thing", MyThing.new
    register "another.thing", AnotherThing.new
    register "thing", Thing
  end
end
```

## Provider lifecycle

Providers offer a three-stage lifecycle: `prepare`, `start`, and `stop`. Each has a distinct purpose:

- prepare - basic setup code, here you can require third-party code, or code from your `lib` directory, and perform basic configuration
- start - code that needs to run for a component to be usable at runtime
- stop - code that needs to run to stop a component, perhaps to close a database connection, or purge some artifacts.

```ruby
# config/providers/database.rb

Hanami.app.register_provider(:database) do
  prepare do
    require "acme/db"

    register "database", Acme::DB.configure(target["settings"].database_url)
  end

  start do
    target["database"].establish_connection
  end

  stop do
    target["database"].close_connection
  end
end
```

A provider's prepare and start steps will run as necessary when a component that the provider registers is used by another component at runtime.

`Hanami.boot` calls `start` on each of your application’s providers, meaning each of your providers is started automatically when your application boots. Similarly, `Hanami.shutdown` can be invoked to call `stop` on each provider.

You can also trigger lifecycle transitions directly by using `Hanami.app.prepare(:provider_name)`, `Hanami.app.start(:provider_name)` and `Hanami.app.stop(:provider_name)`.

## Accessing the container via `target`

Within a provider, the `target` method (also available as `target_container`) can be used to access the app container.

This is useful if your provider needs to use other components within the container, for example the application's settings or logger (via `target["settings]` and `target["logger"]`). It can also be used when a provider wants to ensure another provider has started before starting itself, via `target.start(:provider_name)`:

```ruby title="config/providers/uploads_bucket"
Hanami.app.register_provider(:uploads_bucket) do
  prepare do
    require "aws-sdk-s3"
  end

  start do
    target.start(:metrics)

    uploads_bucket_name = target["settings"].uploads_bucket_name

    credentials = Aws::Credentials.new(
      target["settings"].aws_access_key_id,
      target["settings"].aws_secret_access_key,
    )

    uploads_bucket = Aws::S3::Resource.new(credentials: credentials).bucket(uploads_bucket_name)

    register "uploads_bucket", uploads_bucket
  end
end
```
