import { HardhatUserConfig } from "hardhat/config";
import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy';
// import {ethers} from 'hardhat';

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
  const pow_url = process.env.POW_URL as string | "http://localhost:8546";
  const pos_url = process.env.POS_URL as string | "http://localhost:8545";

  const seed = process.env.PRIVKEY_MNEMONIC as string;
  const default_accounts= {
    mnemonic: seed,
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 10,
    passphrase: "",
  }
  config = {
    namedAccounts: {
      deployer: 0,
    },
    networks: {
      pos_local: {
        url: "http://localhost:8545",
        accounts: default_accounts,
      },
      pow_local: {
        url: "http://localhost:8546",
        accounts: default_accounts,
      },
      pos: {
        url: pos_url,
        accounts: default_accounts,
      },
      pow: {
        url: pow_url,
        accounts: default_accounts,
      }
    },
    solidity: {
      version: "0.8.9"
    },
  };
}

export default config;
