import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Wallet } from "ethers";
import { ethers } from "hardhat";

import { AccessTokenVerifier, DataRegistry, DataRegistry__factory } from "../../src/types";

export const eatVerifierFixture = async (eatSigner: Wallet | SignerWithAddress): Promise<AccessTokenVerifier> => {
  const verifierFactory = await ethers.getContractFactory("AccessTokenVerifier");
  const eatVerifier = <AccessTokenVerifier>await verifierFactory.connect(eatSigner).deploy(eatSigner.address);
  await eatVerifier.connect(eatSigner).rotateIntermediate(eatSigner.address);
  await eatVerifier.connect(eatSigner).activateIssuers([eatSigner.address]);
  return eatVerifier;
};

export type DataRegistryFixture = {
  dataRegistry: DataRegistry;
  tokenIds: number[];
  eatVerifier: AccessTokenVerifier;
};

export async function deployDataRegistryFixture(eatSigner: SignerWithAddress): Promise<DataRegistryFixture> {
  const eatVerifier = await eatVerifierFixture(eatSigner);

  const DataRegistryFactory: DataRegistry__factory = <DataRegistry__factory>(
    await ethers.getContractFactory("DataRegistry")
  );
  const dataRegistry = await DataRegistryFactory.deploy(eatVerifier.address);

  const tokenIds = [...Array(50).keys()];

  return { dataRegistry, tokenIds, eatVerifier };
}
