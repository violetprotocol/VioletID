import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";

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

const OWNER_ROLE = utils.keccak256(toUtf8Bytes("OWNER_ROLE"));
const ADMIN_ROLE = utils.keccak256(toUtf8Bytes("ADMIN_ROLE"));

export function shouldBehaveLikeVioletID(): void {
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

  // TODO: To complete
  describe("claimStatuses", async function () {
    context("EOA target", async function () {
      it("with proper EAT should succeed", async function () {
        const claimStatusesFunctionSignature = "claimStatuses(uint8,bytes32,bytes32,uint256,address,uint256)";

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
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("granting twice should have no adverse effect", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_INDIVIDUAL)).to.be.true;

        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_INDIVIDUAL)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
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
            .grantStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("revoking twice should have no adverse effect", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.false;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
        ).to.not.be.reverted;
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
            .grantStatus(this.mockContract.address, Status.REGISTERED_WITH_VIOLET),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockContract.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.true;
      });

      it("contract should not have status not granted", async function () {
        expect(
          await this.violetID.connect(this.signers.user).hasStatus(this.mockContract.address, Status.IS_BUSINESS),
        ).to.be.false;
      });
    });
  });

  describe.skip("hasStatuses", async function () {
    // TODO
  });

  describe("Conversion functions", async () => {
    const statuses = [1, 3, 6, 4];

    describe("getStatusesFromCombinationId", async function () {
      it("should return the correct status combination id from list of statuses", async function () {
        const combinationId = getStatusCombinationId(statuses);
        expect(await this.violetID.callStatic.getStatusesFromCombinationId(combinationId)).to.deep.equal(
          statuses.sort(),
        );
      });
    });

    describe("getStatusCombinationId", async function () {
      it("should return the correct statuses from a combination id", async function () {
        const combinationId = getStatusCombinationId(statuses);
        expect(await this.violetID.callStatic.getStatusCombinationId(statuses)).to.equal(combinationId);
      });
    });
  });
}
