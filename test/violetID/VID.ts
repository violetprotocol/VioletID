import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeVioletID } from "./VID.behavior";
import { deployVioletIDFixture } from "./VID.fixture";

describe("VioletID Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.owner = signers[0];
    this.signers.admin = signers[1];
    this.signers.user = signers[2];

    this.loadFixture = loadFixture;
  });

  describe("VioletID", function () {
    beforeEach(async function () {
      const { violetID } = await this.loadFixture(deployVioletIDFixture);
      this.violetID = violetID;
    });

    shouldBehaveLikeVioletID();
  });
});
