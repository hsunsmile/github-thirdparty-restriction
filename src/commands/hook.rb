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
