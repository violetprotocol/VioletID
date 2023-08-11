// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event AttributeRegistered(uint8 attributeId, string attributeName);
    event AttributeNameUpdated(uint8 attributeId, string attributeName);
    event GrantedAttribute(uint256 tokenId, uint8 attributeId);
    event RevokedAttribute(uint256 tokenId, uint8 attributeId, bytes reason);

    function grantAttribute(uint256 tokenId, uint8 attributeId) external;

    function grantAttributes(uint256 tokenId, uint256 attributeCombinationId) external;

    function revokeAttribute(uint256 tokenId, uint8 attributeId, bytes memory reason) external;

    function hasAttribute(uint256 tokenId, uint8 attributeId) external view returns (bool);

    function attributeIdToName(uint8 attributeId) external view returns (string memory);

    function registerAttribute(uint8 attributeId, string calldata attributeName) external;

    function updateAttributeName(uint8 attributeId, string calldata attributeName) external;
}
