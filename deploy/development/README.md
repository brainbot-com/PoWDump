# PoWDump Development setup

Docker compose file and orchestration scripts for local development with one PoW ganache node and one PoS ganache node.

## Setup

Requirements: `docker`, `docker compose`, `jq`

Initial setup:

```sh
cd deploy
chmod +rwx *.sh

apt-get install jq

cp .env.example .env
```

Then modify the environment variables as needed.


Run the ganache nodes and deploy the contracts in `PoWDump/packages/contracts`:

```sh
./01-init-chain.sh

```


Run the graph node and it's dependencies (postgres database, local ipfs node).
```sh
./02-run.sh

```

Build the graph schemas and deploy it on the graph node for the `pos` and the `pow` networks.
```sh
./03-init-subgraph.sh

```

There are two additional helper scripts:
 - `./00-destroy.sh` 
  - will `down` all services and remove the data dir, containing compiled contracts, deployment info, blockchain state etc.
 - `./00-rebuild-container.sh.sh` 
  - will rebuild the container needed for compilation and subgraph deployment.
  - This can be necessary after changes to the code, since the Docker caching is not optimal yet.
