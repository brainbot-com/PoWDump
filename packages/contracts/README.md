# @package/dump-pow-contracts

This package contains the dumpPOW smart contract and its ABI. The package is created with hardhat.

To properly setup the package create a `.env` file and fill it with the variables from the `.env.example` file.


### Deploy locally

Start a local network with 2 ethereum nodes
```
docker compose up -d
```

While the node is running, deploy the contracts via the deploy script:

```
npx hardhat deploy --network pow_local
npx hardhat deploy --network pos_local
```


To clean the blockchain data:
```
docker compose down
rm -rf ./data/ganache
```

