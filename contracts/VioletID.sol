// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./IVioletID.sol";

contract VioletID is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    UUPSUpgradeable,
    IVioletID
{
    /// @notice Owner role for:
    ///     - Upgrading
    ///     - Pausing
    ///     - Role Managing
    ///     - Setting URI
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    /// @notice Admin role for:
    ///     - Minting
    ///     - Burning
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(uint256 => string) public override tokenIdToName;

    modifier onlyRegisteredTokens(uint256 tokenId) {
        require(bytes(tokenIdToName[tokenId]).length > 0, "token type not registered");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __Pausable_init();
        __ERC1155Burnable_init();
        __ERC1155Supply_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE); // OWNER_ROLE can change OWNER_ROLE
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE); // OWNER_ROLE can change ADMIN_ROLE
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setURI(string memory newuri) public onlyRole(OWNER_ROLE) {
        _setURI(newuri);
    }

    function pause() public onlyRole(OWNER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(OWNER_ROLE) {
        _unpause();
    }

    function registerTokenType(uint256 tokenId, string calldata tokenName) public override onlyRole(ADMIN_ROLE) {
        require(bytes(tokenIdToName[tokenId]).length == 0, "token type already exists");

        tokenIdToName[tokenId] = tokenName;
        emit TokenTypeRegistered(tokenId, tokenName);
    }

    function updateTokenTypeName(
        uint256 tokenId,
        string calldata tokenName
    ) public override onlyRole(ADMIN_ROLE) onlyRegisteredTokens(tokenId) {
        tokenIdToName[tokenId] = tokenName;
        emit TokenTypeUpdated(tokenId, tokenName);
    }

    function grantStatus(
        address account,
        uint256 tokenId,
        bytes memory data
    ) public override onlyRole(ADMIN_ROLE) onlyRegisteredTokens(tokenId) {
        require(!hasStatus(account, tokenId), "account already granted status");

        _mint(account, tokenId, 1, data);
        emit GrantedStatus(account, tokenId);
    }

    function revokeStatus(address account, uint256 tokenId, bytes memory reason) public override onlyRole(ADMIN_ROLE) {
        require(hasStatus(account, tokenId), "account not in revocable status");

        _burn(account, tokenId, 1);
        emit RevokedStatus(account, tokenId, reason);
    }

    function hasStatus(address account, uint256 tokenId) public view override returns (bool) {
        return balanceOf(account, tokenId) > 0;
    }

    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public virtual override {
        revert("transfers disallowed");
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual override {
        revert("transfers disallowed");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(OWNER_ROLE) {}

    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
