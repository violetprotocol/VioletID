// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Provides a mapping from an id to 256 bits used as 'flags', each identified by an `index`.
 * Inspired by OpenZeppelin Contracts (utils/structs/BitMaps.sol)
 **/
contract AttributesMapByAddress {
    mapping(address => uint256) internal _attributes;

    /**
     * @dev Returns whether the bit at `index` is set for the ID `id`.
     */
    function isAttributeSet(address account, uint256 index) internal view returns (bool) {
        uint256 mask = 1 << index;
        return _attributes[account] & mask != 0;
    }

    /**
     * @dev Returns whether a specific set of bits are set for the ID `id`.
     */
    function areAttributesSet(address account, uint256 mask) internal view returns (bool) {
        return _attributes[account] & mask == mask;
    }

    /**
     * @dev Sets the bit at `index` to the boolean `value` for the ID `id`.
     */
    function setAttributeTo(address account, uint256 index, bool value) internal {
        if (value) {
            setAttribute(account, index);
        } else {
            unsetAttribute(account, index);
        }
    }

    /**
     * @dev Sets multiple bits for the ID `id` using a provided `indicesMask`.
     */
    function setMultipleAttributes(address account, uint256 indicesMask) internal {
        _attributes[account] |= indicesMask;
    }

    /**
     * @dev Sets the bit at `index` for the ID `account`.
     */
    function setAttribute(address account, uint256 index) internal {
        uint256 mask = 1 << (index);
        _attributes[account] |= mask;
    }

    /**
     * @dev Unsets the bit at `index` for the ID `account`.
     */
    function unsetAttribute(address account, uint256 index) internal {
        uint256 mask = 1 << index;
        _attributes[account] &= ~mask;
    }
}
