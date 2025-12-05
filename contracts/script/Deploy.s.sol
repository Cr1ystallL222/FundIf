// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/CampaignFactory.sol";

contract DeployFundIf is Script {
    
    CampaignFactory public factory;

    function run() external {
        // 1. Load Deployer
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying with address:", deployer);

        // 2. Load Existing Dependencies
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        address oracleAddress = vm.envAddress("ORACLE_ADDRESS");

        require(usdcAddress != address(0), "USDC_ADDRESS not set in .env");
        require(oracleAddress != address(0), "ORACLE_ADDRESS not set in .env");

        console.log("Linking to existing USDC:", usdcAddress);
        console.log("Linking to existing Oracle:", oracleAddress);

        // 3. Start Transaction
        vm.startBroadcast(deployerPrivateKey);

        // 4. Deploy CampaignFactory
        // This includes the new Campaign.sol logic automatically
        factory = new CampaignFactory(usdcAddress, oracleAddress);
        
        vm.stopBroadcast();

        // 5. Summary
        console.log("");
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("New CampaignFactory: ", address(factory));
        console.log("========================================");
        console.log("Update your frontend/.env.local:");
        console.log("NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("========================================");
    }
}