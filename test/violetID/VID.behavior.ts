import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";

import { generateAccessToken } from "../utils/generateAccessToken";
import { getStatusCombinationId } from "../utils/getStatusCombinationId";
import { VioletIDError } from "./types";

enum Status {
  REGISTERED_WITH_VIOLET = 1,
  IS_INDIVIDUAL = 2,
  IS_BUSINESS = 3,
  IS_US = 5,
  IS_US_ACCREDITED_INVESTOR = 4,
}

const UNREGISTERED_STATUS = 5;

const REGISTERED_WITH_VIOLET_STATUS_NAME = Status[1];
const IS_INDIVIDUAL_STATUS_NAME = Status[2];
const IS_US_ACCREDITED_INVESTOR_STATUS_NAME = Status[4];

const INDIVIDUAL_US_ACCREDITED_COMBINATION_ID = getStatusCombinationId([
  Status.IS_INDIVIDUAL,
  Status.IS_US_ACCREDITED_INVESTOR,
]);

const OWNER_ROLE = utils.keccak256(toUtf8Bytes("OWNER_ROLE"));
const ADMIN_ROLE = utils.keccak256(toUtf8Bytes("ADMIN_ROLE"));

const FIRST_TOKEN_ID = 1;

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

  describe("registerStatus", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID.connect(this.signers.admin).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
      )
        .to.emit(this.violetID, "StatusRegistered")
        .withArgs(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME);

      expect(await this.violetID.callStatic.statusIdToName(Status.IS_INDIVIDUAL)).to.equal(IS_INDIVIDUAL_STATUS_NAME);
    });

    it("as non admin should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.owner).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
      );

      expect(await this.violetID.callStatic.statusIdToName(Status.IS_INDIVIDUAL)).to.equal("");
    });

    context("with registered status", async function () {
      beforeEach("register status", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should fail if already registered", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
        ).to.be.revertedWithCustomError(this.violetID, VioletIDError.StatusAlreadyRegistered);
      });
    });
  });

  describe("updateStatusName", async function () {
    it("as admin should fail without registered status", async function () {
      await expect(
        this.violetID.connect(this.signers.admin).updateStatusName(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
      ).to.be.revertedWithCustomError(this.violetID, VioletIDError.StatusNotYetRegistered);
    });

    context("with registered status", async function () {
      beforeEach("register status", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        const newStatusName = "new name";
        await expect(this.violetID.connect(this.signers.admin).updateStatusName(Status.IS_INDIVIDUAL, newStatusName))
          .to.emit(this.violetID, "StatusNameUpdated")
          .withArgs(Status.IS_INDIVIDUAL, newStatusName);

        expect(await this.violetID.callStatic.statusIdToName(Status.IS_INDIVIDUAL)).to.equal(newStatusName);
      });

      it("as non admin should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).updateStatusName(Status.IS_INDIVIDUAL, "anything"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
        );

        expect(await this.violetID.callStatic.statusIdToName(Status.IS_INDIVIDUAL)).to.equal(IS_INDIVIDUAL_STATUS_NAME);
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
    context("with registered status", async function () {
      beforeEach("register status", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).registerStatus(Status.IS_INDIVIDUAL, IS_INDIVIDUAL_STATUS_NAME),
        ).to.not.be.reverted;
      });

      context("EOA target", async function () {
        it("as admin should succeed", async function () {
          await expect(
            this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
          )
            .to.emit(this.violetID, "GrantedStatus")
            .withArgs(this.signers.user.address, Status.IS_INDIVIDUAL);

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
          )
            .to.emit(this.violetID, "GrantedStatus")
            .withArgs(this.mockContract.address, Status.IS_INDIVIDUAL);

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

    // context("without registered token", async function () {
    //   context("EOA target", async function () {
    //     it("as admin should fail", async function () {
    //       await expect(
    //         this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, Status.IS_INDIVIDUAL),
    //       ).to.be.revertedWith("token type not registered");

    //       expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_INDIVIDUAL)).to.be.false;
    //     });
    //   });

    //   context("Contract target", async function () {
    //     it("as admin should fail", async function () {
    //       await expect(
    //         this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, Status.IS_INDIVIDUAL),
    //       ).to.be.revertedWith("token type not registered");

    //       expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_INDIVIDUAL)).to.be.false;
    //     });
    //   });
    // });
  });

  describe.skip("grantStatuses", async function () {
    // TODO
  });

  describe("revokeStatus", async function () {
    const mockRevokeReason = "0xdeadacc2";
    context("with registered status", async function () {
      beforeEach("register status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerStatus(Status.IS_US_ACCREDITED_INVESTOR, IS_US_ACCREDITED_INVESTOR_STATUS_NAME),
        ).to.not.be.reverted;
      });

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
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;

          expect(
            await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
          ).to.be.false;
        });

        it("as admin should emit event", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          )
            .to.emit(this.violetID, "RevokedStatus")
            .withArgs(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason);
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        });

        it("revoking twice should have no adverse effect", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;

          expect(
            await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
          ).to.be.false;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;

          expect(
            await this.violetID.hasStatus(this.signers.user.address, Status.IS_US_ACCREDITED_INVESTOR),
          ).to.be.false;
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
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;

          expect(
            await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
          ).to.be.false;
        });

        it("as admin should emit event", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          )
            .to.emit(this.violetID, "RevokedStatus")
            .withArgs(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason);
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR)).to.be.true;
        });

        it("revoking twice should have no adverse effect", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;

          expect(
            await this.violetID.hasStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR),
          ).to.be.false;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Status.IS_US_ACCREDITED_INVESTOR, mockRevokeReason),
          ).to.not.be.reverted;
        });
      });
    });
  });

  describe("hasStatus", async function () {
    context("with registered status", async function () {
      beforeEach("register status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerStatus(Status.REGISTERED_WITH_VIOLET, REGISTERED_WITH_VIOLET_STATUS_NAME),
        ).to.not.be.reverted;
      });

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
  });

  describe.skip("hasStatuses", async function () {
    // TODO
  });
}
