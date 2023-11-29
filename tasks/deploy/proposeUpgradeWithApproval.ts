import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("proposeUpgradeWithApproval").setAction(async function (_taskArguments: TaskArguments, { defender }) {
  // const newVIDContract = await ethers.getContractFactory("VioletIDv1_4_0");
  try {
    const response = await defender.proposeUpgradeWithApproval(
      // Sepolia previous VID contract
      "0xE62C5A18Fb0e5f9b01bE9fAc679040e142e0e1FC",
      "VioletIDv1_4_0",
      {
        approvalProcessId: "95f8f653-1112-419a-ba23-bbc22dd5120a",
      },
    );
    console.log(response);
  } catch (error) {
    console.log(error);
  }
  console.log("Task complete ✅");
});

export default {};
