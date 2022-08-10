# @project/dump-pow-subgraph

This package contains the dumpPOW subgraph. The package is created with thegraph.

## Setup repo

First create an .env file and fill it with the variables from the .env.example file.

## Some gotchas

The same atomic-swap contract is deployed on 2 different chains. The node in docker compose is configured to watch for events
on the chains you specify with the `GRAPH_ETHEREUM` variable.

What is being deployed on the node is inside of the `build` directory (it's being generated after executing the 
`yarn build --network $NETWORK_NAME` command).

The `build` command modifies the `subgraph.yaml` file by using the `network` and `startBlock` values from the networks.json file


## How to deploy a graph to the local node

Look at the commands specified in the package.json file. 

The following command deploys a graph for the pow chain:
```
yarn codegen #this step can be omitted if you have already run it
yarn build-create-deploy-pow
```

The following command deploys a graph for the pos chain:
```
yarn codegen #this step can be omitted if you have already run it
yarn build-create-deploy-pow
```
