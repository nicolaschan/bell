{
  description = "Development environment with Node.js, Yarn, Python 3, and SQLite";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            yarn
            python3
            sqlite
          ];

          shellHook = ''
            echo "Development environment loaded!"
            echo "Available tools:"
            echo "- Node.js $(node --version)"
            echo "- Yarn $(yarn --version)"
            echo "- Python $(python3 --version)"
            echo "- SQLite $(sqlite3 --version)"
          '';
        };
      }
    );
}
