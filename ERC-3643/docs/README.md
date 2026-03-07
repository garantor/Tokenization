# ERC-3643 Contract Flow Readme

This document explains the contracts in deployment order, how they connect, and how they support the end-to-end user flow.

## 1. Contract Stack (In Order)

### 1. ONCHAINID Layer

1. `Identity` implementation (from `@onchain-id/solidity`)
2. `ImplementationAuthority` (ONCHAINID authority)
3. `IdFactory` (creates token and investor ONCHAINIDs)

Purpose:
- Defines identity primitives (keys, claims, management).
- Creates ONCHAINID contracts for token and investors.

### 2. ERC-3643 Implementations

1. `ClaimTopicsRegistry`
2. `TrustedIssuersRegistry`
3. `IdentityRegistryStorage`
4. `IdentityRegistry`
5. `ModularCompliance`
6. `Token`

Purpose:
- These are logic contracts used by proxy instances.

### 3. Upgrade/Deployment Control

1. `TREXImplementationAuthority`
2. `TREXFactory`
3. Optional: `TREXGateway`

Purpose:
- `TREXImplementationAuthority` stores active implementation version.
- `TREXFactory` deploys token suites via CREATE2 proxies.
- `TREXGateway` adds deployer permissions and fee/public deployment policy.

### 4. Suite Proxies Deployed Per Token

Each token suite contains:

1. `TokenProxy`
2. `IdentityRegistryProxy`
3. `IdentityRegistryStorageProxy` (or shared IRS if provided)
4. `TrustedIssuersRegistryProxy`
5. `ClaimTopicsRegistryProxy`
6. `ModularComplianceProxy`

## 2. How Contracts Fit the Business Flow

### A. Issuer Setup

1. Platform admin deploys base stack (`TREXImplementationAuthority`, `TREXFactory`, ONCHAINID factory).
2. Issuer deploys one suite through `TREXFactory.deployTREXSuite` or `TREXGateway.deployTREXSuite`.
3. Factory wires all suite contracts together and transfers ownership to token owner.

### B. Compliance Setup

1. Define required claim topics in `ClaimTopicsRegistry`.
2. Register trusted `ClaimIssuer` contracts in `TrustedIssuersRegistry`.
3. Configure transfer rules in `ModularCompliance` modules.

### C. Investor Onboarding

1. Investor gets ONCHAINID.
2. KYC/AML claim issuer signs and writes claims to investor identity.
3. Agent registers investor wallet + ONCHAINID + country in `IdentityRegistry`.

### D. Token Operations

1. Agent mints to verified investors via `Token.mint`.
2. Investors transfer with `Token.transfer`.
3. Transfer succeeds only if:
   - sender/receiver checks pass
   - receiver identity is verified by `IdentityRegistry.isVerified`
   - compliance approves via `ModularCompliance.canTransfer`

### E. Admin Controls

1. Pause/unpause token.
2. Freeze wallet or partially freeze balances.
3. Force transfer, burn, recover address.
4. Update modules/topics/issuers as regulation changes.

## 3. Interaction Map

1. `Token` asks `IdentityRegistry` if receiver is verified.
2. `IdentityRegistry` reads:
   - `ClaimTopicsRegistry` for required topics
   - `TrustedIssuersRegistry` for valid issuers per topic
   - investor ONCHAINID claims for proof
3. `Token` asks `ModularCompliance` if transfer is allowed.
4. If both pass, transfer executes.

## 4. Core Contracts by Responsibility

- `contracts/token/Token.sol`:
  - ERC-20 behavior + compliance enforcement + admin controls.
- `contracts/registry/implementation/IdentityRegistry.sol`:
  - investor registry and verification engine.
- `contracts/registry/implementation/IdentityRegistryStorage.sol`:
  - canonical mapping wallet -> identity/country.
- `contracts/registry/implementation/ClaimTopicsRegistry.sol`:
  - required claims list.
- `contracts/registry/implementation/TrustedIssuersRegistry.sol`:
  - trusted issuer allowlist by claim topic.
- `contracts/compliance/modular/ModularCompliance.sol`:
  - pluggable transfer restriction modules.
- `contracts/factory/TREXFactory.sol`:
  - suite deployment/orchestration.
- `contracts/factory/TREXGateway.sol`:
  - controlled/public deployment and fees.
- `contracts/proxy/authority/TREXImplementationAuthority.sol`:
  - implementation version management.

## 5. Reference Docs

- User interaction guide: [USER_INTERACTION.md](./USER_INTERACTION.md)
- Integration guide: [INTEGRATION.md](./INTEGRATION.md)
- Deployment guide: [../DEPLOYMENT.md](../DEPLOYMENT.md)
