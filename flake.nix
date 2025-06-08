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
            npm install --quiet
            npm install --quiet --dev
          '';
        };

        apps = {

          dev = {
            type = "app";
            program = "${pkgs.writeShellScript "dev" ''
              export PATH=${pkgs.lib.makeBinPath buildInputs}:$PATH
              npm run dev
            ''}";
          };

          build = {
            type = "app";
            program = "${pkgs.writeShellScript "build" ''
              export PATH=${pkgs.lib.makeBinPath buildInputs}:$PATH
              npm run build
            ''}";
          };

          preview = {
            type = "app";
            program = "${pkgs.writeShellScript "preview" ''
              export PATH=${pkgs.lib.makeBinPath buildInputs}:$PATH
              npm run preview
            ''}";
          };

          check = {
            type = "app";
            program = "${pkgs.writeShellScript "check" ''
              export PATH=${pkgs.lib.makeBinPath buildInputs}:$PATH
              echo "🧹 Linting..."
              npm run lint
              echo "💅 Format checking..."
              npm run format:check
              echo "✅ All checks passed!"
            ''}";
          };

          format = {
            type = "app";
            program = "${pkgs.writeShellScript "format" ''
              export PATH=${pkgs.lib.makeBinPath buildInputs}:$PATH
              echo "💅 Formatting code..."
              npm run format
              npm run lint:fix
              echo "✅ Code formatted!"
            ''}";
          };
        };
      });
}
