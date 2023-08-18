// SPDX-License-Identifier: MIT
// TODO: Update to 0.8.20
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
        setStatus(account, statusId);
    }

    function grantStatuses(address account, uint256 statusCombinationId) public override onlyRole(ADMIN_ROLE) {
        setMultipleStatuses(account, statusCombinationId);
    }

    function revokeStatus(address account, uint8 statusId) public override onlyRole(ADMIN_ROLE) {
        unsetStatus(account, statusId);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER_ROLE) {}

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override(AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
