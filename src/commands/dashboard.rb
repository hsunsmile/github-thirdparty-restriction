require 'sinatra/base'
require 'sinatra/reloader'
require 'sinatra_auth_github'
require 'rack'
require 'json'

class Dashboard < Sinatra::Base
  enable :sessions

  set :root, File.expand_path('../../', File.dirname(__FILE__))
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
      repos(organization).each do |repo|
        cache_key = "deploy_key:#{repo['name']}"
        cache(cache_key) do
          github_user.api.deploy_keys(repo['id']).map(&:to_h)
        end
      end
    end

    def repo(organization, repository)
      github_user.api.repository("#{organization}/#{repository}").to_h
    end

    def user
      github_user.attribs.to_h.merge(
        keys: github_user.api.keys.map(&:to_h)
      )
    end
  end

  get '/' do
    authenticate!
    redirect '/index.html'
  end

  get '/repos/:organization' do
    content_type :json
    repos(params[:organization]).to_json
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

class DashboardCommand < Clamp::Command
  def execute
    Rack::Handler::WEBrick.run(Dashboard.new, Port: 9393)
  end
end
