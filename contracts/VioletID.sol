// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./IVioletID.sol";
import "./StatusMap.sol";
import "./temp/AccessTokenConsumerUpgradeable.sol";

contract VioletID is
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable,
    IVioletID,
    StatusMap,
    AccessTokenConsumerUpgradeable
{
    /// @notice Owner role for:
    ///     - Upgrading
    ///     - Pausing
    ///     - Role Managing
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    /// @notice Admin role for:
    ///     - Granting statuses
    ///     - Revoking statuses
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract for usage after deployment.
    /// @dev initialization sets up roles and other on construction setup.
    function initialize(address _eatVerifier) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        __AccessTokenConsumer_init(_eatVerifier);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE); // OWNER_ROLE can change OWNER_ROLE
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE); // OWNER_ROLE can change ADMIN_ROLE
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /// @notice Pauses the smart contract, disabling status granting and revoking
    /// @dev only callable by owner
    function pause() public onlyRole(OWNER_ROLE) {
        _pause();
    }

    /// @notice Unpauses the smart contract, enabling status granting and revoking
    /// @dev only callable by owner
    function unpause() public onlyRole(OWNER_ROLE) {
        _unpause();
    }

    /// @notice Checks if an account has a particular status by its id
    /// @dev returns true/false if the `account` has the `statusId`
    function hasStatus(address account, uint8 statusId) public view override returns (bool) {
        return _isStatusSet(account, statusId);
    }

    /// @notice Checks if an account has a set of statuses by its combination id
    /// @dev returns true/false if the `account` has the `statusCombinationId`
    function hasStatuses(address account, uint256 statusCombinationId) public view override returns (bool) {
        return _areStatusesSet(account, statusCombinationId);
    }

    /// @notice Claims a set of statuses by combination id with a valid EAT
    /// @dev EAT-gated function for a user to claim their own statuses if granted by EAT
    function claimStatuses(
        uint8 v,
        bytes32 r,
        bytes32 s,
        uint256 expiry,
        address account,
        uint256 statusCombinationId
    ) public requiresAuth(v, r, s, expiry) whenNotPaused {
        _setMultipleStatuses(account, statusCombinationId);
    }

    /// @notice Grants a status by id to an account
    /// @dev only callable by owner
    function grantStatus(address account, uint8 statusId) public override onlyRole(ADMIN_ROLE) whenNotPaused {
        _setStatus(account, statusId);
    }

    /// @notice Grants a set of statuses by combination id to an account
    /// @dev only callable by owner
    function grantStatuses(
        address account,
        uint256 statusCombinationId
    ) public override onlyRole(ADMIN_ROLE) whenNotPaused {
        _setMultipleStatuses(account, statusCombinationId);
    }

    /// @notice Revokes a status by id from an account
    /// @dev only callable by owner
    function revokeStatus(address account, uint8 statusId) public override onlyRole(ADMIN_ROLE) whenNotPaused {
        _unsetStatus(account, statusId);
    }

    /// @notice Revokes a set of statuses by combination id from an account
    /// @dev only callable by owner
    function revokeStatuses(address account, uint256 statusCombinationId) public override onlyRole(ADMIN_ROLE) {
        unsetMultipleStatuses(account, statusCombinationId);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER_ROLE) {}

    // EIP-165 compatibility as required by AccessControlUpgradeable
    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return interfaceId == type(IVioletID).interfaceId || super.supportsInterface(interfaceId);
    }
}
