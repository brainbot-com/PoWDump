export const config: {
  ETH_POS_CONTRACT_ADDRESS: string;
  SUBGRAPH_URL: string;
  INFURA_KEY: string;
  NETWORK: string;
} = {
  ETH_POS_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_ETH_POS_CONTRACT_ADDRESS || "",
  SUBGRAPH_URL: process.env.NEXT_PUBLIC_SUBGRAPH_URL || "",
  INFURA_KEY: process.env.NEXT_PUBLIC_INFURA_KEY || "",
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || "",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export default config;
