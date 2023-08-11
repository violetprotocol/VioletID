// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./AttributesMap.sol";
import "./IVioletID.sol";

contract VioletID is
    Initializable,
    ERC1155Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ERC1155BurnableUpgradeable,
    UUPSUpgradeable,
    IVioletID,
    AttributesMap
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
    uint256 public nextTokenId;
    mapping(uint8 => string) public override attributeIdToName;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __Pausable_init();
        __ERC1155Burnable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE); // OWNER_ROLE can change OWNER_ROLE
        _setRoleAdmin(ADMIN_ROLE, OWNER_ROLE); // OWNER_ROLE can change ADMIN_ROLE
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        // Cheaper first mint
        nextTokenId++;
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

    function registerAttribute(uint8 attributeId, string calldata attributeName) public override onlyRole(ADMIN_ROLE) {
        require(bytes(attributeIdToName[attributeId]).length == 0, "attribute already registered");

        attributeIdToName[attributeId] = attributeName;
        emit AttributeRegistered(attributeId, attributeName);
    }

    function updateAttributeName(
        uint8 attributeId,
        string calldata attributeName
    ) public override onlyRole(ADMIN_ROLE) {
        require(bytes(attributeIdToName[attributeId]).length > 0, "attribute not registered");
        attributeIdToName[attributeId] = attributeName;
        emit AttributeNameUpdated(attributeId, attributeName);
    }

    function grantAttribute(uint256 tokenId, uint8 attributeId) public override onlyRole(ADMIN_ROLE) {
        require(!hasAttribute(tokenId, attributeId), "token already has this attribute");
        setAttribute(tokenId, attributeId);
        // TODO: Remove this event?
        emit GrantedAttribute(tokenId, attributeId);
    }

    function grantAttributes(uint256 tokenId, uint256 attributeCombinationId) public override onlyRole(ADMIN_ROLE) {
        setMultipleAttributes(tokenId, attributeCombinationId);
    }

    function revokeAttribute(
        uint256 tokenId,
        uint8 attributeId,
        bytes memory reason
    ) public override onlyRole(ADMIN_ROLE) {
        require(hasAttribute(tokenId, attributeId), "token does not have this attribute");
        unsetAttribute(tokenId, attributeId);
        emit RevokedAttribute(tokenId, attributeId, reason);
    }

    function hasAttribute(uint256 tokenId, uint8 attributeId) public view override returns (bool) {
        return isAttributeSet(tokenId, attributeId);
    }

    function hasAttributes(uint256 tokenId, uint256 attributeCombinationId) public view override returns (bool) {
        return areAttributesSet(tokenId, attributeCombinationId);
    }

    function mintWithAttributes(address account, uint256 attributeCombinationId) public onlyRole(ADMIN_ROLE) {
        _mint(account, nextTokenId, 1, toBytes(attributeCombinationId));
        unchecked {
            ++nextTokenId;
        }
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
    ) internal override(ERC1155Upgradeable) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        if (from == address(0) && data.length > 0) {
            grantAttributes(ids[0], uint256(bytes32(data)));
        }
    }

    function toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        assembly {
            mstore(add(b, 32), x)
        }
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
