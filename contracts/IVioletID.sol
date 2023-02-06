// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IVioletID {
    function flag(address account) external;

    function unflag(address account) external;
}
