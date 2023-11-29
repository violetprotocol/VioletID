import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("validateUpgrade")
  .addParam("referenceAddress", "Address of the original VioletID")
  .setAction(async function (_taskArguments: TaskArguments, { ethers, upgrades }) {
    const newVIDContract = await ethers.getContractFactory("VioletIDv1_4_0");
    try {
      const response = await upgrades.validateUpgrade(_taskArguments.referenceAddress, newVIDContract, {
        kind: "uups",
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
    console.log("Task complete ✅");
  });

export default {};
