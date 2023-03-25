const hre = require("hardhat");

async function main() {
  const SWAPV3 = await hre.ethers.getContractFactory("WRSwapV3");
  const swapV3 = await SWAPV3.deploy();
  await swapV3.deployed();
  console.log(
    `WR SWAP V3 Deployed to ${swapV3.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
