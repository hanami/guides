---
title: "Building a static site"
order: 30
---

Once we've [created our web app](/v2.2/introduction/building-a-web-app/), it's very easy to convert it fully or partially into a static site – with a little help of the [Parklife gem](https://rubygems.org/gems/parklife) which renders any Rack app into a build of static pages.

## Install Parklife

Add Parklife to the Gemfile and install it.

```
bundle add parklife
bundle exec parklife init
```

## Configure Parklife

The generated Parkfile does not work for Hanami, here's a more suitable blueprint which:

* Boots the Hanami app.
* Crawls the root page and all pages linked from there recursively.
* Gets the explicitly declared page /errors/not-found which is not linked from anywhere.
* Raises an error if it encounters a dead local link.

```
require "hanami/boot"

Parklife.application.configure do |config|
  config.app = Hanami.app
  config.on_404 = :error
end

Parklife.application.routes do
  root crawl: true

  get '/errors/not-found'
end
```

Please refer to the [Parklife config documentation](https://parklife.dev/config) for more.

## Build

To build the static pages into the `/build` directory:

```
bundle exec hanami assets compile
bin/static-build
```
