Octokit.configure do |c|
  c.auto_paginate = true
end

def logger
  @logger ||= Logger.new(STDOUT).tap do |logger|
    logger.level = Logger::INFO
  end
end

def client
  @client ||= Octokit::Client.new(:netrc => true).tap do |c|
    c.user.login
  end
end

def redis_client
  @redis_client ||= Redis.new(:host => "127.0.0.1", :port => 6379, :db => 0)
end
