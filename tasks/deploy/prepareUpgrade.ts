import { ContractFactory } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// 💡 Make sure to delete /artifacts and /cache and then run `yarn compile` before running this task,
// and that you have specified the right Etherscan API key in .env.
task("prepareUpgrade").setAction(async function (_taskArguments: TaskArguments, { ethers, upgrades, run, network }) {
  const violetIDFactory = await ethers.getContractFactory("VioletIDv1_4_0");

  let violetIDProxyAddress: string;
  if (network.name == "sepolia") {
    violetIDProxyAddress = "0xE62C5A18Fb0e5f9b01bE9fAc679040e142e0e1FC";
  } else {
    throw new Error(`No violetID address known for network: ${network.name}`);
  }

  const address = await upgrades.prepareUpgrade(violetIDProxyAddress, violetIDFactory as unknown as ContractFactory, {
    kind: "uups",
    useDefenderDeploy: false,
  });

  console.log(`New implementation deployed at: ${address}`);
  console.log(`Verifying contract...`);

  await run("verify:verify", {
    address,
  });

  console.log("Task complete ✅");
});

export default {};
