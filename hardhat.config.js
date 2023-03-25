require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

module.exports = {
  //solidity: "0.7.6",
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./frontend/src/artifacts"
  },
  allowUnlimitedContractSize: true,
  etherscan: {
    apiKey: "RXWDRFIWDHDEQS6TA5GIMUN53YXDPS4YP5"
  },
  networks: {
    hardhat: {
      forking: {
        //url: "https://eth-mainnet.g.alchemy.com/v2/8Srm8dlSQID3Dtw2xVb74bTD-Vw3_L51"
        url: "https://polygon-mainnet.g.alchemy.com/v2/GR-_C0-oPT5QnS4_42BKDmDmiVzrl771"
      },
    },
    goerli: {
      url: process.env.WEB3_ALCHEMY_GOERLI,
      accounts: [process.env.PRIVATE_KEY_GOERLI]
    }
  }
};

