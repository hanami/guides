---
title: Form Helper
order: 30
---
# Form Helper

Yields a form builder for constructing an HTML form and returns the resulting form string.


## form_for

Builds the form using the given base name for all fields.
The overall structure of the attributes available is as follows:

### Usage

**Basic Example**

```ruby
<%= form_for("book", "/books", class: "form-horizontal") do |f| %>
  <div>
    <%= f.label "title" %>
    <%= f.text_field "title", class: "form-control" %>
  </div>

  <%= f.submit "Create" %>
<% end %>
```

This will render HTML as shown below:

```html
<form action="/books" method="POST" accept-charset="utf-8" class="form-horizontal">
  <input type="hidden" name="_csrf_token" value="920cd5bfaecc6e58368950e790f2f7b4e5561eeeab230aa1b7de1b1f40ea7d5d">
  <div>
    <label for="book-title">Title</label>
    <input type="text" name="book[title]" id="book-title" value="Test Driven Development">
  </div>

  <button type="submit">Create</button>
</form>
```

All the fields had been prefixed with the form's name (`"book"`) passed as a first argument.

To show CSRF meta tags, you need to have [sessions enabled](/v2.0/actions/sessions). Without that, you won't have the `csrf_token` hidden input field available.

**Skipping the form name**

If you don't want to use the form name, skip it, and pass a URL as a first argument.

```ruby
<%= form_for("/books", class: "form-horizontal") do |f| %>
  <div>
    <%= f.label "book.title" %>
    <%= f.text_field "books.title", class: "form-control" %>
  </div>

  <%= f.submit "Create" %>
<% end %>
```

This way you get a full control over naming each of the form's element

```html
<form action="/books" method="POST" accept-charset="utf-8" class="form-horizontal">
  <input type="hidden" name="_csrf_token" value="920cd5bfaecc6e58368950e790f2f7b4e5561eeeab230aa1b7de1b1f40ea7d5d">
  <div>
    <label for="book-title">Title</label>
    <input type="text" name="book[title]" id="book-title" value="Test Driven Development">
  </div>

  <button type="submit">Create</button>
</form>
```

**Method overrides**

While the default HTTP request method is set to `POST`, you can override it by passing in the `method:` keyword.

```ruby
<%= form_for("/books/123", method: :put) do |f| %>
 <%= f.text_field "book.title" %>
 <%= f.submit "Update" %>
<% end %>
```

This will override the method giving you the control of the type of action you want to perform.

```ruby
<form action="/books/123" accept-charset="utf-8" method="POST">
 <input type="hidden" name="_method" value="PUT">
 <input type="hidden" name="_csrf_token" value="920cd5bfaecc6e58368950e790f2f7b4e5561eeeab230aa1b7de1b1f40ea7d5d">
 <input type="text" name="book[title]" id="book-title" value="Test Driven Development">

 <button type="submit">Update</button>
</form>
```

**Overriding form values**

There is often a scenario where you want to pre-fill the form values with the object loaded from the server. Form helper allows you to override any set of values by simply accepting a hash of attributes you want to replace.

```ruby
<%= form_for("/songs", values: {song: {title: "Envision"}}) do |f| %>
 <%= f.text_field "song.title" %>
 <%= f.submit "Create" %>
<%= end %>
```

The value in the `song-title` test field had been filled in from the passed in parameters.

```html
<form action="/songs" accept-charset="utf-8" method="POST">
 <input type="hidden" name="_csrf_token" value="920cd5bfaecc6e58368950e790f2f7b4e5561eeeab230aa1b7de1b1f40ea7d5d">
 <input type="text" name="song[title]" id="song-title" value="Envision">

 <button type="submit">Create</button>
</form>
```

## Building blocks
Below you can see a range of convenient methods for building the fields within an HTML form, integrating with request params and template locals to populate the fields with appropriate values.
### input
Generates an input tag without any special handling. For more convenience and other advanced features, see specific field type descriptions in this section.

**Basic usage**
```ruby
f.input(type: :text, name: "book[title]", id: "book-title", value: book.title)
=> <input type="text" name="book[title]" id="book-title" value="Hanami book">
```
### csrf_meta_tags
Returns CSRF meta tags for use via unobtrusive JavaScript (UJS) libraries.

**Usage**

```ruby
# /app/templates/layouts/app.html.erb

<%== csrf_meta_tags %>

# => <meta name="csrf-param" content="_csrf_token">
# => <meta name="csrf-token" content="4a038be85b7603c406dcbfad4b9cdf91ec6ca138ed6441163a07bb0fdfbe25b5">
```

