---
title: Overview
order: 10
---

An action is an endpoint that handles incoming HTTP requests for a specific [route](/v2.0/router/overview).

In a Hanami application, **an action is an object**.

This design provides self-contained actions that don't share their context accidentally with other actions. It also prevents gigantic controllers to appear in the project.
It has several advantages in terms of testability and control of a single action.

## A Simple Action

**TODO: Add information about generators when ready**

Before we create an action, let's visit our routes and add there a pointer to it.

```ruby
# apps/web/config/routes.rb
slice :main, at: "/" do
  #...
  define do
    get 'dashboard', to: 'dashboard.index'
  end
end
```

Now we have the `/dashboard` path recognized by our application, but it points to non-existing action.

To create an action, create a new file under the `/app/actions`. 

```ruby
# app/actions/dashboard/index.rb

module Sandbox
  module Actions
    module Dashboard
      class Index < Action
        def handle(req, res)
          res.status = 200
          res.body = "<h3>Hanami Dashboard!</h3>"
        end
      end
    end
  end
end
```

When we visit a `/dashboard` URL, our application will call a newly generated file with request parameters put into it. Check out [router chapter](/v2.0/router/overview) for details on how routing works in Hanami applications.

Now let's examine the newly generated action file:

```ruby
# app/actions/dashboard/index.rb

module Sandbox
  module Actions
    module Dashboard
      class Index < Action
      end
    end
  end
end
```

## Naming
That file begins with a module declaration which is the name of our app: `Sandbox`.

### Component Name

The second module, `Actions` points to the type of component the action is kind of. Within a single app, Hanami application consists of components, such as *actions*, *views*, *parts*, and so on.

### Controller Name

The last bit is `Dashboard`, which is a module grouping several actions related to the same context. Within the same context, we could for example have all CRUD actions like `Dashboard::Create` or `Dashboard::Destroy`.

The whole action name is `Main::Actions::Dashboard::Index`.

<p class="warning">
  You should avoid giving your action modules the same name as your slice or app e.g. avoid naming a controller <code>Main</code> in an app or slice named <code>Main</code>. If you're interested in details, check this <a href="/v2.0/extras/overview">reference</a>.
</p>

### Rendering

Empty action tries to look for a *view object* to render a template, according to a naming convention.

**TODO:** finish it up when views are ready

Action: `Sandbox::Actions::Dashboard::Index` will try to render a view: `Sandbox::Views::Dashboard::Index`.

> If you want to learn more about view objects, feel free to jump into the [views overview](/v2.0/views/overview) - you can always come back later!

To customize or extend the default action's behavior, let's visit the [basic usage](/v2.0/actions/basic_usage) section of actions guides!
