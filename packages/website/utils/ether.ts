import {Ether} from "@uniswap/sdk-core";

export class ExtendedEther extends Ether {

    public static onCreate(chainId: number): ExtendedEther {
        return new Ether(chainId)
    }
}
