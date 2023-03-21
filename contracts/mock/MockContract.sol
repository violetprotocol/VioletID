// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

contract MockContract is IERC1155ReceiverUpgradeable {
    address public immutable _violetId;

    constructor(address _violetId_) {
        _violetId = _violetId_;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        return IERC1155ReceiverUpgradeable.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external view returns (bool) {}

    function transferVID(address to) external {
        IERC1155Upgradeable(_violetId).safeTransferFrom(address(this), to, 1, 1, "");
    }

    function transferVIDBatch(address to) external {
        IERC1155Upgradeable(_violetId).safeBatchTransferFrom(address(this), to, new uint256[](1), new uint256[](1), "");
    }
}
