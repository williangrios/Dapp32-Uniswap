require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./frontend/src/artifacts"
  },
  allowUnlimitedContractSize: true,
  networks: {
    // hardhat: {
    //   forking: {
    //     enabled: true,
    //     //url: "https://eth-mainnet.g.alchemy.com/v2/8Srm8dlSQID3Dtw2xVb74bTD-Vw3_L51"
    //   },
    //   chainId: 137
    // },
    goerli: {
      url: process.env.WEB3_ALCHEMY_GOERLI,
      accounts: [process.env.PRIVATE_KEY_GOERLI]
    }
  }
};


// https://www.youtube.com/watch?v=GwMyv7CmoRs