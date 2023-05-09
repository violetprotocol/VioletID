import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { VioletID, VioletID__factory } from "../../src/types";

task("deploy:VioletID").setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
  const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
  const violetID: VioletID = <VioletID>await upgrades.deployProxy(VioletIDFactory, [], { initializer: "initialize" });
  await violetID.deployed();
  console.log(`VioletID deployed at: ${violetID.address}`);
});

export default {};
