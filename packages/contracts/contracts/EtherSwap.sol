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
    uint64 public constant RECIPIENT_CHANGE_LOCK_DURATION = 60*10;

    mapping(uint32 => Swap) public swaps;

    event Commit(address initiator, address recipient, uint256 value, uint256 expectedAmount, uint64 endTimeStamp, bytes32 indexed hashedSecret, uint32 indexed id);
    event ChangeRecipient(address recipient, uint32 indexed id);
    event Claim(address recipient, uint256 value, bytes32 proof, uint32 indexed id);
    event Refund(uint32 indexed id);

    function commit(uint64 _lockTimeSec, bytes32 _hashedSecret, uint256 _expectedAmount, address payable _recipient) external payable {
        require(msg.value > 0, "Ether is required");

        Swap memory swap;
        swap.hashedSecret = _hashedSecret;
        swap.initiator = payable(msg.sender);
        swap.recipient = _recipient;
        swap.endTimeStamp = uint64(block.timestamp + _lockTimeSec);
        swap.changeRecipientTimestamp = 0;
        swap.value = msg.value;
        swap.expectedAmount = _expectedAmount;

        if (_recipient != address(0)) {
            swap.changeRecipientTimestamp = type(uint64).max;
        }

        swaps[numberOfSwaps] = swap;

        emit Commit(msg.sender, _recipient, msg.value, _expectedAmount, swap.endTimeStamp, _hashedSecret, numberOfSwaps);

        numberOfSwaps = numberOfSwaps + 1;
    }

    function changeRecipient(uint32 _swapId, address payable _recipient) external {
        require(_swapId < numberOfSwaps, "No swap with corresponding id");
        require(swaps[_swapId].changeRecipientTimestamp <= block.timestamp, "Cannot change recipient: timestamp");

        swaps[_swapId].recipient = _recipient;
        swaps[_swapId].changeRecipientTimestamp = uint64(block.timestamp) + RECIPIENT_CHANGE_LOCK_DURATION;

        emit ChangeRecipient(_recipient, _swapId);
    }

    function claim(uint32 _id, bytes32 _proof) external {
        require(_id < numberOfSwaps, "No swap with corresponding id");

        Swap memory swap = swaps[_id];

        require(swap.endTimeStamp >= block.timestamp, "Swap expired");
        require(swap.recipient != address(0), "Swap has no recipient");

        bytes32 hashedSecret = keccak256(abi.encode(_proof));
        require(hashedSecret == swap.hashedSecret, "Incorrect secret");

        clean(_id);
        swap.recipient.transfer(swap.value);
        emit Claim(swap.recipient, swap.value, _proof, _id);
    }

    function refund(uint32 id) external {
        require(id < numberOfSwaps, "No swap with corresponding id");
        require(swaps[id].endTimeStamp < block.timestamp, "TimeStamp violation");
        require(swaps[id].value > 0, "Nothing to refund");

        uint256 value = swaps[id].value;
        address payable initiator = swaps[id].initiator;

        clean(id);

        initiator.transfer(value);
        emit Refund(id);
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
}


// SPDX-License-Identifier: MIT
