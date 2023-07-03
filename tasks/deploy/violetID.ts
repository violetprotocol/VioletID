import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { VioletID, VioletID__factory } from "../../src/types";

// 💡 Make sure to delete /artifacts and /cache and then run `yarn compile` before running this task,
// and that you have specified the right Etherscan API key in .env.
task("deploy:VioletID").setAction(async function (_taskArguments: TaskArguments, { ethers, upgrades, run }) {
  console.log(`Deploying Violet ID...`);

  const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
  const violetID: VioletID = <VioletID>await upgrades.deployProxy(VioletIDFactory, [], { initializer: "initialize" });
  await violetID.deployed();
  console.log(`VioletID deployed at: ${violetID.address}`);

  console.log("Verifying contract...");

  await run("verify:verify", {
    address: violetID.address,
  });
});

export default {};
