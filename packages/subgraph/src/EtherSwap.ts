import {
    SwapRefundedEvent,
    SwapInitiatedEvent,
    SwapSuccessEvent,
    SwapRecipientAddedEvent
} from "../generated/EtherSwap/EtherSwap";
import {SwapCommitment} from "../generated/schema";

// Create a swapCommitment and add it to the database
export function handleSwapInitiatedEvent(event: SwapInitiatedEvent): void {
    const id = event.params.hashedSecret.toHex();

    const swapCommitment = new SwapCommitment(id);

    swapCommitment.id = id;
    swapCommitment.initiator = event.params.initiator;
    swapCommitment.recipient = event.params.recipient;
    swapCommitment.value = event.params.value;
    swapCommitment.expectedAmount = event.params.expectedAmount;
    swapCommitment.hashedSecret = event.params.hashedSecret;
    swapCommitment.endTimeStamp = event.params.endTimeStamp;
    swapCommitment.emptied = false;
    swapCommitment.refunded = false;

    swapCommitment.save();
}

export function handleSwapSuccessEvent(event: SwapSuccessEvent): void {
    const swapCommitment = SwapCommitment.load(event.params.hashedSecret.toHex())

    if(swapCommitment !== null) {
        swapCommitment.emptied = true;
        swapCommitment.save();
    }
}

export function handleSwapRefundedEvent(event: SwapRefundedEvent): void {
    const swapCommitment = SwapCommitment.load(event.params.hashedSecret.toHex())

    if(swapCommitment !== null) {
        swapCommitment.refunded = true;
        swapCommitment.save();
    }
}

export function handleSwapRecipientAddedEvent(event: SwapRecipientAddedEvent): void {
    const swapCommitment = SwapCommitment.load(event.params.hashedSecret.toHex())

    if(swapCommitment !== null) {
        swapCommitment.recipient = event.params.recipient;
        swapCommitment.save();
    }
}