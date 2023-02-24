import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, upgrades } from "hardhat";

import type { VioletID, VioletID__factory } from "../../types";

export async function deployVioletIDFixture(): Promise<{ violetID: VioletID }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const owner: SignerWithAddress = signers[0];
  const admin: SignerWithAddress = signers[1];

  const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
  const violetID: VioletID = <VioletID>await upgrades.deployProxy(VioletIDFactory, [], {});
  await violetID.deployed();

  await violetID.connect(owner).grantRole(await violetID.callStatic.ADMIN_ROLE(), admin.address);
  await violetID.connect(owner).revokeRole(await violetID.callStatic.ADMIN_ROLE(), owner.address);

  return { violetID };
}
