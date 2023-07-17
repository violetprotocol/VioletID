import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { messages, utils } from "@violetprotocol/ethereum-access-token-helpers";
import { BigNumber, Contract, Wallet } from "ethers";
import { splitSignature } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { SimpleRegistry } from "../../src/types";

export const generateAccessTokenGrantSingle = async (
  signer: SignerWithAddress,
  verifyingContract: Contract,
  caller: Wallet | SignerWithAddress,
  contract: SimpleRegistry,
  parameters: any[],
  expiry?: BigNumber,
) => {
  const token = {
    functionCall: {
      functionSignature: contract.interface.getSighash(
        "grantStatusSingle(uint8,bytes32,bytes32,uint256,uint256,address)",
      ),
      target: ethers.utils.getAddress(contract.address),
      caller: ethers.utils.getAddress(caller.address),
      parameters: utils.packParameters(
        contract.interface,
        "grantStatusSingle(uint8,bytes32,bytes32,uint256,uint256,address)",
        parameters,
      ),
    },
    expiry: expiry || BigNumber.from(4833857428),
  };

  const domain: messages.Domain = {
    verifyingContract: verifyingContract.address,
    name: "Ethereum Access Token",
    version: "1",
    chainId: await signer.getChainId(),
  };

  const eat = splitSignature(await utils.signAccessToken(signer, domain, token));

  return { eat, expiry: token.expiry };
};
