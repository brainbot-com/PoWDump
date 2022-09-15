# PoWDump Deployment

Docker compose file and orchestration scripts for deployment 
of a PoWDump indexing graph node and transient services.

The publicly exposed endpoints are:

- `graph.staging.powdump.com:80`, `graph.staging.powdump.com:443` - graph's HTTP GraphQL query endpoint

All endpoints are accesible via HTTPS, and the HTTP endpoints will return HTTPS redirects.
TLS certificates are automatically requested over Let's Encrypte certbot.


## Deployment

Pull or push the whole PoWDump repository to the server.


Requirements: `docker`, `docker compose`, `jq`


Inital setup:

```sh
cd deploy
chmod +rwx *.sh

apt-get install jq

cp .env.example .env
```

Then modify the environment variables as needed.



Run the graph-node and transient services:

```sh
./01-run.sh

```

Build the graph schemas and deploy it on the graph node for the `pos` and the `pow` networks.
```sh
./02-init-subgraph.sh

```
This will use the checked out state of the repository in order to compile the contracts,
generate subgraph schemas and manifest files and deploy the subgraphs to the graph node.

#### `packages/subgraph/networks.json` overwrite: 

Make sure the deployed contracts on the live PoS and PoW chains in the networks file reflect 
the checked out contract code / subgraph mappings. Otherwise the graph node can
not index the events.

#### `subgraph`  package version 
The subgraph deployment version label (`graph deploy --version-label` flag )
is read from the `subgraph` package version in the `packages/subgraph/package.json` file.
This can be overwritten by setting the `SUBGRAPH_VERSION` environment variable explicitly
(this is not automatically read from the `.env` file).


There are two additional helper scripts:
 - `./00-destroy.sh` 
  - will `down` all services and remove the data dir, containing compiled contracts, deployment info,etc.
 - `./00-rebuild-container.sh.sh` 
  - will rebuild the container needed for compilation and subgraph deployment.
  - This can be necessary after changes to the code, since the Docker caching is not optimal yet.
