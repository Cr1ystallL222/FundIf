// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "forge-std/Test.sol";
import "../src/CampaignFactory.sol";
import "../src/Campaign.sol";
import "../src/MockUSDC.sol";
import "../src/MockOracle.sol"; 


/**
 * @title FundIfTest
 * @notice Comprehensive test suite for FundIf prediction-gated crowdfunding platform
 * @dev Tests CampaignFactory and Campaign contracts on Base blockchain
 */
contract FundIfTest is Test {
    // ============ STATE VARIABLES ============
    
    // Core contracts
    MockUSDC public usdc;
    MockOracle public oracle;
    CampaignFactory public factory;
    
    // Test addresses
    address public owner;
    address public creator;
    address public recipient;
    address public funder1;
    address public funder2;
    address public funder3;
    
    // Test parameters
    bytes32 public conditionId;
    uint256 public deadline;
    uint256 public goalAmount;
    
    // Constants for readability
    uint256 constant FUNDER_INITIAL_BALANCE = 100_000 * 1e6; // 100,000 USDC
    uint256 constant DEFAULT_GOAL = 10_000 * 1e6;            // 10,000 USDC
    uint256 constant ONE_THOUSAND_USDC = 1_000 * 1e6;
    uint256 constant TWO_THOUSAND_USDC = 2_000 * 1e6;
    uint256 constant THREE_THOUSAND_USDC = 3_000 * 1e6;
    uint256 constant FIVE_THOUSAND_USDC = 5_000 * 1e6;
    
    // ============ EVENTS (redeclared for expectEmit) ============
    
    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string title,
        uint256 goalAmount,
        bytes32 conditionId,
        uint256 deadline
    );
    
    event Funded(address indexed funder, uint256 amount, uint256 totalFunded);
    event Resolved(bool outcome);
    event Withdrawn(address indexed recipient, uint256 amount);
    event Refunded(address indexed funder, uint256 amount);

    // ============ SETUP ============

    function setUp() public {
        // Create labeled addresses for better trace readability
        owner = makeAddr("owner");
        creator = makeAddr("creator");
        recipient = makeAddr("recipient");
        funder1 = makeAddr("funder1");
        funder2 = makeAddr("funder2");
        funder3 = makeAddr("funder3");
        
        // Deploy core contracts as owner
        vm.startPrank(owner);
        usdc = new MockUSDC();
        oracle = new MockOracle();
        factory = new CampaignFactory(address(usdc), address(oracle));
        vm.stopPrank();
        
        // Mint USDC to all funders (100,000 USDC each)
        usdc.mint(funder1, FUNDER_INITIAL_BALANCE);
        usdc.mint(funder2, FUNDER_INITIAL_BALANCE);
        usdc.mint(funder3, FUNDER_INITIAL_BALANCE);
        
        // Set default test parameters
        conditionId = keccak256("test-condition-1");
        deadline = block.timestamp + 7 days;
        goalAmount = DEFAULT_GOAL;
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @notice Creates a campaign via factory with default test parameters
     * @return campaign The deployed Campaign contract
     */
    function _createCampaign() internal returns (Campaign) {
        vm.prank(creator);
        address campaignAddr = factory.createCampaign(
            "Test Campaign",
            "Test Description for the campaign",
            goalAmount,
            recipient,
            conditionId,
            deadline
        );
        return Campaign(campaignAddr);
    }
    
    /**
     * @notice Creates a campaign with custom parameters
     * @param _title Campaign title
     * @param _conditionId Unique condition ID for oracle
     * @return campaign The deployed Campaign contract
     */
    function _createCampaignWithParams(
        string memory _title,
        bytes32 _conditionId
    ) internal returns (Campaign) {
        vm.prank(creator);
        address campaignAddr = factory.createCampaign(
            _title,
            "Test Description",
            goalAmount,
            recipient,
            _conditionId,
            deadline
        );
        return Campaign(campaignAddr);
    }
    
    /**
     * @notice Funds a campaign - handles approval and funding in one call
     * @param campaign The campaign to fund
     * @param funder The address providing funds
     * @param amount The amount of USDC to contribute
     */
    function _fundCampaign(Campaign campaign, address funder, uint256 amount) internal {
        vm.startPrank(funder);
        usdc.approve(address(campaign), amount);
        campaign.fund(amount);
        vm.stopPrank();
    }
    
    /**
     * @notice Resolves campaign condition to YES via oracle
     * @param campaign The campaign to resolve
     */
    function _resolveYes(Campaign campaign) internal {
        // Owner sets outcome in oracle
        vm.prank(owner);
        oracle.setOutcome(conditionId, true);
        
        // Anyone can trigger resolution read
        campaign.resolve();
    }
    
    /**
     * @notice Resolves campaign condition to NO via oracle
     * @param campaign The campaign to resolve
     */
    function _resolveNo(Campaign campaign) internal {
        // Owner sets outcome in oracle
        vm.prank(owner);
        oracle.setOutcome(conditionId, false);
        
        // Anyone can trigger resolution read
        campaign.resolve();
    }

    // ============ FACTORY TESTS ============
    
    /**
     * @notice Test 1: Verify campaign creation and storage
     */
    function test_CreateCampaign() public {
        vm.prank(creator);
        address campaignAddr = factory.createCampaign(
            "Test Campaign",
            "Test Description",
            goalAmount,
            recipient,
            conditionId,
            deadline
        );
        
        // Campaign address should be valid
        assertTrue(campaignAddr != address(0), "Campaign address should not be zero");
        
        // Campaign should be stored in factory
        address[] memory campaigns = factory.getCampaigns();
        assertEq(campaigns.length, 1, "Should have exactly 1 campaign");
        assertEq(campaigns[0], campaignAddr, "Stored campaign should match returned address");
        
        // Campaign count should update
        assertEq(factory.getCampaignCount(), 1, "Campaign count should be 1");
    }
    
    /**
     * @notice Test 2: Verify CampaignCreated event emission with correct data
     */
    function test_CreateCampaign_EmitsEvent() public {
        // We check indexed params: topic1 (skip campaign - unknown), topic2 (creator)
        // checkTopic1=false (campaign addr unknown), checkTopic2=true, checkTopic3=false, checkData=true
        vm.expectEmit(false, true, false, true, address(factory));
        
        emit CampaignCreated(
            address(0), // Placeholder - not checked
            creator,
            "Test Campaign",
            goalAmount,
            conditionId,
            deadline
        );
        
        vm.prank(creator);
        factory.createCampaign(
            "Test Campaign",
            "Test Description",
            goalAmount,
            recipient,
            conditionId,
            deadline
        );
    }
    
    /**
     * @notice Test 3: Create multiple campaigns and verify array retrieval
     */
    function test_GetCampaigns() public {
        // Create 3 campaigns with unique condition IDs
        vm.startPrank(creator);
        address c1 = factory.createCampaign(
            "Campaign 1", "Desc 1", goalAmount, recipient, 
            keccak256("condition-1"), deadline
        );
        address c2 = factory.createCampaign(
            "Campaign 2", "Desc 2", goalAmount, recipient, 
            keccak256("condition-2"), deadline
        );
        address c3 = factory.createCampaign(
            "Campaign 3", "Desc 3", goalAmount, recipient, 
            keccak256("condition-3"), deadline
        );
        vm.stopPrank();
        
        // Retrieve all campaigns
        address[] memory campaigns = factory.getCampaigns();
        
        // Verify array contents
        assertEq(campaigns.length, 3, "Should have 3 campaigns");
        assertEq(campaigns[0], c1, "First campaign mismatch");
        assertEq(campaigns[1], c2, "Second campaign mismatch");
        assertEq(campaigns[2], c3, "Third campaign mismatch");
    }
    
    /**
     * @notice Test 4: Verify filtering campaigns by creator address
     */
    function test_GetCampaignsByCreator() public {
        address creator2 = makeAddr("creator2");
        address creator3 = makeAddr("creator3");
        
        // Creator 1 creates 2 campaigns
        vm.startPrank(creator);
        factory.createCampaign("C1-1", "Desc", goalAmount, recipient, keccak256("c1-1"), deadline);
        factory.createCampaign("C1-2", "Desc", goalAmount, recipient, keccak256("c1-2"), deadline);
        vm.stopPrank();
        
        // Creator 2 creates 3 campaigns
        vm.startPrank(creator2);
        factory.createCampaign("C2-1", "Desc", goalAmount, recipient, keccak256("c2-1"), deadline);
        factory.createCampaign("C2-2", "Desc", goalAmount, recipient, keccak256("c2-2"), deadline);
        factory.createCampaign("C2-3", "Desc", goalAmount, recipient, keccak256("c2-3"), deadline);
        vm.stopPrank();
        
        // Creator 3 creates 1 campaign
        vm.prank(creator3);
        factory.createCampaign("C3-1", "Desc", goalAmount, recipient, keccak256("c3-1"), deadline);
        
        // Verify filtering returns correct counts
        address[] memory creator1Campaigns = factory.getCampaignsByCreator(creator);
        address[] memory creator2Campaigns = factory.getCampaignsByCreator(creator2);
        address[] memory creator3Campaigns = factory.getCampaignsByCreator(creator3);
        
        assertEq(creator1Campaigns.length, 2, "Creator1 should have 2 campaigns");
        assertEq(creator2Campaigns.length, 3, "Creator2 should have 3 campaigns");
        assertEq(creator3Campaigns.length, 1, "Creator3 should have 1 campaign");
    }
    
    /**
     * @notice Test 5: Verify pagination with getCampaignsRange
     */
    function test_GetCampaignsRange() public {
        // Create 5 campaigns
        address[] memory created = new address[](5);
        vm.startPrank(creator);
        for (uint256 i = 0; i < 5; i++) {
            created[i] = factory.createCampaign(
                string(abi.encodePacked("Campaign ", vm.toString(i))),
                "Description",
                goalAmount,
                recipient,
                keccak256(abi.encodePacked("condition-", i)),
                deadline
            );
        }
        vm.stopPrank();
        
        // Get range [1, 4) - should return indices 1, 2, 3
        address[] memory rangeCampaigns = factory.getCampaignsRange(1, 4);
        
        assertEq(rangeCampaigns.length, 3, "Range should return 3 campaigns");
        assertEq(rangeCampaigns[0], created[1], "First in range should be index 1");
        assertEq(rangeCampaigns[1], created[2], "Second in range should be index 2");
        assertEq(rangeCampaigns[2], created[3], "Third in range should be index 3");
    }
    
    /**
     * @notice Test 6: Verify isCampaign mapping correctly identifies campaigns
     */
    function test_IsCampaign() public {
        Campaign campaign = _createCampaign();
        
        // Valid campaign should return true
        assertTrue(factory.isCampaign(address(campaign)), "Should recognize valid campaign");
        
        // Random addresses should return false
        assertFalse(factory.isCampaign(address(0x1234)), "Should not recognize random address");
        assertFalse(factory.isCampaign(funder1), "Should not recognize funder as campaign");
        assertFalse(factory.isCampaign(address(usdc)), "Should not recognize USDC as campaign");
    }
    
    /**
     * @notice Test 7: Revert when creating campaign with zero goal amount
     */
    function test_Revert_CreateCampaign_ZeroGoal() public {
        vm.prank(creator);
        vm.expectRevert(); // Expect any revert
        factory.createCampaign(
            "Test Campaign",
            "Test Description",
            0, // Zero goal - should revert
            recipient,
            conditionId,
            deadline
        );
    }
    
    /**
     * @notice Test 8: Revert when creating campaign with zero recipient address
     */
    function test_Revert_CreateCampaign_ZeroRecipient() public {
        vm.prank(creator);
        vm.expectRevert();
        factory.createCampaign(
            "Test Campaign",
            "Test Description",
            goalAmount,
            address(0), // Zero recipient - should revert
            conditionId,
            deadline
        );
    }
    
    /**
     * @notice Test 9: Revert when creating campaign with past deadline
     */
    function test_Revert_CreateCampaign_PastDeadline() public {
        vm.prank(creator);
        vm.expectRevert();
        factory.createCampaign(
            "Test Campaign",
            "Test Description",
            goalAmount,
            recipient,
            conditionId,
            block.timestamp - 1 // Past deadline - should revert
        );
    }
    
    /**
     * @notice Test 10: Revert when creating campaign with empty title
     */
    function test_Revert_CreateCampaign_EmptyTitle() public {
        vm.prank(creator);
        vm.expectRevert();
        factory.createCampaign(
            "", // Empty title - should revert
            "Test Description",
            goalAmount,
            recipient,
            conditionId,
            deadline
        );
    }
    
    /**
     * @notice Test 11: Revert when creating campaign with empty description
     */
    function test_Revert_CreateCampaign_EmptyDescription() public {
        vm.prank(creator);
        vm.expectRevert();
        factory.createCampaign(
            "Test Campaign",
            "", // Empty description - should revert
            goalAmount,
            recipient,
            conditionId,
            deadline
        );
    }

    // ============ FUNDING TESTS ============
    
    /**
     * @notice Test 12: Single funder contributes successfully
     */
    function test_Fund() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = ONE_THOUSAND_USDC;
        
        uint256 funderBalanceBefore = usdc.balanceOf(funder1);
        uint256 campaignBalanceBefore = usdc.balanceOf(address(campaign));
        
        _fundCampaign(campaign, funder1, fundAmount);
        
        // Verify funder balance decreased
        assertEq(
            usdc.balanceOf(funder1), 
            funderBalanceBefore - fundAmount, 
            "Funder balance should decrease by fund amount"
        );
        
        // Verify campaign received funds
        assertEq(
            usdc.balanceOf(address(campaign)), 
            campaignBalanceBefore + fundAmount, 
            "Campaign should receive funds"
        );
        
        // Verify contribution is tracked
        assertEq(
            campaign.getContribution(funder1), 
            fundAmount, 
            "Contribution should be tracked correctly"
        );
    }
    
    /**
     * @notice Test 13: Multiple funders contribute to same campaign
     */
    function test_Fund_MultipleFunders() public {
        Campaign campaign = _createCampaign();
        
        // Three different funders contribute different amounts
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder2, TWO_THOUSAND_USDC);
        _fundCampaign(campaign, funder3, THREE_THOUSAND_USDC);
        
        // Verify each contribution is tracked separately
        assertEq(campaign.getContribution(funder1), ONE_THOUSAND_USDC, "Funder1 contribution mismatch");
        assertEq(campaign.getContribution(funder2), TWO_THOUSAND_USDC, "Funder2 contribution mismatch");
        assertEq(campaign.getContribution(funder3), THREE_THOUSAND_USDC, "Funder3 contribution mismatch");
        
        // Verify contributors array has all three
        address[] memory contributors = campaign.getContributors();
        assertEq(contributors.length, 3, "Should have exactly 3 contributors");
    }
    
    /**
     * @notice Test 14: Same funder contributes multiple times - amounts accumulate
     */
    function test_Fund_MultipleTimes() public {
        Campaign campaign = _createCampaign();
        
        // Same funder contributes twice
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder1, TWO_THOUSAND_USDC);
        
        // Verify contributions accumulate
        assertEq(
            campaign.getContribution(funder1), 
            THREE_THOUSAND_USDC, 
            "Contributions should accumulate"
        );
        
        // Verify contributor only appears once in array
        address[] memory contributors = campaign.getContributors();
        assertEq(contributors.length, 1, "Should have only 1 unique contributor");
        assertEq(contributors[0], funder1, "Contributor should be funder1");
    }
    
    /**
     * @notice Test 15: Verify Funded event emission
     */
    function test_Fund_EmitsEvent() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = ONE_THOUSAND_USDC;
        
        vm.startPrank(funder1);
        usdc.approve(address(campaign), fundAmount);
        
        // Expect Funded event with correct parameters
        vm.expectEmit(true, false, false, true, address(campaign));
        emit Funded(funder1, fundAmount, fundAmount);
        
        campaign.fund(fundAmount);
        vm.stopPrank();
    }
    
    /**
     * @notice Test 16: Verify totalFunded updates correctly with multiple contributions
     */
    function test_Fund_UpdatesTotalFunded() public {
        Campaign campaign = _createCampaign();
        
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder2, TWO_THOUSAND_USDC);
        _fundCampaign(campaign, funder1, 500 * 1e6); // funder1 adds more
        
        // Get campaign info to check totalFunded
        // --- FIX START ---
        // Store the struct result in a variable
        Campaign.CampaignInfo memory info = campaign.getCampaignInfo();
        uint256 totalFunded = info.totalFunded;
        // --- FIX END ---
        
        assertEq(
            totalFunded, 
            ONE_THOUSAND_USDC + TWO_THOUSAND_USDC + 500 * 1e6, 
            "Total funded should be sum of all contributions"
        );
    }
    
    /**
     * @notice Test 17: Verify getContributors returns correct array
     */
    function test_GetContributors() public {
        Campaign campaign = _createCampaign();
        
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder2, TWO_THOUSAND_USDC);
        
        address[] memory contributors = campaign.getContributors();
        
        assertEq(contributors.length, 2, "Should have 2 contributors");
        assertEq(contributors[0], funder1, "First contributor should be funder1");
        assertEq(contributors[1], funder2, "Second contributor should be funder2");
    }
    
    /**
     * @notice Test 18: Verify getContribution returns correct amounts
     */
    function test_GetContribution() public {
        Campaign campaign = _createCampaign();
        
        _fundCampaign(campaign, funder1, 1234 * 1e6);
        
        // Check contributor amount
        assertEq(campaign.getContribution(funder1), 1234 * 1e6, "Should return exact contribution");
        
        // Check non-contributor returns 0
        assertEq(campaign.getContribution(funder2), 0, "Non-contributor should return 0");
        assertEq(campaign.getContribution(address(0x9999)), 0, "Random address should return 0");
    }
    
    /**
     * @notice Test 19: Revert when funding with zero amount
     */
    function test_Revert_Fund_ZeroAmount() public {
        Campaign campaign = _createCampaign();
        
        vm.startPrank(funder1);
        usdc.approve(address(campaign), ONE_THOUSAND_USDC);
        
        vm.expectRevert();
        campaign.fund(0); // Zero amount should revert
        vm.stopPrank();
    }
    
    /**
     * @notice Test 20: Revert when funding after campaign is resolved
     */
    function test_Revert_Fund_AfterResolved() public {
        Campaign campaign = _createCampaign();
        
        // Fund and resolve the campaign
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _resolveYes(campaign);
        
        // Try to fund after resolution - should revert
        vm.startPrank(funder2);
        usdc.approve(address(campaign), ONE_THOUSAND_USDC);
        
        vm.expectRevert();
        campaign.fund(ONE_THOUSAND_USDC);
        vm.stopPrank();
    }
    
    /**
     * @notice Test 21: Revert when funding after deadline has passed
     */
    function test_Revert_Fund_AfterDeadline() public {
        Campaign campaign = _createCampaign();
        
        // Warp time past the deadline
        vm.warp(deadline + 1 seconds);
        
        vm.startPrank(funder1);
        usdc.approve(address(campaign), ONE_THOUSAND_USDC);
        
        vm.expectRevert();
        campaign.fund(ONE_THOUSAND_USDC);
        vm.stopPrank();
    }
    
    /**
     * @notice Test 22: Revert when USDC not approved before funding
     */
    function test_Revert_Fund_NoApproval() public {
        Campaign campaign = _createCampaign();
        
        // Try to fund without approving USDC first
        vm.prank(funder1);
        vm.expectRevert();
        campaign.fund(ONE_THOUSAND_USDC);
    }

    // ============ RESOLUTION TESTS ============
    
    /**
     * @notice Test 23: Resolve with YES outcome updates campaign state
     */
    function test_Resolve_Yes() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Resolve with YES outcome
        _resolveYes(campaign);
        
        // Verify campaign state
        Campaign.CampaignInfo memory info = campaign.getCampaignInfo();
        assertTrue(info.resolved, "Campaign should be marked as resolved");
        assertTrue(info.outcomeYes, "Outcome should be YES (true)");
    }
    
    /**
     * @notice Test 24: Resolve with NO outcome updates campaign state
     */
    function test_Resolve_No() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Resolve with NO outcome
        _resolveNo(campaign);
        
        // Verify campaign state
        Campaign.CampaignInfo memory info = campaign.getCampaignInfo();
        assertTrue(info.resolved, "Campaign should be marked as resolved");
        assertFalse(info.outcomeYes, "Outcome should be NO (false)");
    }
    
    /**
     * @notice Test 25: Verify Resolved event emission
     */
    function test_Resolve_EmitsEvent() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Set outcome in oracle
        vm.prank(owner);
        oracle.setOutcome(conditionId, true);
        
        // Expect Resolved event
        vm.expectEmit(false, false, false, true, address(campaign));
        emit Resolved(true);
        
        campaign.resolve();
    }
    
    /**
     * @notice Test 26: Revert when oracle hasn't resolved the condition yet
     */
    function test_Revert_Resolve_NotReady() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Oracle hasn't set outcome - resolution should fail
        vm.expectRevert();
        campaign.resolve();
    }
    
    /**
     * @notice Test 27: Revert when trying to resolve already resolved campaign
     */
    function test_Revert_Resolve_AlreadyResolved() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // First resolution succeeds
        _resolveYes(campaign);
        
        // Second resolution should revert
        vm.expectRevert();
        campaign.resolve();
    }

    // ============ WITHDRAW TESTS (YES OUTCOME) ============
    
    /**
     * @notice Test 28: Full withdrawal flow - fund, resolve YES, withdraw
     */
    function test_Withdraw() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = FIVE_THOUSAND_USDC;
        
        // Fund the campaign
        _fundCampaign(campaign, funder1, fundAmount);
        
        // Resolve with YES outcome
        _resolveYes(campaign);
        
        // Record balances before withdrawal
        uint256 recipientBalanceBefore = usdc.balanceOf(recipient);
        
        // Recipient withdraws
        vm.prank(recipient);
        campaign.withdraw();
        
        // Verify recipient received all funds
        assertEq(
            usdc.balanceOf(recipient), 
            recipientBalanceBefore + fundAmount, 
            "Recipient should receive all funds"
        );
        
        // Verify campaign is now empty
        assertEq(
            usdc.balanceOf(address(campaign)), 
            0, 
            "Campaign should be empty after withdrawal"
        );
    }
    
    /**
     * @notice Test 29: Verify Withdrawn event emission
     */
    function test_Withdraw_EmitsEvent() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = FIVE_THOUSAND_USDC;
        
        _fundCampaign(campaign, funder1, fundAmount);
        _resolveYes(campaign);
        
        // Expect Withdrawn event
        vm.expectEmit(true, false, false, true, address(campaign));
        emit Withdrawn(recipient, fundAmount);
        
        vm.prank(recipient);
        campaign.withdraw();
    }
    
    /**
     * @notice Test 30: Verify recipient receives full totalFunded amount
     */
    function test_Withdraw_FullAmount() public {
        Campaign campaign = _createCampaign();
        
        // Multiple funders contribute
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder2, TWO_THOUSAND_USDC);
        _fundCampaign(campaign, funder3, THREE_THOUSAND_USDC);
        
        uint256 totalContributed = ONE_THOUSAND_USDC + TWO_THOUSAND_USDC + THREE_THOUSAND_USDC;
        
        _resolveYes(campaign);
        
        uint256 recipientBalanceBefore = usdc.balanceOf(recipient);
        
        vm.prank(recipient);
        campaign.withdraw();
        
        // Recipient should receive the total from all funders
        assertEq(
            usdc.balanceOf(recipient), 
            recipientBalanceBefore + totalContributed, 
            "Recipient should receive total from all funders"
        );
    }
    
    /**
     * @notice Test 31: Revert when non-recipient tries to withdraw
     */
    function test_Revert_Withdraw_NotRecipient() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _resolveYes(campaign);
        
        // Funder tries to withdraw (not authorized)
        vm.prank(funder1);
        vm.expectRevert();
        campaign.withdraw();
        
        // Creator tries to withdraw (not authorized)
        vm.prank(creator);
        vm.expectRevert();
        campaign.withdraw();
    }
    
    /**
     * @notice Test 32: Revert when trying to withdraw before resolution
     */
    function test_Revert_Withdraw_NotResolved() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Campaign not resolved yet
        vm.prank(recipient);
        vm.expectRevert();
        campaign.withdraw();
    }
    
    /**
     * @notice Test 33: Revert when trying to withdraw after NO outcome
     */
    function test_Revert_Withdraw_OutcomeNo() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Resolve with NO outcome - recipient cannot withdraw
        _resolveNo(campaign);
        
        vm.prank(recipient);
        vm.expectRevert();
        campaign.withdraw();
    }
    
    /**
     * @notice Test 34: Revert when trying to withdraw twice
     */
    function test_Revert_Withdraw_Twice() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _resolveYes(campaign);
        
        // First withdrawal succeeds
        vm.prank(recipient);
        campaign.withdraw();
        
        // Second withdrawal should revert
        vm.prank(recipient);
        vm.expectRevert();
        campaign.withdraw();
    }

    // ============ REFUND TESTS (NO OUTCOME) ============
    
    /**
     * @notice Test 35: Full refund flow - fund, resolve NO, refund
     */
    function test_Refund() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = FIVE_THOUSAND_USDC;
        
        // Fund the campaign
        _fundCampaign(campaign, funder1, fundAmount);
        
        uint256 funderBalanceAfterFunding = usdc.balanceOf(funder1);
        
        // Resolve with NO outcome
        _resolveNo(campaign);
        
        // Funder claims refund
        vm.prank(funder1);
        campaign.refund();
        
        // Verify funder got their money back
        assertEq(
            usdc.balanceOf(funder1), 
            funderBalanceAfterFunding + fundAmount, 
            "Funder should receive full refund"
        );
    }
    
    /**
     * @notice Test 36: Multiple funders all receive refunds
     */
    function test_Refund_MultipleFunders() public {
        Campaign campaign = _createCampaign();
        
        // Three funders contribute
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _fundCampaign(campaign, funder2, TWO_THOUSAND_USDC);
        _fundCampaign(campaign, funder3, THREE_THOUSAND_USDC);
        
        _resolveNo(campaign);
        
        // All funders claim refunds
        vm.prank(funder1);
        campaign.refund();
        
        vm.prank(funder2);
        campaign.refund();
        
        vm.prank(funder3);
        campaign.refund();
        
        // Campaign should be completely empty
        assertEq(
            usdc.balanceOf(address(campaign)), 
            0, 
            "Campaign should be empty after all refunds"
        );
    }
    
    /**
     * @notice Test 37: Verify each funder receives their exact contribution
     */
    function test_Refund_CorrectAmounts() public {
        Campaign campaign = _createCampaign();
        
        uint256 amount1 = 1234 * 1e6;
        uint256 amount2 = 2567 * 1e6;
        uint256 amount3 = 3891 * 1e6;
        
        _fundCampaign(campaign, funder1, amount1);
        _fundCampaign(campaign, funder2, amount2);
        _fundCampaign(campaign, funder3, amount3);
        
        _resolveNo(campaign);
        
        // Record balances before refunds
        uint256 balance1Before = usdc.balanceOf(funder1);
        uint256 balance2Before = usdc.balanceOf(funder2);
        uint256 balance3Before = usdc.balanceOf(funder3);
        
        // All claim refunds
        vm.prank(funder1);
        campaign.refund();
        vm.prank(funder2);
        campaign.refund();
        vm.prank(funder3);
        campaign.refund();
        
        // Verify each received exactly their contribution
        assertEq(usdc.balanceOf(funder1), balance1Before + amount1, "Funder1 refund incorrect");
        assertEq(usdc.balanceOf(funder2), balance2Before + amount2, "Funder2 refund incorrect");
        assertEq(usdc.balanceOf(funder3), balance3Before + amount3, "Funder3 refund incorrect");
    }
    
    /**
     * @notice Test 38: Verify Refunded event emission
     */
    function test_Refund_EmitsEvent() public {
        Campaign campaign = _createCampaign();
        uint256 fundAmount = ONE_THOUSAND_USDC;
        
        _fundCampaign(campaign, funder1, fundAmount);
        _resolveNo(campaign);
        
        // Expect Refunded event
        vm.expectEmit(true, false, false, true, address(campaign));
        emit Refunded(funder1, fundAmount);
        
        vm.prank(funder1);
        campaign.refund();
    }
    
    /**
     * @notice Test 39: Revert when trying to refund before resolution
     */
    function test_Revert_Refund_NotResolved() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Campaign not resolved yet
        vm.prank(funder1);
        vm.expectRevert();
        campaign.refund();
    }
    
    /**
     * @notice Test 40: Revert when trying to refund after YES outcome
     */
    function test_Revert_Refund_OutcomeYes() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        
        // Resolve with YES outcome - funders cannot refund
        _resolveYes(campaign);
        
        vm.prank(funder1);
        vm.expectRevert();
        campaign.refund();
    }
    
    /**
     * @notice Test 41: Revert when caller never contributed
     */
    function test_Revert_Refund_NoContribution() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _resolveNo(campaign);
        
        // Funder2 never contributed but tries to refund
        vm.prank(funder2);
        vm.expectRevert();
        campaign.refund();
    }
    
    /**
     * @notice Test 42: Revert when trying to refund twice
     */
    function test_Revert_Refund_Twice() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, ONE_THOUSAND_USDC);
        _resolveNo(campaign);
        
        // First refund succeeds
        vm.prank(funder1);
        campaign.refund();
        
        // Second refund should revert
        vm.prank(funder1);
        vm.expectRevert();
        campaign.refund();
    }

    // ============ CAMPAIGN INFO TESTS ============
    
    /**
     * @notice Test 43: Verify getCampaignInfo returns all fields correctly
     */
    function test_GetCampaignInfo() public {
        Campaign campaign = _createCampaign();
        _fundCampaign(campaign, funder1, FIVE_THOUSAND_USDC);
        
        // Do not destructure. Assign to struct variable.
        Campaign.CampaignInfo memory info = campaign.getCampaignInfo();
        
        // Verify fields using dot notation
        assertEq(info.title, "Test Campaign", "Title mismatch");
        assertEq(info.description, "Test Description for the campaign", "Description mismatch");
        assertEq(info.goalAmount, goalAmount, "Goal amount mismatch");
        assertEq(info.recipient, recipient, "Recipient mismatch");
        assertEq(info.totalFunded, FIVE_THOUSAND_USDC, "Total funded mismatch");
        assertEq(info.deadline, deadline, "Deadline mismatch");
        assertFalse(info.resolved, "Should not be resolved initially");
        assertFalse(info.outcomeYes, "Outcome should be false initially");
        assertEq(info.conditionId, conditionId, "Condition ID mismatch");
    }
}