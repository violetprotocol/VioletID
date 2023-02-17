import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { VioletID, VioletID__factory } from "../../src/types";

task("deploy:VioletID")
  .addParam("metadatauri", "URI where the token metadata exists")
  .addParam("owner", "The owner to set for the contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers: SignerWithAddress[] = await ethers.getSigners();
    const factory: VioletID__factory = <VioletID__factory>await ethers.getContractFactory("VioletID");
    const violetId: VioletID = <VioletID>await factory.connect(signers[0]).deploy(taskArguments.metadatauri);
    await violetId.deployed();
    console.log("VioletID deployed to: ", violetId.address);

    const tx = await violetId.transferOwnership(taskArguments.owner);
    await tx.wait();
  });

export default {};
