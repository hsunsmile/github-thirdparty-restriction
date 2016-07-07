require 'octokit'
require 'redis'

Encoding.default_external = "utf-8"

Octokit.configure do |c|
  c.auto_paginate = true
end

def logger
  @logger ||= Logger.new(STDOUT).tap do |logger|
    logger.level = Logger::INFO
  end
end

def github_client
  @client ||= Octokit::Client.new(:netrc => true).tap do |c|
    c.user.login
  end
end

def redis_client
  @redis_client ||= begin
                      redis_uri = URI(ENV.fetch('REDIS_URL', 'redis://localhost:6379/'))
                      Redis.new(host: redis_uri.host, port: redis_uri.port, :db => 0)
                    end
end
