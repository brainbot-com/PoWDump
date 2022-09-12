import yargs, { ArgumentsCamelCase, Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { matchCommitmentTx, watchForCommitments } from "../commitments";
import { setConfig } from "../config";

yargs(hideBin(process.argv))
  .env("POW_DUMP")
  .config({ env: true })
  .command(
    "match <transactionWithSwapCommitment> [swapContractAddressOnTargetChain] [commitmentSourceChainRPC] [commitmentTargetChainRPC] [privateKey]",
    "Match a commitment from the source chain to the target chain by finding a swap commitment in the given transaction hash.",
    (args: Argv) => {
      args.option("transactionWithSwapCommitment", {
        describe: "The commitment hash to match",
        string: true
      });
      args.option("swapContractAddressOnSourceChain", {
        describe:
          "The swapContractAddressOnSourceChain address on the source chain",
        string: true,
        demandOption: true
      });
      args.option("swapContractAddressOnTargetChain", {
        describe:
          "The swapContractAddressOnTargetChain address on the target chain",
        string: true,
        demandOption: true
      });
      args.option("commitmentSourceChainRPC", {
        default: "http://127.0.01:8545",
        describe: "The source chain the commitment was made on"
      });
      args.option("commitmentTargetChainRPC", {
        default: "https://ethereum-goerli-rpc.allthatnode.com",
        describe: "The target chain the commitment has to be deployed on"
      });
      args.option("privateKey", {
        demandOption: true,
        string: true,
        describe:
          "The private key to use to sign the transaction. You can use .env variable POW_DUMP_PRIVATE_KEY to pass this"
      });
    },
    async ({
      transactionWithSwapCommitment,
      commitmentSourceChainRPC,
      swapContractAddressOnSourceChain,
      swapContractAddressOnTargetChain,
      commitmentTargetChainRPC,
      privateKey
    }: ArgumentsCamelCase<{
      transactionWithSwapCommitment: string;
      commitmentSourceChainRPC: string;
      swapContractAddressOnSourceChain: string;
      swapContractAddressOnTargetChain: string;
      commitmentTargetChainRPC: string;
      privateKey: string;
    }>) => {
      setConfig(
        commitmentSourceChainRPC,
        commitmentTargetChainRPC,
        swapContractAddressOnSourceChain,
        swapContractAddressOnTargetChain,
        privateKey
      );
      await matchCommitmentTx(transactionWithSwapCommitment);
    }
  )
  .command(
    "watch <swapContractAddressOnSourceChain> [swapContractAddressOnTargetChain] [commitmentSourceChainRPC] [commitmentTargetChainRPC] [privateKey]",
    "Watches the source contract for new commitments and matches them on the target chain",
    (args: Argv) => {
      args.option("swapContractAddressOnSourceChain", {
        describe:
          "The swapContractAddressOnSourceChain address on the source chain",
        string: true
      });
      args.option("swapContractAddressOnTargetChain", {
        describe:
          "The swapContractAddressOnTargetChain address on the target chain",
        string: true,
        demandOption: true
      });
      args.option("commitmentSourceChainRPC", {
        default: "http://127.0.01:8545",
        describe: "The source chain the commitment was made on"
      });
      args.option("commitmentTargetChainRPC", {
        default: "https://ethereum-goerli-rpc.allthatnode.com",
        describe: "The target chain the commitment has to be deployed on"
      });
      args.option("privateKey", {
        demandOption: true,
        string: true,
        describe:
          "The private key to use to sign the transaction. You can use .env variable POW_DUMP_PRIVATE_KEY to pass this"
      });
    },
    async ({
      swapContractAddressOnSourceChain,
      swapContractAddressOnTargetChain,
      commitmentSourceChainRPC,
      commitmentTargetChainRPC,
      privateKey
    }: ArgumentsCamelCase<{
      swapContractAddressOnSourceChain: string;
      swapContractAddressOnTargetChain: string;
      commitmentSourceChainRPC: string;
      commitmentTargetChainRPC: string;
      privateKey: string;
    }>) => {
      setConfig(
        commitmentSourceChainRPC,
        commitmentTargetChainRPC,
        swapContractAddressOnSourceChain,
        swapContractAddressOnTargetChain,
        privateKey
      );
      await watchForCommitments();
    }
  )
  .demandCommand()
  .parse();
