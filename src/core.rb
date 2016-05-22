require 'octokit'
require 'json'
require_relative 'configuration'
require 'clamp'

def client
  @client ||=
    begin
      Octokit::Client.new(:netrc => true).tap do |c|
        c.user.login
      end
    end
end

class UserCommand < Clamp::Command
  option "--organization", "ORGANIZATION", "e.g. octokit", required: true

  def execute
    all_users = { users: [] }

    client.organization_members(organization).each do |user|
      user = client.user(user.id)
      info << {
        id:         user.id,
        login:      user.login,
        name:       user.name,
        email:      user.email,
        created_at: user.created_at,
        pub_keys:   client.user_keys(user.id)
      }
      puts info.to_json
      all_users[:users] << info
    end

    all_users
  end
end

class HooksCommand < Clamp::Command
  option "--organization", "ORGANIZATION", "e.g. octokit", required: true
  option "--repository", "REPOSITORY", "e.g. octokit.rb"

  def execute
    target_org   = client.organization(organization)
    target_repos = repository ?
      [client.repository("#{target_org.login}/#{repository}")] :
      client.organization_repositories(target_org.login)

      all_hooks = {hooks: []}

      target_repos.each do |repo|
        info = {
          repo: {
            id:          repo.id,
            name:        repo.name,
            desc:        repo.description,
            deploy_keys: client.deploy_keys(repo.id)
          },
          hooks: [],
          authors: []
        }

        client.hooks(repo.id).each do |hook|
          info[:hooks] << {
            id:   hook.id,
            name: hook.name,
            config_url:  hook.config.url
          }
        end

        (client.contributors_stats(repo.id) || []).each do |contrib|
          info[:authors] << {
            id:    contrib.author.id,
            login: contrib.author.login
          }
        end

        all_hooks[:hooks] << info
      end

      all_hooks
  end
end

class MainCommand < Clamp::Command
  subcommand "users", "Get user informations", UserCommand
  subcommand "repositories", "Get repository informations", HooksCommand
end

MainCommand.run

__END__

require 'clamp'

class SpeakCommand < Clamp::Command

  option "--loud", :flag, "say it loud"
  option ["-n", "--iterations"], "N", "say it N times", :default => 1 do |s|
    Integer(s)
  end

  parameter "WORDS ...", "the thing to say", :attribute_name => :words

  def execute
    the_truth = words.join(" ")
    the_truth.upcase! if loud?
    iterations.times do
      puts the_truth
    end
  end

end

SpeakCommand.run
