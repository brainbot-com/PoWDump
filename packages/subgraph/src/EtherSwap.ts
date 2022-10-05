import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import {
    ChangeRecipient,
    Claim,
    Commit, Refund

} from "../generated/EtherSwap/EtherSwap"
import {SwapCommitment} from "../generated/schema";

// Create a swapCommitment and add it to the database
export function handleCommit(event: Commit): void {
    const id = event.params.id.toString();

    const swapCommitment = new SwapCommitment(id);

    swapCommitment.id = id;
    swapCommitment.idAsInt = event.params.id;
    swapCommitment.initiator = event.params.initiator;
    swapCommitment.recipient = event.params.recipient;
    swapCommitment.recipientChangedAt = BigInt.fromI32(0);
    swapCommitment.recipientChangedInTransaction = Address.fromString("0x0000000000000000000000000000000000000000");
    swapCommitment.value = event.params.value;
    swapCommitment.expectedAmount = event.params.expectedAmount;
    swapCommitment.endTimeStamp = event.params.endTimeStamp;
    swapCommitment.createdAt = event.block.timestamp;
    swapCommitment.createdInTransaction = event.transaction.hash;
    swapCommitment.emptiedAt = BigInt.fromI32(0);
    swapCommitment.emptiedInTransaction = Address.fromString("0x0000000000000000000000000000000000000000");
    swapCommitment.refundedAt = BigInt.fromI32(0);
    swapCommitment.refundedInTransaction = Address.fromString("0x0000000000000000000000000000000000000000");
    swapCommitment.hashedSecret = event.params.hashedSecret;
    swapCommitment.proof = Bytes.empty();
    swapCommitment.emptied = false;
    swapCommitment.refunded = false;
    swapCommitment.contractAddress = event.address;

    swapCommitment.save();
}

export function handleClaim(event: Claim): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toString())

    if(swapCommitment !== null) {
        swapCommitment.emptied = true;
        swapCommitment.proof = event.params.proof
        swapCommitment.emptiedAt = event.block.timestamp;
        swapCommitment.emptiedInTransaction = event.transaction.hash;
        swapCommitment.save();
    }
}

export function handleRefund(event: Refund): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toString())

    if(swapCommitment !== null) {
        swapCommitment.refunded = true;
        swapCommitment.refundedAt = event.block.timestamp;
        swapCommitment.refundedInTransaction = event.transaction.hash;
        swapCommitment.save();
    }
}

export function handleChangeRecipient(event: ChangeRecipient): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toString())

    if(swapCommitment !== null) {
        swapCommitment.recipient = event.params.recipient;
        swapCommitment.recipientChangedAt = event.block.timestamp;
        swapCommitment.recipientChangedInTransaction = event.transaction.hash;
        swapCommitment.save();
    }
}