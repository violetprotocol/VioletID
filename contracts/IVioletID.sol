// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event StatusRegistered(uint8 statusId, string statusName);
    event StatusNameUpdated(uint8 statusId, string statusName);
    event GrantedStatus(address account, uint8 statusId);
    event RevokedStatus(address account, uint8 statusId, bytes reason);

    // TODO: statusId not needed and cheaper without?
    error AccountDoesNotHaveStatus(uint8 statusId);
    error AccountAlreadyHasStatus(uint8 statusId);
    error StatusAlreadyRegistered();
    error StatusNotYetRegistered();

    function statusIdToName(uint8 statusId) external view returns (string memory);

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

    function revokeStatus(address account, uint8 statusId, bytes memory reason) external;

    function registerStatus(uint8 statusId, string calldata statusName) external;

    function updateStatusName(uint8 statusId, string calldata statusName) external;
}