To show CSRF meta tags, you need to have [sessions enabled](/v2.0/actions/sessions). Without that, you won't have the `csrf_token` hidden input field available.
### fields_for
Applies the base input name to all fields within the given block.

This can be helpful when generating a set of nested fields.

This is a convenience only. You can achieve the same result by including the base name at
the beginning of each input name.

**Usage**
```ruby
<% f.fields_for "address" do |fa| %>
   <%= fa.text_field "street" %>
   <%= fa.text_field "suburb" %>
<% end %>
```

This is the equivalent of

```ruby
<%= f.text_field "address.street" %>
<%= f.text_field "address.suburb" %>
```

which will render

```html
<input type="text" name="delivery[customer_name]" id="delivery-customer-name" value="">
<input type="text" name="delivery[address][street]" id="delivery-address-street" value="">
```

**Multiple levels of nesting**

There is no hard restriction on how much levels of nesting you can support this way, but general user experience advice is to avoid big multi-level forms, and if your form requires three or more nesting levels, you could consider refactoring it.

```ruby
<% f.fields_for "address" do |fa| %>
   <%= fa.text_field "street" %>

   <% fa.fields_for "location" do |fl| %>
	 <%= fl.text_field "city" %>
   <% end %>
 <% end %>
```

The rendered HTML for the code above looks as this:

```html
<input type="text" name="delivery[address][street]" id="delivery-address-street" value="">
<input type="text" name="delivery[address][location][city]" id="delivery-address-location-city" value="">
```

### fields_for_collection

Yields to the given block for each element in the matching collection value, and applies
the base input name to all fields within the block.

**Usage**

Use this whenever generating form fields for a collection of nested fields.

```ruby
<% f.fields_for_collection("addresses") do |fa| %>
  <%= fa.text_field("street") %>
<% end %>
```

It'll render the HTML input types for each of the collection values, setting their ids to the index, which starts from 0.

```html
<input type="text" name="delivery[addresses][][street]" id="delivery-address-0-street" value="">
<input type="text" name="delivery[addresses][][street]" id="delivery-address-1-street" value="">
```

**Yielding index and the value**

You can get access to the index number and the collection item value, by yielding additional parameters. This way you get control over rendering or tweaking them on the flow.

```ruby
<% f.fields_for_collection("bill.addresses") do |fa, i, address| %>
  <div class="form-group">
    Address id: <%= address.id %>
    <%= fa.label("street") %>
    <%= fa.text_field("street", data: {index: i.to_s}) %>
  </div>
<% end %>
```

```html
<div class="form-group">
  Address id: 23
  <label for="bill-addresses-0-street">Street</label>
  <input type="text" name="bill[addresses][][street]" id="bill-addresses-0-street" value="5th Ave" data-index="0">
</div>
<div class="form-group">
  Address id: 42
  <label for="bill-addresses-1-street">Street</label>
  <input type="text" name="bill[addresses][][street]" id="bill-addresses-1-street" value="4th Ave" data-index="1">
</div>
```

### label
Returns a label tag for the given field name, with a humanized version of the field name as the tag's content.

**Usage**
```ruby
<%= f.label("book.extended_title") %>
# => <label for="book-extended-title">Extended title</label>
```

**Adding HTML attibutes**

```ruby
<%= f.label("book.title", class: "form-label") %>
# => <label for="book-title" class="form-label">Title</label>
```

**Custom content value**

You may specify the `for:` attribute, and pass the label's content as a first argument, to gain the full control over the rendered HTML.

```ruby
<%= f.label("Title", for: "book.extended_title") %>
# => <label for="book-extended-title">Title</label>

f.label("book.extended_title", for: "ext-title")
# => <label for="ext-title">Extended title</label>
```

**Giving value in a block**

You may also provide the content's value in the block, which allows you to include other HTML tags if needed.
```ruby
<%= f.label for: "book.free_shipping" do %>
  Free shipping
  <abbr title="optional" aria-label="optional">*</abbr>
<% end %>

# =>
<label for="book-free-shipping">
  Free shipping
  <abbr title="optional" aria-label="optional">*</abbr>
</label>
```
### fieldset
Returns a fieldset tag. It is useful to group related items together.

