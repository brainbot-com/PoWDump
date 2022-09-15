#!/usr/bin/env bash
set -xe

if docker compose ls >/dev/null 2>&1; then
  DC="docker compose"
else
  DC=docker-compose
fi

$DC --profile tools stop hardhat
$DC --profile tools rm -f hardhat

rm -rf data/hardhat

$DC --profile tools up -d hardhat

for network in pos pow; do
  # run with the deps since the local chains should be running
  $DC run --rm hardhat deploy --network $network
done

$DC --profile tools stop hardhat
# the ethnodes will still be running

