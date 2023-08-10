// SPDX-License-Identifier: GPL-3.0
// TODO: Use a more recent version?
pragma solidity ^0.8.9;

import "@violetprotocol/ethereum-access-token/contracts/AccessTokenConsumer.sol";
import "./AttributesMap.sol";

error Unauthorized();

/**
 * @title DataRegistry
 */
contract DataRegistry is AccessTokenConsumer, AttributesMap {
    address public owner;

    constructor(address _EATVerifier) AccessTokenConsumer(_EATVerifier) {
        owner = msg.sender;
    }

    function hasStatus(uint256 statusId, uint256 tokenId) public view returns (bool) {
        return isAttributeSet(tokenId, statusId);
    }

    function grantStatusSingle(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        uint256 statusId,
        uint256 tokenId
    ) public requiresAuth(v, r, s, expiry) {
        setAttribute(tokenId, statusId);
    }

    function grantStatusSingle(uint8 statusId, uint256 tokenId) public {
        if (msg.sender != owner) revert Unauthorized();
        setAttribute(tokenId, statusId);
    }

    function grantStatusesSingle(uint256 statusCombinationId, uint256 tokenId) public {
        if (msg.sender != owner) revert Unauthorized();
        setMultipleAttributes(tokenId, statusCombinationId);
    }

    function grantStatusBatch(uint256 statusId, uint256[] memory tokenIds) public {
        if (msg.sender != owner) revert Unauthorized();
        uint256 length = tokenIds.length;
        for (uint256 i = 0; i < length; ) {
            setAttribute(tokenIds[i], statusId);
            unchecked {
                ++i;
            }
        }
    }
}
