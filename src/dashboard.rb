require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra_auth_github'
require 'rack'
require 'time'
require 'json'
require 'uri'

require './src/configuration'

class Dashboard < Sinatra::Base
  enable :sessions

  set :root, File.expand_path('../', File.dirname(__FILE__))
  set :views, Proc.new{ File.join(root, 'src', 'assets') }
  set :public_folder, Proc.new{ File.join(root, 'public') }
  set :scss, {:style => :compact, :debug_info => false}

  set :github_options, {
    :scopes    => 'user,write:public_key,admin:repo_hook,repo',
    :secret    => ENV['GITHUB_CLIENT_SECRET'],
    :client_id => ENV['GITHUB_CLIENT_ID'],
  }

  configure :development do
    register Sinatra::Reloader
  end

  register Sinatra::Auth::Github

  helpers do
    def cache(key)
      value = redis_client.get key
      if !value
        value = yield
        redis_client.set key, value.map(&:to_h).to_json
      else
        value = JSON.parse(value)
      end
      value
    end

    def organizations
      github_user.api.organizations.map(&:to_h).map{|i| i.fetch(:login)}
    end

    def repos(organization)
      cache("repo:#{organization}") do
        github_user.api.organization_repositories(organization)
      end
    end

    def deploy_keys(organization)
      repos = repos(organization)
      progress_key = "fetching_progress_deploy_keys:#{organization}"
      repos.each_with_index.map do |repo, idx|
        progress = (idx*100.0/repos.count).round(2)
        redis_client.set progress_key, progress
        cache_key = "deploy_key:#{repo['id']}"
        keys = cache(cache_key) do
          github_user.api.deploy_keys(repo['id']) rescue ["Failed to get"]
        end
        repo['deploy_keys'] = keys.select do |key|
          t = key['created_at']
          t && DateTime.parse(t.to_s) <= DateTime.parse("2014-02-01 00:00:00 UTC")
        end
        repo
      end.select do |repo|
        !repo['deploy_keys'].empty?
      end.tap do
        redis_client.set progress_key, 100
      end
    end

    def hooks(organization)
      repos = repos(organization)
      progress_key = "fetching_progress_hooks:#{organization}"
      repos.each_with_index.map do |repo, idx|
        progress = (idx*100.0/repos.count).round(2)
        redis_client.set progress_key, progress
        cache_key = "hook:#{repo['id']}"
        hooks = cache(cache_key) do
          github_user.api.hooks(repo['id']) rescue []
        end
        repo['hooks'] = hooks.select do |key|
          t = key['created_at']
          t && DateTime.parse(t.to_s) >= DateTime.parse("2014-05-01 00:00:00 UTC")
        end
        repo
      end.select do |repo|
        !repo['hooks'].empty?
      end.tap do
        redis_client.set progress_key, 100
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

  get '/repos/:organization' do
    content_type :json
    repos(params[:organization]).inject([]) do |a, repo|
      a << {
        name:        repo['name'],
        description: repo['description'],
        created_at:  repo['created_at']
      }
      a
    end.to_json
  end

  get '/deploy_keys/:organization' do
    content_type :json
    deploy_keys(params[:organization]).inject([]) do |a, repo|
      a << {
        name:        repo['name'],
        description: repo['description'],
        created_at:  repo['created_at'],
        deploy_keys: repo['deploy_keys']
      }
      a
    end.to_json
  end

  get '/hooks/:organization' do
    content_type :json
    hooks(params[:organization]).inject([]) do |a, repo|
      repo['hooks'].each do |hook|
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
      a
    end.sort_by do |hook|
      hook[:count]
    end.reverse.to_json
  end

  get '/deploy_key/:organization/:repository' do
    content_type :json
    org, repo = params.values_at(:organization, :repository)
    github_user.api.deploy_keys("#{org}/#{repo}").map(&:to_h).to_json
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

