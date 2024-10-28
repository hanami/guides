---
title: Relations
order: 20
---

Relations own the responsibility of querying your database. They encode what data exists in the table, how to coerce SQL types into Ruby types and vice-versa, and how this table relates to others.

Relations are named in the **plural* form because they model a collection of data.

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

Alternately, if this were located in the Main slice it would be in `slices/main/relations`.

## Schema

The simplest way to define your schema is to allow ROM to infer it from your database directly:

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relations
      schema infer: true
    end
  end
end
```

This should be your starting point in most cases, and you can usually leave it as-is.

However, sometimes you want to customize how types are coerced in Ruby. This is done by overriding the inferred types.

```ruby
module Bookshelf
  module Relations
    class Books < Hanami::DB::Relations
      schema infer: true do
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

Normally, dry-types model a single type with optional coercion logic. However, SQL introduces a two-fold coercion due to the difference between SQL and Ruby types. When these types diverge, the first type argument is the SQL type to be written, and you pass a `:read` argument with the Ruby type.

With more complex DB types like JSONB, you may want to define a type constant to encapsulate the necessary transformation rules. This is particularly useful when you want to instantiate a value object.

```ruby
module Bookshelf
  module Relations
    class Credentials < Hanami::DB::Relations
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
      schema infer: true do
        # shorthand syntax
        primary_key :id

        # This is equivalent
        attribute :id, Types::Integer.meta(primary_key: true)
      end
    end
  end
end
```
