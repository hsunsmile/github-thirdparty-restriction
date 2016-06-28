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
    :scopes    => 'user,write:public_key,admin:repo_hook,repo',
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

  get '/deploy_keys/:organization' do
    content_type :json
    command = deploy_keys(params[:organization])
    result = command.result.inject([]) do |a, repo|
      if repo
        target_keys = repo['deploy_keys'].select do |key|
          t = key['created_at']
          t && DateTime.parse(t.to_s) <= DateTime.parse("2014-02-01 00:00:00 UTC")
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

