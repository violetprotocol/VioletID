import { validateUpgradeSafety } from "@openzeppelin/upgrades-core";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("validateUpgradeSafety")
  .addParam("referenceName", "Address of the original VioletID")
  .setAction(async function (_taskArguments: TaskArguments) {
    try {
      const response = await validateUpgradeSafety(
        "artifacts/build-info",
        "VioletIDv1_4_0",
        _taskArguments.referenceName,
      );
      console.log(JSON.stringify(response));
    } catch (error) {
      console.log(error);
    }
    console.log("Task complete ✅");
  });

export default {};
