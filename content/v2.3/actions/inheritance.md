---
title: Inheritance
order: 120
---

When you inherit from an action class, you also inherit much of its behavior. This includes:

- Dependencies specified with the Deps mixin
- Config
- Callbacks
- Parameter validation schemas

You can use action inheritance to ensure that broad collections of actions all have consistent key behaviors.

For example, consider the following base action class.

```ruby
# apps/action.rb

module Bookshelf
  class Action < Hanami::Action
    include Deps["authenticator"]

    format :json

    before :authenticate_user!

    private

    def authenticate_user!(request, response)
      halt 401 unless authenticator.valid_api_token?(request.headers["X-API-Token"])
    end
  end
end
```

Any class that inherits from this will:

- Have the `authenticator` object available to its instance methods
- Expect JSON requests and return JSON responses
- Ensure that requests are authenticated based on the `X-API-Token` and return a 401 error if not

Courtesty of the inheritance, subclasses gain all this behavior without any additional code.

```ruby
# app/actions/books/index.rb

module Bookshelf
  module Actions
    module Books
      class Index < Bookshelf::Action
      end
    end
  end
end
```

## Standard base classes

When you create a new Hanami app, Hanami generates a standard base class for all your actions to inherit from.

```ruby
# apps/action.rb

module Bookshelf
  class Action < Hanami::Action
  end
end
```

Hanami also generates a base action class for each slice.

```ruby
# slices/admin/action.rb

module Admin
  class Action < Hanami::Action
  end
end
```

These base classes can be a useful place to put any config or behavior that you want for every action in your app or slice.

## Leveraging action inheritance

Since actions are just regular Ruby classes, you can also use all the standard Ruby techniques to share behaviour across various subsets of your actions.

For example, you could make a new base class for a specific group of actions:

```ruby
# app/actions/user_profile/base.rb

module Bookshelf
  module Actions
    module UserProfile
      class Base < Bookshelf::Action
        before :authenticate_user!

        private

        def authenticate_user!(request, response)
          # halt 401 unless ...
        end
      end
    end
  end
end
```

Any classes within this namespace could inherit from `Actions::UserProfile::Base` and share common user authentication behaviour.

Alternatively, for authentication behaviour that may need to be used across a range of disparate actions, you could also consider a module.

```ruby
# app/actions/authenticated_action.rb

module Bookshelf
  module Actions
    module AuthenticatedAction
      def self.included(action_class)
        action_class.before :authenticate_user!
      end

      private

      def authenticate_user!(request, response)
        # halt 401 unless ...
      end
    end
  end
end
```

With this, any action requiring authentication can include the module.

```ruby
module Bookshelf
  module Actions
    module UserProfile
      class Update < Bookshelf::Action
        include AuthenticatedAction
      end
    end
  end
end
```
