import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import { AccessTokenVerifier, DataRegistry, DataRegistry__factory } from "../../src/types";
import { eatVerifierFixture } from "../fixtures/eatVerifierFixtures";

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
