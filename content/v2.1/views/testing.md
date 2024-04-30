---
title: Testing
order: 101
---

Views in hanami are based on [dry-view](https://dry-rb.org/gems/dry-view/0.7/testing/) and you can expect inheritance of its approach to testing. This means that `every component [is] designed to support unit testing, in full isolation`

No single approach is enforced, you can test entire views, parts, templates, or even individual methods. However a general advice would be to: 

<p class="convention">
Resort to detailed unit-level testing when a detailed view logic is present.
</p>

In those cases a full "feature"-type specs would be too slow to setup, run and hard to maintain. On the other hand, maintaining unit test that are very detailed in what the view renders would also be cumbersome when views are subjects to changes.

## Testing entire view

Views are relatively simple objects, and testing them in full isolation should be easy. After initialization and providing dependencies (with mocks and doubles or not) you simply call the object and define expectations.

Given a view, with dependency and simple logic in the template, like this:
```ruby
module Profile
  class Show < Main::View
    include Deps[users_repo: "repositories.users"]
    
    expose :current_user

    expose :user do |id:|
      users_repo.by_id(id)
    end
  end
end
```

```erb
<% if current_user.id == user.id %>
  <p class="text-base">This is your profile. You can edit your data.</p>
<% else %>
  <p class="text-base">This is the profile of <%= user.name %>. You can admire it.</p>
<% end %>
```

You can test it like this:
```ruby
RSpec.describe Profile::Show do
  User = Struct.new(:name, :id)
  subject(:view) { described_class.new(users_repo: users_repo) }
  let(:users_repo) { double(:users_repo) }
  let(:current_user) { User.new(name: "Dale", id: 2) }

  context "when user inspects his profile" do
    it "renders his profile" do
      allow(users_repo).to receive(:by_id).with(2).and_return(current_user)

      rendered = view.call(current_user: current_user, id: 2)

      expect(rendered.to_s).to include("This is your profile. You can edit your data.")
    end
  end

  context "when user is inspecting someone else's profile" do
    let(:user) { User.new(name: "Chip", id: 1) }

    it "renders other user profile" do
      allow(users_repo).to receive(:by_id).with(1).and_return(user)

      rendered = view.call(current_user: current_user, id: 1)

      expect(rendered.to_s).to include("This is the profile of Chip. You can admire it.")
    end
  end
end
```
<p class="notice">
Just calling the initialized view object with `#call` will return an instance of `Hanami::View::Rendered`, that is why `to_s` is used.  
</p>

## Testing exposures

Since default `call` returns a `Hanami::View::Rendered` object, you can easily test exposed values. 
This example is an extension of the one above.

```ruby
describe "exposures" do
  subject(:rendered) { view.call(current_user: current_user, id: 1) }
  let(:user) { User.new(name: "Chip", id: 1) }

  before do
    allow(users_repo).to receive(:by_id).with(1).and_return(user)
  end

  it "exposes current_user" do
    expect(rendered[:current_user].name).to eq(current_user.name)
  end

  it "exposes user" do
    expect(rendered[:user].id).to eq(user.id)
  end
end
```

## Parts testing

As mentioned before, all parts of hanami-view can be tested in complete isolation. This means that in testing parts can be completely isolated from the views they are used by.

```ruby
class User < Main::Part
  def decorated_name
    "User: #{value.name.upcase}"
  end
end
```

```ruby
RSpec.describe User do
  subject(:part) { described_class.new(value: user) }
  let(:user) {  Struct.new(:name).new("chip") }

  it 'decorates name' do
    expect(part.decorated_name).to eq "User: CHIP"
  end
end
```

And if we want to check how they are actually rendered, we just need to provide them a view, like it usually happens in the regular view lifecycle.

Just keep in mind, we don't even have to use an existing view, we can provide a much more minimalistic one, just for testing, to keep the test composable and fast, not bringing in any baggage from an existing view.

```ruby
RSpec.describe Parts::User do
  subject(:part_class) { described_class }
  let(:user) { Struct.new(:name).new("chip") }

  context "with rendering" do
    let(:view) do
      Class.new(Hanami::View) do
        config.paths = "spec/fixtures/integration/testing"
        config.template = "main"
      end.new
    end
    let(:part) { part_class.new(name: :user, value: user, rendering: view.rendering) }

    it "renders the user card" do
      expect(part.card).to match %(<div class="card-header"><h4 class="card-title">User: CHIP</h4></div>).strip
    end
  end
end
```

This is still for the same part as before, but extended:

```ruby
module Parts
  class User < Libus::Part
    def decorated_name
      "User: #{value.name.upcase}"
    end

    def card
      render "user_card", name: decorated_name
    end
  end
end
```

With a simple html, using the passed local

```erb
<div class="card-header"><h4 class="card-title"><%= name %></h4></div>
```
