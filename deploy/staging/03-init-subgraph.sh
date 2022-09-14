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
    SUBGRAPH_VERSION="v$(jq -r '.version' <../../packages/contracts/package.json)"
fi

# FIXME this is not very flexible when the contract name changes!
cat data/deployments/pow/EtherSwap.json | jq --argfile a2 data/deployments/pos/EtherSwap.json \
  '{pow:{EtherSwap:{address:.address}}, pos: {EtherSwap:{address: $a2.address}}}' > data/deployments/graph_networks.json


$DC stop graph-cli
$DC rm -f graph-cli


$DC run --no-deps --rm graph-cli codegen
for network in pos pow; do

  $DC run --no-deps --rm graph-cli build \
    --network $network \
    --network-file /usr/app/packages/contracts/deployments/graph_networks.json

  $DC run --no-deps --rm graph-cli create --node http://graph-node:8020/ $network --network $network

  $DC run --no-deps --rm graph-cli deploy \
    --version-label $SUBGRAPH_VERSION \
    --node http://graph-node:8020/ \
    --ipfs http://ipfs:5001 \
    $network --network $network \
    --network-file /usr/app/packages/contracts/deployments/graph_networks.json

done

$DC stop graph-cli
