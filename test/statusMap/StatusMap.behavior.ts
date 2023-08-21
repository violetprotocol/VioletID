import { expect } from "chai";
import { utils } from "ethers";

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

export function shouldBehaveLikeStatusMap(): void {
  describe("_isStatusSet", async function () {
    context("with status", async function () {
      beforeEach("set status", async function () {
        await this.statusMap.setStatusTo(this.signers.user.address, Status.REGISTERED_WITH_VIOLET, true);
      });

      it("should return true", async function () {
        expect(
          await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.true;
      });

      it("should return false", async function () {
        expect(
          await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.IS_INDIVIDUAL),
        ).to.be.false;
      });
    });
  });

  describe("_areStatusesSet", async function () {
    context("with status", async function () {
      beforeEach("set status", async function () {
        await this.statusMap.setMultipleStatuses(this.signers.user.address, INDIVIDUAL_US_ACCREDITED_COMBINATION_ID);
      });

      it("should return true", async function () {
        expect(
          await this.statusMap.callStatic.areStatusesSet(
            this.signers.user.address,
            INDIVIDUAL_US_ACCREDITED_COMBINATION_ID,
          ),
        ).to.be.true;
      });

      it("should return false", async function () {
        expect(
          await this.statusMap.callStatic.areStatusesSet(
            this.signers.user.address,
            getStatusCombinationId([Status.IS_BUSINESS, Status.REGISTERED_WITH_VIOLET]),
          ),
        ).to.be.false;
      });
    });
  });

  describe("_setStatusTo", async function () {
    it("should successfully set status", async function () {
      await expect(this.statusMap.setStatusTo(this.signers.user.address, Status.REGISTERED_WITH_VIOLET, true)).to.not.be
        .reverted;

      expect(await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to
        .be.true;
    });

    it("should successfully unset status", async function () {
      await expect(this.statusMap.setStatusTo(this.signers.user.address, Status.REGISTERED_WITH_VIOLET, true)).to.not.be
        .reverted;

      await expect(this.statusMap.setStatusTo(this.signers.user.address, Status.REGISTERED_WITH_VIOLET, false)).to.not
        .be.reverted;

      expect(await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to
        .be.false;
    });
  });

  describe("_setMultipleStatuses", async function () {
    it("should successfully set multiple statuses", async function () {
      await expect(
        this.statusMap.setMultipleStatuses(
          this.signers.user.address,
          getStatusCombinationId([Status.REGISTERED_WITH_VIOLET, Status.IS_INDIVIDUAL]),
        ),
      ).to.not.be.reverted;

      expect(
        await this.statusMap.callStatic.areStatusesSet(
          this.signers.user.address,
          getStatusCombinationId([Status.REGISTERED_WITH_VIOLET, Status.IS_INDIVIDUAL]),
        ),
      ).to.be.true;
    });
  });

  describe("_setStatus", async function () {
    it("should successfully set status", async function () {
      await expect(this.statusMap.setStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to.not.be
        .reverted;

      expect(await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.REGISTERED_WITH_VIOLET)).to
        .be.true;
    });
  });

  describe("_unsetStatus", async function () {
    context("with set status", async function () {
      beforeEach("set status", async function () {
        this.statusMap.setStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET);
      });

      it("should successfully unset status", async function () {
        await expect(
          this.statusMap.unsetStatus(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.not.be.reverted;

        expect(
          await this.statusMap.callStatic.isStatusSet(this.signers.user.address, Status.REGISTERED_WITH_VIOLET),
        ).to.be.false;
      });
    });
  });

  describe("Conversion functions", async () => {
    const statuses = [
      [0, 1, 3, 6, 4],
      [0, 2, 3, 5, 7],
      [1, 2, 3, 5, 6],
      [0, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 7],
    ];

    describe("getStatusesFromCombinationId", async function () {
      it("should return the correct status combination id from list of statuses", async function () {
        statuses.forEach(async (status) => {
          const combinationId = getStatusCombinationId(status);
          expect(await this.statusMap.callStatic.getStatusesFromCombinationId(combinationId)).to.deep.equal(
            statuses.sort(),
          );
        });
      });
    });

    describe("getStatusCombinationId", async function () {
      it("should return the correct statuses from a combination id", async function () {
        statuses.forEach(async (status) => {
          const combinationId = getStatusCombinationId(status);
          expect(await this.statusMap.callStatic.getStatusCombinationId(status)).to.equal(combinationId);
        });
      });
    });
  });
}
