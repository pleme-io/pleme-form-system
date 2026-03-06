{
  description = "Form system library for Nexus products";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    substrate = {
      url = "github:pleme-io/substrate";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, dream2nix, substrate, devenv, ... }:
    (import "${substrate}/lib/typescript-library-flake.nix" {
      inherit nixpkgs dream2nix substrate devenv;
    }) {
      inherit self;
      name = "pleme-form-system";
    };
}
