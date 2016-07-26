require 'octokit'
require 'redis'

Encoding.default_external = "utf-8"
redis_host = ENV.fetch('REDIS_SERVICE_HOST', 'localhost')
redis_port = ENV.fetch('REDIS_SERVICE_PORT', 6379)

ENV['REDIS_URL'] ||= "redis://#{redis_host}:#{redis_port}/"

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
                      redis_uri = URI(ENV['REDIS_URL'])
                      Redis.new(host: redis_uri.host, port: redis_uri.port, :db => 0)
                    end
end
