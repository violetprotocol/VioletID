// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../StatusMap.sol";

contract MockStatusMap is StatusMap {
    function isStatusSet(address account, uint8 index) public view returns (bool) {
        return _isStatusSet(account, index);
    }

    function areStatusesSet(address account, uint256 mask) public view returns (bool) {
        return _areStatusesSet(account, mask);
    }

    function setStatusTo(address account, uint256 index, bool value) public {
        _setStatusTo(account, index, value);
    }

    function setMultipleStatuses(address account, uint256 indicesMask) public {
        _setMultipleStatuses(account, indicesMask);
    }

    function setStatus(address account, uint256 index) public {
        _setStatus(account, index);
    }

    function unsetStatus(address account, uint256 index) public {
        _unsetStatus(account, index);
    }
}
