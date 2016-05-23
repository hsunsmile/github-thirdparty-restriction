require 'opal'
require 'browser'
require 'reactive-ruby'

desc "Build ReactJS applicaiton library"
task :build_application_js do
  FileUtils.mkdir_p "assets/js" unless File.exists? "assets/js"
  Opal.append_path "src"
  File.binwrite "assets/js/application.js", Opal::Builder.build("ui").to_s
end
