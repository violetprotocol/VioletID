import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { messages, utils } from "@violetprotocol/ethereum-access-token-helpers";
import { BigNumber, Contract, Wallet } from "ethers";
import { splitSignature } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { SimpleRegistry } from "../../src/types";

export const generateAccessToken = async (
  signer: SignerWithAddress,
  verifyingContract: Contract,
  functionSignature: string,
  caller: Wallet | SignerWithAddress,
  contract: SimpleRegistry,
  parameters: any[],
  expiry?: BigNumber,
) => {
  const token = {
    functionCall: {
      functionSignature: contract.interface.getSighash(functionSignature),
      target: ethers.utils.getAddress(contract.address),
      caller: ethers.utils.getAddress(caller.address),
      parameters: utils.packParameters(contract.interface, functionSignature, parameters),
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
