import fs from 'fs';
import path from 'path';
import { ContractReceipt, ContractTransaction, Signer } from 'ethers';
import { ethers, network } from 'hardhat';
import OnchainID from '@onchain-id/solidity';

type DeployProfile = 'dev' | 'prod';

type DeployConfig = {
  profile: DeployProfile;
  confirmations: number;
  owner: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenSalt: string;
  irs: string;
  onchainId: string;
  irAgents: string[];
  tokenAgents: string[];
  complianceModules: string[];
  complianceSettings: string[];
  claimTopic: string;
  issuerClaims: string[];
  claimIssuerAddress?: string;
  claimIssuerOwner: string;
  claimSigner: string;
  outputDir: string;
};

type SuiteAddresses = {
  token: string;
  ir: string;
  irs: string;
  tir: string;
  ctr: string;
  mc: string;
};

function env(name: string): string | undefined {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseProfile(): DeployProfile {
  const requested = (env('DEPLOY_PROFILE') ?? 'dev').toLowerCase();
  if (requested !== 'dev' && requested !== 'prod') {
    throw new Error(`Invalid DEPLOY_PROFILE "${requested}". Expected "dev" or "prod".`);
  }
  return requested;
}

function assertAddress(value: string, label: string): string {
  if (!ethers.utils.isAddress(value)) {
    throw new Error(`Invalid address for ${label}: ${value}`);
  }
  return ethers.utils.getAddress(value);
}

function parseAddressList(raw: string | undefined, label: string): string[] {
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item, index) => assertAddress(item, `${label}[${index}]`));
}

function parseBytesListFromJson(raw: string | undefined, label: string): string[] {
  if (!raw) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} must be valid JSON array.`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON array.`);
  }
  return parsed.map((item, index) => {
    if (typeof item !== 'string' || !ethers.utils.isHexString(item)) {
      throw new Error(`${label}[${index}] must be a hex bytes string.`);
    }
    return item;
  });
}

function parseTopic(value: string): string {
  if (ethers.utils.isHexString(value)) {
    return ethers.BigNumber.from(value).toHexString();
  }
  return ethers.utils.id(value);
}

function parseTopicList(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) {
    return fallback;
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => parseTopic(item));
}

function parsePositiveInt(raw: string | undefined, fallback: number, label: string): number {
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return parsed;
}

function loadConfig(deployerAddress: string): DeployConfig {
  const profile = parseProfile();
  const isProd = profile === 'prod';

  const owner = assertAddress(isProd ? requireEnv('TREX_OWNER') : env('TREX_OWNER') ?? deployerAddress, 'TREX_OWNER');
  const tokenName = isProd ? requireEnv('TREX_TOKEN_NAME') : env('TREX_TOKEN_NAME') ?? 'TREXDINO';
  const tokenSymbol = isProd ? requireEnv('TREX_TOKEN_SYMBOL') : env('TREX_TOKEN_SYMBOL') ?? 'TREX';
  const tokenDecimals = parsePositiveInt(env('TREX_TOKEN_DECIMALS'), 0, 'TREX_TOKEN_DECIMALS');
  const tokenSalt = isProd ? requireEnv('TREX_SALT') : env('TREX_SALT') ?? `dev-${network.name}-${Date.now()}`;
  const claimTopic = parseTopic(isProd ? requireEnv('TREX_CLAIM_TOPIC') : env('TREX_CLAIM_TOPIC') ?? 'CLAIM_TOPIC');
  const issuerClaims = parseTopicList(env('TREX_CLAIM_ISSUER_CLAIMS'), [claimTopic]);
  const confirmations = parsePositiveInt(env('DEPLOY_CONFIRMATIONS'), isProd ? 3 : 1, 'DEPLOY_CONFIRMATIONS');

  const irs = env('TREX_IRS_ADDRESS') ? assertAddress(requireEnv('TREX_IRS_ADDRESS'), 'TREX_IRS_ADDRESS') : ethers.constants.AddressZero;
  const onchainId = env('TREX_ONCHAINID_ADDRESS')
    ? assertAddress(requireEnv('TREX_ONCHAINID_ADDRESS'), 'TREX_ONCHAINID_ADDRESS')
    : ethers.constants.AddressZero;

  const irAgents = parseAddressList(env('TREX_IR_AGENTS'), 'TREX_IR_AGENTS');
  const tokenAgents = parseAddressList(env('TREX_TOKEN_AGENTS'), 'TREX_TOKEN_AGENTS');
  const complianceModules = parseAddressList(env('TREX_COMPLIANCE_MODULES'), 'TREX_COMPLIANCE_MODULES');
  const complianceSettings = parseBytesListFromJson(env('TREX_COMPLIANCE_SETTINGS_JSON'), 'TREX_COMPLIANCE_SETTINGS_JSON');

  const claimIssuerAddress = env('TREX_CLAIM_ISSUER_ADDRESS')
    ? assertAddress(requireEnv('TREX_CLAIM_ISSUER_ADDRESS'), 'TREX_CLAIM_ISSUER_ADDRESS')
    : undefined;
  const claimIssuerOwner = assertAddress(
    env('TREX_CLAIM_ISSUER_OWNER') ?? owner,
    'TREX_CLAIM_ISSUER_OWNER',
  );
  const claimSigner = assertAddress(
    isProd ? requireEnv('TREX_CLAIM_SIGNER') : env('TREX_CLAIM_SIGNER') ?? deployerAddress,
    'TREX_CLAIM_SIGNER',
  );
  const outputDir = env('TREX_OUTPUT_DIR') ?? path.join(process.cwd(), 'deployments');

  const config: DeployConfig = {
    profile,
    confirmations,
    owner,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenSalt,
    irs,
    onchainId,
    irAgents,
    tokenAgents,
    complianceModules,
    complianceSettings,
    claimTopic,
    issuerClaims,
    claimIssuerAddress,
    claimIssuerOwner,
    claimSigner,
    outputDir,
  };

  validateConfig(config, deployerAddress);
  return config;
}

