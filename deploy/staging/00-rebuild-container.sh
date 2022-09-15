#!/usr/bin/env bash
set -xe

if docker compose ls >/dev/null 2>&1; then
  DC="docker compose"
else
  DC=docker-compose
fi

$DC stop hardhat graph-cli
$DC rm -f hardhat graph-cli

docker-compose up -d --no-deps --build hardhat graph-cli

$DC stop hardhat graph-cli
