class UserCommand < Clamp::Command
  option "--organization", "ORGANIZATION", "e.g. octokit", required: true

  def execute
    members = client.organization_members(organization)
    logger.info "There are #{members.count} members in #{organization}"
    members.each do |user|
      if redis_client.get "user:#{user.id}"
        logger.info "User #{user.login} is cached by redis, skip"
        next
      end

      logger.info "Fetching information about user #{user.login}...."
      user = client.user(user.id)
      redis_client.set "user:#{user.id}", {
        id:         user.id,
        login:      user.login,
        name:       user.name,
        email:      user.email,
        created_at: user.created_at,
        pub_keys:   client.user_keys(user.id).map(&:to_h)
      }.to_json
    end
  end
end
