// A minimal Hardhat config just to run the local node

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // Typical for recent ERC-3643 repos
  networks: {
    hardhat: {
      chainId: 31337 // Standard local hardhat chain ID
    }
  }
};
