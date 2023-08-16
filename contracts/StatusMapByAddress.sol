// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev Provides a mapping from an id to 256 bits, used as boolean 'flags' to represent different statuses,
 * each identified by an `index`.
 * Inspired by OpenZeppelin Contracts (utils/structs/BitMaps.sol)
 **/
contract StatusMapByAddress {
    mapping(address => uint256) internal _statuses;

    /**
     * @dev Returns whether the bit at `index` is set for a specific account.
     */
    function isStatusSet(address account, uint8 index) internal view returns (bool) {
        uint256 mask = 1 << index;
        return _statuses[account] & mask != 0;
    }

    /**
     * @dev Returns whether a specific set of bits are set for a given account.
     */
    function areStatusesSet(address account, uint256 mask) internal view returns (bool) {
        return _statuses[account] & mask == mask;
    }

    /**
     * @dev Sets the bit at `index` to the boolean `value` for the account `account`.
     */
    function setStatusTo(address account, uint256 index, bool value) internal {
        if (value) {
            setStatus(account, index);
        } else {
            unsetStatus(account, index);
        }
    }

    /**
     * @dev Sets multiple bits for the ID `id` using a provided `indicesMask`.
     */
    function setMultipleStatuses(address account, uint256 indicesMask) internal {
        _statuses[account] |= indicesMask;
    }

    /**
     * @dev Sets the bit at `index` for the account `account`.
     */
    function setStatus(address account, uint256 index) internal {
        uint256 mask = 1 << (index);
        _statuses[account] |= mask;
    }

    /**
     * @dev Unsets the bit at `index` for the account `account`.
     */
    function unsetStatus(address account, uint256 index) internal {
        uint256 mask = 1 << index;
        _statuses[account] &= ~mask;
    }
}
