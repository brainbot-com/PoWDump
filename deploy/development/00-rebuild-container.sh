#!/usr/bin/env bash
set -xe

if docker compose ls >/dev/null 2>&1; then
  DC="docker compose"
else
  DC=docker-compose
fi

$DC stop graph-cli
$DC rm -f graph-cli

docker-compose up -d --no-deps --build graph-cli

$DC stop graph-cli
