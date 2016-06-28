require 'json'

require 'active_support'
require 'active_support/core_ext/hash/indifferent_access'

require 'sidekiq'
require 'sidekiq-superworker'

require './src/configuration'

class Command
  include Sidekiq::Worker

  def client
    access_token = redis_client.get 'github_client:access_token'
    raise "github access token is not ready, please sign in first" unless access_token

    @client ||= Octokit::Client.new(:access_token => access_token).tap do |c|
      c.user.login
    end
  end

  def cache(key, ttl = 7200, &block)
    puts "cache getting #{key}"
    value = redis_client.get key
    if !value
      puts "calling block"
      value = block.call
      redis_client.set key, value.to_json
      redis_client.expire key, ttl
    else
      value = JSON.parse(value)
    end
    value
  rescue JSON::ParserError
    puts "invalid cached value, del key #{key}"
    redis_client.del key
  end

  def skip_cache
    false
  end

  def cache_key
    raise "subclass must implement this"
  end

  def progress_key
    raise "Progress key should be defined in sub classes"
  end

  def command
    raise "command should be defined in sub classes"
  end

  def progress_total
    raise "You should specify how to calculate total"
  end

  def set_progress(progress)
    calculated_progress = (progress*100.0/progress_total).round(2)
    redis_client.set progress_key, calculated_progress
  end

  def current_progress
    raise "Progress key is not set." unless progress_key
    redis_client.get(progress_key).to_i
  end

  def set_error(error)
    raise "error key is not set." unless error_key
    redis_client.set error_key, error
  end

  def result(default="[]")
    JSON.parse(redis_client.get(cache_key) || default)
  end

  def error
    raise "error key is not set." unless error_key
    redis_client.get error_key
  end

  def perform(*args)
    raise "command is not defined." unless command

    check_id = command.source_location.join(":")
    new_job = false
    if redis_client.get check_id
      puts "#{check_id} is already running"
    else
      if error
        puts "#{check_id} skip running job because of error: #{error}"
      else
        redis_client.set check_id, Time.now.to_i
        new_job = true
        puts "running job with #{check_id}"
        if skip_cache
          command.call
        else
          cache(cache_key) do
            command.call
          end
        end
      end
    end
  rescue => e
    set_error(e.message)
  ensure
    if new_job
      puts "delete job with #{check_id}"
      redis_client.del check_id
    end
  end
end

class Repository < Command
  attr_accessor :organization

  def cache_key
    "repository:#{organization}"
  end

  def error_key
    "error_repository:#{organization}"
  end

  def command
    ->() {
      client.organization_repositories(organization).map(&:to_h)
    }
  end

  def perform(organization)
    self.organization = organization

    super
  end
end

class SubCommand < Command
  attr_accessor :organization, :repositories

  def subcommand
    raise "subcommand must be defined in sub classes"
  end

  def cache_key
    "#{subcommand}:#{organization}"
  end

  def progress_key
    "progress_#{subcommand}:#{organization}"
  end

  def error_key
    "error_#{subcommand}:#{organization}"
  end

  def progress_total
    repositories.count
  end

  def with_repositories
    repositories.shuffle.each_with_index.map do |repo, idx|
      repo = repo.with_indifferent_access
      puts "fetch #{subcommand} for #{repo[:full_name]} -- #{idx}"
      repo[subcommand] = cache("#{subcommand}:#{organization}:#{repo[:full_name]}") do
        yield repo
      end
      set_progress(idx+1)
      repo
    end
  end

  def perform(organization)
    self.organization = organization

    r = Repository.new
    r.organization = organization
    self.repositories = r.result

    super
  end
end

class DeployKeys < SubCommand
  def subcommand
    "deploy_keys"
  end

  def command
    ->() {
      with_repositories do |repo|
        client.deploy_keys(repo[:full_name]).map(&:to_h)
      end
    }
  end
end

class Hooks < SubCommand
  def subcommand
    "hooks"
  end

  def command
    ->() {
      with_repositories do |repo|
        client.hooks(repo[:full_name]).map(&:to_h)
      end
    }
  end
end

Superworker.define(:DeployKeysWorker, :organization) do
  Repository :organization
  DeployKeys :organization
end

Superworker.define(:HooksWorker, :organization) do
  Repository :organization
  Hooks :organization
end

__END__
Hooks.perform_async('zendesk')
