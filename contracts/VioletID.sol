// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IVioletID.sol";

contract VioletID is ERC1155, Ownable, IVioletID {
    // TokenId of VioletID token is 0
    uint256 constant tokenId = 0;

    // Mapping from tokenId to number of addresses that own at least 1
    mapping(uint256 => uint256) private _uniqueOwners;

    modifier onlyUnregistered() {
        require(!isAccountRegistered(msg.sender), "VioletID: account is already registered");
        _;
    }

    constructor(string memory metadataURI) ERC1155(metadataURI) Ownable() {}

    function flag(address account) external onlyOwner onlyUnregistered {
        _mint(account, tokenId, 1, "");
        _uniqueOwners[tokenId] = _uniqueOwners[tokenId] + 1;
    }

    function unflag(address account) external onlyOwner {
        _burn(account, tokenId, 1);
        _uniqueOwners[tokenId] = _uniqueOwners[tokenId] - 1;
    }

    function isAccountRegistered(address account) public view returns (bool) {
        return balanceOf(account, tokenId) > 0;
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        revert("VioletID: transfers disallowed");
    }
}
