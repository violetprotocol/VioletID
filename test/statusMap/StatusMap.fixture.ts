import { ethers } from "hardhat";

import { MockStatusMap, MockStatusMap__factory, StatusMap, StatusMap__factory } from "../../src/types";

export async function deployStatusMapFixture(): Promise<{
  statusMap: StatusMap;
}> {
  const StatusMapFactory: MockStatusMap__factory = <MockStatusMap__factory>(
    await ethers.getContractFactory("MockStatusMap")
  );
  const statusMap: MockStatusMap = <MockStatusMap>await StatusMapFactory.deploy();
  await statusMap.deployed();

  return { statusMap };
}
