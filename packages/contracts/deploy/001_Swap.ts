import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatUserConfig} from "hardhat/config";
import {deploymentsConf} from "../hardhat.config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const {network} = hre.hardhatArguments
  const userConfig: HardhatUserConfig & {deployments?: deploymentsConf} = hre.userConfig
  const deploymentConfig = userConfig.deployments


  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  // TODO make configurable
  const recipientChangeLockDuration = 10*60;
  const feeRecipient = "0x0000000000000000000000000000000000001234";
  const feePerMillion = network ? deploymentConfig?.[network]?.defaultFeePerMillion || 0 : 0;

  await deploy('EtherSwap', {
    from: deployer,
    args: [recipientChangeLockDuration, feeRecipient, feePerMillion],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

};
export default func;
// func.id = 'deploy_greetings_registry'; // id required to prevent reexecution
func.tags = ['EtherSwap'];

