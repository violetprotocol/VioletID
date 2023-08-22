import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { MockVioletIDReceiver, VioletID } from "../src/types";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    violetID: VioletID;
    randomAddresses: string[];
    mockVIDReceiver: MockVioletIDReceiver;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  owner: SignerWithAddress;
  admin: SignerWithAddress;
  user: SignerWithAddress;
}
