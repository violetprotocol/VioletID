// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface of the VioletID contract
 */
interface IVioletID {
    /**
     * @dev Returns a boolean for whether `account` has `statusId`
     *
     * Must return true if `account` has status indicated by `statusId`
     * Must return false if `account` does not have status indicated by `statusId`
     */
    function hasStatus(address account, uint8 statusId) external view returns (bool);

    /**
     * @dev Returns a boolean for whether `account` has `statusCombinationId`
     *
     * Must return true if `account` has statuses indicated by `statusCombinationId`
     * Must return false if `account` does not have statuses indicated by `statusCombinationId`
     *
     * Status combination id is a single number that combines statuses through assigning or
     * unassigning bits in a uint256 value by index of bit. The statusId of each status being assigned
     * represents the bit index.
     */
    function hasStatuses(address account, uint256 statusCombinationId) external view returns (bool);

    /**
     * @dev Claims a set of statuses as `statusCombinationId` for msg.sender with valid EAT
     *
     * Must set the statuses for the calling account only if the EAT is valid
     * Must fail to set the statuses for the calling account if the EAT is expired or invalid
     * Must not deassign existing statuses if not included by `statusCombinationId`.
     *
     * Status combination id is a single number that combines statuses through assigning or
     * unassigning bits in a uint256 value by index of bit. The statusId of each status being assigned
     * represents the bit index.
     */
    function claimStatuses(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address account,
        uint256 statusCombinationId
    ) external;

    /**
     * @dev Grants a `statusId` to `account`
     *
     * Must set `statusId` for the specified `account`
     */
    function grantStatus(address account, uint8 statusId) external;

    /**
     * @dev Grants a set of statuses as `statusCombinationId` to `account`
     *
     * Must set each status id contained by `statusCombinationId` to the `account`
     *
     * Status combination id is a single number that combines statuses through assigning or
     * unassigning bits in a uint256 value by index of bit. The statusId of each status being assigned
     * represents the bit index.
     */
    function grantStatuses(address account, uint256 statusCombinationId) external;

    /**
     * @dev Revokes a `statusId` from `account`
     *
     * Must unset `statusId` for the specified `account`
     */
    function revokeStatus(address account, uint8 statusId) external;

    /**
     * @dev Revokes a set of statuses as `statusCombinationId` from `account`
     *
     * Must unset each status id contained by `statusCombinationId` from the `account`
     *
     * Status combination id is a single number that combines statuses through assigning or
     * unassigning bits in a uint256 value by index of bit. The statusId of each status being assigned
     * represents the bit index.
     */
    function revokeStatuses(address account, uint256 statusCombinationId) external;
}
