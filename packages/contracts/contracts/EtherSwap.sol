pragma solidity 0.8.16;

import "hardhat/console.sol";

contract EtherSwap {

    struct Swap {
        bytes32 hashedSecret;
        address payable initiator;
        // timestamp after which the swap is expired, can no longer be claimed and can be reimbursed
        uint64 endTimeStamp;
        address payable recipient;
        // timestamp after which the recipient of the swap can be changed
        // used to prevent dos attacks by locking swaps of users with a random address
        uint64 changeRecipientTimestamp;
        uint256 value;
        uint256 expectedAmount;
    }

    uint32 public numberOfSwaps;
    // duration in seconds of the lock put on swaps to prevent changing their recipient repeatedly
    uint64 public recipientChangeLockDuration;

    address payable public feeRecipient;
    // the fee on a swap will be `swapValue * feePerMillion / 1_000_000`
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
        // Pay the tx.origin to incentivize deployment via a contract using create2 allowing us to pre-compile
        // the contract address
        payable(tx.origin).transfer(address(this).balance);
    }

    /// Commit to swap
    ///
    /// This function can be directly called by users matching an already committed to swap
    /// that know the end timestamp and recipient they should use.
    ///
    /// @param _swapEndTimestamp the timestamp at which the commit expires
    /// @param _hashedSecret the hashed secret
    /// @param _payout the value paid to the counterparty claiming the swap
    /// @param _expectedAmount the value expected by the committer in return for _payout
    /// @param _recipient the recipient of the swap
    ///        can be the zero address
    function commit(uint64 _swapEndTimestamp, bytes32 _hashedSecret, uint256 _payout, uint256 _expectedAmount, address payable _recipient) public payable {
        require(block.timestamp < _swapEndTimestamp, "Swap end timestamp must be in the future");
        require(_payout != 0, "Cannot commit to 0 payout");
        require(_expectedAmount != 0, "Cannot commit to 0 expected amount");

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

    /// Commit to swap
    ///
    /// This function can be called by users uncertain as to when their transaction will be minted
    ///
    /// @param _transactionExpiryTime the timestamp at which the transaction expires
    ///        used to make sure the user does not see himself committed later than expected
    /// @param _lockTimeSec the duration of the swap lock
    ///        swap will expire at block.timestamp + _lockTimeSec
    /// @param _hashedSecret the hashed secret
    /// @param _payout the value paid to the counterparty claiming the swap
    /// @param _expectedAmount the value expected by the committer in return for _payout
    /// @param _recipient the recipient of the swap
    ///        can be the zero address
    function commit(uint64 _transactionExpiryTime, uint64 _lockTimeSec, bytes32 _hashedSecret, uint256 _payout, uint256 _expectedAmount, address payable _recipient) external payable {
        require(block.timestamp < _transactionExpiryTime, "Transaction no longer valid");
        commit(uint64(block.timestamp) + _lockTimeSec, _hashedSecret, _payout, _expectedAmount, _recipient);
    }

    /// Change recipient of an existing swap
    ///
    /// Call this function when you want to match a swap to set yourself as
    /// the recipient of the swap for `recipientChangeLockDuration` seconds
    ///
    /// @param _swapId the swap id
    /// @param _recipient the recipient to be set
    function changeRecipient(uint32 _swapId, address payable _recipient) external {
        require(_swapId < numberOfSwaps, "No swap with corresponding id");
        require(swaps[_swapId].changeRecipientTimestamp <= block.timestamp, "Cannot change recipient: timestamp");

        swaps[_swapId].recipient = _recipient;
        swaps[_swapId].changeRecipientTimestamp = uint64(block.timestamp) + recipientChangeLockDuration;

        emit ChangeRecipient(_recipient, _swapId);
    }

    /// Claim a swap
    ///
    /// Claim a swap to sent its locked value to its recipient by revealing the hashed secret
    ///
    /// @param _id the swap id
    /// @param _proof the proof that once hashed produces the `hashedSecret` committed to in the swap
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

    /// Refund a swap
    ///
    /// Refund an expired swap by transferring back its locked value to the swap initiator.
    /// Requires the swap to be expired.
    /// Also reimburses the eventual fee locked for the swap.
    ///
    /// @param id the swap id
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

    /// Withdraw the fees
    ///
    /// Send the total collected fees to the `feeRecipient` address.
    function withdrawFees() external {
        uint256 toTransfer = collectedFees;
        collectedFees = 0;
        feeRecipient.transfer(toTransfer);
        emit WithdrawFees(toTransfer);
    }

    /// Clean a swap from storage
    ///
    /// @param id the swap id
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

    /// Get the fee paid for a swap from its swap value
    /// msg.value = swap value + fee
    ///
    /// @param value the swap value
    /// @return the fee paid for the swap
    function feeFromSwapValue(uint256 value) public view returns(uint256) {
        uint256 fee = value * feePerMillion / 1_000_000;
        return fee;
    }
}


// SPDX-License-Identifier: MIT