```ruby
<%= f.fieldset do %>
  <%= f.legend("Author") %>
  <%= f.label("author.name") %>
  <%= f.text_field("author.name") %>
<% end %>

```

```html
<fieldset>
  <legend>Author</legend>
  <label for="book-author-name">Name</label>
  <input type="text" name="book[author][name]" id="book-author-name" value="">
</fieldset>
```

Keep in mind that this is only a visual improvement and does not affect the data structure being sent to the server.
### check_box
Returns the tags for a checkbox.

When editing a resource, the form automatically assigns the `checked` HTML attribute for the checkbox tag.

**Usage**

```ruby
f.check_box("delivery.free_shipping")
# =>
<input type="hidden" name="delivery[free_shipping]" value="0">
<input type="checkbox" name="delivery[free_shipping]" id="delivery-free-shipping" value="1">
```

Please notice, that **the helper also returns a hidden input tag preceding the checkbox input tag**. This ensures that unchecked values are submitted with the form.

**Adding HTML attributes**

```ruby
f.check_box("delivery.free_shipping", class: "form-check-input")

# =>
<input type="hidden" name="delivery[free_shipping]" value="0">
<input type="checkbox" name="delivery[free_shipping]" id="delivery-free-shipping" value="1" class="form-check-input">
```

**Specifying checked and unchecked values**

By default values of the checkbox are either "0" or "1", but you can control that with the `checked_value` and `unchecked_value` properties.

```ruby
f.check_box("delivery.free_shipping", checked_value: "true", unchecked_value: "false")

<input type="hidden" name="delivery[free_shipping]" value="false">
<input type="checkbox" name="delivery[free_shipping]" id="delivery-free-shipping" value="true">
```

**Automatic checked values**

If the form values match the `checked_value` of the checkbox, it'll automatically become checked. It works for "0" and "1" strings, integers, and boolean values, but you can match any two values and make them automatically recognized.

```ruby
# Given the request params:
# {delivery: {free_shipping: "1"}}
f.check_box("delivery.free_shipping")
# =>
<input type="hidden" name="delivery[free_shipping]" value="0">
<input type="checkbox" name="delivery[free_shipping]" id="delivery-free-shipping" value="1" checked="checked">
```

**Forcing the checked value**

Even if the corresponding field value is not matching the `checked_value`, you can still force the `check_box` to be checked with a usage of `checked` option.

```ruby
# Given the request params:
# {delivery: {free_shipping: "0"}}
f.check_box("deliver.free_shipping", checked: "checked")
# =>
<input type="hidden" name="delivery[free_shipping]" value="0">
<input type="checkbox" name="delivery[free_shipping]" id="delivery-free-shipping" value="1" checked="checked">
```

**Multiple checkboxes

If we have an array of values, and we'd like to send values only for those that are chosen, we can use the multiple checkboxes feature, specifying the name attribute:

```ruby
f.check_box("book.languages", name: "book[languages][]", value: "italian", id: nil)
f.check_box("book.languages", name: "book[languages][]", value: "english", id: nil)

# =>
<input type="checkbox" name="book[languages][]" value="italian">
<input type="checkbox" name="book[languages][]" value="english">
```

This will also automatically check if the corresponding values are matching or not, which will auto-recognize those fields that need to be checked.

```ruby
@example Automatic "checked" attribute for an array of values
# Given the request params:
# {book: {languages: ["italian"]}}
f.check_box("book.languages", name: "book[languages][]", value: "italian", id: nil)
f.check_box("book.languages", name: "book[languages][]", value: "english", id: nil)

# =>
<input type="checkbox" name="book[languages][]" value="italian" checked="checked">
<input type="checkbox" name="book[languages][]" value="english">

```

### color_field
Returns a color input HTML tag.

```ruby
f.color_field("user.background")
# =>
<input type="color" name="user[background]" id="user-background" value="">
```

This helper accepts HTML attributes as well, like most of other building blocks we provide.

```ruby
 f.color_field("user.background", class: "form-control")
 #=>
 <input type="color" name="user[background]" id="user-background" value="" class="form-control">
```

### date_field
Returns a date input tag.

   ```ruby

f.date_field("user.birth_date")
# =>
<input type="date" name="user[birth_date]" id="user-birth-date" value="">

# With HTML Attributes
f.date_field("user.birth_date", class: "form-control")
# =>
<input type="date" name="user[birth_date]" id="user-birth-date" value="" class="form-control">
```


### datetime_field
Returns a datetime input tag.

