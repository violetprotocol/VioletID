import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import { AccessTokenVerifier, MockContract, MockContract__factory, VioletID, VioletID__factory } from "../../src/types";
import { eatVerifierFixture } from "../fixtures/eatVerifierFixtures";

export async function deployVioletIDFixture(): Promise<{
  violetID: VioletID;
  mockContract: MockContract;
  eatVerifier: AccessTokenVerifier;
}> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = signers[0];
  const admin: SignerWithAddress = signers[1];

  const eatVerifier = await eatVerifierFixture(owner);

  const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
  const violetID: VioletID = <VioletID>(
    await upgrades.deployProxy(VioletIDFactory, [eatVerifier.address], { initializer: "initialize" })
  );
  await violetID.deployed();

  await violetID.connect(owner).grantRole(await violetID.callStatic.ADMIN_ROLE(), admin.address);
  await violetID.connect(owner).revokeRole(await violetID.callStatic.ADMIN_ROLE(), owner.address);

  const MockContractFactory: MockContract__factory = <MockContract__factory>(
    await ethers.getContractFactory("MockContract")
  );
  const mockContract: MockContract = <MockContract>await MockContractFactory.deploy(violetID.address);
  await mockContract.deployed();

  return { violetID, mockContract, eatVerifier };
}
