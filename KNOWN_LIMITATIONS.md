# Vaultwork v1 - Known Limitations

This document outlines the intentional scope cuts for Vaultwork v1. These are design decisions made to ship a functional MVP, not oversights. Future versions may address these limitations.

**Version:** 1.0.0
**Last Updated:** 2024

## Scope Cuts

### 1. Single Arbiter per Project
**Current Implementation:** Each project has a single trusted arbiter address who has full discretion to resolve disputes and split funds.

**Limitation:** If the arbiter is unavailable or acts maliciously, there is no fallback mechanism.

**Rationale:** Simplifies dispute resolution logic for MVP. Allows using a multisig wallet or DAO as the arbiter address without changing contract logic.

**Future Enhancement:** Implement contract-based arbitration (e.g., Kleros, Aragon Court) with voting mechanisms.

### 2. No Dispute Bonds/Staking
**Current Implementation:** No mechanism requires parties to stake tokens when raising or resolving disputes.

**Limitation:** Parties can raise disputes frivolously without economic consequences.

**Rationale:** Adds complexity to token economics and user experience. For MVP, trust in the arbiter is sufficient.

**Future Enhancement:** Add dispute bonds that are slashed for malicious dispute raising or unfair resolution.

### 3. Single ERC20 Token per Project
**Current Implementation:** Each project only supports one ERC20 token (e.g., USDC). No ETH payments or multi-token baskets.

**Limitation:** Users cannot pay with native ETH or mix tokens in a single project.

**Rationale:** Simplifies contract logic and reduces gas costs. Most freelance payments use a single stablecoin.

**Future Enhancement:** Support ETH payments and multi-token milestone payments.

### 4. No Partial Milestone Delivery
**Current Implementation:** Milestones are atomic - either fully delivered/approved or disputed. No partial completion payments.

**Limitation:** Freelancers cannot receive partial payment for incomplete work.

**Rationale:** Clear state machine reduces edge cases. Users can create smaller milestones for granular payments.

**Future Enhancement:** Add partial delivery with prorated payments based on completion percentage.

### 5. No Emergency Stop/Pause Mechanism
**Current Implementation:** Once funded, contracts cannot be paused even if a critical bug is discovered.

**Limitation:** No ability to halt operations in case of security incidents.

**Rationale:** Simple logic reduces attack surface. Thorough testing and audit mitigate risk.

**Future Enhancement:** Add timelock + upgradeable proxy pattern for emergency interventions.

### 6. No Reputation/Rating System
**Current Implementation:** No on-chain reputation tracking for clients, freelancers, or arbiters.

**Limitation:** Users cannot verify counterparties' trustworthiness on-chain.

**Rationale:** Out of scope for MVP. Off-chain reputation systems (LinkedIn, Upwork) are sufficient initially.

**Future Enhancement:** Implement on-chain reputation scores and review system.

### 7. No Multi-Signature for Arbiter Decisions
**Current Implementation:** Arbiter can unilaterally resolve disputes without requiring multiple approvals.

**Limitation:** Single point of failure for dispute resolution decisions.

**Rationale:** Simplifies MVP. Users can deploy a multisig contract as the arbiter address if needed.

**Future Enhancement:** Built-in multi-signature requirement for dispute resolution.

### 8. No Appeal Mechanism
**Current Implementation:** Once arbiter resolves a dispute, the decision is final with no appeal process.

**Limitation:** Unfair dispute resolutions cannot be challenged.

**Rationale:** Keeps v1 simple. Parties can choose a reputable arbiter to mitigate this risk.

**Future Enhancement:** Add time-locked appeal window with higher-level arbitration.

### 9. Fixed Review Window per Project
**Current Implementation:** Review window is set at project creation and applies to all milestones equally.

**Limitation:** Cannot adjust review time for different milestone complexities.

**Rationale:** Simpler configuration. Most projects use consistent review periods.

**Future Enhancement:** Allow per-milestone review window customization.

### 10. No Cancellation After Funding
**Current Implementation:** Projects can only be cancelled if never funded. No mutual cancellation after work begins.

**Limitation:** Parties cannot mutually agree to cancel and refund after funding.

**Rationale:** Prevents rug-pull scenarios. Once funded, the contract must execute.

**Future Enhancement:** Add mutual cancellation with freelancer consent and refund logic.

## Design Philosophy

These limitations reflect a deliberate choice to ship a **functional, secure MVP** rather than a feature-complete but complex system. The core value proposition—trust-minimized milestone escrow—is fully delivered in v1.

**Security First:** Each limitation was evaluated against security implications. No scope cut compromises fund safety.

Each limitation is documented here to:
1. Be transparent about current capabilities
2. Guide future development priorities
3. Help users understand the system's boundaries
4. Demonstrate that these are intentional trade-offs, not oversights

## Security Considerations

Despite these limitations, Vaultwork v1 maintains strong security guarantees:
- All funds are held in smart contracts, not by trusted parties
- Reentrancy protection on all fund-moving functions
- Access control enforced on every state-changing function
- OpenZeppelin audited contracts for core functionality
- Comprehensive test coverage targeting 90%+

## Upgrade Path

The contract architecture is designed to be upgradeable:
- Factory pattern allows deploying new contract versions
- Minimal proxies enable gas-efficient upgrades
- Clear separation between factory and escrow contracts
- Events emitted for all state transitions enable off-chain indexing

Future versions can introduce new features while maintaining backward compatibility through the factory pattern.