```ruby
f.datetime_field("delivery.delivered_at")
# =>
<input type="datetime" name="delivery[delivered_at]" id="delivery-delivered-at" value="">

# With HTML Attributes
f.datetime_field("delivery.delivered_at", class: "form-control")
# =>
<input type="datetime" name="delivery[delivered_at]" id="delivery-delivered-at" value="" class="form-control">
```
### datetime_local_field
Returns a datetime-local input tag.

```ruby
f.datetime_local_field("delivery.delivered_at")
# =>
<input type="datetime-local" name="delivery[delivered_at]" id="delivery-delivered-at" value="">

# With HTML Attributes
f.datetime_local_field("delivery.delivered_at", class: "form-control")
# =>
<input type="datetime-local" name="delivery[delivered_at]" id="delivery-delivered-at" value="" class="form-control">
```

### time_field
Returns a time input tag.

```ruby
f.time_field("book.release_hour")
# =>
<input type="time" name="book[release_hour]" id="book-release-hour" value="">

# With HTML Attributes
f.time_field("book.release_hour", class: "form-control")
# =>
<input type="time" name="book[release_hour]" id="book-release-hour" value="" class="form-control">
```
### month_field
Returns a month input tag.

```ruby
f.month_field("book.release_month")
# =>
<input type="month" name="book[release_month]" id="book-release-month" value="">

# HTML Attributes
f.month_field("book.release_month", class: "form-control")
# =>
<input type="month" name="book[release_month]" id="book-release-month" value="" class="form-control">
```
### week_field
   Returns a week input tag.

```ruby

f.week_field("book.release_week")
# =>
<input type="week" name="book[release_week]" id="book-release-week" value="">

# With HTML Attributes
f.week_field("book.release_week", class: "form-control")
# =>
<input type="week" name="book[release_week]" id="book-release-week" value="" class="form-control">
```
### email_field
Returns an email input tag.

```ruby
f.email_field("user.email")
# =>
<input type="email" name="user[email]" id="user-email" value="">

# With HTML Attributes
f.email_field("user.email", class: "form-control")
# =>
<input type="email" name="user[email]" id="user-email" value="" class="form-control">
```
### url_field

Returns a URL input tag.

```ruby
f.url_field("user.website")
# =>
<input type="url" name="user[website]" id="user-website" value="">

# With HTML Attributes
f.url_field("user.website", class: "form-control")
# =>
<input type="url" name="user[website]" id="user-website" value="" class="form-control">
```
### tel_field
Returns a telephone input tag.

   ```ruby
f.tel_field("user.telephone")
# =>
<input type="tel" name="user[telephone]" id="user-telephone" value="">

# With HTML Attributes
f.tel_field("user.telephone", class: "form-control")
# =>
<input type="tel" name="user[telephone]" id="user-telephone" value="" class="form-control">
```

### hidden_field
Returns a hidden input tag, not visible in the rendered page but only in the source code.

```ruby
f.hidden_field("delivery.customer_id")
# =>
<input type="hidden" name="delivery[customer_id]" id="delivery-customer-id" value="">
```

There is hardly a need to pass HTML attributes to this one, but you can of course do this as with any other input field.
### file_field
Returns a file input tag. It allows you to upload a file and accepts two special attributes:

```ruby
f.file_field("user.avatar")
# =>
<input type="file" name="user[avatar]" id="user-avatar">

# With  HTML Attributes
f.file_field("user.avatar", class: "avatar-upload")
# =>
<input type="file" name="user[avatar]" id="user-avatar" class="avatar-upload">
```

**Specifying accepted MIME Types**

You can control what MIME Types your input allow by passing in the additional option `:accepted`. This can be a `String`, where types are separated by coma, or an `Array`.

```ruby
f.file_field("user.resume", accept: "application/pdf,application/ms-word")
# =>
<input type="file" name="user[resume]" id="user-resume" accept="application/pdf,application/ms-word">

f.file_field("user.resume", accept: ["application/pdf", "application/ms-word"])
# =>
<input type="file" name="user[resume]" id="user-resume" accept="application/pdf,application/ms-word">
```

**Multiple file uploads**

You can control whether to accept multiple file uploads by passing in the `:multiple` option argument:

```ruby
f.file_field("user.resume", multiple: true)
# =>
<input type="file" name="user[resume]" id="user-resume" multiple="multiple">
```
### number_field
Returns a number input tag.

