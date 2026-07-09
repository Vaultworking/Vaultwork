// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./MilestoneEscrow.sol";

/**
 * @title EscrowFactory
 * @dev Factory for deploying MilestoneEscrow instances using EIP-1167 minimal proxies
 * @notice Gas-efficient deployment of escrow contracts
 * @custom:security-contact security@vaultwork.io
 */
contract EscrowFactory {
    using Clones for address;

    // Implementation contract address for minimal proxy pattern
    address public immutable implementation;
    // Factory owner who can transfer ownership
    address public owner;

    // Mappings for off-chain indexing
    // These allow efficient querying of escrows by participant
    mapping(address => address[]) private _escrowsByClient;
    mapping(address => address[]) private _escrowsByFreelancer;
    address[] private _allEscrows;

    // Event emitted when a new escrow project is created
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

    // Event emitted when factory ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Constructor sets the implementation contract
     * @notice Deployer becomes initial owner
     * @param _implementation Address of the MilestoneEscrow implementation
     */
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation address");
        implementation = _implementation;
        owner = msg.sender;
    }

    /**
     * @dev Create a new escrow project
     * @notice Caller becomes the client of the escrow
     * @param freelancer Freelancer address
     * @param token ERC20 token address
     * @param arbiter Arbiter address
     * @param milestoneAmounts Array of milestone amounts
     * @param milestoneDescriptions Array of milestone descriptions
     * @param reviewWindowSeconds Review window duration in seconds
     * @return escrowAddress Address of the newly deployed escrow
     */
    function createProject(
        address freelancer,
        address token,
        address arbiter,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions,
        uint256 reviewWindowSeconds
    ) external returns (address escrowAddress) {
        require(freelancer != address(0), "Invalid freelancer address");
        require(token != address(0), "Invalid token address");
        require(arbiter != address(0), "Invalid arbiter address");
        require(milestoneAmounts.length > 0, "At least one milestone required");
        require(milestoneAmounts.length == milestoneDescriptions.length, "Arrays length mismatch");

        // Calculate total amount for event
        uint256 totalAmount;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            totalAmount += milestoneAmounts[i];
        }

        // Deploy minimal proxy
        escrowAddress = implementation.clone();

        // Initialize the proxy
        MilestoneEscrow(escrowAddress).initialize(
            msg.sender, // client
            freelancer,
            token,
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindowSeconds
        );

        // Update mappings
        _escrowsByClient[msg.sender].push(escrowAddress);
        _escrowsByFreelancer[freelancer].push(escrowAddress);
        _allEscrows.push(escrowAddress);

        emit ProjectCreated(
            escrowAddress,
            msg.sender,
            freelancer,
            token,
            arbiter,
            totalAmount,
            milestoneAmounts.length,
            reviewWindowSeconds,
            block.timestamp
        );
    }

    /**
     * @dev Get all escrows for a specific client
     * @param client Client address
     * @return Array of escrow addresses where client is the payer
     */
    function getEscrowsByClient(address client) external view returns (address[] memory) {
        return _escrowsByClient[client];
    }

    /**
     * @dev Get all escrows for a specific freelancer
     * @param freelancer Freelancer address
     * @return Array of escrow addresses where freelancer is the payee
     */
    function getEscrowsByFreelancer(address freelancer) external view returns (address[] memory) {
        return _escrowsByFreelancer[freelancer];
    }

    /**
     * @dev Get total number of escrows created by this factory
     * @return Total escrow count across all users
     */
    function escrowCount() external view returns (uint256) {
        return _allEscrows.length;
    }

    /**
     * @dev Get escrow address by index
     * @notice Useful for paginating through all escrows
     * @param index Index in all escrows array
     * @return Escrow address at the given index
     */
    function allEscrows(uint256 index) external view returns (address) {
        require(index < _allEscrows.length, "Index out of bounds");
        return _allEscrows[index];
    }

    /**
     * @dev Get all escrows
     * @notice Returns complete list of all escrow addresses
     * @return Array of all escrow addresses
     */
    function getAllEscrows() external view returns (address[] memory) {
        return _allEscrows;
    }

    /**
     * @dev Transfer ownership of factory
     * @notice Only callable by current owner
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "Only owner can transfer");
        require(newOwner != address(0), "Invalid owner address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
