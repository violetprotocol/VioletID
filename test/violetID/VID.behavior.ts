import { expect } from "chai";
import { ZeroAddress, id } from "ethers";
import { ethers } from "hardhat";

import { VioletIDv1_4_0, VioletIDv1_4_0__factory } from "../../src/types";
import { generateAccessToken } from "../utils/generateAccessToken";
import { getStatusCombinationId } from "../utils/getStatusCombinationId";

enum Status {
  REGISTERED_WITH_VIOLET = 1,
  IS_INDIVIDUAL = 2,
  IS_BUSINESS = 3,
  IS_US_ACCREDITED_INVESTOR = 4,
  IS_US = 5,
}

const INDIVIDUAL_US_ACCREDITED_COMBINATION_ID = getStatusCombinationId([
  Status.IS_INDIVIDUAL,
  Status.IS_US_ACCREDITED_INVESTOR,
]);

const BUSINESS_REGISTERED_WITH_VIOLET_COMBINATION_ID = getStatusCombinationId([
  Status.IS_BUSINESS,
  Status.REGISTERED_WITH_VIOLET,
]);

const NEW_VERIFIER = "0x33FaabBe19057C30d1405Fd8d16039255ff7EEf4";

const OWNER_ROLE = id("OWNER_ROLE");
const ADMIN_ROLE = id("ADMIN_ROLE");

