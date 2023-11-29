import { ethers, upgrades } from "hardhat";

import {
  AccessTokenVerifier,
  MockVioletIDReceiver,
  MockVioletIDReceiver__factory,
  VioletIDv1_4_0,
  VioletIDv1_4_0__factory,
} from "../../src/types";
import { eatVerifierFixture } from "../fixtures/eatVerifierFixtures";

export async function deployVioletIDFixture(): Promise<{
  violetID: VioletIDv1_4_0;
  mockVIDReceiver: MockVioletIDReceiver;
  mockVIDReceiverAddress: string;
  eatVerifier: AccessTokenVerifier;
}> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: getSigners() exists, see https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-ethers#helpers
  const signers = await ethers.getSigners();
  const owner = signers[0];
  const admin = signers[1];

  const eatVerifier = await eatVerifierFixture(owner);
  const eatVerifierAddress = await eatVerifier.getAddress();

  const VioletIDFactory: VioletIDv1_4_0__factory = <VioletIDv1_4_0__factory>(
    await ethers.getContractFactory("VioletIDv1_4_0")
  );
  const deployedVioletId = await upgrades.deployProxy(VioletIDFactory, [eatVerifierAddress], {
    initializer: "initialize",
    useDefenderDeploy: false,
  });

  await deployedVioletId.waitForDeployment();

  const violetID = deployedVioletId as unknown as VioletIDv1_4_0;

  await violetID.connect(owner).grantRole(await violetID.ADMIN_ROLE.staticCall(), admin.address);
  await violetID.connect(owner).revokeRole(await violetID.ADMIN_ROLE.staticCall(), owner.address);

  const MockVIDReceiverFactory: MockVioletIDReceiver__factory = <MockVioletIDReceiver__factory>(
    await ethers.getContractFactory("MockVioletIDReceiver")
  );
  const mockVIDReceiver: MockVioletIDReceiver = <MockVioletIDReceiver>(
    await MockVIDReceiverFactory.deploy(await violetID.getAddress())
  );
  await mockVIDReceiver.waitForDeployment();
  const mockVIDReceiverAddress = await mockVIDReceiver.getAddress();

  return { violetID, mockVIDReceiver, mockVIDReceiverAddress, eatVerifier };
}
