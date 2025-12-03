// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MockUSDC.sol";
import "../src/MockOracle.sol";
import "../src/CampaignFactory.sol";

/// @title FundIf Deployment Script
/// @notice Deploys all FundIf contracts to Base Sepolia testnet
/// @dev Run with: forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast
contract DeployFundIf is Script {
    
    // ============ Deployed Contract Addresses ============
    MockUSDC public usdc;
    MockOracle public oracle;
    CampaignFactory public factory;
    address public demoCampaign;

    function run() external {
        // ========================================
        // STEP 1: Load Configuration
        // ========================================
        // Load the deployer's private key from environment variable
        // This key controls all deployed contracts and pays for gas
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        // Derive the deployer address from the private key for logging
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("");
        console.log("========================================");
        console.log("FUNDIF DEPLOYMENT STARTING");
        console.log("========================================");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("");

        // ========================================
        // STEP 2: Start Transaction Broadcasting
        // ========================================
        // All transactions between startBroadcast and stopBroadcast
        // will be signed with the deployer's private key and sent to the network
        vm.startBroadcast(deployerPrivateKey);

        // ========================================
        // STEP 3: Deploy MockUSDC
        // ========================================
        // MockUSDC is a test ERC20 token that simulates USDC
        // It has a public mint() function so anyone can get test tokens
        // On mainnet, replace this with the real USDC address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // ========================================
        // STEP 4: Deploy MockOracle
        // ========================================
        // MockOracle simulates a prediction market oracle
        // Owner can call setOutcome(conditionId, result) to resolve predictions
        // On mainnet, integrate with UMA, Polymarket, or a real oracle
        oracle = new MockOracle();
        console.log("MockOracle deployed at:", address(oracle));

        // ========================================
        // STEP 5: Deploy CampaignFactory
        // ========================================
        // CampaignFactory creates and tracks all FundIf campaigns
        // It needs references to the USDC token and oracle for all campaigns
        factory = new CampaignFactory(address(usdc), address(oracle));
        console.log("CampaignFactory deployed at:", address(factory));

        // ========================================
        // STEP 6: Create Demo Campaign (Optional)
        // ========================================
        // Create a sample campaign to demonstrate the platform
        // This gives you something to test with immediately after deployment
        
        // Generate a unique condition ID by hashing a human-readable identifier
        // This ID links the campaign to a specific prediction market outcome
        bytes32 conditionId = keccak256(abi.encodePacked("pacific-treaty-2025"));
        
        // Campaign deadline: 30 days from deployment
        uint256 deadline = block.timestamp + 30 days;
        
        // Funding goal: 10,000 USDC (USDC has 6 decimals)
        uint256 goal = 10_000 * 1e6;
        
        // For demo purposes, funds go to deployer if successful
        // In production, this would be the actual project wallet
        address recipient = deployer;
        
        // Create the demo campaign through the factory
        demoCampaign = factory.createCampaign(
            "Fund Ocean Cleanup IF Pacific Treaty Passes",
            "This campaign will fund ocean cleanup efforts, but only if the Pacific Environmental Treaty passes by end of 2025. Your contribution is held in escrow - if the treaty passes, funds go to OceanCleanup.org. If it fails, you get a full refund.",
            goal,
            recipient,
            conditionId,
            deadline
        );
        console.log("Demo Campaign deployed at:", demoCampaign);

        // ========================================
        // STEP 7: Stop Transaction Broadcasting
        // ========================================
        // All contract deployments are complete
        vm.stopBroadcast();

        // ========================================
        // STEP 8: Print Deployment Summary
        // ========================================
        _printSummary();
    }

    /// @notice Prints a formatted summary of all deployed contracts
    /// @dev Called after all deployments are complete
    function _printSummary() internal view {
        console.log("");
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE - BASE SEPOLIA");
        console.log("========================================");
        console.log("");
        console.log("Contract Addresses:");
        console.log("-------------------");
        console.log("MockUSDC:        ", address(usdc));
        console.log("MockOracle:      ", address(oracle));
        console.log("CampaignFactory: ", address(factory));
        console.log("Demo Campaign:   ", demoCampaign);
        console.log("");
        console.log("========================================");
        console.log("Copy these to your frontend/.env.local:");
        console.log("========================================");
        console.log("");
        
        // Log in a format that's easy to copy-paste into .env files
        console.log("NEXT_PUBLIC_USDC_ADDRESS=", address(usdc));
        console.log("NEXT_PUBLIC_ORACLE_ADDRESS=", address(oracle));
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("NEXT_PUBLIC_DEMO_CAMPAIGN=", demoCampaign);
        console.log("");
        console.log("========================================");
        console.log("BaseScan Verification Links:");
        console.log("========================================");
        console.log("");
        console.log("https://sepolia.basescan.org/address/", address(usdc));
        console.log("https://sepolia.basescan.org/address/", address(oracle));
        console.log("https://sepolia.basescan.org/address/", address(factory));
        console.log("https://sepolia.basescan.org/address/", demoCampaign);
        console.log("");
        console.log("========================================");
    }
}