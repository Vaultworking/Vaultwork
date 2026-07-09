// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MilestoneEscrow
 * @dev Trust-minimized escrow for freelance milestone payments
 * @notice One contract per project, deployed via EscrowFactory
 * @custom:security-contact security@vaultwork.io
 */
contract MilestoneEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

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

    // Parameters (storage for minimal proxy pattern)
    // These are stored in regular storage instead of immutable to support EIP-1167 minimal proxies
    address public client;
    address public freelancer;
    address public token;
    address public arbiter;
    uint256 public reviewWindowSeconds;
    uint256 public totalEscrowAmount;

    // State variables
    bool public isFunded;
    Milestone[] public milestones;

    // Events - emitted for all state transitions
    event Funded(address indexed client, uint256 totalAmount, uint256 timestamp);
    event MilestoneDelivered(uint256 indexed milestoneIndex, address indexed freelancer, uint256 timestamp);
    event MilestoneApproved(uint256 indexed milestoneIndex, address indexed client, uint256 amount, uint256 timestamp);
    event DisputeRaised(uint256 indexed milestoneIndex, address indexed client, uint256 timestamp);
    event DisputeResolved(uint256 indexed milestoneIndex, address indexed arbiter, uint256 clientAmount, uint256 freelancerAmount, uint256 timestamp);
    event FundsReleased(uint256 indexed milestoneIndex, address indexed freelancer, uint256 amount, uint256 timestamp);
    event ProjectCancelled(address indexed client, uint256 timestamp);

    /**
     * @dev Constructor for implementation contract
     * @notice No parameters to support EIP-1167 minimal proxy pattern
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Initialize function for minimal proxy pattern
     * @notice Called immediately after deployment of minimal proxy
     * @param _client Client address who funds the escrow
     * @param _freelancer Freelancer address who receives payments
     * @param _token ERC20 token address for payments
     * @param _arbiter Arbiter address for dispute resolution
     * @param _milestoneAmounts Array of milestone amounts
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _reviewWindowSeconds Review window duration in seconds
     */
    function initialize(
        address _client,
        address _freelancer,
        address _token,
        address _arbiter,
        uint256[] memory _milestoneAmounts,
        string[] memory _milestoneDescriptions,
        uint256 _reviewWindowSeconds
    ) external {
        require(owner() == address(0), "Already initialized");
        require(_client != address(0), "Invalid client address");
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_token != address(0), "Invalid token address");
        require(_arbiter != address(0), "Invalid arbiter address");
        require(_milestoneAmounts.length > 0, "At least one milestone required");
        require(_milestoneAmounts.length == _milestoneDescriptions.length, "Arrays length mismatch");
        require(_reviewWindowSeconds > 0, "Review window must be positive");

        _transferOwnership(_client);

        // Store immutable parameters in storage (since we can't use immutable with initialize)
        assembly {
            sstore(client.slot, _client)
            sstore(freelancer.slot, _freelancer)
            sstore(token.slot, _token)
            sstore(arbiter.slot, _arbiter)
            sstore(reviewWindowSeconds.slot, _reviewWindowSeconds)
        }

        uint256 totalAmount;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            require(_milestoneAmounts[i] > 0, "Milestone amount must be positive");
            totalAmount += _milestoneAmounts[i];
            milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                description: _milestoneDescriptions[i],
                state: MilestoneState.Pending,
                deliveryTimestamp: 0
            }));
        }
        
        assembly {
            sstore(totalEscrowAmount.slot, totalAmount)
        }
    }

    /**
     * @dev Client deposits total escrow amount
     * @notice Only callable once by client after approving token transfer
     * @notice Transfers totalEscrowAmount from client to contract
     */
    function fund() external nonReentrant {
        require(msg.sender == client, "Only client can fund");
        require(!isFunded, "Already funded");

        isFunded = true;
        IERC20(token).safeTransferFrom(client, address(this), totalEscrowAmount);

        emit Funded(client, totalEscrowAmount, block.timestamp);
    }

    /**
     * @dev Freelancer marks milestone as delivered
     * @notice Starts the review window for this milestone
     * @param milestoneIndex Index of milestone to mark as delivered
     */
    function markDelivered(uint256 milestoneIndex) external nonReentrant {
        require(msg.sender == freelancer, "Only freelancer can deliver");
        require(isFunded, "Contract not funded");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].state == MilestoneState.Pending, "Milestone not pending");

        milestones[milestoneIndex].state = MilestoneState.Delivered;
        milestones[milestoneIndex].deliveryTimestamp = block.timestamp;

        emit MilestoneDelivered(milestoneIndex, freelancer, block.timestamp);
    }

    /**
     * @dev Client approves milestone and releases payment
     * @notice Transfers milestone amount to freelancer
     * @param milestoneIndex Index of milestone to approve
     */
    function approve(uint256 milestoneIndex) external nonReentrant {
        require(msg.sender == client, "Only client can approve");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].state == MilestoneState.Delivered, "Milestone not delivered");

        _releaseMilestone(milestoneIndex);
        milestones[milestoneIndex].state = MilestoneState.Approved;

        emit MilestoneApproved(milestoneIndex, client, milestones[milestoneIndex].amount, block.timestamp);
    }

    /**
     * @dev Client raises dispute during review window
     * @notice Must be called before review window expires
     * @param milestoneIndex Index of milestone to dispute
     */
    function raiseDispute(uint256 milestoneIndex) external {
        require(msg.sender == client, "Only client can raise dispute");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].state == MilestoneState.Delivered, "Milestone not delivered");
        
        uint256 deliveryTime = milestones[milestoneIndex].deliveryTimestamp;
        require(block.timestamp < deliveryTime + reviewWindowSeconds, "Review window expired");

        milestones[milestoneIndex].state = MilestoneState.Disputed;

        emit DisputeRaised(milestoneIndex, client, block.timestamp);
    }

    /**
     * @dev Arbiter resolves dispute by splitting funds
     * @notice clientBps = 10000 gives all to client, 0 gives all to freelancer
     * @param milestoneIndex Index of disputed milestone
     * @param clientBps Basis points (0-10000) for client share
     */
    function resolveDispute(uint256 milestoneIndex, uint256 clientBps) external nonReentrant {
        require(msg.sender == arbiter, "Only arbiter can resolve");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].state == MilestoneState.Disputed, "Milestone not disputed");
        require(clientBps <= 10000, "Invalid basis points");

        uint256 amount = milestones[milestoneIndex].amount;
        uint256 clientAmount = (amount * clientBps) / 10000;
        uint256 freelancerAmount = amount - clientAmount;

        if (clientAmount > 0) {
            IERC20(token).safeTransfer(client, clientAmount);
        }
        if (freelancerAmount > 0) {
            IERC20(token).safeTransfer(freelancer, freelancerAmount);
        }

        milestones[milestoneIndex].state = MilestoneState.Resolved;

        emit DisputeResolved(milestoneIndex, arbiter, clientAmount, freelancerAmount, block.timestamp);
    }

    /**
     * @dev Freelancer claims funds after review window expires
     * @notice Auto-releases milestone if client doesn't approve or dispute
     * @param milestoneIndex Index of milestone to claim
     */
    function claimAfterTimeout(uint256 milestoneIndex) external nonReentrant {
        require(msg.sender == freelancer, "Only freelancer can claim");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(milestones[milestoneIndex].state == MilestoneState.Delivered, "Milestone not delivered");

        uint256 deliveryTime = milestones[milestoneIndex].deliveryTimestamp;
        require(block.timestamp >= deliveryTime + reviewWindowSeconds, "Review window not expired");

        _releaseMilestone(milestoneIndex);
        milestones[milestoneIndex].state = MilestoneState.Released;

        emit FundsReleased(milestoneIndex, freelancer, milestones[milestoneIndex].amount, block.timestamp);
    }

    /**
     * @dev Client cancels unfunded project
     * @notice Allows client to cancel before funding
     * @notice Only callable if contract was never funded
     */
    function cancelUnfundedProject() external {
        require(msg.sender == client, "Only client can cancel");
        require(!isFunded, "Cannot cancel funded project");

        // Check if any milestone was delivered
        for (uint256 i = 0; i < milestones.length; i++) {
            require(milestones[i].state == MilestoneState.Pending, "Project already started");
        }

        emit ProjectCancelled(client, block.timestamp);
    }

    /**
     * @dev Internal function to release milestone payment to freelancer
     * @notice Sets milestone state to Released
     * @param milestoneIndex Index of milestone to release
     */
    function _releaseMilestone(uint256 milestoneIndex) internal {
        uint256 amount = milestones[milestoneIndex].amount;
        IERC20(token).safeTransfer(freelancer, amount);
        milestones[milestoneIndex].state = MilestoneState.Released;
        emit FundsReleased(milestoneIndex, freelancer, amount, block.timestamp);
    }

    // View functions for off-chain indexing

    /**
     * @dev Get milestone count
     * @return Total number of milestones in the project
     */
    function milestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    /**
     * @dev Get milestone details
     * @param index Milestone index
     * @return Milestone struct containing amount, description, state, and delivery timestamp
     */
    function getMilestone(uint256 index) external view returns (Milestone memory) {
        require(index < milestones.length, "Invalid milestone index");
        return milestones[index];
    }

    /**
     * @dev Get all milestones
     * @return Array of all milestone structs
     */
    function getAllMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }
}
