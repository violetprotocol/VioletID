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
    // EAT helpers uses a previous version of ether so it calls _signTypedData.
    // The following keeps backward compatibility
    // TODO: To update once EAT helpers support ethers v6
    this.signers.owner._signTypedData = this.signers.owner.signTypedData;
    this.signers.admin = signers[1];
    this.signers.user = signers[2];
    this.signers.user.address = await this.signers.user.getAddress();

    this.loadFixture = loadFixture;
  });

  describe("VioletID", function () {
    beforeEach(async function () {
      const { violetID, mockVIDReceiver, eatVerifier, mockVIDReceiverAddress } = await this.loadFixture(
        deployVioletIDFixture,
      );
      this.violetID = violetID;
      this.mockVIDReceiver = mockVIDReceiver;
      this.mockVIDReceiverAddress = mockVIDReceiverAddress;
      this.eatVerifier = eatVerifier;
    });

    shouldBehaveLikeVioletID();
  });
});
