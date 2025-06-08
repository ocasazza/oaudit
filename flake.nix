{
  description = "Vue.js + TypeScript project with Nix flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        # Node.js and npm packages
        nodejs = pkgs.nodejs_20;

        # Development dependencies
        buildInputs = with pkgs; [
          nodejs
          nodePackages.npm
          nodePackages.typescript
          nodePackages.eslint
          nodePackages.prettier
          git
        ];

      in
      {
        devShells.default = pkgs.mkShell {
          inherit buildInputs;

          shellHook = ''
            npm install --include=dev --quiet
          '';
        };
      });
}
