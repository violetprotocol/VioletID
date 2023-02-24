import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";

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

  describe("mint", async function () {
    it("as admin should succeed", async function () {
      await expect(this.violetID.connect(this.signers.admin).mint(this.signers.user.address, 0, 1, "0x00")).to.not.be
        .reverted;
    });

    it("as owner should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.owner).mint(this.signers.user.address, 0, 1, "0x00"),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });

    it("as user should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.user).mint(this.signers.user.address, 0, 1, "0x00"),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });
  });

  describe("mintBatch", async function () {
    it("as admin should succeed", async function () {
      await expect(this.violetID.connect(this.signers.admin).mintBatch(this.signers.user.address, [0], [1], "0x00")).to
        .not.be.reverted;
    });

    it("as owner should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.owner).mintBatch(this.signers.user.address, [0], [1], "0x00"),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });

    it("as user should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.user).mintBatch(this.signers.user.address, [0], [1], "0x00"),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
      );
    });
  });
}
