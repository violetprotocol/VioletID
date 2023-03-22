import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";

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

  describe("grantStatus", async function () {
    context("EOA target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "GrantedStatus")
          .withArgs(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID);

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("twice should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account already granted status");

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
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
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "GrantedStatus")
          .withArgs(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID);

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("twice should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account already granted status");

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
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
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);
      });

      it("as admin should emit event", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "RevokedStatus")
          .withArgs(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00");

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("already unregistered account should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith("account not in revocable status");
      });
    });

    context("Contract target", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);
      });

      it("as admin should emit event", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        )
          .to.emit(this.violetID, "RevokedStatus")
          .withArgs(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00");

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(1);
      });

      it("already unregistered account should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.numberWithBaseRegistrationStatus()).to.equal(0);

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .revokeStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
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
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(
              this.signers.user.address,
              this.signers.admin.address,
              this.BASE_REGISTRATION_STATUS_TOKENID,
              1,
              "0x00",
            ),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.signers.admin.address)).to.be.false;
      });

      it("to Contract should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(
              this.signers.user.address,
              this.mockContract.address,
              this.BASE_REGISTRATION_STATUS_TOKENID,
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
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
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

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(anotherMock.address)).to.be.false;
      });
    });
  });

  describe("safeBatchTransferFrom", async function () {
    context("EOA holder", async function () {
      beforeEach("grantStatus", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeBatchTransferFrom(
              this.signers.user.address,
              this.signers.admin.address,
              [this.BASE_REGISTRATION_STATUS_TOKENID],
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
              [this.BASE_REGISTRATION_STATUS_TOKENID],
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
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
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

        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.hasBaseRegistrationStatus(anotherMock.address)).to.be.false;
      });
    });
  });

  describe("hasStatus", async function () {
    context("EOA holder", async function () {
      it("user should be registered", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID),
        ).to.be.true;
      });

      it("user should not be registered", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID),
        ).to.be.false;
      });
    });

    context("Contract holder", async function () {
      it("contract should be registered", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID),
        ).to.be.true;
      });

      it("contract should not be registered", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID
            .connect(this.signers.user)
            .hasStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID),
        ).to.be.false;
      });
    });
  });

  describe("hasBaseRegistrationStatus", async function () {
    context("EOA holder", async function () {
      it("user should be base registered", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.signers.user.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.user.address),
        ).to.be.true;
        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.admin.address),
        ).to.be.false;
      });

      it("user should not be base registered", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.user.address),
        ).to.be.false;
        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.admin.address),
        ).to.be.false;
      });
    });

    context("Contract holder", async function () {
      it("contract should be base registered", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, this.BASE_REGISTRATION_STATUS_TOKENID, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.mockContract.address),
        ).to.be.true;
        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.admin.address),
        ).to.be.false;
      });

      it("contract should not be base registered", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
        ).to.not.be.reverted;

        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.mockContract.address),
        ).to.be.false;
        expect(
          await this.violetID.connect(this.signers.user).hasBaseRegistrationStatus(this.signers.admin.address),
        ).to.be.false;
      });
    });
  });
}
