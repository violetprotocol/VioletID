import { task } from "hardhat/config";
import { VioletID, VioletID__factory } from "../../src/types";
import type { TaskArguments } from "hardhat/types";


// 💡 Make sure to delete /artifacts and /cache and then run `yarn compile` before running this task,
// and that you have specified the right Etherscan API key in .env.
task("upgrade:VioletID")
  .setAction(async function (_taskArguments: TaskArguments, { ethers, upgrades }) {
    const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
    const result = upgrades.prepareUpgrade(
      // OPGoerli previous VID contract
      "0xE7d118354e726F1cd1E004a2DB90B771AdbA3588",
      VioletIDFactory
    )

    upgrades.prepareUpgrade


    console.log("Task complete ✅");
  });

export default {};
