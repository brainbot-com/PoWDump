import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {randomBytes} from "ethers/lib/utils"
import {BigNumber} from "ethers"
import {EtherSwap} from "../typechain-types"
import exp from "constants"

describe("EtherSwap", function () {

  const recipientChangeLockDuration = 10*60;
  const feeRecipient = "0x5678000000000000000000000000000000001234";
  const feePerMillion = 1000

  const lockTime = 365 * 24 * 60 * 60;
  let transactionExpiry: number;
  const secret = randomBytes(32)
  const hashedSecret = ethers.utils.keccak256(secret)
  const expectedAmount = 1
  const swapValue = 1_000
  const swapFee = 1
  const msgValue = swapValue + swapFee
  let recipient = ""
  let txSender = ""

  before(async function() {
    recipient = (await ethers.getSigners())[1].address
    txSender = (await ethers.getSigners())[0].address
    transactionExpiry = (await ethers.provider.getBlock("latest")).timestamp * 100
  });

  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployEtherSwap() {
    const EtherSwapFactory = await ethers.getContractFactory("EtherSwap");
    return EtherSwapFactory.deploy(recipientChangeLockDuration, ethers.constants.AddressZero, 0);
  }

  async function deployEtherSwapWithFees() {
    const EtherSwapFactory = await ethers.getContractFactory("EtherSwap");
    return EtherSwapFactory.deploy(recipientChangeLockDuration, feeRecipient, feePerMillion);
  }

  async function deployCommit() {
    const etherSwap = await deployEtherSwap()

    await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

    return {etherSwap, secret};
  }

  async function deployCommitWithFees() {
    const etherSwap = await deployEtherSwapWithFees()

    await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue})

    return etherSwap;
  }

  describe("Deploy", function () {

    let salt: Uint8Array
    let bytecode: string

    before(async function() {
      salt = randomBytes(32)
      // bytecode taken from compiled contracts
      bytecode = "0x60806040523480156200001157600080fd5b50604051620022ed380380620022ed8339818101604052810190620000379190620001ca565b82600060046101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550816000600c6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055503273ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f1935050505015801562000111573d6000803e3d6000fd5b5050505062000226565b600080fd5b600067ffffffffffffffff82169050919050565b6200013f8162000120565b81146200014b57600080fd5b50565b6000815190506200015f8162000134565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620001928262000165565b9050919050565b620001a48162000185565b8114620001b057600080fd5b50565b600081519050620001c48162000199565b92915050565b600080600060608486031215620001e657620001e56200011b565b5b6000620001f6868287016200014e565b93505060206200020986828701620001b3565b92505060406200021c868287016200014e565b9150509250925092565b6120b780620002366000396000f3fe6080604052600436106100c25760003560e01c8063c14210801161007f578063e4510e4c11610059578063e4510e4c14610212578063e8f9d2f914610255578063effc83a814610280578063fd05f8fb146102bd576100c2565b8063c1421080146101b1578063e1423d86146101cd578063e33d61a6146101f6576100c2565b806309d52ae3146100c75780631c48c074146100f2578063469048401461011b578063476343ee1461014657806356b351a91461015d5780639003adfe14610186575b600080fd5b3480156100d357600080fd5b506100dc6102e8565b6040516100e991906113c7565b60405180910390f35b3480156100fe57600080fd5b5061011960048036038101906101149190611423565b610302565b005b34801561012757600080fd5b50610130610556565b60405161013d9190611491565b60405180910390f35b34801561015257600080fd5b5061015b61057c565b005b34801561016957600080fd5b50610184600480360381019061017f91906114d8565b61062e565b005b34801561019257600080fd5b5061019b61081c565b6040516101a89190611531565b60405180910390f35b6101cb60048036038101906101c691906115da565b610822565b005b3480156101d957600080fd5b506101f460048036038101906101ef9190611655565b610c60565b005b610210600480360381019061020b9190611695565b611017565b005b34801561021e57600080fd5b5061023960048036038101906102349190611423565b611083565b60405161024c9796959493929190611731565b60405180910390f35b34801561026157600080fd5b5061026a61112d565b60405161027791906117af565b60405180910390f35b34801561028c57600080fd5b506102a760048036038101906102a291906117ca565b611141565b6040516102b49190611531565b60405180910390f35b3480156102c957600080fd5b506102d2611189565b6040516102df91906113c7565b60405180910390f35b600160009054906101000a900467ffffffffffffffff1681565b60008054906101000a900463ffffffff1663ffffffff168163ffffffff1610610360576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161035790611854565b60405180910390fd5b42600360008363ffffffff1663ffffffff16815260200190815260200160002060010160149054906101000a900467ffffffffffffffff1667ffffffffffffffff16106103e2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103d9906118c0565b60405180910390fd5b6000600360008363ffffffff1663ffffffff1681526020019081526020016000206003015411610447576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161043e9061192c565b60405180910390fd5b6000600360008363ffffffff1663ffffffff168152602001908152602001600020600301549050600061047982611141565b90506000600360008563ffffffff1663ffffffff16815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690506104cb846111a3565b8073ffffffffffffffffffffffffffffffffffffffff166108fc83856104f1919061197b565b9081150290604051600060405180830381858888f1935050505015801561051c573d6000803e3d6000fd5b508363ffffffff167f847f8a104849d2450bf78e2263d44a3487510a696eb225045cd93dce2c0e3ac760405160405180910390a250505050565b6000600c9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600254905060006002819055506000600c9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f193505050501580156105f3573d6000803e3d6000fd5b507f835862a12039ab712842887f732f62f9ba4e46c8a157b8f2ece290bb03cb6229816040516106239190611531565b60405180910390a150565b60008054906101000a900463ffffffff1663ffffffff168263ffffffff161061068c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161068390611854565b60405180910390fd5b42600360008463ffffffff1663ffffffff16815260200190815260200160002060020160149054906101000a900467ffffffffffffffff1667ffffffffffffffff16111561070f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161070690611a21565b60405180910390fd5b80600360008463ffffffff1663ffffffff16815260200190815260200160002060020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550600060049054906101000a900467ffffffffffffffff16426107929190611a41565b600360008463ffffffff1663ffffffff16815260200190815260200160002060020160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055508163ffffffff167fb04a17d7ae44ad7dc8524e24397e888ddedade09b3a456a94dacfaf2065ceed9826040516108109190611adc565b60405180910390a25050565b60025481565b8467ffffffffffffffff16421061086e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161086590611b69565b60405180910390fd5b600083036108b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108a890611bd5565b60405180910390fd5b600082036108f4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108eb90611c67565b60405180910390fd5b60006108ff84611141565b9050838161090d919061197b565b341461094e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094590611cf9565b60405180910390fd5b610956611324565b8581600001818152505033816020019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505082816060019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff168152505086816040019067ffffffffffffffff16908167ffffffffffffffff16815250506000816080019067ffffffffffffffff16908167ffffffffffffffff1681525050848160a0018181525050838160c0018181525050600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614610a825767ffffffffffffffff816080019067ffffffffffffffff16908167ffffffffffffffff16815250505b80600360008060009054906101000a900463ffffffff1663ffffffff1663ffffffff1681526020019081526020016000206000820151816000015560208201518160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060408201518160010160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060608201518160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060808201518160020160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555060a0820151816003015560c0820151816004015590505060008054906101000a900463ffffffff1663ffffffff16867f5cf458bd64ba061c11c45897ac82bc3e8e1bd79d5ae92659ced32b482489eb41338689898760400151604051610c13959493929190611d3a565b60405180910390a3600160008054906101000a900463ffffffff16610c389190611d8d565b6000806101000a81548163ffffffff021916908363ffffffff16021790555050505050505050565b60008054906101000a900463ffffffff1663ffffffff168263ffffffff1610610cbe576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cb590611854565b60405180910390fd5b6000600360008463ffffffff1663ffffffff1681526020019081526020016000206040518060e0016040529081600082015481526020016001820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016001820160149054906101000a900467ffffffffffffffff1667ffffffffffffffff1667ffffffffffffffff1681526020016002820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820160149054906101000a900467ffffffffffffffff1667ffffffffffffffff1667ffffffffffffffff16815260200160038201548152602001600482015481525050905042816040015167ffffffffffffffff161015610e6b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e6290611e11565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16816060015173ffffffffffffffffffffffffffffffffffffffff1603610ede576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ed590611e7d565b60405180910390fd5b600082604051602001610ef19190611e9d565b60405160208183030381529060405280519060200120905081600001518114610f4f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f4690611f04565b60405180910390fd5b610f5c8260a00151611141565b600254610f69919061197b565b600281905550610f78846111a3565b816060015173ffffffffffffffffffffffffffffffffffffffff166108fc8360a001519081150290604051600060405180830381858888f19350505050158015610fc6573d6000803e3d6000fd5b508363ffffffff167ffbed29def4fe40082e63798e263a1af286fbe0079763694e9bdf8316b484cc4783606001518460a001518660405161100993929190611f24565b60405180910390a250505050565b8567ffffffffffffffff164210611063576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161105a90611fa7565b60405180910390fd5b61107b85426110729190611a41565b85858585610822565b505050505050565b60036020528060005260406000206000915090508060000154908060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010160149054906101000a900467ffffffffffffffff16908060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020160149054906101000a900467ffffffffffffffff16908060030154908060040154905087565b60008054906101000a900463ffffffff1681565b600080620f4240600160009054906101000a900467ffffffffffffffff1667ffffffffffffffff16846111749190611fc7565b61117e9190612050565b905080915050919050565b600060049054906101000a900467ffffffffffffffff1681565b6000600360008363ffffffff1663ffffffff168152602001908152602001600020905080600001600090558060010160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690558060010160146101000a81549067ffffffffffffffff02191690558060020160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690558060020160146101000a81549067ffffffffffffffff021916905580600301600090558060040160009055600360008363ffffffff1663ffffffff1681526020019081526020016000206000808201600090556001820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556001820160146101000a81549067ffffffffffffffff02191690556002820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556002820160146101000a81549067ffffffffffffffff02191690556003820160009055600482016000905550505050565b6040518060e0016040528060008019168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600067ffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600067ffffffffffffffff16815260200160008152602001600081525090565b600067ffffffffffffffff82169050919050565b6113c1816113a4565b82525050565b60006020820190506113dc60008301846113b8565b92915050565b600080fd5b600063ffffffff82169050919050565b611400816113e7565b811461140b57600080fd5b50565b60008135905061141d816113f7565b92915050565b600060208284031215611439576114386113e2565b5b60006114478482850161140e565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061147b82611450565b9050919050565b61148b81611470565b82525050565b60006020820190506114a66000830184611482565b92915050565b6114b581611470565b81146114c057600080fd5b50565b6000813590506114d2816114ac565b92915050565b600080604083850312156114ef576114ee6113e2565b5b60006114fd8582860161140e565b925050602061150e858286016114c3565b9150509250929050565b6000819050919050565b61152b81611518565b82525050565b60006020820190506115466000830184611522565b92915050565b611555816113a4565b811461156057600080fd5b50565b6000813590506115728161154c565b92915050565b6000819050919050565b61158b81611578565b811461159657600080fd5b50565b6000813590506115a881611582565b92915050565b6115b781611518565b81146115c257600080fd5b50565b6000813590506115d4816115ae565b92915050565b600080600080600060a086880312156115f6576115f56113e2565b5b600061160488828901611563565b955050602061161588828901611599565b9450506040611626888289016115c5565b9350506060611637888289016115c5565b9250506080611648888289016114c3565b9150509295509295909350565b6000806040838503121561166c5761166b6113e2565b5b600061167a8582860161140e565b925050602061168b85828601611599565b9150509250929050565b60008060008060008060c087890312156116b2576116b16113e2565b5b60006116c089828a01611563565b96505060206116d189828a01611563565b95505060406116e289828a01611599565b94505060606116f389828a016115c5565b935050608061170489828a016115c5565b92505060a061171589828a016114c3565b9150509295509295509295565b61172b81611578565b82525050565b600060e082019050611746600083018a611722565b6117536020830189611482565b61176060408301886113b8565b61176d6060830187611482565b61177a60808301866113b8565b61178760a0830185611522565b61179460c0830184611522565b98975050505050505050565b6117a9816113e7565b82525050565b60006020820190506117c460008301846117a0565b92915050565b6000602082840312156117e0576117df6113e2565b5b60006117ee848285016115c5565b91505092915050565b600082825260208201905092915050565b7f4e6f2073776170207769746820636f72726573706f6e64696e67206964000000600082015250565b600061183e601d836117f7565b915061184982611808565b602082019050919050565b6000602082019050818103600083015261186d81611831565b9050919050565b7f54696d655374616d702076696f6c6174696f6e00000000000000000000000000600082015250565b60006118aa6013836117f7565b91506118b582611874565b602082019050919050565b600060208201905081810360008301526118d98161189d565b9050919050565b7f4e6f7468696e6720746f20726566756e64000000000000000000000000000000600082015250565b60006119166011836117f7565b9150611921826118e0565b602082019050919050565b6000602082019050818103600083015261194581611909565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061198682611518565b915061199183611518565b92508282019050808211156119a9576119a861194c565b5b92915050565b7f43616e6e6f74206368616e676520726563697069656e743a2074696d6573746160008201527f6d70000000000000000000000000000000000000000000000000000000000000602082015250565b6000611a0b6022836117f7565b9150611a16826119af565b604082019050919050565b60006020820190508181036000830152611a3a816119fe565b9050919050565b6000611a4c826113a4565b9150611a57836113a4565b9250828201905067ffffffffffffffff811115611a7757611a7661194c565b5b92915050565b6000819050919050565b6000611aa2611a9d611a9884611450565b611a7d565b611450565b9050919050565b6000611ab482611a87565b9050919050565b6000611ac682611aa9565b9050919050565b611ad681611abb565b82525050565b6000602082019050611af16000830184611acd565b92915050565b7f5377617020656e642074696d657374616d70206d75737420626520696e20746860008201527f6520667574757265000000000000000000000000000000000000000000000000602082015250565b6000611b536028836117f7565b9150611b5e82611af7565b604082019050919050565b60006020820190508181036000830152611b8281611b46565b9050919050565b7f43616e6e6f7420636f6d6d697420746f2030207061796f757400000000000000600082015250565b6000611bbf6019836117f7565b9150611bca82611b89565b602082019050919050565b60006020820190508181036000830152611bee81611bb2565b9050919050565b7f43616e6e6f7420636f6d6d697420746f203020657870656374656420616d6f7560008201527f6e74000000000000000000000000000000000000000000000000000000000000602082015250565b6000611c516022836117f7565b9150611c5c82611bf5565b604082019050919050565b60006020820190508181036000830152611c8081611c44565b9050919050565b7f45746865722076616c756520646f6573206e6f74206d61746368207061796f7560008201527f74202b2066656500000000000000000000000000000000000000000000000000602082015250565b6000611ce36027836117f7565b9150611cee82611c87565b604082019050919050565b60006020820190508181036000830152611d1281611cd6565b9050919050565b6000611d2482611450565b9050919050565b611d3481611d19565b82525050565b600060a082019050611d4f6000830188611d2b565b611d5c6020830187611acd565b611d696040830186611522565b611d766060830185611522565b611d8360808301846113b8565b9695505050505050565b6000611d98826113e7565b9150611da3836113e7565b9250828201905063ffffffff811115611dbf57611dbe61194c565b5b92915050565b7f5377617020657870697265640000000000000000000000000000000000000000600082015250565b6000611dfb600c836117f7565b9150611e0682611dc5565b602082019050919050565b60006020820190508181036000830152611e2a81611dee565b9050919050565b7f5377617020686173206e6f20726563697069656e740000000000000000000000600082015250565b6000611e676015836117f7565b9150611e7282611e31565b602082019050919050565b60006020820190508181036000830152611e9681611e5a565b9050919050565b6000602082019050611eb26000830184611722565b92915050565b7f496e636f72726563742073656372657400000000000000000000000000000000600082015250565b6000611eee6010836117f7565b9150611ef982611eb8565b602082019050919050565b60006020820190508181036000830152611f1d81611ee1565b9050919050565b6000606082019050611f396000830186611acd565b611f466020830185611522565b611f536040830184611722565b949350505050565b7f5472616e73616374696f6e206e6f206c6f6e6765722076616c69640000000000600082015250565b6000611f91601b836117f7565b9150611f9c82611f5b565b602082019050919050565b60006020820190508181036000830152611fc081611f84565b9050919050565b6000611fd282611518565b9150611fdd83611518565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156120165761201561194c565b5b828202905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061205b82611518565b915061206683611518565b92508261207657612075612021565b5b82820490509291505056fea26469706673582212207626c89d504826054acd826f679deacb123b6c57eff87ad18e128243d4ff2afb64736f6c63430008100033"
      const paddedChangeRecipientLock = (recipientChangeLockDuration).toString(16).padStart(64, '0')
      const paddedFeeRecipient = (feeRecipient.slice(2)).padStart(64, '0')
      const paddedFeePerMillion = (feePerMillion).toString(16).padStart(64, '0')
      bytecode = bytecode + paddedChangeRecipientLock + paddedFeeRecipient + paddedFeePerMillion
    })

    it("Should deploy at pre-computed address", async function () {
      const deployerFactory = await ethers.getContractFactory("UnsafeContractFactory");
      const deployer = await deployerFactory.deploy();

      let [precomputedAddress, isDeployed] = await deployer.checkDestinationAddress(bytecode, salt)
      expect(isDeployed).to.equal(false)

      await deployer.unsafeDeploy(bytecode, salt)

      isDeployed = (await deployer.checkDestinationAddress(bytecode, salt))[1]
      expect(isDeployed).to.equal(true)

      const etherSwap = await ethers.getContractAt("EtherSwap", precomputedAddress)
      expect(etherSwap.feeRecipient()).to.eventually.equal(feeRecipient)
      expect(etherSwap.recipientChangeLockDuration()).to.eventually.equal(recipientChangeLockDuration)
      expect(etherSwap.feePerMillion()).to.eventually.equal(feePerMillion)
    });

    it("Should pay out user for deployment", async function () {
      const deployerFactory = await ethers.getContractFactory("UnsafeContractFactory");
      const deployer = await deployerFactory.deploy();

      let [precomputedAddress, isDeployed] = await deployer.checkDestinationAddress(bytecode, salt)
      expect(isDeployed).to.equal(false)
      const prefundValue = 123456789
      const funder = (await ethers.getSigners())[0]
      funder.sendTransaction({"to": precomputedAddress, "value": prefundValue})

      const user = (await ethers.getSigners())[1]
      const balanceBefore = await ethers.provider.getBalance(user.address)
      const deployTx = await deployer.connect(user).unsafeDeploy(bytecode, salt)
      const balanceAfter = await ethers.provider.getBalance(user.address)

      isDeployed = (await deployer.checkDestinationAddress(bytecode, salt))[1]
      expect(isDeployed).to.equal(true)
      const receipt = await deployTx.wait()
      expect(balanceAfter.sub(balanceBefore)).to.equal(BigNumber.from(prefundValue).sub(receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)))
    });
  });

  describe("Commit", function () {
    it("Should commit with transaction expiry time and swap lock time", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](
        transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(ethers.constants.AddressZero)
      expect(commit.changeRecipientTimestamp).to.equal(0)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
    });

    it("Should commit with swap end timestamp", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const swapExpiryTime = (await ethers.provider.getBlock("latest")).timestamp * 2

      await etherSwap['commit(uint64,bytes32,uint256,uint256,address)'](
        swapExpiryTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue})

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(swapExpiryTime)
      expect(commit.recipient).to.equal(ethers.constants.AddressZero)
      expect(commit.changeRecipientTimestamp).to.equal(0)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
    });

    it("Should store proper commit with recipient", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": swapValue})

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp
      const maxUint64 = BigNumber.from(2).pow(64).sub(1)

      const commit = await etherSwap.swaps(0)
      expect(commit.hashedSecret).to.equal(ethers.utils.hexlify(hashedSecret))
      expect(commit.initiator).to.equal(txSender)
      expect(commit.endTimeStamp).to.equal(blockTime + lockTime)
      expect(commit.recipient).to.equal(recipient)
      expect(commit.changeRecipientTimestamp).to.equal(maxUint64)
      expect(commit.value).to.equal(swapValue)
      expect(commit.expectedAmount).to.equal(expectedAmount)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(swapValue)
    });

    it("Should emit a Commit event", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": swapValue})).to.emit(
          etherSwap, "Commit"
      ).withArgs(txSender, recipient, swapValue, expectedAmount, (await ethers.provider.getBlock("latest")).timestamp + lockTime, hashedSecret, 0)
    });

    it("Should not commit expired transaction", async function () {
      const etherSwap = await loadFixture(deployEtherSwap);

      const blockTime = (await ethers.provider.getBlock("latest")).timestamp

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](
        blockTime - 1, lockTime, hashedSecret, swapValue, expectedAmount, ethers.constants.AddressZero, {"value": swapValue}))
        .to.be.revertedWith("Transaction no longer valid")
    })
  });

  describe("Change recipient", function () {

    it("Should change recipient from 0 address", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(recipient)
    });

    it("Should prevent recipient change before timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const oldRecipient = recipient
      const newRecipient = (await ethers.getSigners())[2].address
      await expect(etherSwap.changeRecipient(0, newRecipient)).to.be.revertedWith("Cannot change recipient: timestamp")

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(oldRecipient)
    });

    it("Should allow recipient change after timestamp", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const newRecipient = (await ethers.getSigners())[2].address
      await ethers.provider.send("evm_increaseTime", [recipientChangeLockDuration])
      await etherSwap.changeRecipient(0, newRecipient)

      const commit = await etherSwap.swaps(0)
      expect(commit.recipient).to.equal(newRecipient)
    });

    it("Should emit a ChangeRecipient event", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await expect(etherSwap.changeRecipient(0, recipient)).to.emit(etherSwap, "ChangeRecipient").withArgs(
          recipient, 0
      )
    });
  });

  describe("Claim", function () {
    it("Should claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      const balanceBefore = await ethers.provider.getBalance(recipient)
      await etherSwap.claim(0, secret)
      const balanceAfter = await ethers.provider.getBalance(recipient)

      expect(balanceAfter.sub(balanceBefore)).to.equal(swapValue)
    });

    it("Should not claim twice in a row", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await etherSwap.claim(0, secret)
      await expect(etherSwap.claim(0, secret)).to.be.reverted
    });

    it("Should not claim without recipient", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap has no recipient")
    });

    it("Should not claim with incorrect secret", async function () {
      const {etherSwap,} = await loadFixture(deployCommit);
      const secret = randomBytes(32)

      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Incorrect secret")
    });

    it("Should not claim expired swap secret", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [lockTime])

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap expired")
    });
  });

  describe("Refund", function () {
    it("Should refund", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      const recipient = (await ethers.getSigners())[1]
      const committer = (await ethers.getSigners())[0].address
      await etherSwap.changeRecipient(0, recipient.address)

      const balanceBefore = await ethers.provider.getBalance(committer)
      await ethers.provider.send("evm_increaseTime", [lockTime])
      await etherSwap.connect(recipient).refund(0)
      const balanceAfter = await ethers.provider.getBalance(committer)

      expect(balanceAfter.sub(balanceBefore)).to.equal(swapValue)
    });

    it("Should not refund before expiry", async function () {
      const {etherSwap, } = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await expect(etherSwap.refund(0)).to.be.revertedWith("TimeStamp violation")
    });
  });

  describe("Refund & Claim", function () {
    it("Should not refund after claim", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)
      await etherSwap.claim(0, secret)

      await expect(etherSwap.refund(0)).to.be.revertedWith("Nothing to refund")
    });

    it("Should not claim after refund", async function () {
      const {etherSwap, secret} = await loadFixture(deployCommit);

      await etherSwap.changeRecipient(0, recipient)

      await ethers.provider.send("evm_increaseTime", [lockTime])
      await etherSwap.refund(0)

      await expect(etherSwap.claim(0, secret)).to.be.revertedWith("Swap expired")
    });
  });

  describe("Fees", function () {
    it("Should calculate the right fees", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      const values = [1_234_000, 1_000_000, 1_234_000_000, 456, 888_888]
      const expectedFees = values.map(value => Math.floor(value * feePerMillion / 1_000_000))

      for (let i = 0; i < values.length; i++) {
        expect(etherSwap.feeFromSwapValue(values[i])).to.eventually.equal(expectedFees[i])
      }
    });

    it("Should collect fee on commit", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      await etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue})

      const commit = await etherSwap.swaps(0)
      expect(commit.value).to.equal(swapValue)

      expect(await etherSwap.provider.getBalance(etherSwap.address)).to.equal(msgValue)
    });

    it("Should refuse commit with wrong fees", async function () {
      const etherSwap = await loadFixture(deployEtherSwapWithFees);

      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue + 1}))
        .to.be.revertedWith("Ether value does not match payout + fee")
      await expect(etherSwap['commit(uint64,uint64,bytes32,uint256,uint256,address)'](transactionExpiry, lockTime, hashedSecret, swapValue, expectedAmount, recipient, {"value": msgValue - 1}))
        .to.be.revertedWith("Ether value does not match payout + fee")
    });

    it("Should increase collected fees on claim", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      expect(etherSwap.collectedFees()).to.eventually.equal(0)

      await etherSwap.claim(0, secret)

      expect(etherSwap.collectedFees()).to.eventually.equal(swapFee)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(swapFee)
    });

    it("Should reimburse fees on refund", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      const recipient = (await ethers.getSigners())[1]

      const balanceBefore = await ethers.provider.getBalance(txSender)
      await ethers.provider.send("evm_increaseTime", [lockTime + 1])
      await etherSwap.connect(recipient).refund(0)
      const balanceAfter = await ethers.provider.getBalance(txSender)

      expect(etherSwap.collectedFees()).to.eventually.equal(0)
      expect(balanceAfter.sub(balanceBefore)).to.equal(msgValue)
    });

    it("Should withdraw collected fees", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      await etherSwap.claim(0, secret)

      expect(etherSwap.collectedFees()).to.eventually.equal(1)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(1)

      await etherSwap.withdrawFees()

      expect(etherSwap.collectedFees()).to.eventually.equal(0)
      expect(etherSwap.provider.getBalance(etherSwap.address)).to.eventually.equal(0)
      expect(etherSwap.provider.getBalance(feeRecipient)).to.eventually.equal(1)
    });

    it("Should emit WithdrawFees event", async function () {
      const etherSwap = await loadFixture(deployCommitWithFees);

      await etherSwap.claim(0, secret)

      expect(await etherSwap.withdrawFees()).to.emit(etherSwap, "WithdrawFees").withArgs(1)
    });
  });
});
