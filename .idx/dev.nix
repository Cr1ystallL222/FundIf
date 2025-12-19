# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    # pkgs.go
    # pkgs.python311
    # pkgs.python311Packages.pip
    pkgs.nodejs_20
    pkgs.git
    pkgs.cd frontend 
    # pkgs.nodePackages.nodemon
  ];

  # Sets environment variables in the workspace
  env = {};

  idx = {
    # Keep previews enabled
    previews = {
      enable = true;

      # Define a web preview named "web"
      previews = {
        web = {
          command = [
            "sh"
            "-c"
            "npm install --legacy-peer-deps && npm run dev -- --hostname 0.0.0.0 --port $PORT"
          ];
          manager = "web";
          cwd = "frontend";
          env = {
            PORT = "9002";
          };
        };
      };
    };
  };
}
