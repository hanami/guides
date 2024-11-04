---
title: Relations
order: 40
---

Relations own the responsibility of querying your database. They encode what data exists in the table, how to coerce SQL types into Ruby types and vice-versa, and how this table relates to others.

Relations are named in the **plural** form because they model a collection of data.

They are located in the relations directory of their respective Slice. So, for an App-level database config:

```ruby
# Located in app/relations/books.rb
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
    end
  end
end
```

<p class="convention">
  Alternately, if there were located in a Main slice it would be in <strong>slices/main/relations</strong>
</p>

All registered relations for the slice are available under the **relations** namespace. For instance, if we have `books`, `authors`, `publishers`, and `languages` as relations, we can expect the following keys:

- `relations.authors`
- `relations.books`
- `relations.languages`
- `relations.publishers`

Although you can inject these relations into your business objects, you will seldom need to do this because Hanami Repos will already have access to all of them.

## Schema

The simplest way to define your schema is to allow ROM to infer it from your database directly:

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true
    end
  end
end
```

The first argument to `schema` is your table name. You can alias this within ROM using the `as:` keyword.

This should be your starting point in most cases, and you can usually leave it as-is.

However, sometimes you want to customize how types are coerced in Ruby. This is done by overriding the inferred types.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true do
        primary_key :id
        attribute :status, Types::String, read: Types::Coercible::Symbol
      end
    end
  end
end
```

By default, the type of an attribute is used for both reading and writing. In the above case, we’re providing a different type for reading, so it is converted to a Symbol when read from the DB and back to a string when written.

```ruby
id = books.insert(title: "Hanami", status: :released)
books.by_pk(id).one
# => { id: 1, title: "Hanami", status: :released }
```


