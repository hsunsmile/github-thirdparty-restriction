require 'active_support'
require 'active_support/core_ext/hash/indifferent_access'

require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra_auth_github'
require 'rack'
require 'time'
require 'json'
require 'uri'
require 'byebug'

require './src/workers/github/command'

class Dashboard < Sinatra::Base
  enable :sessions

  set :root, File.expand_path('../', File.dirname(__FILE__))
  set :views, Proc.new{ File.join(root, 'src', 'assets') }
  set :public_folder, Proc.new{ File.join(root, 'public') }
  set :scss, {:style => :compact, :debug_info => false}

  set :github_options, {
    :scopes    => 'user,admin:public_key,admin:repo_hook,repo',
    :secret    => ENV['GITHUB_CLIENT_SECRET'],
    :client_id => ENV['GITHUB_CLIENT_ID'],
  }

  configure :development do
    register Sinatra::Reloader
  end

  register Sinatra::Auth::Github

  helpers do
    def organizations
      github_user.api.organizations.map(&:to_h).map{|i| i.fetch(:login)}
    end

    def deploy_keys(organization)
      DeployKeys.new.tap do |r|
        r.organization = organization
        DeployKeysWorker.perform_async(organization)
      end
    end

    def hooks(organization)
      Hooks.new.tap do |r|
        r.organization = organization
        HooksWorker.perform_async(organization)
      end
    end

    def repo(organization, repository)
      github_user.api.repository("#{organization}/#{repository}").to_h
    end

    def user
      keys = github_user.api.keys
      github_user.attribs.to_h.merge(
        invalid_keys: keys.select do |key|
          key['created_at'] <= Time.parse("2014-02-01 00:00:00 UTC")
        end.map(&:to_h),
        valid_keys: keys.select do |key|
          key['created_at'] > Time.parse("2014-02-01 00:00:00 UTC")
        end.map(&:to_h)
      )
    end
  end

  before do
    p = request.path_info.split('/')[1]
    pass if p =~ /auth.*/
    unless authenticated?
      redirect '/401.html'
    end
  end

  get '/authenticate' do
    authenticate!
    redis_client.set 'github_client:access_token', github_user.api.access_token
    redirect '/index.html'
  end

  get '/' do
    redirect '/index.html'
  end

  get '/progress/:type/:repository' do
    progress_key = "fetching_progress_#{params[:type]}:#{params[:repository]}"
    content_type :json
    {
      type: params[:type],
      repository: params[:repository],
      progress: redis_client.get(progress_key).to_i || 0
    }.to_json
  end

  get '/organizations' do
    content_type :json
    organizations.to_json
  end

  post '/user_keys' do
    content_type :json
    key_id, key_content, key_title = params.values_at(:id, :key, :title)
    begin
      removed_key = github_user.api.remove_key(key_id)
      status = 'failed to update your key'
      if removed_key
        status = github_user.api.add_key(key_title, key_content).to_h
      end
      {
        status: status
      }
    rescue => e
      {
        status: e.message
      }
    end.to_json
  end

  get '/deploy_keys/:organization/:type' do
    content_type :json
    command = deploy_keys(params[:organization])
    type = params[:type]

    condition = ->(t) {
      DateTime.parse(t.to_s) <= DateTime.parse("2014-02-01 00:00:00 UTC")
    }

    if type != 'before_2014_02'
      condition = ->(t) {
        DateTime.parse(t.to_s) > DateTime.parse("2014-02-01 00:00:00 UTC")
      }
    end

    result = command.result.inject([]) do |a, repo|
      if repo
        repo = repo.with_indifferent_access
        target_keys = repo['deploy_keys'].select do |key|
          t = key['created_at']
          t && condition.call(t)
        end
        if target_keys.count > 0
          a << {
            name:        repo['name'],
            description: repo['description'],
            created_at:  repo['created_at'],
            deploy_keys: repo['deploy_keys']
          }
        end
      end
      a
    end

    if type != 'before_2014_02'
      result = result.inject([]) do |a, repo|
        if repo
          repo[:deploy_keys].each do |key|
            title = key[:title]
            i = a.find {|item| item[:title] == title}
            if i
              i[:repos] << {title: repo[:name]}
              i[:count] += 1
            else
              a << {
                title: title,
                count: 1,
                repos: [ {title: repo[:name]} ]
              }
            end
          end
        end
        a
      end.sort_by do |key|
        key[:count]
      end.reverse
    end

    {
      progress: command.current_progress,
      results: result,
      error: command.error
    }.to_json
  end

  get '/hooks/:organization' do
    content_type :json
    command = hooks(params[:organization])
    result = command.result.inject([]) do |a, repo|
      if repo
        repo['hooks'].select do |key|
          t = key['created_at']
          t && DateTime.parse(t.to_s) >= DateTime.parse("2014-05-01 00:00:00 UTC")
        end.each do |hook|
          url = hook['config']['url']
          host = url ? URI.parse(url).host : ''
          type = hook['name']
          i = a.find {|item| item[:type] == type && item[:host] == host}
          if i
            i[:repos] << {title: repo['name']}
            i[:count] += 1
          else
            a << {
              type: hook['name'],
              host: host,
              count: 1,
              repos: [ {title: repo['name']} ]
            }
          end
        end
      end
      a
    end.sort_by do |hook|
      hook[:count]
    end.reverse

    {
      progress: command.current_progress,
      results: result,
      error: command.error
    }.to_json
  end

  get '/:organization/:repository' do
    content_type :json
    repo(params[:organization], params[:repository]).to_json
  end

  get '/user' do
    content_type :json
    user.to_json
  end

  get '/public_keys' do
    content_type :json
    user.to_json
  end

  get '/logout' do
    logout!
    redirect '/401.html'
  end
end