function validateConfig(config: DeployConfig, deployerAddress: string): void {
  if (config.tokenName.length === 0) {
    throw new Error('Token name cannot be empty.');
  }
  if (config.tokenSymbol.length === 0) {
    throw new Error('Token symbol cannot be empty.');
  }
  if (config.tokenDecimals < 0 || config.tokenDecimals > 18) {
    throw new Error('Token decimals must be between 0 and 18.');
  }
  if (config.tokenSalt.length === 0) {
    throw new Error('Token salt cannot be empty.');
  }
  if (config.complianceSettings.length > config.complianceModules.length) {
    throw new Error('Invalid compliance pattern: settings length cannot exceed modules length.');
  }
  if (config.irAgents.length > 5 || config.tokenAgents.length > 5) {
    throw new Error('Factory supports up to 5 IR agents and 5 token agents at deployment.');
  }
  if (config.complianceModules.length > 30) {
    throw new Error('Factory supports up to 30 compliance modules at deployment.');
  }
  if (config.issuerClaims.length === 0) {
    throw new Error('Issuer claims list cannot be empty.');
  }
  if (!config.issuerClaims.some((topic) => topic.toLowerCase() === config.claimTopic.toLowerCase())) {
    throw new Error('Issuer claims must include the configured claim topic.');
  }

  if (config.profile === 'prod') {
    if (config.irAgents.length === 0 || config.tokenAgents.length === 0) {
      throw new Error('Production profile requires at least one IR agent and one token agent.');
    }
    if (config.owner.toLowerCase() === deployerAddress.toLowerCase()) {
      console.warn('WARNING: TREX_OWNER equals deployer. Consider using a multisig owner in production.');
    }
  }
}

async function waitTx(txPromise: Promise<ContractTransaction>, label: string, confirmations: number): Promise<ContractReceipt> {
  const tx = await txPromise;
  const receipt = await tx.wait(confirmations);
  console.log(`${label} tx: ${tx.hash}`);
  return receipt;
}

async function deployContractAndWait(
  name: string,
  args: unknown[],
  deployer: Signer,
): Promise<{ address: string }> {
  const contract = await ethers.deployContract(name, args, deployer);
  await contract.deployed();
  return contract;
}

function extractSuiteAddresses(receipt: ContractReceipt): SuiteAddresses {
  const suiteEvent = receipt.events?.find((event) => event.event === 'TREXSuiteDeployed');
  if (!suiteEvent?.args || suiteEvent.args.length < 6) {
    throw new Error('TREXSuiteDeployed event not found or malformed.');
  }
  const token = suiteEvent.args[0];
  const ir = suiteEvent.args[1];
  const irs = suiteEvent.args[2];
  const tir = suiteEvent.args[3];
  const ctr = suiteEvent.args[4];
  const mc = suiteEvent.args[5];

  if (
    typeof token !== 'string' ||
    typeof ir !== 'string' ||
    typeof irs !== 'string' ||
    typeof tir !== 'string' ||
    typeof ctr !== 'string' ||
    typeof mc !== 'string'
  ) {
    throw new Error('Invalid TREXSuiteDeployed event payload.');
  }

  return { token, ir, irs, tir, ctr, mc };
}

