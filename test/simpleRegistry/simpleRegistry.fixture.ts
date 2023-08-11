import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import { AccessTokenVerifier, SimpleRegistry, SimpleRegistry__factory } from "../../src/types";
import { eatVerifierFixture } from "../fixtures/eatVerifierFixtures";

export type SimpleRegistryFixture = {
  simpleRegistry: SimpleRegistry;
  randomAddresses: string[];
  eatVerifier: AccessTokenVerifier;
};

export async function deploySimpleRegistryFixture(eatSigner: SignerWithAddress): Promise<SimpleRegistryFixture> {
  const eatVerifier = await eatVerifierFixture(eatSigner);

  const SimpleRegistryFactory: SimpleRegistry__factory = <SimpleRegistry__factory>(
    await ethers.getContractFactory("SimpleRegistry")
  );
  const simpleRegistry = await SimpleRegistryFactory.deploy(eatVerifier.address);

  const randomAddresses = Array(50)
    .fill(0)
    .map(() => ethers.Wallet.createRandom().address);

  return { simpleRegistry, randomAddresses, eatVerifier };
}
