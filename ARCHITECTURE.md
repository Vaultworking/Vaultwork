# VoltWork Contract Architecture

## State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                     Milestone State Machine                      │
└─────────────────────────────────────────────────────────────────┘

    Pending ──(markDelivered)──► Delivered
        │                              │
        │                              │
        │                              ▼
        │                         (review window)
        │                              │
        │                              ├─────────(timeout)───► Released
        │                              │
        │                              ▼
        │                         (approve)───► Released
        │                              │
        │                              ▼
        │                         (raiseDispute)──► Disputed
        │                                                   │
        │                                                   ▼
        │                                            (resolveDispute)──► Resolved
        │
        └──(cancelUnfundedProject)──► Cancelled (only if never funded)
```

## Contract Interfaces

### IMilestoneEscrow.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMilestoneEscrow {
    enum MilestoneState {
        Pending,      // Initial state, awaiting delivery
        Delivered,    // Freelancer marked as delivered, in review window
        Approved,     // Client approved, funds released
        Disputed,     // Dispute raised, awaiting arbiter resolution
        Resolved,     // Arbiter resolved dispute, funds split
        Released      // Funds released to freelancer
    }

    struct Milestone {
        uint256 amount;
        string description;
        MilestoneState state;
        uint256 deliveryTimestamp;
    }

    // Events
    event Funded(address indexed client, uint256 totalAmount, uint256 timestamp);
    event MilestoneDelivered(uint256 indexed milestoneIndex, address indexed freelancer, uint256 timestamp);
    event MilestoneApproved(uint256 indexed milestoneIndex, address indexed client, uint256 amount, uint256 timestamp);
    event DisputeRaised(uint256 indexed milestoneIndex, address indexed client, uint256 timestamp);
    event DisputeResolved(uint256 indexed milestoneIndex, address indexed arbiter, uint256 clientAmount, uint256 freelancerAmount, uint256 timestamp);
    event FundsReleased(uint256 indexed milestoneIndex, address indexed freelancer, uint256 amount, uint256 timestamp);
    event ProjectCancelled(address indexed client, uint256 timestamp);

    // View functions
    function client() external view returns (address);
    function freelancer() external view returns (address);
    function token() external view returns (address);
    function arbiter() external view returns (address);
    function reviewWindowSeconds() external view returns (uint256);
    function isFunded() external view returns (bool);
    function totalEscrowAmount() external view returns (uint256);
    function milestones(uint256 index) external view returns (Milestone memory);
    function milestoneCount() external view returns (uint256);

    // State-changing functions
    function fund() external;
    function markDelivered(uint256 milestoneIndex) external;
    function approve(uint256 milestoneIndex) external;
    function raiseDispute(uint256 milestoneIndex) external;
    function resolveDispute(uint256 milestoneIndex, uint256 clientBps) external;
    function claimAfterTimeout(uint256 milestoneIndex) external;
    function cancelUnfundedProject() external;
}
```

### IEscrowFactory.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEscrowFactory {
    event ProjectCreated(
        address indexed escrowAddress,
        address indexed client,
        address indexed freelancer,
        address token,
        address arbiter,
        uint256 totalAmount,
        uint256 milestoneCount,
        uint256 reviewWindowSeconds,
        uint256 timestamp
    );

    function createProject(
        address freelancer,
        address token,
        address arbiter,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions,
        uint256 reviewWindowSeconds
    ) external returns (address escrowAddress);

    function getEscrowsByClient(address client) external view returns (address[] memory);
    function getEscrowsByFreelancer(address freelancer) external view returns (address[] memory);
    function escrowCount() external view returns (uint256);
    function allEscrows(uint256 index) external view returns (address);
}
```

## Design Decisions Review

### Decisions That Are Sound
1. **Single arbiter per project** - Appropriate for MVP, interface allows future upgrade to contract-based arbitration
2. **No dispute bonds** - Reasonable scope cut for v1, documented in KNOWN_LIMITATIONS.md
3. **Single ERC20 token per project** - Simplifies logic, multi-token adds complexity without clear benefit for MVP
4. **Atomic milestones** - Clear and predictable, partial delivery can be added later as multiple smaller milestones
5. **EIP-1167 minimal proxies** - Gas-efficient pattern, well-tested by OpenZeppelin
6. **Review window with auto-release** - Protects freelancer from client inaction
7. **Client can cancel unfunded projects** - Prevents abandoned contracts from cluttering the chain

### Potential Concerns to Flag

**1. Arbiter Power Concentration**
- Single arbiter has significant power (can split funds arbitrarily)
- Mitigation: Document clearly, recommend using multisig or DAO as arbiter address
- Future: Could add time-lock on arbiter decisions or appeal mechanism

**2. No Partial Milestone Delivery**
- If a milestone is 90% complete but client rejects it, freelancer gets nothing
- Mitigation: Encourage smaller milestone granules in documentation
- Future: Could add "partial approval" with prorated payment

**3. Dispute Timing**
- Client can raise dispute at any time during review window
- No mechanism for freelancer to withdraw delivery if client is unresponsive
- Mitigation: Auto-release after timeout protects freelancer

**4. Token Approval Flow**
- Client must approve token transfer separately before calling fund()
- This is standard pattern but adds UX friction
- Mitigation: Frontend should handle approval + fund in sequence

**5. No Emergency Stop**
- Once funded, no way to pause contract if critical bug found
- Mitigation: Thorough testing, simple logic reduces attack surface
- Future: Could add timelock + upgradeable pattern

**Recommendation**: All design decisions are appropriate for an MVP. The flagged items are intentional trade-offs for simplicity, not flaws. Proceed with implementation as specified.
