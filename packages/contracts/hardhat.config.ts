import { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

dotenvConfig();

const isCI = process.env.CI !== undefined;

let config: HardhatUserConfig;

if (isCI) {
  console.log("Running in CI environment. We don't support deployment on CI yet.");
  config = {
    solidity: {
      version: "0.8.9"
    }
  };
} else {
  const privateKey = process.env.GOERLI_PRIVATE_KEY as string;
  const alchemyKey = process.env.ALCHEMY_API_KEY as string;

  config = {
    networks: {
      goerli: {
        url: `https://eth-goerli.g.alchemy.com/v2/${alchemyKey}`,
        accounts: [privateKey]
      }
    },
    solidity: {
      version: "0.8.9"
    }
  };
}

export default config;
