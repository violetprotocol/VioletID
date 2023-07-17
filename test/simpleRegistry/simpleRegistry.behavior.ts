import { expect } from "chai";

import { generateAccessTokenGrantSingle } from "../utils/generateAccessToken";

const MAUVE_VERIFIED_ENTITY_STATUS_TOKENID = 1;

// const OWNER_ROLE = utils.keccak256(toUtf8Bytes("OWNER_ROLE"));
// const ADMIN_ROLE = utils.keccak256(toUtf8Bytes("ADMIN_ROLE"));

export function shouldBehaveLikeSimpleRegistry(): void {
  describe("grantStatusSingle", async function () {
    context("With RBAC", async function () {
      it("as owner should succeed", async function () {
        await this.simpleRegistry
          .connect(this.signers.owner)
          ["grantStatusSingle(uint256,address)"](MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address),
          expect(await this.simpleRegistry.hasStatus(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address))
            .to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.simpleRegistry
            .connect(this.signers.user)
            ["grantStatusSingle(uint256,address)"](MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address),
        ).to.be.revertedWithCustomError(this.simpleRegistry, "Unauthorized");
      });
    });

    context("With EAT", async function () {
      it("should grant status", async function () {
        const userAddress = this.signers.user.address;
        const { eat, expiry } = await generateAccessTokenGrantSingle(
          this.signers.owner,
          this.eatVerifier,
          this.signers.user,
          this.simpleRegistry,
          [MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, userAddress],
        );

        await this.simpleRegistry
          .connect(this.signers.user)
          ["grantStatusSingle(uint8,bytes32,bytes32,uint256,uint256,address)"](
            eat.v,
            eat.r,
            eat.s,
            expiry,
            MAUVE_VERIFIED_ENTITY_STATUS_TOKENID,
            userAddress,
          );

        expect(await this.simpleRegistry.hasStatus(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, userAddress)).to.be.true;
      });
    });
  });

  describe("grantStatusBatch", async function () {
    context("With RBAC", async function () {
      it("as owner should succeed", async function () {
        await this.simpleRegistry
          .connect(this.signers.owner)
          .grantStatusBatch(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.randomAddresses);

        expect(
          await this.simpleRegistry.hasStatus(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.randomAddresses[4]),
        ).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.simpleRegistry
            .connect(this.signers.user)
            .grantStatusBatch(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.randomAddresses),
        ).to.be.revertedWithCustomError(this.simpleRegistry, "Unauthorized");
      });
    });

    // context("With EAT", async function () {
    //   it("as owner should succeed", async function () {
    //     await this.simpleRegistry
    //       .connect(this.signers.owner)
    //       .grantStatusSingle(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address),
    //       expect(await this.simpleRegistry.hasStatus(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address))
    //         .to.be.true;
    //   });

    //   it("as user should fail", async function () {
    //     await expect(
    //       this.simpleRegistry
    //         .connect(this.signers.user)
    //         .grantStatusSingle(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, this.signers.user.address),
    //     ).to.be.revertedWithCustomError(this.simpleRegistry, "Unauthorized");
    //   });
    // });
  });

  // describe("hasStatus", async function () {
  //   context("with registered token", async function () {
  //     beforeEach("register token", async function () {
  //       await expect(
  //         this.violetID
  //           .connect(this.signers.admin)
  //           .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
  //       ).to.not.be.reverted;
  //     });

  //     context("EOA holder", async function () {
  //       it("user should have status", async function () {
  //         await expect(
  //           this.violetID
  //             .connect(this.signers.admin)
  //             .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
  //         ).to.not.be.reverted;

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
  //         ).to.be.true;
  //       });

  //       it("user should not have status", async function () {
  //         await expect(
  //           this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
  //         ).to.be.revertedWith("token type not registered");

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
  //         ).to.be.false;

  //         expect(await this.violetID.connect(this.signers.user).hasStatus(this.signers.user.address, 42)).to.be.false;
  //       });
  //     });

  //     context("Contract holder", async function () {
  //       it("contract should have status", async function () {
  //         await expect(
  //           this.violetID
  //             .connect(this.signers.admin)
  //             .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
  //         ).to.not.be.reverted;

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
  //         ).to.be.true;
  //       });

  //       it("contract should not have status", async function () {
  //         await expect(
  //           this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
  //         ).to.be.revertedWith("token type not registered");

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
  //         ).to.be.false;

  //         expect(await this.violetID.connect(this.signers.user).hasStatus(this.mockContract.address, 42)).to.be.false;
  //       });
  //     });
  //   });
  // });
}
