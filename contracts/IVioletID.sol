// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    function flag(address account) external;

    function unflag(address account) external;

    function isAccountRegistered(address account) external view returns (bool);

    function numberOfRegisteredAccounts() external view returns (uint256);
}
