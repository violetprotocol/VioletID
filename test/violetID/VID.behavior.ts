import { expect } from "chai";

export function shouldBehaveLikeVioletID(): void {
  describe("grantRole", async function () {
    context("as owner", async function () {
      it("ADMIN_ROLE should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantRole(await this.violetID.callStatic.ADMIN_ROLE(), this.signers.user.address),
        ).to.not.be.reverted;
      });

      it("OWNER_ROLE should succeed", async function () {
        await expect(
          this.violetID
            .connect(this.signers.owner)
            .grantRole(await this.violetID.callStatic.OWNER_ROLE(), this.signers.user.address),
        ).to.not.be.reverted;
      });
    });

    context("as admin", async function () {
      it("ADMIN_ROLE should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantRole(await this.violetID.callStatic.ADMIN_ROLE(), this.signers.user.address),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${await this.violetID.callStatic.OWNER_ROLE()}`,
        );
      });

      it("OWNER_ROLE should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.admin)
            .grantRole(await this.violetID.callStatic.OWNER_ROLE(), this.signers.user.address),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.admin.address.toLowerCase()} is missing role ${await this.violetID.callStatic.OWNER_ROLE()}`,
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
        `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${await this.violetID.callStatic.ADMIN_ROLE()}`,
      );
    });

    it("as user should fail", async function () {
      await expect(
        this.violetID.connect(this.signers.user).mint(this.signers.user.address, 0, 1, "0x00"),
      ).to.be.revertedWith(
        `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${await this.violetID.callStatic.ADMIN_ROLE()}`,
      );
    });
  });
}
