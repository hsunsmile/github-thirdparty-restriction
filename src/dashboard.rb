require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra_auth_github'
require 'rack'
require 'time'
require 'json'

require './src/configuration'

class Dashboard < Sinatra::Base
  enable :sessions

  set :root, File.expand_path('../', File.dirname(__FILE__))
  set :views, Proc.new{ File.join(root, 'src', 'assets') }
  set :public_folder, Proc.new{ File.join(root, 'public') }
  set :scss, {:style => :compact, :debug_info => false}

  set :github_options, {
    :scopes    => 'write:public_key,admin:repo_hook,repo',
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

    def repos(organization)
      cache_key = "repo:#{organization}"
      repos = cache(cache_key) do
        github_user.api.organization_repositories(organization)
      end
      repos.inject([]) do |a, repo|
        a << {
          id:          repo['id'],
          name:        repo['name'],
          description: repo['description'],
          created_at:  repo['created_at']
        }
        a
      end
    end

    def deploy_keys(organization)
      repos = repos(organization)
      repos.each_with_index.map do |repo, idx|
        progress = (idx*100.0/repos.count).round(2)
        redis_client.set "fetching_progress_deploy_keys", progress
        cache_key = "deploy_key:#{repo[:id]}"
        keys = cache(cache_key) do
          github_user.api.deploy_keys(repo[:id]) rescue []
        end
        repo[:deploy_keys] = keys.select do |key|
          t = key['created_at']
          t && DateTime.parse(t.to_s) <= DateTime.parse("2014-02-01 00:00:00 UTC")
        end
        repo
      end.select do |repo|
        !repo[:deploy_keys].empty?
      end.tap do |repos|
        redis_client.set "fetching_progress_deploy_keys", 100
      end
    end

    def repo(organization, repository)
      github_user.api.repository("#{organization}/#{repository}").to_h
    end

    def user
      keys = github_user.api.keys
      github_user.attribs.to_h.merge(
        keys_count: keys.count,
        invalid_keys_count: keys.select do |key|
          key['created_at'] <= Time.parse("2014-02-01 00:00:00 UTC")
        end.count,
        keys: keys.map(&:to_h)
      )
    end
  end

  before do
    p = request.path_info.split('/')[1]
    pass if p =~ /\.html$|auth.*/
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

  get '/progress/:type' do
    content_type :json
    {
      type: params[:type],
      progress: redis_client.get("fetching_progress_#{params[:type]}").to_i || 0
    }.to_json
  end

  get '/repos/:organization' do
    content_type :json
    repos(params[:organization]).to_json
  end

  get '/deploy_keys/:organization' do
    content_type :json
    deploy_keys(params[:organization]).to_json
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

