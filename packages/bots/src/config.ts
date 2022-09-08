import { JsonRpcProvider } from "@ethersproject/providers";
import { ethers, Wallet } from "ethers";
import {Contract} from "@ethersproject/contracts";

type ConfigType = {
  abi: any,
  source: {
    provider: JsonRpcProvider;
    wallet: Wallet;
    contract: Contract;
  };
  target: {
    provider: JsonRpcProvider;
    wallet: Wallet;
    contract: Contract;
  };
};
let config: null | ConfigType = null;

export const getConfig = () => {
  if (config === null) {
    throw new Error("Config not initialized");
  }

  return config;
};

export const setConfig = (
  sourceChainRPC: string,
  targetChainRPC: string,
  swapContractAddressOnSourceChain: string,
  swapContractAddressOnTargetChain: string,
  privateKey: string
) => {
  const sourceProvider = new ethers.providers.JsonRpcProvider(sourceChainRPC);
  const targetProvider = new ethers.providers.JsonRpcProvider(targetChainRPC);

  const sourceWallet = new Wallet(privateKey, sourceProvider);
  const targetWallet = new Wallet(privateKey, targetProvider);

  const abi = require("../../contracts/artifacts/contracts/EtherSwap.sol/EtherSwap.json")
      .abi;

  const ethSwapContractOnSource = new Contract(swapContractAddressOnSourceChain, abi, sourceWallet);
  const ethSwapContractOnTarget = new Contract(swapContractAddressOnTargetChain, abi, targetWallet);

  config = {
    abi: abi,
    source: {
      provider: sourceProvider,
      wallet: sourceWallet,
      contract: ethSwapContractOnSource
    },
    target: {
      provider: targetProvider,
      wallet: targetWallet,
      contract: ethSwapContractOnTarget
    }
  };
};