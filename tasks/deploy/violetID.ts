import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { VioletID, VioletID__factory } from "../../src/types";

// 💡 Make sure to delete /artifacts and /cache and then run `yarn compile` before running this task,
// and that you have specified the right Etherscan API key in .env.
task("deploy:VioletID")
  .addParam("eatverifier", "Contract address of VioletID contract")
  .setAction(async function (_taskArguments: TaskArguments, { ethers, upgrades, run }) {
    const signer = ethers.provider.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(`Deploying Violet ID with signer ${signerAddress}.`);

    const eatVerifier = _taskArguments.eatverifier;

    if (!eatVerifier) throw new Error("Missing EAT verifier address. Make sure it is passed as --eatverifier param");

    const VioletIDFactory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
    const violetID: VioletID = <VioletID>(
      await upgrades.deployProxy(VioletIDFactory, [eatVerifier], { initializer: "initialize" })
    );
    await violetID.deployTransaction.wait(5);
    console.log(`🚀 VioletID deployed at: ${violetID.address}`);

    console.log("Verifying contract...");

    await run("verify:verify", {
      address: violetID.address,
    });

    console.log("Task complete ✅");
  });

export default {};
