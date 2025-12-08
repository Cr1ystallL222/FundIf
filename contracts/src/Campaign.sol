// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOracle.sol";

/**
 * @title Campaign
 * @author Logan Staples
 * @notice Core escrow contract for a prediction-gated crowdfunding campaign
 */
contract Campaign {
    // ============ Type Declarations ============

    struct CampaignInfo {
        string title;
        string description;
        address creator;
        address recipient;
        uint256 goalAmount;
        uint256 totalFunded;
        uint256 deadline;
        bytes32 conditionId;
        string marketSlug;
        bool resolved;
        bool outcomeYes;
        bool withdrawn;
    }

    // ============ Immutable State Variables ============

    IERC20 public immutable usdc;
    IOracle public immutable oracle;

    // ============ Campaign Configuration State ============

    address public creator;
    address public recipient;
    string public title;
    string public description;
    uint256 public goalAmount;
    bytes32 public conditionId;
    string public marketSlug;
    uint256 public deadline;

    // ============ Funding Tracking State ============

    uint256 public totalFunded;
    
    uint256 public yieldGenerated; 

    mapping(address => uint256) public contributions;
    address[] public contributors;

    // ============ Resolution State ============

    bool public resolved;
    bool public outcomeYes;
    bool public withdrawn;
    mapping(address => bool) public refunded;

    // ============ Events ============

    event Funded(address indexed funder, uint256 amount, uint256 totalFunded);
    event Resolved(bool outcome);
    event Withdrawn(address indexed recipient, uint256 amount, uint256 yield);
    event Refunded(address indexed funder, uint256 amount);
    event YieldAccrued(uint256 amount);

    // ============ Constructor ============

    constructor(
        address _usdc,
        address _oracle,
        address _creator,
        address _recipient,
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        bytes32 _conditionId,
        string memory _marketSlug,
        uint256 _deadline
    ) {
        usdc = IERC20(_usdc);
        oracle = IOracle(_oracle);
        creator = _creator;
        recipient = _recipient;
        title = _title;
        description = _description;
        goalAmount = _goalAmount;
        conditionId = _conditionId;
        marketSlug = _marketSlug;
        deadline = _deadline;
    }

    // ============ Core External Functions ============

    function fund(uint256 amount) external {
        require(!resolved, "Campaign already resolved");
        require(block.timestamp < deadline, "Funding period ended");
        require(amount > 0, "Amount must be greater than 0");

        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += amount;
        totalFunded += amount;

        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        emit Funded(msg.sender, amount, totalFunded);
    }

    /* 
     * @notice Simulate Aave Yield
     * @dev Allows anyone to deposit extra USDC to simulate interest accrual
     * Pitch: "Our contract puts capital to work in Aave while waiting for resolution."
     */
    function simulateYield(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        require(success, "Yield transfer failed");
        
        yieldGenerated += amount;
        emit YieldAccrued(amount);
    }

    function resolve() external {
        require(!resolved, "Already resolved");
        require(oracle.isResolved(conditionId), "Oracle not resolved yet");

        resolved = true;
        outcomeYes = oracle.getOutcome(conditionId);

        emit Resolved(outcomeYes);
    }

    /* 
     * @notice RECIPIENT WITHDRAWAL (Includes Yield!)
     */
    function withdraw() external {
        require(resolved, "Not resolved yet");
        require(outcomeYes, "Outcome was NO");
        require(msg.sender == recipient, "Only recipient can withdraw");
        require(!withdrawn, "Already withdrawn");

        withdrawn = true;
        
        // RECIPIENT GETS PRINCIPAL + YIELD
        uint256 totalPayout = totalFunded + yieldGenerated;

        // Effect before interaction
        totalFunded = 0;
        yieldGenerated = 0;

        bool success = usdc.transfer(recipient, totalPayout);
        require(success, "USDC transfer failed");

        emit Withdrawn(recipient, totalPayout, yieldGenerated);
    }

    /* 
     * @notice MANUAL REFUND (For users)
     */
    function refund() external {
        require(resolved, "Not resolved yet");
        require(!outcomeYes, "Outcome was YES");
        require(contributions[msg.sender] > 0, "No contribution found");
        require(!refunded[msg.sender], "Already refunded");

        uint256 amount = contributions[msg.sender];
        refunded[msg.sender] = true;
        contributions[msg.sender] = 0;

        bool success = usdc.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");

        emit Refunded(msg.sender, amount);
    }

    /* 
     * @notice BATCH "PUSH" REFUND
     * @dev Allows backend to automatically push refunds to users
     * Pitch: Programmable wallets mean users don't have to claim refunds.
     */
    function adminBatchRefund(address[] calldata _contributors) external {
        require(resolved, "Not resolved yet");
        require(!outcomeYes, "Outcome was YES");
        
        // Open access for hackathon demo speed, or add require(msg.sender == creator)
        
        for (uint256 i = 0; i < _contributors.length; i++) {
            address contributor = _contributors[i];
            
            // Skip if already refunded
            if (!refunded[contributor] && contributions[contributor] > 0) {
                uint256 amount = contributions[contributor];
                
                // Update state
                refunded[contributor] = true;
                contributions[contributor] = 0;
                
                // Transfer
                require(usdc.transfer(contributor, amount), "Transfer failed");
                emit Refunded(contributor, amount);
            }
        }
    }

    // ============ View Functions ============

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getContribution(address funder) external view returns (uint256) {
        return contributions[funder];
    }

    function getCampaignInfo() external view returns (CampaignInfo memory info) {
        info = CampaignInfo({
            title: title,
            description: description,
            creator: creator,
            recipient: recipient,
            goalAmount: goalAmount,
            totalFunded: totalFunded,
            deadline: deadline,
            conditionId: conditionId,
            marketSlug: marketSlug,
            resolved: resolved,
            outcomeYes: outcomeYes,
            withdrawn: withdrawn
        });
    }
}