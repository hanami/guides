---
title: Testing
order: 101
aliases:
  - "/views/testing"
---

Views in Hanami are designed to encourage easier testing of your views, with each aspect of views designed to support direct unit testing. This means you can test your views at whatever level of granularity makes sense for you.

## Testing views

To test a view directly, initialize it, passing in any dependencies it requires. If the view's dependencies are provided via the deps mixin, then a simple `.new` should be sufficient. Provide test doubles for certain dependencies if you want to simulate certain conditions.

Then, call the view with the expected arguments, and make your test expectations against its output.

Given this view:

```ruby
# app/views/profile/show.rb

module Profile
  class Show < Main::View
    include Deps[users_repo: "repos.user_repo"]

    expose :current_user

    expose :user do |id:|
      user_repo.by_id(id)
    end
  end
end
```

```sql
<%# app/templates/views/profile/show.html.erb %>

<% if current_user.id == user.id %>
  <p class="text-base">This is your profile. You can edit your data.</p>
<% else %>
  <p class="text-base">This is the profile of <%= user.name %>. You can admire it.</p>
<% end %>
```

A test could look like this:

```ruby
# spec/unit/views/profile/show_spec.rb

RSpec.describe Views::Profile::Show do
  subject(:view) { described_class.new(users_repo:) }

  let(:user_repo) { double(:user_repo) }
  let(:current_user) { double(:user, name: "Amy", id: 1) }

  context "user inspects their profile" do
    it "renders their profile" do
      allow(user_repo).to receive(:by_id).with(1).and_return(current_user)

      output = view.call(current_user:, id: 1).to_s

      expect(output).to include("This is your profile. You can edit your data.")
    end
  end

  context "user inspects someone else's profile" do
    let(:other_user) { double(:user, name: "Lena", id: 2)}

    it "renders the other user's profile" do
      allow(users_repo).to receive(:by_id).with(2).and_return(other_user)

      output = view.call(current_user:, id: 2).to_s

      expect(output).to include("This is the profile of Lena. You can admire it.")
    end
  end
end
```

<p class="notice">
Views return from `#call` an instance of `Hanami::View::Rendered`. To get a plain string, use `#to_s`.
</p>

## Testing exposures

To test a view's [exposures](/v2.2/views/input-and-exposures/) directly, you can access them on the `Hanami::View::Rendered` object returned after calling your view.

```ruby
describe "exposures" do
  subject(:rendered) { view.call(current_user: current_user, id: 1) }

  let(:user) { double(:user, name: "Amy", id: 1) }

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

## Testing parts

To test part behavior, initialize a part and make your expecations against its methods.

```ruby
module MyApp
  module Views
    module Parts
      class User < MyApp::Views::Part
        def display_name
          "#{name} (#{email})"
        end
      end
    end
  end
end

RSpec.describe(MyApp::Views::Parts::User) do
  subject(:part) { described_class.new(value: user) }
  let(:user) { double(:user, name: "Amy", email: "amy@example.com"}

  describe "#display_name" do
    it "includes the name and email" do
      expect(part.display_name).to eq "Amy (amy@example.com)"
    end
  end
end
```

You can also use the same approach to test part behavior that requires helpers, renders partials, or accesses the context.

```ruby
module MyApp
  module Views
    module Parts
      class User < MyApp::Views::Part
        def display_name
          "#{name} (#{email})"
        end

        # Using a helper
        def title_tag
          helpers.tag.h1(display_name)
        end

        # Rendering a partial at templates/users/_info_card.html
        def info_card
          render("users/info_card")
        end
      end
    end
  end
end

RSpec.describe(MyApp::Views::Parts::User) do
  subject(:part) { described_class.new(value: user) }
  let(:user) { double(:user, name: "Amy", email: "amy@example.com"}

  describe "#title_tag" do
    it "includes the name and email in a h1 tag" do
      expect(part.title_tag).to eq "<h1>Amy (amy@example.com)</h1>"
    end
  end

  describe "#info_card" do
    it "renders the info card" do
      expect(part.info_card).to start_with %(<div class="user-info-card">)
    end
  end
end
```
