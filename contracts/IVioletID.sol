// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event GrantedStatus(address account, uint256 tokenId);
    event RevokedStatus(address account, uint256 tokenId, bytes reason);

    function grantStatus(address account, uint256 tokenId, bytes memory data) external;

    function revokeStatus(address account, uint256 tokenId, bytes memory reason) external;

    function hasStatus(address account, uint256 tokenId) external view returns (bool);

    function hasBaseRegistrationStatus(address account) external view returns (bool);

    function numberWithBaseRegistrationStatus() external view returns (uint256);
}
