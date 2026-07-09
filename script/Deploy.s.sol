// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/EscrowFactory.sol";
import "../contracts/MilestoneEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory rpcUrl = vm.envString("RPC_URL");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MilestoneEscrow implementation
        MilestoneEscrow implementation = new MilestoneEscrow();
        console.log("MilestoneEscrow implementation deployed at:", address(implementation));

        // Deploy EscrowFactory
        EscrowFactory factory = new EscrowFactory(address(implementation));
        console.log("EscrowFactory deployed at:", address(factory));

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia");
        console.log("MilestoneEscrow Implementation:", address(implementation));
        console.log("EscrowFactory:", address(factory));
        console.log("\nTo verify on Basescan:");
        console.log("forge verify-contract", address(factory), "src/EscrowFactory.sol:EscrowFactory --chain-id 84532 --watch");
    }
}
