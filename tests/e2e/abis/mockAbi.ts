export const TREXFactoryABI = [{
  "inputs": [
    {"internalType": "address","name": "tokenImplementation","type": "address"},
    {"internalType": "address","name": "ctrImplementation","type": "address"},
    {"internalType": "address","name": "irsImplementation","type": "address"},
    {"internalType": "address","name": "irImplementation","type": "address"},
    {"internalType": "address","name": "tirImplementation","type": "address"},
    {"internalType": "address","name": "complianceImplementation","type": "address"}
  ],
  "stateMutability": "nonpayable",
  "type": "constructor"
}, {
  "inputs": [],
  "name": "TREXSuiteDeployed",
  "type": "event"
}, {
  "inputs": [{"internalType": "string","name": "_salt","type": "string"}, {"internalType": "struct ITREXFactory.TokenDetails","name": "_tokenDetails","type": "tuple"}, {"internalType": "struct ITREXFactory.ClaimDetails","name": "_claimDetails","type": "tuple"}],
  "name": "deployTREXSuite",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}] as const;

export const TokenABI = [{
  "inputs": [{"internalType": "address","name": "account","type": "address"}],
  "name": "balanceOf",
  "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address","name": "account","type": "address"}],
  "name": "isFrozen",
  "outputs": [{"internalType": "bool","name": "","type": "bool"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "paused",
  "outputs": [{"internalType": "bool","name": "","type": "bool"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address","name": "_to","type": "address"}, {"internalType": "uint256","name": "_amount","type": "uint256"}],
  "name": "mint",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "pause",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address[]","name": "_toList","type": "address[]"}, {"internalType": "uint256[]","name": "_amounts","type": "uint256[]"}],
  "name": "batchMint",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address","name": "agent","type": "address"}],
  "name": "addAgent",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address","name": "agent","type": "address"}],
  "name": "removeAgent",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address","name": "newImplementation","type": "address"}],
  "name": "upgradeTo",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}] as const;

export const IdentityRegistryABI = [{
  "inputs": [{"internalType": "address","name": "_userAddress","type": "address"}],
  "name": "identity",
  "outputs": [{"internalType": "address","name": "","type": "address"}],
  "stateMutability": "view",
  "type": "function"
}] as const;
