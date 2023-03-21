import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { MockContract } from "../src/types/contracts/mock/MockContract";
import type { VioletID } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    violetID: VioletID;
    mockContract: MockContract;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  owner: SignerWithAddress;
  admin: SignerWithAddress;
  user: SignerWithAddress;
}
