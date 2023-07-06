import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { VioletID } from "../src/types";

task("grantRole")
  .addParam("violetid", "Contract address of VioletID contract")
  .addParam("role", "Name of role to assign")
  .addParam("address", "Account address to which role will be granted")
  .setAction(async function (_taskArguments: TaskArguments, { ethers }) {
    const violetID = <VioletID>await ethers.getContractAt("VioletID", _taskArguments.violetid);

    let role;
    switch (_taskArguments.role) {
      case "default":
        role = await violetID.callStatic.DEFAULT_ADMIN_ROLE();
        break;
      case "admin":
        role = await violetID.callStatic.ADMIN_ROLE();
        break;
      case "owner":
        role = await violetID.callStatic.OWNER_ROLE();
        break;
      default:
        console.log(`Role ${_taskArguments.role} unrecognised`);
        return;
    }

    const tx = await violetID.grantRole(role, _taskArguments.address);
    const receipt = await tx.wait();

    console.log(`Transaction mined in: ${receipt.transactionHash}`);
  });

export default {};
