// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    event AccountDeregistered(address account, bytes reason);

    function flag(address account, bytes memory data) external;

    function unflag(address account, bytes memory reason) external;

    function isAccountRegistered(address account) external view returns (bool);

    function isContractRegistered(address contractAddress) external view returns (bool);

    function numberOfRegisteredAccounts() external view returns (uint256);

    function numberOfRegisteredContracts() external view returns (uint256);
}
