# TREX Deployment Guide

This guide explains how to deploy with [`scripts/deploy-trex.ts`](./scripts/deploy-trex.ts) using `dev` and `prod` profiles.

## 1. Prerequisites

- Install dependencies:

```bash
npm ci
```

- Copy environment template:

```bash
cp .env.example .env
```

- Fill `.env` values for your target environment.

## 2. Profiles

The script supports two profiles via `DEPLOY_PROFILE`.

- `dev`:
  - Uses safe defaults for local/dev testing.
  - If optional vars are not provided, script fills sensible defaults.
- `prod`:
  - Enforces strict required variables.
  - Requires explicit owner, token metadata, salt, claim signer, and agent lists.

## 3. Required Variables for `prod`

At minimum, set:

- `TREX_OWNER`
- `TREX_TOKEN_NAME`
- `TREX_TOKEN_SYMBOL`
- `TREX_SALT`
- `TREX_CLAIM_TOPIC`
- `TREX_CLAIM_SIGNER`
- `TREX_IR_AGENTS`
- `TREX_TOKEN_AGENTS`

Recommended for production:

- `DEPLOY_CONFIRMATIONS=3` (or more)
- `TREX_OUTPUT_DIR=./deployments`
- `TREX_CLAIM_ISSUER_ADDRESS` if reusing an audited issuer contract

## 4. Environment Loading

The script reads `process.env`. Load your `.env` before running:

```bash
set -a
source .env
set +a
```

## 5. Run Commands

### Local dev (Hardhat network)

```bash
set -a
source .env
set +a
DEPLOY_PROFILE=dev npx hardhat run scripts/deploy-trex.ts --network hardhat
```

### Production-like network

```bash
set -a
source .env
set +a
DEPLOY_PROFILE=prod npx hardhat run scripts/deploy-trex.ts --network <network-name>
```

Replace `<network-name>` with your configured Hardhat network.

## 6. Variable Formats

- `TREX_IR_AGENTS`, `TREX_TOKEN_AGENTS`, `TREX_COMPLIANCE_MODULES`:
  - Comma-separated EVM addresses.
- `TREX_COMPLIANCE_SETTINGS_JSON`:
  - JSON array of hex calldata.
  - Example:

```json
["0x1234abcd", "0xdeadbeef"]
```

- `TREX_CLAIM_TOPIC`, `TREX_CLAIM_ISSUER_CLAIMS`:
  - Plain string (hashed internally) or hex topic value.
  - `TREX_CLAIM_ISSUER_CLAIMS` accepts comma-separated values.

## 7. Behavior and Safety Checks

The script:

- Deploys implementations + authorities + factory.
- Registers TREX version in implementation authority.
- Links ONCHAINID factory to TREX factory.
- Deploys or attaches a `ClaimIssuer`.
- Deploys suite via `TREXFactory.deployTREXSuite`.
- Verifies:
  - salt not already used
  - token mapping consistency
  - ownership of suite contracts matches `TREX_OWNER`
- Writes deployment artifact JSON to `TREX_OUTPUT_DIR`.

## 8. Production Notes

- Prefer multisig for `TREX_OWNER`.
- Use dedicated operational wallets/contracts for agent roles.
- Use deterministic, auditable salts per issuance series.
- If sharing `TREX_IRS_ADDRESS`, ensure ownership and governance are aligned before deployment.
- Keep deployment artifacts in source control or secure release storage.
