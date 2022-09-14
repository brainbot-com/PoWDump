#!/usr/bin/env bash
set -xe

if docker compose ls >/dev/null 2>&1; then
  DC="docker compose"
else
  DC=docker-compose
fi

$DC stop
$DC rm -f
$DC up -d 
sleep 20

$DC ps
 
