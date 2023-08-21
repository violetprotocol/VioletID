import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";
import { ethers } from "hardhat";

import { AccessTokenVerifier } from "../../src/types";

export const eatVerifierFixture = async (eatSigner: Wallet | SignerWithAddress): Promise<AccessTokenVerifier> => {
  const verifierFactory = await ethers.getContractFactory("AccessTokenVerifier");
  const eatVerifier = <AccessTokenVerifier>await verifierFactory.connect(eatSigner).deploy(eatSigner.address);
  await eatVerifier.connect(eatSigner).rotateIntermediate(eatSigner.address);
  await eatVerifier.connect(eatSigner).activateIssuers([eatSigner.address]);
  return eatVerifier;
};
