#!/usr/bin/env bash
set -xe

if docker compose ls >/dev/null 2>&1; then
  DC="docker compose"
else
  DC=docker-compose
fi

if ! command -v jq &> /dev/null; then
  echo "'jq' is needed for the deploy scripts, please install!"
  exit
fi

if [[ -z "${SUBGRAPH_VERSION}" ]]; then
    SUBGRAPH_VERSION="v$(jq -r '.version' <../../packages/subgraph/package.json)"
fi


$DC stop graph-cli hardhat
$DC rm -f graph-cli hardhat


# Compile the contracts to the artifacts dir
$DC run --no-deps --rm hardhat compile

# Codegen generates AssemblyScript types for smart contract ABIs and the subgraph schema.
$DC run --no-deps --rm graph-cli codegen --output-dir generated/
for network in pos pow; do
  # TODO copy networks.json, subgraph.yaml to the build folders as well

  # Build compiles a subgraph to WebAssembly.
  $DC run --no-deps --rm graph-cli build \
    --network $network \
    --network-file networks.json \
    --output-dir build/$SUBGRAPH_VERSION/$network

  # Create registers a subgraph name on the graph node
  $DC run --no-deps --rm graph-cli create --node http://graph-node:8020/ $network --network $network

  #  Deploy deploys a subgraph on the graph node
  $DC run --no-deps --rm graph-cli deploy \
    --version-label $SUBGRAPH_VERSION \
    --node http://graph-node:8020/ \
    --ipfs http://ipfs:5001 \
    $network --network $network \
    --network-file networks.json \
    --output-dir build/$SUBGRAPH_VERSION/$network

done

$DC stop graph-cli hardhat
