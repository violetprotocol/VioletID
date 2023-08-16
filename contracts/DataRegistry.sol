// SPDX-License-Identifier: GPL-3.0
// TODO: Use a more recent version?
pragma solidity ^0.8.9;

import "@violetprotocol/ethereum-access-token/contracts/AccessTokenConsumer.sol";
import "./AttributesMapByAddress.sol";

error Unauthorized();

/**
 * @title DataRegistry
 */
contract DataRegistry is AccessTokenConsumer, AttributesMapByAddress {
    address public owner;

    constructor(address _EATVerifier) AccessTokenConsumer(_EATVerifier) {
        owner = msg.sender;
    }

    function hasStatus(uint256 statusId, address account) public view returns (bool) {
        return isAttributeSet(account, statusId);
    }

    function claimStatusSingle(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 statusId,
        address account
    ) public requiresAuth(v, r, s, expiry) {
        setAttribute(account, statusId);
    }

    function grantStatusSingle(uint8 statusId, address account) public {
        if (msg.sender != owner) revert Unauthorized();
        setAttribute(account, statusId);
    }

    function grantStatusesSingle(uint256 statusCombinationId, address account) public {
        if (msg.sender != owner) revert Unauthorized();
        setMultipleAttributes(account, statusCombinationId);
    }

    function claimStatuses(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 statusCombinationId,
        address account
    ) public requiresAuth(v, r, s, expiry) {
        setMultipleAttributes(account, statusCombinationId);
    }

    function grantStatusBatch(uint256 statusId, address[] memory accounts) public {
        if (msg.sender != owner) revert Unauthorized();
        uint256 length = accounts.length;
        for (uint256 i = 0; i < length; ) {
            setAttribute(accounts[i], statusId);
            unchecked {
                ++i;
            }
        }
    }
}
