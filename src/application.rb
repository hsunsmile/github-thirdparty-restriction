require 'octokit'
require 'json'
require 'clamp'
require "redis"
require 'logger'
require_relative 'configuration'
require_relative 'commands/user'
require_relative 'commands/hook'
require_relative 'commands/dashboard'
require_relative 'commands/main'

MainCommand.run

__END__
