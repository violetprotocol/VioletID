// SPDX-License-Identifier: GPL-3.0
// TODO: Use a more recent version?
pragma solidity ^0.8.9;

import "@violetprotocol/ethereum-access-token/contracts/AccessTokenConsumer.sol";

error Unauthorized();

/**
 * @title SimpleRegistry
 */
contract SimpleRegistry is AccessTokenConsumer {
    address public owner;
    // Status ID => address => true/false
    mapping(uint256 => mapping(address => bool)) public hasStatus;

    constructor(address _EATVerifier) AccessTokenConsumer(_EATVerifier) {
        owner = msg.sender;
    }

    function grantStatusSingle(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 statusId,
        address addy
    ) public requiresAuth(v, r, s, expiry) {
        hasStatus[statusId][addy] = true;
    }

    function grantStatusSingle(uint256 statusId, address addy) public {
        if (msg.sender != owner) revert Unauthorized();
        hasStatus[statusId][addy] = true;
    }

    function grantStatusBatch(uint256 statusId, address[] memory addys) public {
        if (msg.sender != owner) revert Unauthorized();
        uint256 length = addys.length;
        for (uint256 i = 0; i < length; ) {
            hasStatus[statusId][addys[i]] = true;
            unchecked {
                ++i;
            }
        }
    }
}
