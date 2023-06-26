// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event TokenRegistered(uint256 tokenId, string tokenName);
    event TokenUpdated(uint256 tokenId, string tokenName);
    event GrantedStatus(address account, uint256 tokenId);
    event RevokedStatus(address account, uint256 tokenId, bytes reason);

    function grantStatus(address account, uint256 tokenId, bytes memory data) external;

    function revokeStatus(address account, uint256 tokenId, bytes memory reason) external;

    function hasStatus(address account, uint256 tokenId) external view returns (bool);

    function tokenIdToType(uint256 tokenId) external view returns (string memory);

    function registerTokenType(uint256 tokenId, string calldata tokenName) external;

    function updateTokenTypeName(uint256 tokenId, string calldata tokenName) external;
}
