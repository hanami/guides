---
title: Overview
order: 10
---

Hanami’s persistence layer is based on the [Ruby Object Mapper (ROM)](https://rom-rb.org/) project. ROM may be a radically different approach to persistence than what you're familiar with, but don’t let that scare you. ROM is designed to provide clear separation of responsibilities. The hardest part is shifting your perspective to think in a new paradigm.

<blockquote cite="https://rom-rb.org/learn/" class="quote">
Above all else ROM favors:

- **Explicitness** over "magic" whenever possible
- **Speed**, because performance is a *feature*
- **Flexibility** in your domain layer's design

[ROM: Principles & Design](https://rom-rb.org/learn/#principles-amp-design)
</blockquote>

While traditional Object-Relational Mapping comes from a strictly Object-Oriented approach, ROM combines the best parts of Functional Programming and OOP that play to Ruby’s inherent strengths as a language. Instead of homogenizing all datastores into a lowest-common-denominator API, ROM embraces the diversity of storage engines and the powerful features they can provide.

## Relations

Relations represent a collection of information in your persistence layer, and its relationships to other collections. They contain a **schema**, **associations**, and a **dataset**.

Relations model how you query the persistence layer for information. With a SQL database, this means constructing SQL queries. But importantly, ROM does not assume your backend technology; you could be querying a YAML file, a document-based storage engine, or an HTTP endpoint as well. Hanami does not officially support doing this yet, but it is possible.

The default adapter used by `Hanami::DB::Relation` is the `ROM::SQL` adapter. The adapter defines the top-level semantics of how the storage engine works, and how to connect to it. `ROM::SQL` is based on the [Sequel](http://sequel.jeremyevans.net/) library.

## Schemas

The schema defines the shape of the incoming data and how it should be coerced into Ruby types. Most of the time, you will see this inferred from the database directly:

```ruby
class Users < Hanami::DB::Relation
  schema :users, infer: true
end
```

However, if you need to make any alterations to the defaults you can explicitly declare schema with or without inference.

```ruby
class Users < Hanami::DB::Relation
  schema :users, infer: true do
    attribute :email, Types::Email
  end
end
```

`ROM::SQL` provides a wide array of data types for SQL engines, but you can provide your own based on dry-types. In this
example, `Types::Email` would be user-defined.

For more on Schemas, see [the relations guide]({{% ref "relations.md#schema" %}}).

## Associations

Associations define the relationships between individual Relations.

```ruby
class Users < Hanami::DB::Relation
  schema(infer: true) do
    associations do
      has_many :users_tasks
      has_many :tasks, through: :users_tasks
    end
  end
end
```


For more on associations, see [the relations guide]({{% ref "relations.md#associations" %}}).

## Datasets

Datasets define how the underlying data is fetched by default. ROM defaults to selecting all attributes in the schema, but this is simple to override.

```ruby
class Users < Hanami::DB::Relation
  schema(:users, infer: true)

  dataset do
    select(:id, :name).order(:name)
  end
end
```

The dataset can be thought of as the default state of the query; adding query conditions builds up the query from there.

The output of Dataset queries are plain Ruby hashes, which are consumed by a Repository (and automatically converted to Structs there).

For more on Datasets, see [the relations guide]({{% ref "relations.md#dataset" %}}).

## Repositories

Repositories are the primary public interface of the persistence layer. They exist to bridge the gap between business objects and database objects.

Because Relation queries are highly dependent on the shape of the persistence layer, the Repository encapsulates this responsibility with a permanent, public API.

Consider the case of a users table that originally used emails as the identity of the user.

```ruby
class UserRepo < Hanami::DB::Repo
  def find(email) = users.where(email:).one
end
```


Let's say the requirement has changed, to use usernames as the principal identity instead. Without a Repository, every place in your codebase that queries a User would need to accommodate this change. But here, we can do:

```ruby
class UserRepo < Hanami::DB::Repo
  def find(username) = users.where(username:).one
end
```

If the rest of your business logic treats the identity as an opaque string, then you’re done. The encapsulation afforded by Repository restricts the knowledge of the persistence layer from where it does not belong.

For more on Repositories, see [ROM: Repositories](https://rom-rb.org/learn/repository/5.2/)

## Structs

The final output of a Repository is a Struct.

A Hanami struct is immutable, and contains no business logic. They are extensible for adding presentation logic:

```ruby
module Main
  module Structs
    class User < Hanami::DB::Struct
      def full_name
        "#{given_name} #{family_name}"
      end

      def mailbox
        "#{full_name} <#{email}>"
      end
    end
  end
end
```

But you don’t need to define every struct ahead of time, only to extend its functionality. If you don't define a Struct class, Structs will be generated on-demand in the appropriate namespace.

A Struct is not a permanent abstraction of a piece of data: it is a momentary projection of the data you requested. This means that instead of a `User` model that fills every role you need of a user, you could project user data as a `Credential` for authentication, a `Role` for authorization, a `Visitor` for displaying their identity on the page. Every projection can serve a specific purpose, and contain exactly the information you need and nothing more.

More importantly, the form your structs take in the application layer can change independently of the persistence layer. Your database tables can change without impacting the structs; the application structs can change without impacting the database. All you have to do is manage the changing relationships to produce the same output.
