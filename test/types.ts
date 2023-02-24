import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { VioletID } from "../types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    violetID: VioletID;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  owner: SignerWithAddress;
  admin: SignerWithAddress;
  user: SignerWithAddress;
}
