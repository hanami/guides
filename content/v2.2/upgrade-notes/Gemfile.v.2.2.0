# frozen_string_literal: true

source "https://rubygems.org"

gem "hanami", "~> 2.2.0.beta"
gem "hanami-assets", "~> 2.2.0.beta"
gem "hanami-controller", "~> 2.2.0.beta"
gem "hanami-db", "~> 2.2.0.beta"
gem "hanami-router", "~> 2.2.0.beta"
gem "hanami-validations", "~> 2.2.0.beta"
gem "hanami-view", "~> 2.2.0.beta"

gem "dry-types", "~> 1.0", ">= 1.6.1"
gem "dry-operation", github: "dry-rb/dry-operation"
gem "puma"
gem "rake"
gem "sqlite3"

group :development do
  gem "hanami-webconsole", "~> 2.2.0.beta"
  gem "guard-puma"
end

group :development, :test do
  gem "dotenv"
end

group :cli, :development do
  gem "hanami-reloader", "~> 2.2.0.beta"
end

group :cli, :development, :test do
  gem "hanami-rspec", "~> 2.2.0.beta"
end

group :test do
  gem "capybara"
  gem "rack-test"
  gem "pg"
  gem "database_cleaner-sequel"
end
