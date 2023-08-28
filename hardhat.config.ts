import "@nomicfoundation/hardhat-ledger";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import * as ethers from "ethers";
import "hardhat-dependency-compiler";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import "solidity-coverage";

import "./tasks";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
const privateKey: string | undefined = process.env.PRIVATE_KEY;
const ledgerAddress: string | undefined = process.env.LEDGER_ACCOUNT_ADDRESS;

if (!privateKey && !mnemonic && !ledgerAddress) {
  throw new Error("Please set a ledger address, a PRIVATE_KEY or MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const chainIds = {
  "arbitrum-goerli": 421613,
  "arbitrum-mainnet": 42161,
  avalanche: 43114,
  bsc: 56,
  hardhat: 31337,
  mainnet: 1,
  "optimism-mainnet": 10,
  "optimism-goerli": 420,
  "polygon-mainnet": 137,
  "polygon-mumbai": 80001,
  rinkeby: 4,
  kovan: 42,
  goerli: 5,
};

// If a ledger address is defined, it will use that and nothing else.
// If a private key is defined, it will use it and nothing else.
// Otherwise, it will use the mnemonic set in env.
const getAccounts = () => {
  if (ledgerAddress) {
    return {
      accounts: undefined,
      ledgerAccounts: [ledgerAddress],
    };
  } else if (privateKey) {
    return {
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      ledgerAccounts: undefined,
    };
  } else if (mnemonic) {
    return {
      accounts: {
        count: 20,
        mnemonic,
        path: "m/44'/60'/0'/0",
      },
      ledgerAccounts: undefined,
    };
  }
};

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://" + network + ".infura.io/v3/" + infuraApiKey;
  const accountSettings = getAccounts();

  return {
    ...accountSettings,
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      optimisticGoerli: process.env.OPTIMISM_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      rinkeby: process.env.ETHERSCAN_API_KEY || "",
      kovan: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    arbitrumOne: getChainConfig("arbitrum-mainnet"),
    arbitrumGoerli: getChainConfig("arbitrum-goerli"),
    avalanche: getChainConfig("avalanche"),
    bsc: getChainConfig("bsc"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism-mainnet"),
    optimismGoerli: {
      ...getChainConfig("optimism-goerli"),
      gasPrice: ethers.utils.parseUnits("2", "gwei").toNumber(),
    },
    polygon: getChainConfig("polygon-mainnet"),
    polygonMumbai: getChainConfig("polygon-mumbai"),
    rinkeby: getChainConfig("rinkeby"),
    kovan: getChainConfig("kovan"),
    goerli: getChainConfig("goerli"),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.20",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 20000,
      },
    },
  },
  dependencyCompiler: {
    paths: [
      "@violetprotocol/ethereum-access-token/contracts/AccessTokenVerifier.sol",
      "@violetprotocol/ethereum-access-token/contracts/upgradeable/AccessTokenConsumerUpgradeable.sol",
    ],
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
