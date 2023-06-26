import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";

const MAUVE_VERIFIED_ENTITY_STATUS_TOKENID = 0;
const MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME = "MAUVE_VERIFIED_ENTITY_STATUS";

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

  describe("registerTokenType", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
      )
        .to.emit(this.violetID, "TokenRegistered")
        .withArgs(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME);

      expect(await this.violetID.callStatic.tokenIdToType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.equal(
        MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME,
      );
    });

    it("as non admin should fail", async function () {
      await expect(
        this.violetID
          .connect(this.signers.owner)
          .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
      );

      expect(await this.violetID.callStatic.tokenIdToType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.equal("");
    });

    context("with registered token", async function () {
      beforeEach("register token", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
        ).to.be.revertedWith("token type already exists");
      });
    });
  });

  describe("updateTokenTypeName", async function () {
    it("as admin should fail without registered token", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .updateTokenTypeName(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
      ).to.be.revertedWith("token type not registered");
    });

    context("with registered token", async function () {
      beforeEach("register token", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerTokenType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        const newTokenTypeName = "new name";
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .updateTokenTypeName(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, newTokenTypeName),
        )
          .to.emit(this.violetID, "TokenUpdated")
          .withArgs(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, newTokenTypeName);

        expect(await this.violetID.callStatic.tokenIdToType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.equal(
          newTokenTypeName,
        );
      });

      it("as non admin should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .updateTokenTypeName(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "anything"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
        );

        expect(await this.violetID.callStatic.tokenIdToType(MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.equal(
          MAUVE_VERIFIED_ENTITY_STATUS_TOKEN_NAME,
        );
      });
    });
  });

  describe("grantStatus", async function () {
    context("EOA target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "GrantedStatus")
          .withArgs(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID);

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("twice should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account already granted status");

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    context("Contract target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "GrantedStatus")
          .withArgs(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID);

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("twice should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account already granted status");

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });
  });

  describe("revokeStatus", async function () {
    context("EOA target", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });

      it("as admin should emit event", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "RevokedStatus")
          .withArgs(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00");

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("already unregistered account should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account not in revocable status");
      });
    });

    context("Contract target", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });

      it("as admin should emit event", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "RevokedStatus")
          .withArgs(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00");

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("already unregistered account should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account not in revocable status");
      });
    });
  });

  describe("safeTransferFrom", async function () {
    context("EOA holder", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(
              this.signers.user.address,
              this.signers.admin.address,
              MAUVE_VERIFIED_ENTITY_STATUS_TOKENID,
              1,
              "0x00",
            ),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(
          await this.violetID.hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
        expect(
          await this.violetID.hasStatus(this.signers.admin.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });

      it("to Contract should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(
              this.signers.user.address,
              this.mockContract.address,
              MAUVE_VERIFIED_ENTITY_STATUS_TOKENID,
              1,
              "0x00",
            ),
        ).to.be.revertedWith(`transfers disallowed`);
      });
    });

    context("Contract holder", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(this.mockContract.transferVID(this.signers.user.address)).to.be.revertedWith(
          `transfers disallowed`,
        );
      });

      it("to Contract should fail", async function () {
        const anotherMock = await (await ethers.getContractFactory("MockContract")).deploy(this.violetID.address);
        await expect(this.mockContract.transferVID(anotherMock.address)).to.be.revertedWith(`transfers disallowed`);

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
        expect(await this.violetID.hasStatus(anotherMock.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.be.false;
      });
    });
  });

  describe("safeBatchTransferFrom", async function () {
    context("EOA holder", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeBatchTransferFrom(
              this.signers.user.address,
              this.signers.admin.address,
              [MAUVE_VERIFIED_ENTITY_STATUS_TOKENID],
              [1],
              "0x00",
            ),
        ).to.be.revertedWith(`transfers disallowed`);
      });

      it("to Contract should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeBatchTransferFrom(
              this.signers.user.address,
              this.mockContract.address,
              [MAUVE_VERIFIED_ENTITY_STATUS_TOKENID],
              [1],
              "0x00",
            ),
        ).to.be.revertedWith(`transfers disallowed`);
      });
    });

    context("Contract holder", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(this.mockContract.transferVIDBatch(this.signers.user.address)).to.be.revertedWith(
          `transfers disallowed`,
        );
      });

      it("to Contract should fail", async function () {
        const anotherMock = await (await ethers.getContractFactory("MockContract")).deploy(this.violetID.address);
        await expect(this.mockContract.transferVIDBatch(anotherMock.address)).to.be.revertedWith(
          `transfers disallowed`,
        );

        expect(
          await this.violetID.hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
        expect(await this.violetID.hasStatus(anotherMock.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID)).to.be.false;
      });
    });
  });

  describe("hasStatus", async function () {
    context("EOA holder", async function () {
      it("user should have status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("user should not have status", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });
    });

    context("Contract holder", async function () {
      it("contract should have status", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.true;
      });

      it("contract should not have status", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockContract.address, MAUVE_VERIFIED_ENTITY_STATUS_TOKENID),
        ).to.be.false;
      });
    });
  });
}
