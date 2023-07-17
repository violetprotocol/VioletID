import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeSimpleRegistry } from "./simpleRegistry.behavior";
import { deploySimpleRegistryFixture } from "./simpleRegistry.fixture";

describe("SimpleRegistry Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;
    this.randomAddresses = [];
    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.owner = signers[0];
    this.signers.user = signers[1];

    this.eatVerifier;

    this.loadFixture = loadFixture;
  });

  describe("Simple Registry", function () {
    beforeEach(async function () {
      const { simpleRegistry, randomAddresses, eatVerifier } = await deploySimpleRegistryFixture(this.signers.owner);

      this.simpleRegistry = simpleRegistry;
      this.randomAddresses = randomAddresses;
      this.eatVerifier = eatVerifier;
    });

    shouldBehaveLikeSimpleRegistry();
  });
});
