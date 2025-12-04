// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOracle.sol";

/**
 * @title Campaign
 * @author FundIf Team
 * @notice Core escrow contract for a prediction-gated crowdfunding campaign on Base
 * @dev This contract holds USDC contributions until a linked prediction market resolves.
 *      If the prediction resolves YES, funds are released to the designated recipient.
 *      If it resolves NO, all contributors can claim full refunds.
 *      Implements "Kickstarter meets Polymarket" - conditional crowdfunding based on real-world outcomes.
 */
contract Campaign {
    // ============ Type Declarations ============

    /**
     * @notice Comprehensive campaign information struct for efficient frontend queries
     * @dev Returned by getCampaignInfo() to minimize RPC calls
     * @param title Human-readable campaign title
     * @param description Detailed campaign description
     * @param creator Address that deployed this campaign via factory
     * @param recipient Address receiving funds on YES outcome
     * @param goalAmount Target funding amount in USDC (6 decimals)
     * @param totalFunded Current total contributions received
     * @param deadline Unix timestamp when funding period ends
     * @param conditionId Polymarket prediction market condition identifier
     * @param resolved Whether the oracle has determined the outcome
     * @param outcomeYes The resolved outcome (true=YES, false=NO)
     * @param withdrawn Whether recipient has claimed the funds
     */
    struct CampaignInfo {
        string title;
        string description;
        address creator;
        address recipient;
        uint256 goalAmount;
        uint256 totalFunded;
        uint256 deadline;
        bytes32 conditionId;
        bool resolved;
        bool outcomeYes;
        bool withdrawn;
    }

    // ============ Immutable State Variables ============

    /// @notice USDC token contract for all contributions and withdrawals
    /// @dev Base network USDC uses 6 decimal places (1 USDC = 1_000_000)
    IERC20 public immutable usdc;

    /// @notice Oracle contract that provides prediction market resolution data
    /// @dev Must implement IOracle interface with isResolved() and getOutcome()
    IOracle public immutable oracle;

    // ============ Campaign Configuration State ============

    /// @notice Address that created this campaign through the factory contract
    /// @dev Set at deployment, used for frontend attribution and potential admin features
    address public creator;

    /// @notice Address that receives all funds if prediction resolves YES
    /// @dev Cannot be changed after deployment for security
    address public recipient;

    /// @notice Human-readable campaign title for display purposes
    string public title;

    /// @notice Detailed campaign description explaining the funding purpose
    string public description;

    /// @notice Target funding goal in USDC with 6 decimals
    /// @dev Example: 1000 USDC = 1_000_000_000 (1000 * 10^6)
    uint256 public goalAmount;

    /// @notice Unique identifier linking to Polymarket prediction market condition
    /// @dev Used to query oracle for resolution status and outcome
    bytes32 public conditionId;

    /// @notice Unix timestamp after which no new contributions are accepted
    /// @dev Contributions blocked when block.timestamp >= deadline
    uint256 public deadline;

    // ============ Funding Tracking State ============

    /// @notice Running total of all USDC contributions received
    /// @dev Updated on each successful fund() call
    uint256 public totalFunded;

    /// @notice Maps contributor addresses to their cumulative contribution amounts
    /// @dev Reset to 0 when contributor claims refund
    mapping(address => uint256) public contributions;

    /// @notice Ordered array of all unique contributor addresses
    /// @dev Addresses remain in array even after refund (historical record)
    address[] public contributors;

    // ============ Resolution State ============

    /// @notice Flag indicating whether the prediction market outcome is finalized
    /// @dev Once true, funding is closed and withdraw/refund paths become available
    bool public resolved;

    /// @notice The final prediction market outcome
    /// @dev true = prediction came true (YES), false = prediction failed (NO)
    /// @dev Only meaningful when resolved == true
    bool public outcomeYes;

    /// @notice Flag indicating recipient has claimed the funds
    /// @dev Prevents double-withdrawal attacks
    bool public withdrawn;

    /// @notice Tracks which contributors have successfully claimed refunds
    /// @dev Prevents double-refund attacks
    mapping(address => bool) public refunded;

    // ============ Events ============

    /**
     * @notice Emitted when a contributor successfully funds the campaign
     * @param funder Address of the contributor
     * @param amount USDC amount contributed in this transaction (6 decimals)
     * @param totalFunded New cumulative total after this contribution
     */
    event Funded(address indexed funder, uint256 amount, uint256 totalFunded);

    /**
     * @notice Emitted when the prediction market outcome is recorded on-chain
     * @param outcome true if YES (recipient can withdraw), false if NO (refunds enabled)
     */
    event Resolved(bool outcome);

    /**
     * @notice Emitted when recipient successfully withdraws funds after YES outcome
     * @param recipient Address receiving the funds
     * @param amount Total USDC amount withdrawn
     */
    event Withdrawn(address indexed recipient, uint256 amount);

    /**
     * @notice Emitted when a contributor successfully claims their refund after NO outcome
     * @param funder Address receiving the refund
     * @param amount USDC amount refunded to this contributor
     */
    event Refunded(address indexed funder, uint256 amount);

    // ============ Constructor ============

    /**
     * @notice Deploys a new Campaign escrow contract with specified parameters
     * @dev Called by CampaignFactory; all parameters are immutable after deployment
     * @param _usdc Address of USDC token contract on Base network
     * @param _oracle Address of oracle contract implementing IOracle interface
     * @param _creator Address of user who initiated campaign creation
     * @param _recipient Address to receive funds on successful (YES) outcome
     * @param _title Campaign title for frontend display
     * @param _description Full campaign description and details
     * @param _goalAmount Target funding amount in USDC (6 decimals)
     * @param _conditionId Polymarket condition ID linking to prediction market
     * @param _deadline Unix timestamp when funding period closes
     */
    constructor(
        address _usdc,
        address _oracle,
        address _creator,
        address _recipient,
        string memory _title,
        string memory _description,
        uint256 _goalAmount,
        bytes32 _conditionId,
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
        deadline = _deadline;
    }

    // ============ Core External Functions ============

    /**
     * @notice Contribute USDC to this campaign
     * @dev Caller must first approve this contract to spend their USDC via usdc.approve()
     *      Implements checks-effects-interactions pattern for reentrancy protection
     *      First-time contributors are added to the contributors array
     * @param amount Amount of USDC to contribute (6 decimals, e.g., 100 USDC = 100_000_000)
     * 
     * Requirements:
     * - Campaign must not be resolved yet
     * - Current timestamp must be before deadline
     * - Amount must be greater than zero
     * - Caller must have approved sufficient USDC allowance
     * 
     * Emits a {Funded} event on success
     */
    function fund(uint256 amount) external {
        // Checks - validate all preconditions
        require(!resolved, "Campaign already resolved");
        require(block.timestamp < deadline, "Funding period ended");
        require(amount > 0, "Amount must be greater than 0");

        // Effects - update all state before external calls
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += amount;
        totalFunded += amount;

        // Interactions - external call last (checks-effects-interactions pattern)
        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        require(success, "USDC transfer failed");

        emit Funded(msg.sender, amount, totalFunded);
    }

    /**
     * @notice Resolve the campaign by fetching the prediction market outcome from oracle
     * @dev Permissionless - anyone can call once oracle has resolved the condition
     *      This bridges the off-chain prediction market result to on-chain state
     *      After resolution, either withdraw() (YES) or refund() (NO) becomes available
     * 
     * Requirements:
     * - Campaign must not already be resolved
     * - Oracle must report the condition as resolved
     * 
     * Emits a {Resolved} event with the outcome
     */
    function resolve() external {
        // Checks
        require(!resolved, "Already resolved");
        require(oracle.isResolved(conditionId), "Oracle not resolved yet");

        // Effects - no external calls, so order is less critical
        resolved = true;
        outcomeYes = oracle.getOutcome(conditionId);

        emit Resolved(outcomeYes);
    }

    /**
     * @notice Withdraw all campaign funds to recipient after YES outcome
     * @dev Only the designated recipient can call this function
     *      Transfers the entire totalFunded amount in a single transaction
     *      Uses checks-effects-interactions to prevent reentrancy
     * 
     * Requirements:
     * - Campaign must be resolved
     * - Outcome must be YES (outcomeYes == true)
     * - Caller must be the recipient address
     * - Funds must not have been withdrawn already
     * 
     * Emits a {Withdrawn} event on success
     */
    function withdraw() external {
        // Checks - validate all preconditions
        require(resolved, "Not resolved yet");
        require(outcomeYes, "Outcome was NO");
        require(msg.sender == recipient, "Only recipient can withdraw");
        require(!withdrawn, "Already withdrawn");

        // Effects - update state before external call
        withdrawn = true;
        uint256 amount = totalFunded;

        // Interactions - transfer after state update
        bool success = usdc.transfer(recipient, amount);
        require(success, "USDC transfer failed");

        emit Withdrawn(recipient, amount);
    }

    /**
     * @notice Claim full refund of contribution after NO outcome
     * @dev Each contributor must call individually to receive their refund
     *      Contribution amount is cached and cleared before transfer (CEI pattern)
     *      Double-refund protection via refunded mapping
     * 
     * Requirements:
     * - Campaign must be resolved
     * - Outcome must be NO (outcomeYes == false)
     * - Caller must have a positive contribution balance
     * - Caller must not have already claimed a refund
     * 
     * Emits a {Refunded} event on success
     */
    function refund() external {
        // Checks - validate all preconditions
        require(resolved, "Not resolved yet");
        require(!outcomeYes, "Outcome was YES");
        require(contributions[msg.sender] > 0, "No contribution found");
        require(!refunded[msg.sender], "Already refunded");

        // Effects - cache amount and clear state before transfer
        uint256 amount = contributions[msg.sender];
        refunded[msg.sender] = true;
        contributions[msg.sender] = 0;

        // Interactions - external call last
        bool success = usdc.transfer(msg.sender, amount);
        require(success, "USDC transfer failed");

        emit Refunded(msg.sender, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Retrieve the complete list of contributor addresses
     * @dev Returns all addresses that have ever contributed, including those who refunded
     *      Use getContribution() to check current balance for each address
     * @return Array of all unique contributor addresses in order of first contribution
     */
    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    /**
     * @notice Get the current contribution amount for a specific address
     * @dev Returns 0 if address never contributed or has been refunded
     * @param funder Address to query
     * @return Current contribution balance in USDC (6 decimals)
     */
    function getContribution(address funder) external view returns (uint256) {
        return contributions[funder];
    }

    /**
     * @notice Retrieve all campaign information in a single call
     * @dev Optimized for frontend efficiency - bundles 11 storage reads into one RPC call
     *      Returns a struct that can be easily destructured in JavaScript/TypeScript
     * @return info CampaignInfo struct containing all campaign metadata and state
     */
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
            resolved: resolved,
            outcomeYes: outcomeYes,
            withdrawn: withdrawn
        });
    }
}