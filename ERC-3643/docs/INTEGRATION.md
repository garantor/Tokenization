# Integration Guide

This guide explains how to integrate backend services, wallets, compliance systems, and the ERC-3643 contracts.

## 1. Integration Boundaries

## On-chain components

- Deployment and governance:
  - `TREXFactory`, optional `TREXGateway`, `TREXImplementationAuthority`
- Token suite:
  - `Token`, `IdentityRegistry`, `IdentityRegistryStorage`, `ClaimTopicsRegistry`, `TrustedIssuersRegistry`, `ModularCompliance`
- Identity:
  - ONCHAINID `Identity`, `ClaimIssuer`, `IdFactory`

## Off-chain components

- KYC/AML provider
- Claims service (claim signing + on-chain claim writing)
- Issuance service (mint/burn orchestration)
- Transfer pre-check service
- Event indexer and audit/reporting
- Wallet custody/signing (EOA, MPC, multisig)

## 2. Suggested Service Architecture

1. `deployment-service`
   - Runs `scripts/deploy-trex.ts`
   - Stores deployment artifacts.
2. `identity-service`
   - Creates or links investor ONCHAINID.
   - Registers identities in `IdentityRegistry`.
3. `claims-service`
   - Manages claim issuer keys.
   - Issues claims and submits `addClaim`.
4. `token-ops-service`
   - Mint, burn, pause, freeze, recovery.
5. `policy-service`
   - Manages claim topics, trusted issuers, compliance modules.
6. `indexer-service`
   - Consumes events and syncs operational DB.

## 3. Critical On-Chain Call Flow

### A. Deployment

1. Deploy stack with `deploy-trex.ts`.
2. Capture artifact output (`trex-<network>-<profile>-<timestamp>.json`).
3. Persist addresses in config service.

### B. Investor Onboarding

1. Ensure investor ONCHAINID exists.
2. Add claims from trusted claim issuer.
3. Register wallet + identity + country in `IdentityRegistry`.
4. Verify with read call `IdentityRegistry.isVerified(wallet)`.

### C. Issuance

1. Agent wallet calls `Token.mint(to, amount)`.
2. Emit and index `Transfer` (mint from zero address).

### D. Transfer UX Pre-Check

Before user signs transfer:

1. `Token.paused()`
2. `Token.isFrozen(sender)` and `Token.isFrozen(receiver)`
3. `IdentityRegistry.isVerified(receiver)`
4. Optional simulation of compliance rules in a read-only workflow.

## 4. Data You Should Persist Off-Chain

- Contract addresses by network/token series.
- Role assignments:
  - owner, IR agents, token agents, claim issuer keys.
- Investor registry state:
  - wallet, ONCHAINID, country, KYC status.
- Claims metadata:
  - topic, issuer, issuance timestamp, expiry policy.
- Token operations:
  - mint/burn/freeze/recovery audit records.

## 5. Event-Driven Integration

Recommended events to index:

- Deployment:
  - `TREXSuiteDeployed`, `GatewaySuiteDeploymentProcessed`
- Identity:
  - `IdentityRegistered`, `IdentityRemoved`, `IdentityUpdated`
- Policy:
  - `ClaimTopicAdded`, `ClaimTopicRemoved`, `TrustedIssuerAdded`, `TrustedIssuerRemoved`
- Token:
  - `Transfer`, `AddressFrozen`, `TokensFrozen`, `TokensUnfrozen`, `Paused`, `Unpaused`

## 6. Security and Operations

- Keep owner as multisig in production.
- Keep agent keys separate from owner governance keys.
- Protect claim signer keys in HSM/MPC.
- Enforce change management for:
  - claim topics
  - trusted issuers
  - compliance module settings
- Require confirmations for all write tx in production.

## 7. Integration Pitfalls to Avoid

- Using EOA as trusted claim issuer instead of `ClaimIssuer` contract.
- Claim topic mismatch between required topics and issuer-allowed topics.
- Missing agent assignment before operational actions.
- Reusing deployment salt unintentionally.
- Deploying with owner equal to temporary deployer EOA.

## 8. Minimal Production Readiness Gate

Before go-live:

1. Deployment artifact committed to secure store.
2. Ownership checks pass across all suite contracts.
3. At least one IR agent and one token agent configured.
4. Claim topic/trusted issuer policy validated.
5. End-to-end dry run completed:
   - register investor
   - issue claim
   - mint
   - transfer
