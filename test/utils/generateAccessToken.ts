import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { messages, utils } from "@violetprotocol/ethereum-access-token-helpers";
import { BigNumberish, Contract, Signature, Wallet, getAddress } from "ethers";

import { VioletIDv1_4_0 } from "../../src/types";

export const generateAccessToken = async (
  signer: SignerWithAddress,
  verifyingContract: Contract,
  functionSignature: Parameters<VioletIDv1_4_0["interface"]["getFunction"]>[0],
  caller: Wallet | SignerWithAddress,
  contract: VioletIDv1_4_0,
  parameters: string | BigNumberish[],
  expiry?: BigNumberish,
) => {
  const token = {
    functionCall: {
      functionSignature: contract.interface.getFunction(functionSignature).selector,
      target: await contract.getAddress(),
      caller: getAddress(caller.address),
      parameters: utils.packParameters(contract.interface, functionSignature, parameters as any[]),
    },
    expiry: expiry || BigInt(4833857428),
  };

  const domain: messages.Domain = {
    verifyingContract: await verifyingContract.getAddress(),
    name: "Ethereum Access Token",
    version: "1",
    chainId: Number((await signer.provider.getNetwork()).chainId),
  };
  const eat = Signature.from(await utils.signAccessToken(signer, domain, token));

  return { eat, expiry: token.expiry };
};
