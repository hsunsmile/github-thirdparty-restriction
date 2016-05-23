class MainCommand < Clamp::Command
  subcommand "users", "Get user informations", UserCommand
  subcommand "repositories", "Get repository informations", HooksCommand
  subcommand "dashboard", "Start dashboard", DashboardCommand
end