export function shouldBehaveLikeVioletID(): void {
  describe("EIP-165", async function () {
    const eip165InterfaceId = "0x01ffc9a7";
    const violetIDInterfaceId = "0x452ddea2";

    it("should support interface eip-165", async function () {
      expect(await this.violetID.supportsInterface(eip165InterfaceId)).to.be.true;
    });

    it("should support violetID interface", async function () {
      expect(await this.violetID.supportsInterface(violetIDInterfaceId)).to.be.true;
    });

    it("should not support invalid interface", async function () {
      const invalidInterface = "0xffffffff";

      expect(await this.violetID.supportsInterface(invalidInterface)).to.be.false;
    });
  });

  describe("upgrades", async function () {
    describe("_authorizeUpgrade", async function () {
      it("should successfully upgrade from owner", async function () {
        const VioletIDFactory: VioletIDv1_4_0__factory = <VioletIDv1_4_0__factory>(
          await ethers.getContractFactory("VioletIDv1_4_0")
        );
        const violetID: VioletIDv1_4_0 = await VioletIDFactory.deploy();
        await violetID.waitForDeployment();

        await expect(this.violetID.connect(this.signers.owner).upgradeTo(await violetID.getAddress())).to.not.be
          .reverted;
      });

      it("should fail to upgrade from non owner", async function () {
        const adminAddress = String(await this.signers.admin.getAddress()).toLowerCase();

        await expect(this.violetID.connect(this.signers.admin).upgradeTo(ZeroAddress)).to.be.revertedWith(
          `AccessControl: account ${adminAddress} is missing role ${await this.violetID.OWNER_ROLE()}`,
        );
      });
    });
  });

  describe("pauseable", async function () {
    describe("pause", async function () {
      it("should successfully pause from owner", async function () {
        await expect(this.violetID.connect(this.signers.owner).pause()).to.not.be.reverted;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.revertedWith("Pausable: paused");

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatuses(
              this.signers.user.address,
              getStatusCombinationId([Status.REGISTERED_WITH_VIOLET, Status.IS_INDIVIDUAL]),
            ),
        ).to.be.revertedWith("Pausable: paused");

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.revertedWith("Pausable: paused");

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(
              this.signers.user.address,
              getStatusCombinationId([Status.REGISTERED_WITH_VIOLET, Status.IS_INDIVIDUAL]),
            ),
        ).to.be.revertedWith("Pausable: paused");
      });

      it("should fail to pause from non-owner", async function () {
        await expect(this.violetID.connect(this.signers.admin).pause()).to.be.revertedWith(
          `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${await this.violetID.OWNER_ROLE()}`,
        );

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.not.be.reverted;
      });

      context("when paused", async function () {
        beforeEach("pause", async function () {
          await this.violetID.connect(this.signers.owner).pause();
        });

        it("should fail to pause when already paused", async function () {
          await expect(this.violetID.connect(this.signers.owner).pause()).to.be.revertedWith("Pausable: paused");
        });
      });
    });

    describe("unpause", async function () {
      context("when paused", async function () {
        beforeEach("pause", async function () {
          await this.violetID.connect(this.signers.owner).pause();
        });

        it("should successfully unpause from owner", async function () {
          await expect(this.violetID.connect(this.signers.owner).unpause()).to.not.be.reverted;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
          ).to.not.be.reverted;
        });

        it("should fail to unpause from non-owner", async function () {
          await expect(this.violetID.connect(this.signers.admin).unpause()).to.be.revertedWith(
            `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${await this.violetID.OWNER_ROLE()}`,
          );

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
          ).to.be.revertedWith("Pausable: paused");
        });
      });

      it("should fail to unpause when not paused", async function () {
        await expect(this.violetID.connect(this.signers.owner).unpause()).to.be.revertedWith("Pausable: not paused");
      });
    });
  });

  describe("grantRole", async function () {
    context("as owner", async function () {
      it("ADMIN_ROLE should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).grantRole(ADMIN_ROLE, this.signers.user.address),
        ).to.not.be.reverted;
      });

      it("OWNER_ROLE should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).grantRole(OWNER_ROLE, this.signers.user.address),
        ).to.not.be.reverted;
      });
    });

    context("as admin", async function () {
      it("ADMIN_ROLE should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantRole(ADMIN_ROLE, this.signers.user.address),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${OWNER_ROLE}`,
        );
      });

      it("OWNER_ROLE should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantRole(OWNER_ROLE, this.signers.user.address),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${OWNER_ROLE}`,
        );
      });
    });
  });

  describe("setVerifier", async function () {
    it("should successfully set new verifier", async function () {
      await expect(this.violetID.connect(this.signers.owner).updateVerifier(NEW_VERIFIER)).to.not.be.reverted;

      expect(await this.violetID.verifier()).to.equals(NEW_VERIFIER);
    });
    it("should not allow verifier to be changed by non-owner", async function () {
      const originalVerifier = await this.violetID.verifier();
      await expect(this.violetID.connect(this.signers.user).updateVerifier(NEW_VERIFIER)).to.be.reverted;
      expect(await this.violetID.verifier()).to.equals(originalVerifier);
    });
  });

  // TODO: To complete
  describe("claimStatuses", async function () {
    context("EOA target", async function () {
      it("with proper EAT should succeed", async function () {
        const claimStatusesFunctionSignature = "claimStatuses";

        const { eat, expiry } = await generateAccessToken(
          this.signers.owner,
          this.eatVerifier,
          claimStatusesFunctionSignature,
          this.signers.user,
          this.violetID,
          [this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID],
        );
        const { v, r, s } = eat;

        await this.violetID
          .connect(this.signers.user)
          .claimStatuses(v, r, s, expiry, this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID);

        expect(
          await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
        ).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });
    });
  });

  describe("grantStatus", async function () {
    context("EOA target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("granting twice should have no adverse effect", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;

        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    context("Contract target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("granting twice should have no adverse effect", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL)).to.be.true;

        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).grantStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).grantStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });
  });

  // TODO: To complete
  describe("grantStatuses", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .grantStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
      ).to.not.be.reverted;

      expect(await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID)).to.be
        .true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
    });
  });

  describe("setStatuses", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .setStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
      ).to.not.be.reverted;

      expect(await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID)).to.be
        .true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
    });

    it("as non admin should not succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.user)
          .setStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });

    it("should overwrite non set statuses", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .setStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
      ).to.not.be.reverted;
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .setStatuses(this.signers.user.address, BUSINESS_REGISTERED_WITH_VIOLET_COMBINATION_ID),
      ).to.not.be.reverted;

      expect(await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID)).to.be
        .false;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.false;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
      expect(await this.violetID.hasStatuses(this.signers.user.address, BUSINESS_REGISTERED_WITH_VIOLET_COMBINATION_ID))
        .to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_BUSINESS)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
    });
  });

  describe("batchSetStatuses", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .batchSetStatuses([this.signers.user.address], [INDIVIDUAL_US_ACCREDITED_COMBINATION_ID]),
      ).to.not.be.reverted;

      expect(await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID)).to.be
        .true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
    });

    it("as non admin should not succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.user)
          .batchSetStatuses([this.signers.user.address], [INDIVIDUAL_US_ACCREDITED_COMBINATION_ID]),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });

    it("should revert if arrays are mismatched", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .batchSetStatuses(
            [this.signers.user.address, this.signers.owner.address],
            [INDIVIDUAL_US_ACCREDITED_COMBINATION_ID],
          ),
      ).to.be.revertedWithCustomError(this.violetID, "BatchSetStatusArrayMismatch");
    });

    it("should overwrite statuses for more than one user", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .batchSetStatuses(
            [this.signers.user.address, this.signers.owner.address],
            [INDIVIDUAL_US_ACCREDITED_COMBINATION_ID, BUSINESS_REGISTERED_WITH_VIOLET_COMBINATION_ID],
          ),
      ).to.not.be.reverted;

      expect(await this.violetID.hasStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID)).to.be
        .true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;

      expect(
        await this.violetID.hasStatuses(this.signers.owner.address, BUSINESS_REGISTERED_WITH_VIOLET_COMBINATION_ID),
      ).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.owner.address, Status.IS_BUSINESS)).to.be.true;
      expect(await this.violetID.hasStatus(this.signers.owner.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
    });
  });

  describe("revokeStatus", async function () {
    context("EOA target", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("revoking twice should have no adverse effect", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
      });
    });

    context("Contract target", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("revoking twice should have no adverse effect", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;
      });
    });
  });

  describe("revokeStatuses", async function () {
    context("EOA target", async function () {
      // Initially grant these statuses
      const statuses = [
        Status.REGISTERED_WITH_VIOLET,
        Status.IS_INDIVIDUAL,
        Status.IS_US_ACCREDITED_INVESTOR,
        Status.IS_US,
      ];
      const initialCombinationIdOfStatuses = getStatusCombinationId(statuses);
      beforeEach("grantStatuses", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatuses(this.signers.user.address, initialCombinationIdOfStatuses),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatuses(this.signers.user.address, initialCombinationIdOfStatuses)).to.be.true;
      });

      // Subset of statuses to revoke
      const statusesToRevoke = [Status.IS_US_ACCREDITED_INVESTOR, Status.IS_US];
      const combinationIdOfStatusesToRevoke = getStatusCombinationId(statusesToRevoke);

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;
        // Revoked statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatuses(this.signers.user.address, initialCombinationIdOfStatuses)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatuses(this.signers.user.address, initialCombinationIdOfStatuses)).to.be.true;
      });

      it("revoking a status the address does not have should have no adverse effect", async function () {
        // We revoke 2 statuses, one that the address has and one that the address does not.
        const combinationId = getStatusCombinationId([Status.IS_US, Status.IS_BUSINESS]);

        await expect(
          this.violetID.connect(this.signers.admin).revokeStatuses(this.signers.user.address, combinationId),
        ).to.not.be.reverted;

        // Revoked statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_BUSINESS)).to.be.false;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("revoking twice should have no adverse effect", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke)).to.be.false;
        // Revoked statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatuses(this.signers.user.address, combinationIdOfStatusesToRevoke)).to.be.false;
        // Revoked statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.true;
      });
    });

    context("Contract target", async function () {
      // Initially grant these statuses
      const statuses = [
        Status.REGISTERED_WITH_VIOLET,
        Status.IS_BUSINESS,
        Status.IS_US_ACCREDITED_INVESTOR,
        Status.IS_US,
      ];
      const initialCombinationIdOfStatuses = getStatusCombinationId(statuses);
      beforeEach("grantStatuses", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatuses(this.mockVIDReceiverAddress, initialCombinationIdOfStatuses),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatuses(this.mockVIDReceiverAddress, initialCombinationIdOfStatuses)).to.be.true;
      });

      // Subset of statuses to revoke
      const statusesToRevoke = [Status.IS_US_ACCREDITED_INVESTOR, Status.IS_US];
      const combinationIdOfStatusesToRevoke = getStatusCombinationId(statusesToRevoke);

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;
        // Revoked statuses
        expect(
          await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_BUSINESS)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatuses(this.mockVIDReceiverAddress, initialCombinationIdOfStatuses)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatuses(this.mockVIDReceiverAddress, initialCombinationIdOfStatuses)).to.be.true;
      });

      it("revoking a status the address does not have should have no adverse effect", async function () {
        // We revoke 2 statuses, one that the address has and one that the address does not.
        const combinationId = getStatusCombinationId([Status.IS_US, Status.IS_INDIVIDUAL]);

        await expect(
          this.violetID.connect(this.signers.admin).revokeStatuses(this.mockVIDReceiverAddress, combinationId),
        ).to.not.be.reverted;

        // Revoked statuses
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_INDIVIDUAL)).to.be.false;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_BUSINESS)).to.be.true;
      });

      it("revoking twice should have no adverse effect", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.be.false;
        // Revoked statuses
        expect(
          await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_BUSINESS)).to.be.true;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatuses(this.mockVIDReceiverAddress, combinationIdOfStatusesToRevoke),
        ).to.be.false;
        // Revoked statuses
        expect(
          await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_US)).to.be.false;
        // Untouched statuses
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET)).to.be.true;
        expect(await this.violetID.hasStatus(this.mockVIDReceiverAddress, Status.IS_BUSINESS)).to.be.true;
      });
    });
  });

  describe("hasStatus", async function () {
    context("EOA holder", async function () {
      it("user should have status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.true;
      });

      it("user should not have a status not granted", async function () {
        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.false;
      });
    });

    context("Contract holder", async function () {
      it("contract should have status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockVIDReceiverAddress, Status.REGISTERED_WITH_VIOLET),
        ).to.be.true;
      });

      it("contract should not have status not granted", async function () {
        expect(
          await this.violetID.connect(this.signers.user).hasStatus(this.mockVIDReceiverAddress, Status.IS_BUSINESS),
        ).to.be.false;
      });
    });
  });

  describe.skip("hasStatuses", async function () {
    // TODO
  });
}