```ruby
f.number_field("book.percent_read")
=> <input type="number" name="book[percent_read]" id="book-percent-read" value="">
```

For this tag, you can use the `max`, `min`, and `step` HTML attributes, to control the range of acceptable values.

```ruby
f.number_field("book.percent_read", min: 1, max: 100, step: 1)
# =>
<input type="number" name="book[percent_read]" id="book-precent-read" value="" min="1" max="100" step="1">
```
### range_field
Returns a range input tag.

```ruby
f.range_field("book.discount_percentage")
# =>
<input type="range" name="book[discount_percentage]" id="book-discount-percentage" value="">
```

For this tag, you can make use of the `max`, `min`, and `step` HTML attributes.

 ```ruby
f.range_field("book.discount_percentage", min: 1, max: 1, step: 1)
# =>
<input type="range" name="book[discount_percentage]" id="book-discount-percentage" value="" min="1" max="100" step="1">
```
### text_area
Returns a textarea tag.

```ruby
f.text_area("user.hobby")
# =>
<textarea name="user[hobby]" id="user-hobby"></textarea>

# With HTML attributes
f.text_area "user.hobby", class: "form-control"
# =>
<textarea name="user[hobby]" id="user-hobby" class="form-control"></textarea>

```

It accepts the `content` as a second argument.

```ruby
f.text_area "user.hobby", "Football"
# =>
<textarea name="user[hobby]" id="user-hobby">Football</textarea>
```
### text_field
Returns a text input tag.

```ruby
f.text_field("user.first_name")
# =>
<input type="text" name="user[first_name]" id="user-first-name" value="">

# With HTML Attributes
f.text_field("user.first_name", class: "form-control")
# =>
<input type="text" name="user[first_name]" id="user-first-name" value="" class="form-control">
```
### search_field
Returns a search input tag.

```ruby
f.search_field("search.q")
# =>
<input type="search" name="search[q]" id="search-q" value="">

# With HTML Attributes
f.search_field("search.q", class: "form-control")
# =>
<input type="search" name="search[q]" id="search-q" value="" class="form-control">
```
### radio_button
Returns a radio input tag.

```ruby
f.radio_button("book.category", "Fiction")
f.radio_button("book.category", "Non-Fiction")

# =>
<input type="radio" name="book[category]" value="Fiction">
<input type="radio" name="book[category]" value="Non-Fiction">

# With HTML Attributes
f.radio_button("book.category", "Fiction", class: "form-check")
f.radio_button("book.category", "Non-Fiction", class: "form-check")

# =>
<input type="radio" name="book[category]" value="Fiction" class="form-check">
<input type="radio" name="book[category]" value="Non-Fiction" class="form-check">
```

When editing a resource, the form automatically assigns the `checked` HTML attribute for
the tag.

```ruby
# Given the request params:
# { book: { category: "Non-Fiction" } }
f.radio_button("book.category", "Fiction")
f.radio_button("book.category", "Non-Fiction")

#=>
<input type="radio" name="book[category]" value="Fiction">
<input type="radio" name="book[category]" value="Non-Fiction" checked="checked">
```
### password_field
Returns a password input tag in which content is hidden by default.

```ruby
f.password_field("signup.password")
=> <input type="password" name="signup[password]" id="signup-password" value="">
```
### select
Returns a select input tag containing option tags for the given values.

The values should be an enumerable of pairs of content (the displayed text for the option)
and value (the value for the option) strings.

```ruby
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values)

# =>
<select name="book[store]" id="book-store">
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>

# With HTML Attributes
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values, class: "form-control")

# =>
<select name="book[store]" id="book-store" class="form-control">
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>
```

**Automatic values selection**

When editing a resource, automatically assigns the `selected` HTML attribute for any
option tags matching the resource's values.

```ruby
# Given the following request params:
# {book: {store: "it"}}
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values)

# =>
<select name="book[store]" id="book-store">
<option value="it" selected="selected">Italy</option>
<option value="au">Australia</option>
</select>
```

**Defining a prompt**

You can specify a text to display by default by passing in the `prompt` option argument

```ruby
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values, options: {prompt: "Select a store"})

# =>
<select name="book[store]" id="book-store">
  <option>Select a store</option>
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>

# Prompt option and HTML attributes
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values, options: {prompt: "Select a store"}, class: "form-control")

# =>
<select name="book[store]" id="book-store" class="form-control">
  <option disabled="disabled">Select a store</option>
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>

```

