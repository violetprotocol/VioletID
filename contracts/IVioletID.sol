// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event AccountDeregistered(address account, uint256 tokenId, bytes reason);

    function flag(address account, uint256 tokenId, bytes memory data) external;

    function unflag(address account, uint256 tokenId, bytes memory reason) external;

    function isBaseRegistered(address account) external view returns (bool);

    function numberOfBaseRegistered() external view returns (uint256);
}
