import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const ROOT_DIR = path.join(__dirname, '..');
const ERC3643_DIR = path.join(ROOT_DIR, 'ERC-3643');
const DEPLOYMENTS_DIR = path.join(ERC3643_DIR, 'deployments');
const ENV_PATH = path.join(ROOT_DIR, '.env');

function getLatestDeploymentFile() {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    return null;
  }
  const files = fs.readdirSync(DEPLOYMENTS_DIR)
    .filter(f => f.startsWith('trex-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  return files.length > 0 ? path.join(DEPLOYMENTS_DIR, files[0]) : null;
}

function updateEnv() {
  const latestFile = getLatestDeploymentFile();
  if (!latestFile) {
    console.error('No deployment found in ' + DEPLOYMENTS_DIR);
    return;
  }

  console.log('Reading deployment from:', latestFile);
  const deployment = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const { suite } = deployment.addresses;

  let envConfig = {};
  if (fs.existsSync(ENV_PATH)) {
    envConfig = dotenv.parse(fs.readFileSync(ENV_PATH));
  }

  const newConfig = {
    ...envConfig,
    TOKEN_ADDRESS: suite.token,
    IDENTITY_REGISTRY_ADDRESS: suite.ir,
    COMPLIANCE_ADDRESS: suite.mc,
    TREX_FACTORY_ADDRESS: deployment.addresses.trexFactory
  };

  const envContent = Object.entries(newConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(ENV_PATH, envContent);
  console.log('Successfully updated .env with new contract addresses:');
  console.log(`- Token: ${suite.token}`);
  console.log(`- Identity Registry: ${suite.ir}`);
  console.log(`- Compliance: ${suite.mc}`);
  console.log(`- Factory: ${deployment.addresses.trexFactory}`);
}

updateEnv();