The Types namespace available to Relations comes from `ROM::SQL::Types` and is built from [dry-types](https://dry-rb.org/gems/dry-types/).

Normally, dry-types model a single type with optional coercion logic. However, SQL introduces a two-fold coercion due to the difference between SQL and Ruby types. When these types diverge, the first type argument is the SQL type to be written, and you pass a `read:` argument with the Ruby type.

With more complex DB types like JSONB, you may want to define a type constant to encapsulate the necessary transformation rules. This is particularly useful when you want to instantiate a value object.

```ruby
module Bookshelf
  module Relations
    class Credentials < Hanami::DB::Relation
      JWKS = Types.define(JWT::JWK::Set) do
        input { |jwks| Types::PG::JSONB[jwks.export] }
        output { |jsonb| JWT::JWK::Set.new(jsonb.to_h) }
      end

      schema infer: true do
        attribute :jwks, JWKS
      end
    end
  end
end
```

Let’s go over what that is doing step-by-step.

1. `Types.define(JWT::JWK::Set)` establishes a Nominal Type wrapper for the `JWT::JWK::Set` object
2. The input constructor prepares the data to be sent to the DB:
    - Export the JWKS from a class instance to a Hash structure
    - Convert the hash to a `Types::PG::JSONB` so it will be correctly typed as jsonb data
3. The output constructor take the JSONB data from the DB and hydrates the `JWT::JWK::Set` class with it

Constructing this by hand would look like this:

```ruby
JWKS =
  Types.Nominal(JWT::JWK::Set)
  .constructor { |jwks| Types::PG::JSONB[jwks.export] }
  .meta(
    read: Types.Nominal(JWT::JWK::Set)
          .constructor { |jsonb| JWT::JWK::Set.new(jsonb.to_h) }
  )
```

As you can see, the read option we used in the earlier example is a shorthand for adding the appropriate metadata to the write type. ROM uses type metadata to indicate various domain-specific features of the attribute, like primary key status.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true do
        # shorthand syntax
        primary_key :id

        # This is equivalent
        attribute :id, Types::Integer.meta(primary_key: true)
      end
    end
  end
end
```

## Associations

Establishing canonical relationships between relations is how ROM supports aggregating data together in queries.

These relationships are called **associations** and they are defined within a `schema` block using the `associations` helper combined with a handful of different relationship helpers.

### One-to-Many

{{% one-to-many %}}

One-to-many associations are established with `has_many`.

```ruby
module Bookshelf
  module Relations
    class Publishers < Hanami::DB::Relation
      schema :publishers, infer: true do
        associations do
          has_many :books
        end
      end
    end
  end
end
```

`has_many` is also aliased as `one_to_many`.

### Many-to-One

{{% many-to-one %}}

Many-to-one associations are established with `belongs_to`. They reference the other table in singular form.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true do
        associations do
          belongs_to :language
        end
      end
    end

    class Languages < Hanami::DB::Relation
      schema :languages, infer: true do
        associations do
          has_many :books
        end
      end
    end
  end
end
```

`belongs_to` is a shortcut for `many_to_one :languages, as: :language`.

### Many-to-Many

{{% many-to-many %}}

Many-to-many associations are established with `has_many` with the `through:` option.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true do
        associations do
          has_many :authors, through: :authorships
        end
      end
    end

    class Authorships < Hanami::DB::Relation
      schema :authorships do
        primary_key :id

        # These may also be inferred from the db if
        # they are actual foreign keys, but this is
        # how you would do it manually.
        attribute :book_id, Types.ForeignKey(:books)
        attribute :author_id, Types.ForeignKey(:authors)
        attribute :order, Types::Integer

        associations do
          belongs_to :book
          belongs_to :author
        end
      end
    end

    class Authors < Hanami::DB::Relation
      schema :authors, infer: true do
        has_many :books, through: :authorships
      end
    end
  end
end
```

### Aliasing

If you don't wish to use the table name as your relation name, aliasing the relation with `as:` is simple:

```ruby
module Bookshelf
  module Relations
    class Authorships < Hanami::DB::Relation
      schema :books_authors, infer: true, as: :authorships
    end

    class Books < Hanami::DB::Relation
      schema :books, infer: true do
        associations do
          has_many :books_authors, as: :authorships, relation: :authorships
        end
      end
    end
  end
end
```

<p class="convention">
In addition to the relation name in Repositories, the alias is also used by auto-mapping when you combine relations
together. More on combines later.
</p>

This is also useful for building multiple relation classes against the same table, if you have radically different
use-cases and want to separate them.

### Custom Foreign Keys

Integer-based primary keys are the normal case, but you will sometimes want to work with other types. This is supported
by ROM's `ForeignKey` type. `Integer` is the default, but this can be overwritten:

```ruby
module Bookshelf
  module Relations
    class Credentials < Hanami::DB::Relation
      schema :credentials, infer: true do
        attribute :user_id, Types.ForeignKey(:users, Types::PG::UUID)
      end
    end
  end
end
```

As with `Types.define` referenced earlier, this is just setting up metadata on your type definition:

```ruby
Types::Nominal(::String).meta(db_type: "uuid", database: "postgres", foreign_key: true, target: :users)
```

## Querying

Hanami supports querying the database using a **query builder**, a pattern that provides a Ruby DSL to generate SQL for
you.

SQL query building is a _gigantic_ topic, so this will only scratch the suface of what is possible.

<p class="notice">
  ROM Relations are built on top of <a href="http://sequel.jeremyevans.net/rdoc/classes/Sequel/Dataset.html">Sequel
  Datasets</a>. Inspect the generated SQL of a relation by calling <code>.dataset.sql</code> on it.
</p>

### Dual Syntactic Conventions

ROM provides query-building DSL into two forms: a simple Hash-based syntax, and a more complex expression-based syntax.

These queries are equivalent:

```ruby
books.where(publication_date: Date.new(2024, 11, 5))
books.where { publication_date.is(Date.new(2024, 11, 5)) }
```

What is the purpose of having two different solutions to this problem?
In most cases, a simple interface to match values is sufficient.
But for more complicated scenarios, a more powerful interface is necessary.
(This helps avoid dropping down to SQL strings to query your data.)

Instead of matching a date exactly, what if we wanted to match just the year part:

```ruby
books.where { date_part('year', publication_date) > 2020 }
```

An approach wedded to Hash syntax may just give up here, and require you to write SQL as a string instead, but we can
achieve much more with ROM's expression syntax.

<p class="notice">
  Proc-based queries leverage <a href="https://sequel.jeremyevans.net/rdoc/classes/Sequel/SQL/VirtualRow.html">Sequel
  VirtualRows</a> to support more complex expressions involving functions and operators.
</p>

### Negative Restrictions

`where` is easy enough, but often we want to assert what _shouldn't_ be included:

```ruby
# No short reads allowed, hefty tomes only!
books.exclude(pages: ...1000)
books.exclude { pages < 1000 }
```

### Selection

In relational algebra, the definition of what columns you are collecting as part of the query is called the **projection**.
ROM uses the `select` method to perform this operation, named after the SQL operation of the same name.

```ruby
books.select(:id, :title).first
books.select { [id, title] }.first
# => { id: 1, title: "To Kill a Mockingbird" }
```

Multiple calls to `select` will replace the existing projection. If you wish to add to it, use `select_append`.

```ruby
books.select(:id, :title).select(:pages).first
# => { pages: 336 }

books.select(:id, :title).select_append(:pages).first
# => { id: 1, title: "To Kill a Mockingbird", pages: 336 }
```

### Ordering

If the default Ascending order is sufficient, you can use plain arguments:

```ruby
books.order(:title)
```

However, if you want to specify order direction, use the expression syntax:

```ruby
books.order { [publication_date.desc, title.asc] }
```

Every call to `order` will replace any existing order.

`unordered` will remove any current ordering.

### Dynamic Columns

ROM supports some limited type coercion of dynamic columns by prefixing it with a type name:

```ruby
books.to_a
[{:id=>1,
  :language_id=>1,
  :publisher_id=>1,
  :title=>"To Kill a Mockingbird",
  :isbn13=>"9780060935467",
  :pages=>336,
  :publication_date=><Date: 1960-07-11>},
 {:id=>2,
  :language_id=>1,
  :publisher_id=>2,
  :title=>"Go Set a Watchman",
  :isbn13=>"9780062409867",
  :pages=>288,
  :publication_date=><Date: 2016-05-03>}]

books.select {[
  integer::count(:id).as(:total),
  integer::count(:id).filter(pages < 300).as(:short),
  integer::count(:id).filter(pages > 300).as(:long)
]}.unordered.one
{total: 2, short: 1, long: 1}
```

This combines a few different ideas:

- `integer::count(:id)` defines a typed SQL function call with an argument
- `as(:total)` aliases the column using SQL `AS` syntax
- `filter(pages < 300)` is an [Aggregate
  Expression](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES)

These types are references to those defined in `ROM::SQL::Types`, so these should work:

- `bool`
- `date`
- `datetime`
- `decimal`
- `float`
- `hash`
- `integer`
- `json`
- `range`
- `serial`
- `string`
- `time`

But if you need complex type coercions, use ROM's schema system.

### Case Expressions

Case branches are defined as Hash tuples, with an `else:` keyword covering the default case.

```ruby
books.select {[
  id,
  title,
  string::case(
    quantity.is(0) => "out-of-stock",
    (quantity < 100) => "low-stock",
    else: "in-stock"
  ).as(:status)
]}.to_a
```

## Dataset

Every Relation in ROM is initialized with a default dataset that automatically selects all columns. You can adjust this
by using the `dataset` helper.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true

      dataset do
        select(:id, :title, :publication_date).order(:publication_date)
      end
    end
  end
end
```

Let's say you want to automatically hide any record with an `archived_at` timestamp by default, to simulate deletion.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true

      dataset { where(archived_at: nil) }
    end
  end
end
```

You can always use the `unfiltered` method to get back to a blank slate:

```
books.unfiltered.exclude(archived_at: nil)
```

## Scopes

We've all probably seen an application that uses SQL queries directly throughout, without a proper abstraction to hide
this responsibility. This is poor architecture, because not only does it lead to lots of repetition, but it also creates
more work for you when the schema of the database changes.

In Hanami applications, we strongly recommend that you encapsulate this responsibility in the proper Relation class.

_Scopes_ are methods of the Relation class that assist in building queries. They are chainable, because every scope
method returns a new version of the Relation class.

By default, every schema with a primary key defined gets the `by_pk` scope:

```ruby
books.by_pk(1).one
# => { id: 1, title: "To Kill a Mockingbird", publication_date: #<Date 1960-07-11> }
```

This is equivalent to writing:

```ruby
books.where(id: 1).one
```

or simply:

```ruby
books.fetch(1)
```

<p class="notice">
  Query-building is terminated by <strong>one</strong> for single records, and
  <strong>to_a</strong> for multiple. You can also use <strong>each</strong>
  with a relation directly.
</p>

Since scopes are just methods, adding your own is this simple:

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relation
      schema :books, infer: true

      def recent = where { publication_date > Date.new(2020, 1, 1) }
    end
  end
end
```

It is now present on the relation objects:

```ruby
books.recent
# => SELECT id, title, publication_date FROM books WHERE publication_date > '2020-01-01'
```
