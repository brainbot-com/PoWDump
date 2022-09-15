# PoWDump Deployment

Docker compose file and orchestration scripts for deployment 
of a PoWDump indexing graph node and transient services.
Since the website is hosted on GitHub pages, a next.js servicing
webserver is not included here.


Currently, this only includes a full staging environment.
Here, two persistent ganache local blockchain nodes
function as the backend.
This is to be deployed on our DigitalOcean.

The publicly exposed endpoints are:

- `graph.staging.powdump.com:80`, `graph.staging.powdump.com:443` - graph's HTTP GraphQL query endpoint
- `pos.staging.powdump.com:80`, `pos.staging.powdump.com:443` - "PoS" ganache blockchain JSON-RPC endpoint (no real PoS consensus)
- `pow.staging.powdump.com:80`, `pow.staging.powdump.com:443` - "PoW" ganache blockchain JSON-RPC endpoint (no real PoW consensus)

All endpoints are accesible via HTTPS, and the HTTP endpoints will return HTTPS redirects.
TLS certificates are automatically requested over Let's Encrypte certbot.


## Deployment

Pull or push the whole PoWDump repository to the server (the staging droplet is currently accessible on the `46.101.134.65` floating IP).


Requirements: `docker`, `docker compose`, `jq`


Inital setup:

```sh
cd deploy
chmod +rwx *.sh

apt-get install jq

cp .env.example .env
```

Then modify the environment variables as needed.
Since the eth nodes are publicly exposed, it makes sense to change the wallet seed phrase
to a randomly generated one. Although this is no real security risk, this way the funded accounts can't accessed
by strangers.


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
