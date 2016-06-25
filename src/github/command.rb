require 'eventmachine'
require 'json'
require './src/configuration'

module Github
  class Command
    include EM::Deferrable

    attr_accessor :command, :skip_cache, :client

    def cache(key, ttl = 3600, &block)
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
      redis_client.del key
    end

    def cache_key
      raise "subclass must implement this"
    end

    def result
      v = redis_client.get(cache_key) || "[]"
      JSON.parse(v)
    end

    def run
      result = ''
      if skip_cache
        result = command.call
      else
        result = cache(cache_key) do
          command.call
        end
      end
      succeed result
    end
  end

  class Repository < Command
    attr_accessor :organization

    def cache_key
      "repository:#{organization}"
    end

    def run
      self.command = ->() {
        client.organization_repositories(organization).map(&:to_h)
      }
      super
    end
  end

  class CommandWithProgress < Command
    attr_accessor :organization, :repositories

    def cache_key
      "deploy_keys:#{organization}"
    end

    def progress_key
      "progress_deploy_keys:#{organization}"
    end

    def set_progress(progress)
      calculated_progress = (progress*100.0/repositories.count).round(2)
      redis_client.set progress_key, calculated_progress
    end

    def current_progress
      redis_client.get(progress_key).to_i
    end

    def fetch_repositories
      Github::Repository.new.tap do |c|
        c.organization = organization
        c.client = client
        c.callback do |repos|
          self.repositories = repos
          run
        end
        c.run
      end
    end
  end

  class DeployKeys < CommandWithProgress
    def run
      puts "run deploy_keys"
      self.command = ->() {
        repositories.each_with_index.map do |repo, idx|
          full_repo_name = "#{organization}/#{repo['name']}"
          puts "fetch deploy keys for #{full_repo_name} -- #{idx}"
          repo['deploy_keys'] = (client.deploy_keys(full_repo_name) rescue [])
          set_progress(idx+1)
          repo
        end
      }
      super
    end
  end

  class Hooks < CommandWithProgress
    def cache_key
      "hooks:#{organization}"
    end

    def progress_key
      "progress_hooks:#{organization}"
    end

    def run
      puts "run getting hooks"
      self.command = ->() {
        repositories.each_with_index.map do |repo, idx|
          full_repo_name = "#{organization}/#{repo['name']}"
          puts "fetch hooks for #{full_repo_name} -- #{idx}"
          repo['hooks'] = (client.hooks(full_repo_name) rescue [])
          set_progress(idx+1)
          repo
        end
      }
      super
    end
  end
end

# __END__

EM.run do
  c = Github::Hooks.new
  c.organization = 'zendeskgarden'
  c.client = github_client
  c.callback do |res|
    EM.stop
  end
  c.fetch_repositories
  puts "prog: #{c.current_progress}"
  puts "first: #{c.result.first.inspect}"
end
