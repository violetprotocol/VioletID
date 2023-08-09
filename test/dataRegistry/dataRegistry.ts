import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeDataRegistry } from "./dataRegistry.behavior";
import { deployDataRegistryFixture } from "./dataRegistry.fixture";

describe("dataRegistry Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.randomAddresses = [];
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.owner = signers[0];
    this.signers.user = signers[1];

    this.eatVerifier;

    this.loadFixture = loadFixture;
  });

  describe("Data Registry", function () {
    beforeEach(async function () {
      const { dataRegistry, tokenIds, eatVerifier } = await deployDataRegistryFixture(this.signers.owner);

      this.dataRegistry = dataRegistry;
      this.tokenIds = tokenIds;
      this.eatVerifier = eatVerifier;
    });

    shouldBehaveLikeDataRegistry();
  });
});
