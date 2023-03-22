// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event AccountVerified(address account, uint256 tokenId);
    event AccountUnverified(address account, uint256 tokenId, bytes reason);

    function verifyStatus(address account, uint256 tokenId, bytes memory data) external;

    function unverifyStatus(address account, uint256 tokenId, bytes memory reason) external;

    function hasStatus(address account, uint256 tokenId) external view returns (bool);

    function hasBaseVerifiedStatus(address account) external view returns (bool);

    function numberWithBaseVerifiedStatus() external view returns (uint256);
}
