---
title: Overview
order: 10
---

An action is an endpoint that handles incoming HTTP requests for a specific [route](/v2.0/router/overview).

In a Hanami application, **an action is an object**.

This design provides self-contained actions that don't share their context accidentally with other actions. It also prevents gigantic controllers to appear in the project.
It has several advantages in terms of testability and control of a single action.

## A Simple Action

Hanami ships with a generator for actions. Let's create a new one for the main slice:

```shell
$ hanami g action main dashboard#index
# => creates file /slices/main/actions/dashboard/index.rb
# => updates config/routes.rb
```

This command created a new file and updated our `config/routes.rb` file by adding a new line to its content:

```ruby
# apps/web/config/routes.rb
slice :main, at: "/" do
  #...
  get '/dashboard', to: 'dashboard#index'
end
```

From now on, when we'll visit `/dashboard` URL, our application will call a newly generated file with request parameters put into it. Check out [router chapter](/v2.0/router/overview) for details how routing works in Hanami applications.

Now let's examine the newly generated action file:

```ruby
# slices/main/actions/dashboard/index.rb

module Main
  module Actions
    module Dashboard
      class Index < Main::Action
      end
    end
  end
end
```

## Naming
That file begins with a module declaration which is the name of our slice: `Main`.

### Slice Module Name

Hanami project is organized around multiple slices - to help you structure your code in well-organized pieces since day one for easier scalability.

Their name is used as a **top-level module to contain inner components** like actions and views, in order to **avoid naming collisions**. If we have another action `Home::Index` under an application `Admin`, the two of them can coexist inside the same codebase.

### Component Name

The second module, `Actions` points to the type of component the action is kind of. Within a single slice, Hanami application consists of components, such as *actions*, *views*, *parts*, and so on.

### Controller Name

The last bit is `Dashboard`, which is a module grouping several actions related to the same context. Within the same context, we could for example have all CRUD actions like `Dashboard::Create` or `Dashboard::Destroy`.

The whole action name is `Main::Actions::Dashboard::Index`.

<p class="warning">
  You should avoid giving your action modules the same name as your slice, e.g. avoid naming a controller <code>Main</code> in an slice named <code>Main</code>. If you're interested in details, check this <a href="/v2.0/extras/overview">reference</a>.
</p>
### Rendering

Empty action tries to look for a *view object* to render a template, according to a naming convention.

Action: `Main::Actions::Dashboard::Index` will try to render a view: `Main::Views::Dashboard::Index`.

> If you want to learn more about view objects, feel free to jump into the [views overview](/v2.0/views/overview) - you can always come back later!

To customize or extend default action's behavior, let's visit the [basic usage](/v2.0/actions/basic_usage) section of actions guides!