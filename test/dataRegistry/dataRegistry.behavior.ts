import { expect } from "chai";

import { generateAccessTokenGrantSingle } from "../utils/generateAccessToken";

const US_ACCREDITED_INVESTOR_STATUS_ID = 1;
const NON_US_PERSON_STATUS_ID = 1;

const MOCK_TOKEN_ID = 1;

// const OWNER_ROLE = utils.keccak256(toUtf8Bytes("OWNER_ROLE"));
// const ADMIN_ROLE = utils.keccak256(toUtf8Bytes("ADMIN_ROLE"));

export function shouldBehaveLikeDataRegistry(): void {
  describe("grantStatusSingle", async function () {
    context("With RBAC", async function () {
      it("as owner should succeed", async function () {
        await this.dataRegistry
          .connect(this.signers.owner)
          ["grantStatusSingle(uint256,uint256)"](US_ACCREDITED_INVESTOR_STATUS_ID, MOCK_TOKEN_ID);

        expect(await this.dataRegistry.hasStatus(US_ACCREDITED_INVESTOR_STATUS_ID, MOCK_TOKEN_ID)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.dataRegistry
            .connect(this.signers.user)
            ["grantStatusSingle(uint256,uint256)"](US_ACCREDITED_INVESTOR_STATUS_ID, MOCK_TOKEN_ID),
        ).to.be.revertedWithCustomError(this.dataRegistry, "Unauthorized");
      });
    });

    context("With EAT", async function () {
      it("should grant status", async function () {
        const grantStatusSingleFunctionSignature = "grantStatusSingle(uint8,bytes32,bytes32,uint256,uint256,uint256)";
        const { eat, expiry } = await generateAccessTokenGrantSingle(
          this.signers.owner,
          this.eatVerifier,
          grantStatusSingleFunctionSignature,
          this.signers.user,
          this.dataRegistry,
          [US_ACCREDITED_INVESTOR_STATUS_ID, MOCK_TOKEN_ID],
        );

        await this.dataRegistry
          .connect(this.signers.user)
          [grantStatusSingleFunctionSignature](
            eat.v,
            eat.r,
            eat.s,
            expiry,
            US_ACCREDITED_INVESTOR_STATUS_ID,
            MOCK_TOKEN_ID,
          );

        expect(await this.dataRegistry.hasStatus(US_ACCREDITED_INVESTOR_STATUS_ID, MOCK_TOKEN_ID)).to.be.true;
      });
    });
  });

  describe("grantStatusBatch", async function () {
    context("With RBAC", async function () {
      it("as owner should succeed", async function () {
        await this.dataRegistry
          .connect(this.signers.owner)
          .grantStatusBatch(US_ACCREDITED_INVESTOR_STATUS_ID, this.tokenIds);

        expect(await this.dataRegistry.hasStatus(US_ACCREDITED_INVESTOR_STATUS_ID, this.tokenIds[4])).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.dataRegistry
            .connect(this.signers.user)
            .grantStatusBatch(US_ACCREDITED_INVESTOR_STATUS_ID, this.tokenIds),
        ).to.be.revertedWithCustomError(this.dataRegistry, "Unauthorized");
      });
    });

    // context("With EAT", async function () {
    //   it("as owner should succeed", async function () {
    //     await this.dataRegistry
    //       .connect(this.signers.owner)
    //       .grantStatusSingle(US_ACCREDITED_INVESTOR_STATUS_ID, this.signers.user.address),
    //       expect(await this.dataRegistry.hasStatus(US_ACCREDITED_INVESTOR_STATUS_ID, this.signers.user.address))
    //         .to.be.true;
    //   });

    //   it("as user should fail", async function () {
    //     await expect(
    //       this.dataRegistry
    //         .connect(this.signers.user)
    //         .grantStatusSingle(US_ACCREDITED_INVESTOR_STATUS_ID, this.signers.user.address),
    //     ).to.be.revertedWithCustomError(this.dataRegistry, "Unauthorized");
    //   });
    // });
  });

  // describe("hasStatus", async function () {
  //   context("with registered token", async function () {
  //     beforeEach("register token", async function () {
  //       await expect(
  //         this.violetID
  //           .connect(this.signers.admin)
  //           .registerTokenType(US_ACCREDITED_INVESTOR_STATUS_ID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
  //       ).to.not.be.reverted;
  //     });

  //     context("EOA holder", async function () {
  //       it("user should have status", async function () {
  //         await expect(
  //           this.violetID
  //             .connect(this.signers.admin)
  //             .grantStatus(this.signers.user.address, US_ACCREDITED_INVESTOR_STATUS_ID, "0x00"),
  //         ).to.not.be.reverted;

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.signers.user.address, US_ACCREDITED_INVESTOR_STATUS_ID),
  //         ).to.be.true;
  //       });

  //       it("user should not have status", async function () {
  //         await expect(
  //           this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
  //         ).to.be.revertedWith("token type not registered");

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.signers.user.address, US_ACCREDITED_INVESTOR_STATUS_ID),
  //         ).to.be.false;

  //         expect(await this.violetID.connect(this.signers.user).hasStatus(this.signers.user.address, 42)).to.be.false;
  //       });
  //     });

  //     context("Contract holder", async function () {
  //       it("contract should have status", async function () {
  //         await expect(
  //           this.violetID
  //             .connect(this.signers.admin)
  //             .grantStatus(this.mockContract.address, US_ACCREDITED_INVESTOR_STATUS_ID, "0x00"),
  //         ).to.not.be.reverted;

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.mockContract.address, US_ACCREDITED_INVESTOR_STATUS_ID),
  //         ).to.be.true;
  //       });

  //       it("contract should not have status", async function () {
  //         await expect(
  //           this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
  //         ).to.be.revertedWith("token type not registered");

  //         expect(
  //           await this.violetID
  //             .connect(this.signers.user)
  //             .hasStatus(this.mockContract.address, US_ACCREDITED_INVESTOR_STATUS_ID),
  //         ).to.be.false;

  //         expect(await this.violetID.connect(this.signers.user).hasStatus(this.mockContract.address, 42)).to.be.false;
  //       });
  //     });
  //   });
  // });
}
