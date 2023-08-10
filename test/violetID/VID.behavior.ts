import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { getAttributeCombinationId } from "../utils/getAttributeCombinationId";

enum Attribute {
  ENROLLED_INDIVIDUAL = 2,
  ENROLLED_BUSINESS = 3,
  US_ACCREDITED_INVESTOR = 4,
  NON_US_PERSON = 5,
  US_PERSON = 6,
}

const ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME = Attribute[2];

const INDIVIDUAL_US_ACCREDITED_COMBINATION_ID = getAttributeCombinationId([
  Attribute.ENROLLED_INDIVIDUAL,
  Attribute.US_ACCREDITED_INVESTOR,
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

  describe("registerAttribute", async function () {
    it("as admin should succeed", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
      )
        .to.emit(this.violetID, "AttributeRegistered")
        .withArgs(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME);

      expect(await this.violetID.callStatic.attributeIdToName(Attribute.ENROLLED_INDIVIDUAL)).to.equal(
        ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME,
      );
    });

    it("as non admin should fail", async function () {
      await expect(
        this.violetID
          .connect(this.signers.owner)
          .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
      );

      expect(await this.violetID.callStatic.attributeIdToName(Attribute.ENROLLED_INDIVIDUAL)).to.equal("");
    });

    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should fail if already registered", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.be.revertedWith("attribute already registered");
      });
    });
  });

  describe("updateAttributeName", async function () {
    it("as admin should fail without registered token", async function () {
      await expect(
        this.violetID
          .connect(this.signers.admin)
          .updateAttributeName(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
      ).to.be.revertedWith("attribute not registered");
    });

    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        const newAttributeName = "new name";
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .updateAttributeName(Attribute.ENROLLED_INDIVIDUAL, newAttributeName),
        )
          .to.emit(this.violetID, "AttributeNameUpdated")
          .withArgs(Attribute.ENROLLED_INDIVIDUAL, newAttributeName);

        expect(await this.violetID.callStatic.attributeIdToName(Attribute.ENROLLED_INDIVIDUAL)).to.equal(
          newAttributeName,
        );
      });

      it("as non admin should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).updateAttributeName(Attribute.ENROLLED_INDIVIDUAL, "anything"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role 0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775`,
        );

        expect(await this.violetID.callStatic.attributeIdToName(Attribute.ENROLLED_INDIVIDUAL)).to.equal(
          ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME,
        );
      });
    });
  });

  describe("mintWithAttributes", async function () {
    context("EOA target", async function () {
      it("as admin should succeed", async function () {
        const FIRST_TOKEN_ID = 1;
        await this.violetID
          .connect(this.signers.admin)
          .mintWithAttributes(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID);

        expect(await this.violetID.hasAttribute(FIRST_TOKEN_ID, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        expect(await this.violetID.hasAttribute(FIRST_TOKEN_ID, Attribute.US_ACCREDITED_INVESTOR)).to.be.true;
      });

      it("test legacy simple mint", async function () {
        const TOKEN_ID = 1;
        this.violetID.connect(this.signers.admin).registerAttribute(TOKEN_ID, "whatever");
        await this.violetID.connect(this.signers.admin).legacyGrantStatus(this.signers.user.address, TOKEN_ID, "0x00");
      });

      it("as non-admin should fail", async function () {
        const FIRST_TOKEN_ID = 1;
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .mintWithAttributes(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    context("Contract target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
        )
          .to.emit(this.violetID, "GrantedStatus")
          .withArgs(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL);

        expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
      });

      it("twice should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;

        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
        ).to.be.revertedWith("account already granted status");

        expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });
  });

  describe.skip("grantStatus", async function () {
    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      context("EOA target", async function () {
        it("as admin should succeed", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          )
            .to.emit(this.violetID, "GrantedStatus")
            .withArgs(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL);

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("twice should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("account already granted status");

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
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
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          )
            .to.emit(this.violetID, "GrantedStatus")
            .withArgs(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL);

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("twice should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("account already granted status");

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );
        });
      });
    });

    context("without registered token", async function () {
      context("EOA target", async function () {
        it("as admin should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("token type not registered");

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });
      });

      context("Contract target", async function () {
        it("as admin should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("token type not registered");

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });
      });
    });
  });

  describe.skip("revokeStatus", async function () {
    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      context("EOA target", async function () {
        beforeEach("grantStatus", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;
        });

        it("as admin should succeed", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });

        it("as admin should emit event", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          )
            .to.emit(this.violetID, "RevokedStatus")
            .withArgs(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00");

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("already unregistered account should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("account not in revocable status");
        });
      });

      context("Contract target", async function () {
        beforeEach("grantStatus", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;
        });

        it("as admin should succeed", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });

        it("as admin should emit event", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          )
            .to.emit(this.violetID, "RevokedStatus")
            .withArgs(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00");

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });

        it("as owner should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.owner)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("as user should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith(
            `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
          );

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
        });

        it("already unregistered account should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;

          await expect(
            this.violetID
              .connect(this.signers.admin)
              .revokeStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.be.revertedWith("account not in revocable status");
        });
      });
    });
  });

  describe.skip("safeTransferFrom", async function () {
    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      context("EOA holder", async function () {
        beforeEach("grantStatus", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;
        });

        it("to EOA should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .safeTransferFrom(
                this.signers.user.address,
                this.signers.admin.address,
                Attribute.ENROLLED_INDIVIDUAL,
                1,
                "0x00",
              ),
          ).to.be.revertedWith(`transfers disallowed`);

          expect(await this.violetID.hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
          expect(await this.violetID.hasStatus(this.signers.admin.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });

        it("to Contract should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .safeTransferFrom(
                this.signers.user.address,
                this.mockContract.address,
                Attribute.ENROLLED_INDIVIDUAL,
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
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
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

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
          expect(await this.violetID.hasStatus(anotherMock.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });
      });
    });
  });

  describe.skip("safeBatchTransferFrom", async function () {
    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      context("EOA holder", async function () {
        beforeEach("grantStatus", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;
        });

        it("to EOA should fail", async function () {
          await expect(
            this.violetID
              .connect(this.signers.user)
              .safeBatchTransferFrom(
                this.signers.user.address,
                this.signers.admin.address,
                [Attribute.ENROLLED_INDIVIDUAL],
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
                [Attribute.ENROLLED_INDIVIDUAL],
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
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
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

          expect(await this.violetID.hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.true;
          expect(await this.violetID.hasStatus(anotherMock.address, Attribute.ENROLLED_INDIVIDUAL)).to.be.false;
        });
      });
    });
  });

  describe.skip("hasStatus", async function () {
    context("with registered attribute", async function () {
      beforeEach("register attribute", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .registerAttribute(Attribute.ENROLLED_INDIVIDUAL, ENROLLED_INDIVIDUAL_ATTRIBUTE_NAME),
        ).to.not.be.reverted;
      });

      context("EOA holder", async function () {
        it("user should have status", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(
            await this.violetID
              .connect(this.signers.user)
              .hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL),
          ).to.be.true;
        });

        it("user should not have status", async function () {
          await expect(
            this.violetID.connect(this.signers.admin).grantStatus(this.signers.user.address, 42, "0x00"),
          ).to.be.revertedWith("token type not registered");

          expect(
            await this.violetID
              .connect(this.signers.user)
              .hasStatus(this.signers.user.address, Attribute.ENROLLED_INDIVIDUAL),
          ).to.be.false;

          expect(await this.violetID.connect(this.signers.user).hasStatus(this.signers.user.address, 42)).to.be.false;
        });
      });

      context("Contract holder", async function () {
        it("contract should have status", async function () {
          await expect(
            this.violetID
              .connect(this.signers.admin)
              .grantStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL, "0x00"),
          ).to.not.be.reverted;

          expect(
            await this.violetID
              .connect(this.signers.user)
              .hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL),
          ).to.be.true;
        });

        it("contract should not have status", async function () {
          await expect(
            this.violetID.connect(this.signers.admin).grantStatus(this.mockContract.address, 42, "0x00"),
          ).to.be.revertedWith("token type not registered");

          expect(
            await this.violetID
              .connect(this.signers.user)
              .hasStatus(this.mockContract.address, Attribute.ENROLLED_INDIVIDUAL),
          ).to.be.false;

          expect(await this.violetID.connect(this.signers.user).hasStatus(this.mockContract.address, 42)).to.be.false;
        });
      });
    });
  });
}
