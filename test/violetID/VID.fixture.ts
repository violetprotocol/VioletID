import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import {
  AccessTokenVerifier,
  MockVioletIDReceiver,
  MockVioletIDReceiver__factory,
  VioletID,
  VioletID__factory,
} from "../../src/types";
import { eatVerifierFixture } from "../fixtures/eatVerifierFixtures";

export async function deployVioletIDFixture(): Promise<{
  violetID: VioletID;
  mockVIDReceiver: MockVioletIDReceiver;
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

  const MockVIDReceiverFactory: MockVioletIDReceiver__factory = <MockVioletIDReceiver__factory>(
    await ethers.getContractFactory("MockVioletIDReceiver")
  );
  const mockVIDReceiver: MockVioletIDReceiver = <MockVioletIDReceiver>(
    await MockVIDReceiverFactory.deploy(violetID.address)
  );
  await mockVIDReceiver.deployed();

  return { violetID, mockVIDReceiver, eatVerifier };
}