async function deployOrAttachClaimIssuer(
  config: DeployConfig,
  deployer: Signer,
): Promise<string> {
  if (config.claimIssuerAddress) {
    return config.claimIssuerAddress;
  }

  const claimIssuer = await ethers.deployContract('ClaimIssuer', [config.claimIssuerOwner], deployer);
  await claimIssuer.deployed();
  console.log('ClaimIssuer:', claimIssuer.address);

  const claimKey = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['address'], [config.claimSigner]),
  );
  await waitTx(claimIssuer.addKey(claimKey, 3, 1), 'ClaimIssuer.addKey', config.confirmations);

  return claimIssuer.address;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const config = loadConfig(deployer.address);

  console.log(`Deploy profile: ${config.profile}`);
  console.log(`Network: ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Owner: ${config.owner}`);
  console.log(`Salt: ${config.tokenSalt}`);

  const claimTopicsRegistryImpl = await deployContractAndWait('ClaimTopicsRegistry', [], deployer);
  const trustedIssuersRegistryImpl = await deployContractAndWait('TrustedIssuersRegistry', [], deployer);
  const identityRegistryStorageImpl = await deployContractAndWait('IdentityRegistryStorage', [], deployer);
  const identityRegistryImpl = await deployContractAndWait('IdentityRegistry', [], deployer);
  const modularComplianceImpl = await deployContractAndWait('ModularCompliance', [], deployer);
  const tokenImpl = await deployContractAndWait('Token', [], deployer);

  const identityImpl = await new ethers.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer,
  ).deploy(deployer.address, true);
  await identityImpl.deployed();

  const identityImplAuthority = await new ethers.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer,
  ).deploy(identityImpl.address);
  await identityImplAuthority.deployed();

  const identityFactory = await new ethers.ContractFactory(
    OnchainID.contracts.Factory.abi,
    OnchainID.contracts.Factory.bytecode,
    deployer,
  ).deploy(identityImplAuthority.address);
  await identityFactory.deployed();

  const trexImplAuthority = await ethers.deployContract(
    'TREXImplementationAuthority',
    [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
    deployer,
  );
  await trexImplAuthority.deployed();

  const versionStruct = { major: 4, minor: 0, patch: 0 };
  const contractsStruct = {
    tokenImplementation: tokenImpl.address,
    ctrImplementation: claimTopicsRegistryImpl.address,
    irImplementation: identityRegistryImpl.address,
    irsImplementation: identityRegistryStorageImpl.address,
    tirImplementation: trustedIssuersRegistryImpl.address,
    mcImplementation: modularComplianceImpl.address,
  };
  await waitTx(
    trexImplAuthority.addAndUseTREXVersion(versionStruct, contractsStruct),
    'TREXImplementationAuthority.addAndUseTREXVersion',
    config.confirmations,
  );

  const trexFactory = await ethers.deployContract('TREXFactory', [trexImplAuthority.address, identityFactory.address], deployer);
  await trexFactory.deployed();

  await waitTx(
    trexImplAuthority.setTREXFactory(trexFactory.address),
    'TREXImplementationAuthority.setTREXFactory',
    config.confirmations,
  );
  await waitTx(
    identityFactory.addTokenFactory(trexFactory.address),
    'IdFactory.addTokenFactory',
    config.confirmations,
  );

  const existingToken = await trexFactory.getToken(config.tokenSalt);
  if (existingToken !== ethers.constants.AddressZero) {
    throw new Error(`Salt already used: ${config.tokenSalt} -> ${existingToken}`);
  }

  const claimIssuerAddress = await deployOrAttachClaimIssuer(config, deployer);
  const tokenDetails = {
    owner: config.owner,
    name: config.tokenName,
    symbol: config.tokenSymbol,
    decimals: config.tokenDecimals,
    irs: config.irs,
    ONCHAINID: config.onchainId,
    irAgents: config.irAgents,
    tokenAgents: config.tokenAgents,
    complianceModules: config.complianceModules,
    complianceSettings: config.complianceSettings,
  };
  const claimDetails = {
    claimTopics: [config.claimTopic],
    issuers: [claimIssuerAddress],
    issuerClaims: [config.issuerClaims],
  };

  const deployReceipt = await waitTx(
    trexFactory.deployTREXSuite(config.tokenSalt, tokenDetails, claimDetails),
    'TREXFactory.deployTREXSuite',
    config.confirmations,
  );
  const suite = extractSuiteAddresses(deployReceipt);

  const mappedToken = await trexFactory.getToken(config.tokenSalt);
  if (mappedToken.toLowerCase() !== suite.token.toLowerCase()) {
    throw new Error(`Factory token mapping mismatch. Expected ${suite.token}, got ${mappedToken}`);
  }

  const token = await ethers.getContractAt('Token', suite.token);
  const identityRegistry = await ethers.getContractAt('IdentityRegistry', suite.ir);
  const trustedIssuersRegistry = await ethers.getContractAt('TrustedIssuersRegistry', suite.tir);
  const claimTopicsRegistry = await ethers.getContractAt('ClaimTopicsRegistry', suite.ctr);
  const modularCompliance = await ethers.getContractAt('ModularCompliance', suite.mc);

  const [tokenOwner, irOwner, tirOwner, ctrOwner, mcOwner] = await Promise.all([
    token.owner(),
    identityRegistry.owner(),
    trustedIssuersRegistry.owner(),
    claimTopicsRegistry.owner(),
    modularCompliance.owner(),
  ]);
  const expectedOwner = config.owner.toLowerCase();
  const owners = [tokenOwner, irOwner, tirOwner, ctrOwner, mcOwner];
  if (owners.some((owner) => owner.toLowerCase() !== expectedOwner)) {
    throw new Error('Ownership validation failed on one or more suite contracts.');
  }

  fs.mkdirSync(config.outputDir, { recursive: true });
  const artifactPath = path.join(
    config.outputDir,
    `trex-${network.name}-${config.profile}-${Date.now()}.json`,
  );
  fs.writeFileSync(
    artifactPath,
    JSON.stringify(
      {
        profile: config.profile,
        network: network.name,
        deployer: deployer.address,
        config: {
          owner: config.owner,
          tokenName: config.tokenName,
          tokenSymbol: config.tokenSymbol,
          tokenDecimals: config.tokenDecimals,
          tokenSalt: config.tokenSalt,
          irs: config.irs,
          onchainId: config.onchainId,
          irAgents: config.irAgents,
          tokenAgents: config.tokenAgents,
          complianceModules: config.complianceModules,
          complianceSettings: config.complianceSettings,
          claimTopic: config.claimTopic,
          issuerClaims: config.issuerClaims,
          claimIssuerAddress,
          claimIssuerOwner: config.claimIssuerOwner,
          claimSigner: config.claimSigner,
          confirmations: config.confirmations,
        },
        addresses: {
          claimTopicsRegistryImplementation: claimTopicsRegistryImpl.address,
          trustedIssuersRegistryImplementation: trustedIssuersRegistryImpl.address,
          identityRegistryStorageImplementation: identityRegistryStorageImpl.address,
          identityRegistryImplementation: identityRegistryImpl.address,
          modularComplianceImplementation: modularComplianceImpl.address,
          tokenImplementation: tokenImpl.address,
          onchainIdIdentityImplementation: identityImpl.address,
          onchainIdImplementationAuthority: identityImplAuthority.address,
          onchainIdFactory: identityFactory.address,
          trexImplementationAuthority: trexImplAuthority.address,
          trexFactory: trexFactory.address,
          suite,
        },
        deploymentTxHash: deployReceipt.transactionHash,
      },
      null,
      2,
    ),
  );

  console.log('TREX suite deployed successfully.');
  console.log('Token:', suite.token);
  console.log('Identity Registry:', suite.ir);
  console.log('Identity Registry Storage:', suite.irs);
  console.log('Trusted Issuers Registry:', suite.tir);
  console.log('Claim Topics Registry:', suite.ctr);
  console.log('Modular Compliance:', suite.mc);
  console.log('Deployment artifact:', artifactPath);
  console.log('Tip: use DEPLOY_PROFILE=dev for local defaults and DEPLOY_PROFILE=prod with explicit env vars.');
}

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exitCode = 1;
});
