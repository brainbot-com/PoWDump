pragma solidity 0.8.9;

import "hardhat/console.sol";

contract EtherSwap {

    struct Swap {
        bytes32 hashedSecret;
        address payable initiator;
        uint64 endTimeStamp;
        address payable recipient;
        uint64 changeRecipientTimestamp;
        uint256 value;
        uint256 expectedAmount;
    }

    uint32 public numberOfSwaps;
    uint64 public recipientChangeLockDuration;

    address payable public feeRecipient;
    uint64 public feePerMillion;
    uint256 public collectedFees;

    mapping(uint32 => Swap) public swaps;

    event Commit(address initiator, address recipient, uint256 value, uint256 expectedAmount, uint64 endTimeStamp, bytes32 indexed hashedSecret, uint32 indexed id);
    event ChangeRecipient(address recipient, uint32 indexed id);
    event Claim(address recipient, uint256 value, bytes32 proof, uint32 indexed id);
    event Refund(uint32 indexed id);
    event WithdrawFees(uint256 value);

    constructor (uint64 _recipientChangeLockDuration, address payable _feeRecipient, uint64 _feePerMillion) {
        recipientChangeLockDuration = _recipientChangeLockDuration;
        feeRecipient = _feeRecipient;
        feePerMillion = _feePerMillion;
    }

    function commit(uint64 _swapEndTimestamp, bytes32 _hashedSecret, uint256 _payout, uint256 _expectedAmount, address payable _recipient) public payable {
        require(block.timestamp < _swapEndTimestamp, "Swap end timestamp must be in the future");

        uint256 fee = feeFromSwapValue(_payout);
        require(msg.value == fee + _payout, "Ether value does not match payout + fee");

        Swap memory swap;
        swap.hashedSecret = _hashedSecret;
        swap.initiator = payable(msg.sender);
        swap.recipient = _recipient;
        swap.endTimeStamp = _swapEndTimestamp;
        swap.changeRecipientTimestamp = 0;
        swap.value = _payout;
        swap.expectedAmount = _expectedAmount;

        if (_recipient != address(0)) {
            swap.changeRecipientTimestamp = type(uint64).max;
        }

        swaps[numberOfSwaps] = swap;

        emit Commit(msg.sender, _recipient, _payout, _expectedAmount, swap.endTimeStamp, _hashedSecret, numberOfSwaps);

        numberOfSwaps = numberOfSwaps + 1;
    }

    function commit(uint64 _transactionExpiryTime, uint64 _lockTimeSec, bytes32 _hashedSecret, uint256 _payout, uint256 _expectedAmount, address payable _recipient) external payable {
        require(block.timestamp < _transactionExpiryTime, "Transaction no longer valid");
        commit(uint64(block.timestamp) + _lockTimeSec, _hashedSecret, _payout, _expectedAmount, _recipient);
    }

    function changeRecipient(uint32 _swapId, address payable _recipient) external {
        require(_swapId < numberOfSwaps, "No swap with corresponding id");
        require(swaps[_swapId].changeRecipientTimestamp <= block.timestamp, "Cannot change recipient: timestamp");

        swaps[_swapId].recipient = _recipient;
        swaps[_swapId].changeRecipientTimestamp = uint64(block.timestamp) + recipientChangeLockDuration;

        emit ChangeRecipient(_recipient, _swapId);
    }

    function claim(uint32 _id, bytes32 _proof) external {
        require(_id < numberOfSwaps, "No swap with corresponding id");

        Swap memory swap = swaps[_id];

        require(swap.endTimeStamp >= block.timestamp, "Swap expired");
        require(swap.recipient != address(0), "Swap has no recipient");

        bytes32 hashedSecret = keccak256(abi.encode(_proof));
        require(hashedSecret == swap.hashedSecret, "Incorrect secret");

        collectedFees = collectedFees + feeFromSwapValue(swap.value);
        clean(_id);
        swap.recipient.transfer(swap.value);
        emit Claim(swap.recipient, swap.value, _proof, _id);
    }

    function refund(uint32 id) external {
        require(id < numberOfSwaps, "No swap with corresponding id");
        require(swaps[id].endTimeStamp < block.timestamp, "TimeStamp violation");
        require(swaps[id].value > 0, "Nothing to refund");

        uint256 value = swaps[id].value;
        uint256 fee = feeFromSwapValue(value);
        address payable initiator = swaps[id].initiator;

        clean(id);

        initiator.transfer(value + fee);
        emit Refund(id);
    }

    function withdrawFees() external {
        uint256 toTransfer = collectedFees;
        collectedFees = 0;
        feeRecipient.transfer(toTransfer);
        emit WithdrawFees(toTransfer);
    }

    function clean(uint32 id) private {
        Swap storage swap = swaps[id];
        delete swap.hashedSecret;
        delete swap.initiator;
        delete swap.endTimeStamp;
        delete swap.recipient;
        delete swap.changeRecipientTimestamp;
        delete swap.value;
        delete swap.expectedAmount;
        delete swaps[id];
    }

    /**
     * @notice Get the fee paid for a swap from its swap value
               msg.value = swap value + fee
     * @param value the swap value
     * @return the fee paid for the swap
     **/
    function feeFromSwapValue(uint256 value) public view returns(uint256) {
        uint256 fee = value * feePerMillion / 1_000_000;
        return fee;
    }
}


// SPDX-License-Identifier: MIT
