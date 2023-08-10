// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Provides a mapping from an id to 256 bits used as 'flags', each identified by an `index`.
 * Inspired by OpenZeppelin Contracts (utils/structs/BitMaps.sol)
 **/
contract AttributesMap {
    mapping(uint256 => uint256) internal _attributes;

    /**
     * @dev Returns whether the bit at `index` is set for the ID `id`.
     */
    function isAttributeSet(uint256 id, uint256 index) internal view returns (bool) {
        uint256 mask = 1 << index;
        return _attributes[id] & mask != 0;
    }

    /**
     * @dev Sets the bit at `index` to the boolean `value` for the ID `id`.
     */
    function setAttributeTo(uint256 id, uint256 index, bool value) internal {
        if (value) {
            setAttribute(id, index);
        } else {
            unsetAttribute(id, index);
        }
    }

    /**
     * @dev Sets multiple bits for the ID `id` using a provided `indicesMask`.
     */
    function setMultipleAttributes(uint256 id, uint256 indicesMask) internal {
        _attributes[id] |= indicesMask;
    }

    /**
     * @dev Sets the bit at `index` for the ID `id`.
     */
    function setAttribute(uint256 id, uint256 index) internal {
        uint256 mask = 1 << (index);
        _attributes[id] |= mask;
    }

    /**
     * @dev Unsets the bit at `index` for the ID `id`.
     */
    function unsetAttribute(uint256 id, uint256 index) internal {
        uint256 mask = 1 << index;
        _attributes[id] &= ~mask;
    }
}
