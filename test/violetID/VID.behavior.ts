import { expect } from "chai";
import { utils } from "ethers";
import { toUtf8Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { MockContract__factory } from "../../src/types";

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

  describe("flag", async function () {
    context("EOA target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.signers.user.address, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(1);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(this.signers.user.address)).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).flag(this.signers.user.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).flag(this.signers.user.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );
      });
    });

    context("Contract target", async function () {
      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.mockContract.address, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(1);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).flag(this.mockContract.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).flag(this.mockContract.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });
    });
  });

  describe("unflag", async function () {
    context("EOA target", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.signers.user.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).unflag(this.signers.user.address, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.signers.user.address)).to.be.false;
      });

      it("as admin should emit event", async function () {
        await expect(this.violetID.connect(this.signers.admin).unflag(this.signers.user.address, "0x00"))
          .to.emit(this.violetID, "AccountDeregistered")
          .withArgs(this.signers.user.address, "0x00");

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.signers.user.address)).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).unflag(this.signers.user.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(1);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(this.signers.user.address)).to.be.false;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).unflag(this.signers.user.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(1);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(this.signers.user.address)).to.be.false;
      });
    });

    context("Contract target", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.mockContract.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("as admin should succeed", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).unflag(this.mockContract.address, "0x00"),
        ).to.not.be.reverted;

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });

      it("as admin should emit event", async function () {
        await expect(this.violetID.connect(this.signers.admin).unflag(this.mockContract.address, "0x00"))
          .to.emit(this.violetID, "AccountDeregistered")
          .withArgs(this.mockContract.address, "0x00");

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(0);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });

      it("as owner should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.owner).unflag(this.mockContract.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.owner.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(1);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
      });

      it("as user should fail", async function () {
        await expect(
          this.violetID.connect(this.signers.user).unflag(this.mockContract.address, "0x00"),
        ).to.be.revertedWith(
          `AccessControl: account ${this.signers.user.address.toLowerCase()} is missing role ${ADMIN_ROLE}`,
        );

        expect(await this.violetID.callStatic.numberOfRegisteredAccounts()).to.equal(0);
        expect(await this.violetID.callStatic.numberOfRegisteredContracts()).to.equal(1);
        expect(await this.violetID.callStatic.isAccountRegistered(this.mockContract.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
      });
    });
  });

  describe("safeTransferFrom", async function () {
    context("EOA holder", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.signers.user.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(this.signers.user.address, this.signers.admin.address, 0, 1, "0x00"),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.admin.address)).to.be.false;
      });

      it("to Contract should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(this.signers.user.address, this.mockContract.address, 0, 1, "0x00"),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });
    });

    context("Contract holder", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.mockContract.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(this.mockContract.transferVID(this.signers.user.address)).to.be.revertedWith(
          `transfers disallowed`,
        );

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
      });

      it("to Contract should fail", async function () {
        const anotherMock = await (await ethers.getContractFactory("MockContract")).deploy(this.violetID.address);
        await expect(this.mockContract.transferVID(anotherMock.address)).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(anotherMock.address)).to.be.false;
      });
    });
  });

  describe("safeBatchTransferFrom", async function () {
    context("EOA holder", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.signers.user.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeBatchTransferFrom(this.signers.user.address, this.signers.admin.address, [0], [1], "0x00"),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.admin.address)).to.be.false;
      });

      it("to Contract should fail", async function () {
        await expect(
          this.violetID
            .connect(this.signers.user)
            .safeTransferFrom(this.signers.user.address, this.mockContract.address, [0], [1], "0x00"),
        ).to.be.revertedWith(`transfers disallowed`);

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.false;
      });
    });

    context("Contract holder", async function () {
      beforeEach("flag", async function () {
        await expect(
          this.violetID.connect(this.signers.admin).flag(this.mockContract.address, "0x00"),
        ).to.not.be.reverted;
      });

      it("to EOA should fail", async function () {
        await expect(this.mockContract.transferVIDBatch(this.signers.user.address)).to.be.revertedWith(
          `transfers disallowed`,
        );

        expect(await this.violetID.callStatic.isAccountRegistered(this.signers.user.address)).to.be.false;
        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
      });

      it("to Contract should fail", async function () {
        const anotherMock = await (await ethers.getContractFactory("MockContract")).deploy(this.violetID.address);
        await expect(this.mockContract.transferVIDBatch(anotherMock.address)).to.be.revertedWith(
          `transfers disallowed`,
        );

        expect(await this.violetID.callStatic.isContractRegistered(this.mockContract.address)).to.be.true;
        expect(await this.violetID.callStatic.isContractRegistered(anotherMock.address)).to.be.false;
      });
    });
  });
}
