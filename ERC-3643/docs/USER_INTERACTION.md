# User Interaction Guide

This guide maps user-facing actions to on-chain behavior.

## 1. Actors

- Platform Admin:
  - Owns factory/gateway governance and deployment policy.
- Issuer Admin:
  - Owns a token suite and configures token/compliance parameters.
- Compliance or Transfer Agent:
  - Registers identities, mints, freezes, pauses, and handles recovery.
- Claim Issuer:
  - Issues signed claims to investor ONCHAINIDs.
- Investor:
  - Holds token, receives transfers, sends transfers.

## 2. Primary Journeys

### Journey A: New Token Launch

1. Issuer requests deployment with token metadata and compliance settings.
2. Backend calls `TREXFactory.deployTREXSuite` (or `TREXGateway.deployTREXSuite`).
3. Suite contracts are deployed and wired.
4. Ownership transfers to issuer owner wallet.

User impact:
- Token is live but usually paused until operations are ready.

### Journey B: Investor Onboarding (KYC/AML)

1. Investor signs up off-chain.
2. KYC provider validates identity.
3. Claim issuer writes claims to investor ONCHAINID.
4. Agent calls `IdentityRegistry.registerIdentity` or `batchRegisterIdentity`.

User impact:
- Investor becomes eligible to receive/hold token if claims satisfy registry rules.

### Journey C: Primary Issuance

1. Agent calls `Token.mint(investor, amount)`.
2. If token is paused, issuance can still be performed by agent workflows depending on policy.
3. Agent unpauses when market trading should start using `Token.unpause`.

User impact:
- Investor balance appears on-chain.

### Journey D: Secondary Transfer

1. Investor calls `Token.transfer`.
2. Token checks:
   - frozen status and available balance
   - receiver verification via `IdentityRegistry.isVerified`
   - compliance rules via `ModularCompliance`
3. If checks pass, transfer succeeds.

User impact:
- Failed transfers usually indicate compliance or identity issues.

### Journey E: Incident / Regulatory Controls

1. Agent can `pause`, `setAddressFrozen`, or freeze partial balances.
2. Agent can `forcedTransfer` when legally required.
3. Agent can `recoveryAddress` for lost wallet remediation.

User impact:
- Operations can enforce legal or risk controls without contract migration.

## 3. Admin Actions by Role

### Platform Admin

- Manage gateway deployer permissions and deployment fees.
- Enable/disable public deployment on gateway.
- Rotate implementation authority references when upgrading release line.

### Issuer Admin

- Update token name/symbol/onchainID (if needed).
- Manage claim topics and trusted issuers policy.
- Assign agent wallets for operations.

### Compliance/Transfer Agent

- Maintain investor registry entries.
- Mint/burn supply per issuance/redemption events.
- Execute freeze/pause/recovery controls.

## 4. UX and Support Considerations

- Show specific failure reason categories:
  - Not verified
  - Compliance rule blocked
  - Wallet frozen
  - Token paused
- Add pre-check endpoint before transfer:
  - check registration, claims, and compliance policy ex-ante.
- Log and display key events:
  - `IdentityRegistered`
  - `TrustedIssuerAdded`
  - `ClaimTopicAdded`
  - `Transfer`, `Paused`, `Unpaused`, `AddressFrozen`

## 5. Minimal Operational SLA Checklist

- Daily:
  - verify claim issuer keys and trusted issuer registry status.
- Per issuance window:
  - validate agents and pause state.
- Per incident:
  - enforce freeze/pause playbook and evidence logging.
