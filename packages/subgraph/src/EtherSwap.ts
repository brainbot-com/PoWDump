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
    swapCommitment.initiator = event.params.initiator;
    swapCommitment.recipient = event.params.recipient;
    swapCommitment.value = event.params.value;
    swapCommitment.expectedAmount = event.params.expectedAmount;
    swapCommitment.endTimeStamp = event.params.endTimeStamp;
    swapCommitment.hashedSecret = event.params.hashedSecret;
    swapCommitment.emptied = false;
    swapCommitment.refunded = false;

    swapCommitment.save();
}

export function handleClaim(event: Claim): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toHex())

    if(swapCommitment !== null) {
        swapCommitment.emptied = true;
        swapCommitment.proof = event.params.proof
        swapCommitment.save();
    }
}

export function handleRefund(event: Refund): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toHex())

    if(swapCommitment !== null) {
        swapCommitment.refunded = true;
        swapCommitment.save();
    }
}

export function handleChangeRecipient(event: ChangeRecipient): void {
    const swapCommitment = SwapCommitment.load(event.params.id.toHex())

    if(swapCommitment !== null) {
        swapCommitment.recipient = event.params.recipient;
        swapCommitment.save();
    }
}