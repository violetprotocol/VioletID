import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { SimpleRegistry } from "../src/types";
import type { VioletID } from "../src/types";
import { MockContract } from "../src/types/contracts/mock/MockContract";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    violetID: VioletID;
    simpleRegistry: SimpleRegistry;
    randomAddresses: string[];
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
