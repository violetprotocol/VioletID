// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IVioletID.sol";
import "./StatusMapByAddress.sol";
import "./temp/AccessTokenConsumerUpgradeable.sol";

contract VioletID is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    IVioletID,
    StatusMapByAddress,
    AccessTokenConsumerUpgradeable
{
    /// @notice Owner role for:
    ///     - Upgrading
    ///     - Pausing
    ///     - Role Managing
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    /// @notice Admin role for:
    ///     - Registering and updating statuses names
    ///     - Granting statuses
    ///     - Revoking statuses
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    // User-friendly name for each status
    mapping(uint8 => string) public override statusIdToName;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _EATVerifier) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __AccessTokenConsumer_init(_EATVerifier);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE); // OWNER_ROLE can change OWNER_ROLE
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE); // OWNER_ROLE can change ADMIN_ROLE
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function pause() public onlyRole(OWNER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(OWNER_ROLE) {
        _unpause();
    }

    function hasStatus(address account, uint8 statusId) public view override returns (bool) {
        return isStatusSet(account, statusId);
    }

    function hasStatuses(address account, uint256 statusCombinationId) public view override returns (bool) {
        return areStatusesSet(account, statusCombinationId);
    }

    function claimStatuses(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address account,
        uint256 statusCombinationId
    ) public requiresAuth(v, r, s, expiry) {
        setMultipleStatuses(account, statusCombinationId);
    }

    function grantStatus(address account, uint8 statusId) public override onlyRole(ADMIN_ROLE) {
        if (hasStatus(account, statusId)) revert AccountAlreadyHasStatus(statusId);
        setStatus(account, statusId);
        // TODO: Remove this event?
        emit GrantedStatus(account, statusId);
    }

    function grantStatuses(address account, uint256 statusCombinationId) public override onlyRole(ADMIN_ROLE) {
        setMultipleStatuses(account, statusCombinationId);
    }

    function revokeStatus(address account, uint8 statusId, bytes memory reason) public override onlyRole(ADMIN_ROLE) {
        if (!hasStatus(account, statusId)) revert AccountDoesNotHaveStatus(statusId);
        unsetStatus(account, statusId);
        // TODO: Remove this event?
        emit RevokedStatus(account, statusId, reason);
    }

    function registerStatus(uint8 statusId, string calldata statusName) public override onlyRole(ADMIN_ROLE) {
        if (bytes(statusIdToName[statusId]).length > 0) revert StatusAlreadyRegistered();

        statusIdToName[statusId] = statusName;

        emit StatusRegistered(statusId, statusName);
    }

    function updateStatusName(uint8 statusId, string calldata statusName) public override onlyRole(ADMIN_ROLE) {
        if (bytes(statusIdToName[statusId]).length == 0) revert StatusNotYetRegistered();

        statusIdToName[statusId] = statusName;

        emit StatusNameUpdated(statusId, statusName);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER_ROLE) {}

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