**Forcing Selected options**
You may force some items to be selected by passing in the `selected` option argument

```ruby
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.store", values, options: {selected: "it"})

# =>
<select name="book[store]" id="book-store">
  <option value="it" selected="selected">Italy</option>
  <option value="au">Australia</option>
</select>
```

**Multiple select**

To allow multiple selection for options, pass in the `multiple: true` argument.

```ruby
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.stores", values, multiple: true)

# =>
<select name="book[store][]" id="book-store" multiple="multiple">
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>

# Multiple select and HTML attributes
values = {"Italy" => "it", "Australia" => "au"}
f.select("book.stores", values, multiple: true, class: "form-control")

# =>
<select name="book[store][]" id="book-store" multiple="multiple" class="form-control">
  <option value="it">Italy</option>
  <option value="au">Australia</option>
</select>
```

**Passing values as an array**

Because the only requirement is an enumerable of pairs (content -> value), you can also pass in a nested array.
It can be useful when there is a need to support repeated option values.

```ruby
values = [
  ["Italy", "it"],
  ["---", ""],
  ["Afghanistan", "af"],
  ["Italy", "it"],
  ["Zimbabwe", "zw"]
]
f.select("book.stores", values)

# =>
<select name="book[store]" id="book-store">
  <option value="it">Italy</option>
  <option value="">---</option>
  <option value="af">Afghanistan</option>
  <option value="it">Italy</option>
  <option value="zw">Zimbabwe</option>
</select>
```
### datalist
Returns a datalist input tag together with the text input field being bind together.

It accepts a Hash or Array of values as a second argument. The third parameter is a `list` HTML tag input name and the ID of the datalist.

```ruby
values = ["Italy", "Australia"]
f.datalist("book.stores", values, "books")

# =>
<input type="text" name="book[store]" id="book-store" value="" list="books">
<datalist id="books">
  <option value="Italy"></option>
  <option value="Australia"></option>
</datalist>


# With options as Hash
values = Hash["Italy" => "it", "Australia" => "au"]
f.datalist("book.stores", values, "books")

# =>
<input type="text" name="book[store]" id="book-store" value="" list="books">
<datalist id="books">
  <option value="Italy">it</option>
  <option value="Australia">au</option>
</datalist>
```

**HTML Attributes for each input**

You can set HTML attributes for `datalist` and the options fields separately.
Below you can check example of specifying separate HTML attributes for the text, `datalist` and `options` fields

```ruby
values = ["Italy", "Australia"]
f.datalist "book.stores", values, "books", class: 'text-class', datalist: {class: "datalist-class"}, options: {class: "option-class"}

# =>
<input type="text" name="book[store]" id="book-store" value="" list="books" class="text-class">
<datalist id="books" class="datalist-class">
  <option value="Italy" class="option-class"></option>
  <option value="Australia" class="form-control"></option>
</datalist>
```
### button
Returns a button tag with the given content.

```ruby
f.button("Click me")
# =>
<button>Click me</button>

# With HTML Attributes
f.button("Click me", class: "btn btn-secondary")
# =>
<button class="btn btn-secondary">Click me</button>
```

You may pass in content in a block, which allows you to nest the HTML elements.

```ruby
<%= f.button class: "btn btn-secondary" do %>
  <span class="oi oi-check">
<% end %>

# =>
<button class="btn btn-secondary">
  <span class="oi oi-check"></span>
</button>
```

### image_button
Returns an image input tag, to be used as a visual button for the form.

**For security reasons, you should use the absolute URL of the given image.**


```ruby
f.image_button("https://hanamirb.org/assets/button.png")
# =>
<input type="image" src="https://hanamirb.org/assets/button.png">

# With HTML Attributes
f.image_button("https://hanamirb.org/assets/button.png", name: "image", width: "50")
# =>
<input name="image" width="50" type="image" src="https://hanamirb.org/assets/button.png">
```
### submit
Returns a submit button tag with the given content.


```ruby
f.submit("Create")
# =>
<button type="submit">Create</button>

# With HTML Attributes
f.submit("Create", class: "btn btn-primary")
# =>
<button type="submit" class="btn btn-primary">Create</button>
```

You may pass in content in a block, which allows you to nest the HTML elements.

```ruby
<%= f.submit(class: "btn btn-primary") do %>
  <span class="oi oi-check">
<% end %>

# =>
<button type="submit" class="btn btn-primary">
  <span class="oi oi-check"></span>
</button>
```
