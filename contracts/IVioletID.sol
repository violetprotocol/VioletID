// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVioletID {
    function hasStatus(address account, uint8 statusId) external view returns (bool);

    function hasStatuses(address account, uint256 statusCombinationId) external view returns (bool);

    function claimStatuses(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address account,
        uint256 statusCombinationId
    ) external;

    function grantStatus(address account, uint8 statusId) external;

    function grantStatuses(address account, uint256 statusCombinationId) external;

    function revokeStatus(address account, uint8 statusId) external;

    function revokeStatuses(address account, uint256 statusCombinationId) external;
}
