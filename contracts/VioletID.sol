// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IVioletID.sol";

contract VioletID is ERC1155, Ownable, IVioletID {
    // Token ID of VioletID token is 0
    uint256 public constant TOKEN_ID = 0;

    // Mapping from TOKEN_ID to number of addresses that own at least 1
    mapping(uint256 => uint256) private _uniqueOwners;

    modifier onlyUnregistered() {
        require(!isAccountRegistered(msg.sender), "VioletID: account is already registered");
        _;
    }

    // solhint-disable-next-line
    constructor(string memory metadataURI) ERC1155(metadataURI) Ownable() {}

    function flag(address account) external onlyOwner onlyUnregistered {
        _mint(account, TOKEN_ID, 1, "");
        _uniqueOwners[TOKEN_ID] = _uniqueOwners[TOKEN_ID] + 1;
    }

    function unflag(address account) external onlyOwner {
        _burn(account, TOKEN_ID, 1);
        _uniqueOwners[TOKEN_ID] = _uniqueOwners[TOKEN_ID] - 1;
    }

    function isAccountRegistered(address account) public view returns (bool) {
        return balanceOf(account, TOKEN_ID) > 0;
    }

    function numberOfRegisteredAccounts() public view returns (uint256) {
        return _uniqueOwners[TOKEN_ID];
    }

    function safeTransferFrom(address, address, uint256, uint256, bytes memory) public override {
        revert("VioletID: transfers disallowed");
    }
}
