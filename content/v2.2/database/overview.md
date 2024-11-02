---
title: Overview
order: 10
---

Hanami’s persistence layer is based on the Ruby Object Mapper (ROM) project. ROM is a radically different approach to persistence than you may be familiar with. Don’t let that scare you, because all the component parts of ROM are designed to provide clear separation of responsibilities. The hardest part is shifting your perspective to think in a new paradigm.

Above all else ROM favors:

- **Explicitness** over "magic" whenever possible
- **Speed**, because performance is a *feature*
- **Flexibility** in your domain layer's design

[ROM: Principles & Design](https://rom-rb.org/learn/#principles-amp-design)

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


`ROM::SQL` provides a wide array of data types for SQL engines, but you can provide your own based on dry-types.

For more on Schemas, see [ROM Core: Schemas](https://rom-rb.org/learn/core/5.2/schemas/)

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


For more on associations, see [ROM SQL: Associations](https://rom-rb.org/learn/sql/3.3/associations/).

## Datasets

Datasets define how the underlying data is fetched by default. ROM defaults to selecting all attributes in the schema, but this is trivial to override.

```ruby
class Users < Hanami::DB::Relation
  schema(:users, infer: true)

  dataset do
    select(:id, :name).order(:name)
  end
end
```

The dataset can be thought of as the current state of the query before it happens; adding query conditions builds up the state of this dataset until you initiate the query.

The output of Dataset queries are plain Ruby hashes, which are consumed by a Repository.

For more on Datasets, see [Sequel: Dataset Basics](http://sequel.jeremyevans.net/rdoc/files/doc/dataset_basics_rdoc.html)

## Repositories

Repositories are the primary public interface of the persistence layer. They exist to bridge the gap between business objects and database objects.

Because Relation queries are highly dependent on the shape of the persistence layer, the Repository encapsulates this responsibility with a permanent, public API.

Consider the case of a users table that originally used emails as the identity of the user.

```ruby
class UserRepo < Hanami::DB::Repository
  def find(email) = users.where(email:).one
end
```


Now, the requirement is that you move to usernames as the principal identity. Without a Repository, every place in your codebase that queries a User would need to accommodate this change. But here, we can do:

class UserRepo < Hanami::DB::Repository
  def find(username) = users.where(username:).one
end


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

      def to_json = JSON.generate(attributes)
    end
  end
end
```

But you don’t need to define every struct ahead of time, only to extend its functionality. Structs will be generated on-demand in your slice’s `Structs` namespace.

A Struct is not a permanent abstraction of a piece of data: it is a momentary projection of the data you requested. This means that instead of a User model that fills every role you need of a user, you could project user data as a Credential for authentication, a Role for authorization, a Visitor for displaying their identity on the page. Every projection can serve a specific purpose, and contain exactly the information you need and nothing more.

More importantly, the form your structs take in the application layer can change independently of the persistence layer. Your database tables can change without impacting the structs; the application structs can change without impacting the database. All you have to do is manage the changing relationships to produce the same output.

