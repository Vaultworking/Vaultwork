// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EscrowFactory.sol";
import "../contracts/MilestoneEscrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6);
    }
}

contract EscrowFactoryTest is Test {
    EscrowFactory public factory;
    MilestoneEscrow public implementation;
    MockERC20 public token;
    
    address public client = address(0x1);
    address public freelancer = address(0x2);
    address public arbiter = address(0x3);
    
    uint256[] public milestoneAmounts = [100 * 10**6, 200 * 10**6];
    string[] public milestoneDescriptions = ["Design", "Development"];
    uint256 public reviewWindow = 7 days;

    function setUp() public {
        implementation = new MilestoneEscrow();
        factory = new EscrowFactory(address(implementation));
        token = new MockERC20();
    }

    function testInitialState() public view {
        assertEq(factory.implementation(), address(implementation));
        assertEq(factory.escrowCount(), 0);
    }

    function testCreateProject() public {
        vm.startPrank(client);
        address escrowAddress = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        assertTrue(escrowAddress != address(0));
        assertEq(factory.escrowCount(), 1);
        assertEq(factory.allEscrows(0), escrowAddress);
    }

    function testCreateProjectInvalidFreelancer() public {
        vm.startPrank(client);
        vm.expectRevert("Invalid freelancer address");
        factory.createProject(
            address(0),
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();
    }

    function testCreateProjectInvalidToken() public {
        vm.startPrank(client);
        vm.expectRevert("Invalid token address");
        factory.createProject(
            freelancer,
            address(0),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();
    }

    function testCreateProjectInvalidArbiter() public {
        vm.startPrank(client);
        vm.expectRevert("Invalid arbiter address");
        factory.createProject(
            freelancer,
            address(token),
            address(0),
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();
    }

    function testCreateProjectEmptyMilestones() public {
        vm.startPrank(client);
        vm.expectRevert("At least one milestone required");
        factory.createProject(
            freelancer,
            address(token),
            arbiter,
            new uint256[](0),
            new string[](0),
            reviewWindow
        );
        vm.stopPrank();
    }

    function testCreateProjectArrayMismatch() public {
        vm.startPrank(client);
        vm.expectRevert("Arrays length mismatch");
        factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            new string[](1),
            reviewWindow
        );
        vm.stopPrank();
    }

    function testGetEscrowsByClient() public {
        vm.startPrank(client);
        address escrow1 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        
        address escrow2 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        address[] memory clientEscrows = factory.getEscrowsByClient(client);
        assertEq(clientEscrows.length, 2);
        assertEq(clientEscrows[0], escrow1);
        assertEq(clientEscrows[1], escrow2);
    }

    function testGetEscrowsByFreelancer() public {
        vm.startPrank(client);
        address escrow1 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        
        address escrow2 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        address[] memory freelancerEscrows = factory.getEscrowsByFreelancer(freelancer);
        assertEq(freelancerEscrows.length, 2);
        assertEq(freelancerEscrows[0], escrow1);
        assertEq(freelancerEscrows[1], escrow2);
    }

    function testEscrowCount() public {
        assertEq(factory.escrowCount(), 0);

        vm.startPrank(client);
        factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        assertEq(factory.escrowCount(), 1);

        vm.startPrank(client);
        factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        assertEq(factory.escrowCount(), 2);
    }

    function testGetAllEscrows() public {
        vm.startPrank(client);
        address escrow1 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        
        address escrow2 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        address[] memory allEscrows = factory.getAllEscrows();
        assertEq(allEscrows.length, 2);
        assertEq(allEscrows[0], escrow1);
        assertEq(allEscrows[1], escrow2);
    }

    function testAllEscrowsIndexOutOfBounds() public {
        vm.startPrank(client);
        factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        vm.expectRevert("Index out of bounds");
        factory.allEscrows(1);
    }

    function testTransferOwnership() public {
        address newOwner = address(0x4);
        
        vm.startPrank(factory.owner());
        factory.transferOwnership(newOwner);
        vm.stopPrank();

        assertEq(factory.owner(), newOwner);
    }

    function testTransferOwnershipOnlyOwner() public {
        address newOwner = address(0x4);
        
        vm.startPrank(client);
        vm.expectRevert("Only owner can transfer");
        factory.transferOwnership(newOwner);
        vm.stopPrank();
    }

    function testTransferOwnershipInvalidAddress() public {
        vm.startPrank(factory.owner());
        vm.expectRevert("Invalid owner address");
        factory.transferOwnership(address(0));
        vm.stopPrank();
    }

    function testMinimalProxyGasEfficiency() public {
        vm.startPrank(client);
        
        // Deploy first escrow
        uint256 gasBefore1 = gasleft();
        address escrow1 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        uint256 gasAfter1 = gasleft();
        uint256 gasCost1 = gasBefore1 - gasAfter1;

        // Deploy second escrow (should be cheaper due to minimal proxy)
        uint256 gasBefore2 = gasleft();
        address escrow2 = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        uint256 gasAfter2 = gasleft();
        uint256 gasCost2 = gasBefore2 - gasAfter2;

        // Second deployment should be significantly cheaper
        assertLt(gasCost2, gasCost1);
        
        vm.stopPrank();
    }

    function testEscrowInitialization() public {
        vm.startPrank(client);
        address escrowAddress = factory.createProject(
            freelancer,
            address(token),
            arbiter,
            milestoneAmounts,
            milestoneDescriptions,
            reviewWindow
        );
        vm.stopPrank();

        MilestoneEscrow escrow = MilestoneEscrow(escrowAddress);

        assertEq(escrow.client(), client);
        assertEq(escrow.freelancer(), freelancer);
        assertEq(escrow.token(), address(token));
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.reviewWindowSeconds(), reviewWindow);
        assertEq(escrow.totalEscrowAmount(), 300 * 10**6);
        assertEq(escrow.milestoneCount(), 2);
    }
}
