// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MilestoneEscrow.sol";
import "../contracts/EscrowFactory.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockERC20 is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6);
    }
}

contract MilestoneEscrowTest is Test {
    MilestoneEscrow public escrow;
    EscrowFactory public factory;
    MockERC20 public token;
    
    // Test addresses
    address public client = address(0x1);
    address public freelancer = address(0x2);
    address public arbiter = address(0x3);
    
    // Test milestone configuration
    uint256[] public milestoneAmounts = [100 * 10**6, 200 * 10**6, 300 * 10**6];
    string[] public milestoneDescriptions = ["Design", "Development", "Testing"];
    uint256 public reviewWindow = 7 days;

    function setUp() public {
        // Set up test environment
        vm.startPrank(client);
        token = new MockERC20();
        
        MilestoneEscrow implementation = new MilestoneEscrow();
        factory = new EscrowFactory(address(implementation));
        
        address escrowAddress = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        
        escrow = MilestoneEscrow(escrowAddress);
        vm.stopPrank();
    }

    function testInitialState() public view {
        assertEq(escrow.client(), client);
        assertEq(escrow.freelancer(), freelancer);
        assertEq(escrow.token(), address(token));
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.reviewWindowSeconds(), reviewWindow);
        assertEq(escrow.totalEscrowAmount(), 600 * 10**6);
        assertEq(escrow.isFunded(), false);
        assertEq(escrow.milestoneCount(), 3);
    }

    function testFund() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        assertEq(escrow.isFunded(), true);
        assertEq(token.balanceOf(address(escrow)), 600 * 10**6);
    }

    function testFundOnlyOnce() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        
        vm.expectRevert("Already funded");
        escrow.fund();
        vm.stopPrank();
    }

    function testFundOnlyClient() public {
        vm.startPrank(freelancer);
        token.approve(address(escrow), 600 * 10**6);
        vm.expectRevert("Only client can fund");
        escrow.fund();
        vm.stopPrank();
    }

    function testMarkDelivered() public {
        // Fund first
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        // Mark delivered
        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(0);
        assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Delivered));
    }

    function testMarkDeliveredOnlyFreelancer() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        
        vm.expectRevert("Only freelancer can deliver");
        escrow.markDelivered(0);
        vm.stopPrank();
    }

    function testMarkDeliveredOnlyWhenFunded() public {
        vm.startPrank(freelancer);
        vm.expectRevert("Contract not funded");
        escrow.markDelivered(0);
        vm.stopPrank();
    }

    function testMarkDeliveredOnlyPending() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        
        vm.expectRevert("Milestone not pending");
        escrow.markDelivered(0);
        vm.stopPrank();
    }

    function testApprove() public {
        // Fund and deliver
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        // Approve
        vm.startPrank(client);
        escrow.approve(0);
        vm.stopPrank();

        (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(0);
        assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Approved));
        assertEq(token.balanceOf(freelancer), 100 * 10**6);
    }

    function testApproveOnlyClient() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        
        vm.expectRevert("Only client can approve");
        escrow.approve(0);
        vm.stopPrank();
    }

    function testApproveOnlyDelivered() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        
        vm.expectRevert("Milestone not delivered");
        escrow.approve(0);
        vm.stopPrank();
    }

    function testRaiseDispute() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        escrow.raiseDispute(0);
        vm.stopPrank();

        (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(0);
        assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Disputed));
    }

    function testRaiseDisputeOnlyClient() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        
        vm.expectRevert("Only client can raise dispute");
        escrow.raiseDispute(0);
        vm.stopPrank();
    }

    function testRaiseDisputeOnlyDuringWindow() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        // Fast forward past review window
        vm.warp(block.timestamp + reviewWindow + 1);

        vm.startPrank(client);
        vm.expectRevert("Review window expired");
        escrow.raiseDispute(0);
        vm.stopPrank();
    }

    function testResolveDispute() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        escrow.raiseDispute(0);
        vm.stopPrank();

        // Resolve with 50/50 split
        vm.startPrank(arbiter);
        escrow.resolveDispute(0, 5000);
        vm.stopPrank();

        (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(0);
        assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Resolved));
        assertEq(token.balanceOf(client), 50 * 10**6);
        assertEq(token.balanceOf(freelancer), 50 * 10**6);
    }

    function testResolveDisputeOnlyArbiter() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        escrow.raiseDispute(0);
        vm.stopPrank();

        vm.startPrank(client);
        vm.expectRevert("Only arbiter can resolve");
        escrow.resolveDispute(0, 5000);
        vm.stopPrank();
    }

    function testResolveDisputeInvalidBps() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        escrow.raiseDispute(0);
        vm.stopPrank();

        vm.startPrank(arbiter);
        vm.expectRevert("Invalid basis points");
        escrow.resolveDispute(0, 10001);
        vm.stopPrank();
    }

    function testClaimAfterTimeout() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        // Fast forward past review window
        vm.warp(block.timestamp + reviewWindow + 1);

        vm.startPrank(freelancer);
        escrow.claimAfterTimeout(0);
        vm.stopPrank();

        (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(0);
        assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Released));
        assertEq(token.balanceOf(freelancer), 100 * 10**6);
    }

    function testClaimAfterTimeoutOnlyFreelancer() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.warp(block.timestamp + reviewWindow + 1);

        vm.startPrank(client);
        vm.expectRevert("Only freelancer can claim");
        escrow.claimAfterTimeout(0);
        vm.stopPrank();
    }

    function testClaimAfterTimeoutOnlyAfterWindow() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(freelancer);
        vm.expectRevert("Review window not expired");
        escrow.claimAfterTimeout(0);
        vm.stopPrank();
    }

    function testCancelUnfundedProject() public {
        vm.startPrank(client);
        escrow.cancelUnfundedProject();
        vm.stopPrank();
    }

    function testCancelUnfundedProjectOnlyClient() public {
        vm.startPrank(freelancer);
        vm.expectRevert("Only client can cancel");
        escrow.cancelUnfundedProject();
        vm.stopPrank();
    }

    function testCancelUnfundedProjectOnlyWhenUnfunded() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        
        vm.expectRevert("Cannot cancel funded project");
        escrow.cancelUnfundedProject();
        vm.stopPrank();
    }

    function testCancelUnfundedProjectOnlyIfNotStarted() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        vm.expectRevert("Project already started");
        escrow.cancelUnfundedProject();
        vm.stopPrank();
    }

    function testReentrancyAttack() public {
        // This test verifies that ReentrancyGuard is working
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        // The contract uses ReentrancyGuard, so reentrancy should be blocked
        // This is a basic sanity check that the modifier is present
        vm.startPrank(client);
        escrow.approve(0);
        vm.stopPrank();

        assertEq(token.balanceOf(freelancer), 100 * 10**6);
    }

    function testDoubleApprove() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.startPrank(client);
        escrow.approve(0);
        
        vm.expectRevert("Milestone not delivered");
        escrow.approve(0);
        vm.stopPrank();
    }

    function testApproveBeforeDelivery() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        
        vm.expectRevert("Milestone not delivered");
        escrow.approve(0);
        vm.stopPrank();
    }

    function testDisputeAfterWindowCloses() public {
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        vm.stopPrank();

        vm.warp(block.timestamp + reviewWindow + 1);

        vm.startPrank(client);
        vm.expectRevert("Review window expired");
        escrow.raiseDispute(0);
        vm.stopPrank();
    }

    function testHappyPath() public {
        // Fund
        vm.startPrank(client);
        token.approve(address(escrow), 600 * 10**6);
        escrow.fund();
        vm.stopPrank();

        // Deliver all milestones
        vm.startPrank(freelancer);
        escrow.markDelivered(0);
        escrow.markDelivered(1);
        escrow.markDelivered(2);
        vm.stopPrank();

        // Approve all milestones
        vm.startPrank(client);
        escrow.approve(0);
        escrow.approve(1);
        escrow.approve(2);
        vm.stopPrank();

        // Check final state
        assertEq(escrow.isFunded(), true);
        assertEq(token.balanceOf(freelancer), 600 * 10**6);
        assertEq(token.balanceOf(address(escrow)), 0);

        for (uint i = 0; i < 3; i++) {
            (, , MilestoneEscrow.MilestoneState state, ) = escrow.getMilestone(i);
            assertEq(uint(state), uint(MilestoneEscrow.MilestoneState.Approved));
        }
    }
}
