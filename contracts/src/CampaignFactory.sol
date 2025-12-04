// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @author FundIf Team
 * @notice Factory contract that deploys and tracks Campaign escrow contracts for prediction-gated crowdfunding
 * @dev Implements the factory pattern to deploy Campaign contracts with consistent configuration.
 * Each campaign is an independent escrow where funds release only if a prediction market resolves YES,
 * otherwise contributors receive automatic refunds. Built for Base blockchain.
 *
 * Key features:
 * - Deploys Campaign contracts with shared USDC and oracle addresses
 * - Tracks all campaigns globally and per-creator
 * - Provides verification mapping to validate legitimate campaigns
 * - Supports pagination for efficient frontend queries
 */
contract CampaignFactory {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice USDC token contract address shared across all deployed campaigns
    /// @dev Immutable after construction - ensures all campaigns use the same USDC
    address public immutable usdc;

    /// @notice Oracle contract address for prediction market condition resolution
    /// @dev Immutable after construction - provides consistent oracle for all campaigns
    address public immutable oracle;

    /// @notice Array containing addresses of all deployed Campaign contracts
    /// @dev Grows with each createCampaign call, used for enumeration and pagination
    address[] public campaigns;

    /// @notice Maps creator addresses to arrays of their deployed campaign addresses
    /// @dev Enables efficient lookup of all campaigns by a specific creator
    mapping(address => address[]) public campaignsByCreator;

    /// @notice Maps addresses to boolean indicating if they are legitimate campaigns
    /// @dev Used to verify a campaign was deployed by this factory, prevents spoofing
    mapping(address => bool) public isCampaign;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when a new Campaign contract is successfully deployed
     * @param campaign The address of the newly deployed Campaign contract
     * @param creator The address that initiated the campaign creation (msg.sender)
     * @param title The human-readable title of the campaign
     * @param goalAmount The funding goal amount in USDC (including decimals)
     * @param conditionId The prediction market condition identifier from the oracle
     * @param deadline The Unix timestamp when the funding period ends
     */
    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string title,
        uint256 goalAmount,
        bytes32 conditionId,
        uint256 deadline
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the factory with shared USDC and oracle addresses
     * @dev Both addresses are validated and set as immutable for gas efficiency
     * @param _usdc The USDC token contract address on Base blockchain
     * @param _oracle The oracle contract address for prediction market resolution
     */
    constructor(address _usdc, address _oracle) {
        require(_usdc != address(0), "CampaignFactory: Invalid USDC address");
        require(_oracle != address(0), "CampaignFactory: Invalid oracle address");

        usdc = _usdc;
        oracle = _oracle;
    }

    /*//////////////////////////////////////////////////////////////
                          CAMPAIGN CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploys a new Campaign escrow contract with the specified parameters
     * @dev The caller becomes the campaign creator. Creator and recipient can differ,
     * allowing fundraising on behalf of others (e.g., charities, organizations).
     *
     * The deployed Campaign will:
     * - Accept USDC contributions until the deadline
     * - Release funds to recipient if prediction resolves YES and goal is met
     * - Enable refunds if prediction resolves NO or deadline passes without goal
     *
     * Requirements:
     * - goalAmount must be greater than zero
     * - recipient must not be the zero address
     * - deadline must be in the future
     * - title must not be empty
     * - description must not be empty
     *
     * Emits a {CampaignCreated} event.
     *
     * @param title The campaign title displayed to users
     * @param description The campaign description explaining the project and conditions
     * @param goalAmount The funding goal in USDC (e.g., 1000 * 10^6 for 1000 USDC)
     * @param recipient The address that receives funds upon successful resolution
     * @param conditionId The prediction market condition ID from the oracle
     * @param deadline The Unix timestamp when the funding period ends
     * @return campaignAddress The address of the newly deployed Campaign contract
     */
    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goalAmount,
        address recipient,
        bytes32 conditionId,
        uint256 deadline
    ) external returns (address campaignAddress) {
        // Validate all input parameters
        require(goalAmount > 0, "CampaignFactory: Goal must be > 0");
        require(recipient != address(0), "CampaignFactory: Invalid recipient");
        require(deadline > block.timestamp, "CampaignFactory: Deadline must be future");
        require(bytes(title).length > 0, "CampaignFactory: Title required");
        require(bytes(description).length > 0, "CampaignFactory: Description required");

        // Deploy new Campaign contract with factory's shared config and user params
        Campaign newCampaign = new Campaign(
            usdc,
            oracle,
            msg.sender,
            recipient,
            title,
            description,
            goalAmount,
            conditionId,
            deadline
        );

        campaignAddress = address(newCampaign);

        // Register the campaign in all tracking structures
        campaigns.push(campaignAddress);
        campaignsByCreator[msg.sender].push(campaignAddress);
        isCampaign[campaignAddress] = true;

        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            title,
            goalAmount,
            conditionId,
            deadline
        );

        return campaignAddress;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns all deployed campaign addresses
     * @dev WARNING: This function returns the entire array and may be expensive
     * for large numbers of campaigns. Use getCampaignsRange() for pagination
     * in production frontends to avoid RPC timeouts and memory issues.
     * @return Array containing all campaign contract addresses
     */
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    /**
     * @notice Returns all campaigns created by a specific address
     * @dev Useful for creator dashboards and profile pages. Returns empty array
     * if the creator has not created any campaigns.
     * @param creator The address of the campaign creator to query
     * @return Array of campaign addresses created by the specified creator
     */
    function getCampaignsByCreator(address creator) external view returns (address[] memory) {
        return campaignsByCreator[creator];
    }

    /**
     * @notice Returns the total number of campaigns deployed through this factory
     * @dev Useful for pagination calculations and platform statistics
     * @return The total count of all deployed campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    /**
     * @notice Returns a paginated slice of the campaigns array
     * @dev Efficiently retrieves a subset of campaigns for frontend pagination.
     * If end exceeds array length, it is automatically clamped.
     *
     * Example pagination:
     * - Page 1 (items 0-9): getCampaignsRange(0, 10)
     * - Page 2 (items 10-19): getCampaignsRange(10, 20)
     * - Last page: getCampaignsRange(start, getCampaignCount())
     *
     * @param start The starting index (inclusive, 0-based)
     * @param end The ending index (exclusive)
     * @return result Array containing campaign addresses in the specified range
     */
    function getCampaignsRange(
        uint256 start,
        uint256 end
    ) external view returns (address[] memory result) {
        uint256 length = campaigns.length;

        // Clamp end to array bounds
        if (end > length) {
            end = length;
        }

        // Ensure valid range
        require(start < end, "CampaignFactory: Invalid range");

        // Build result array
        uint256 rangeSize = end - start;
        result = new address[](rangeSize);

        for (uint256 i = 0; i < rangeSize;) {
            result[i] = campaigns[start + i];
            unchecked {
                ++i;
            }
        }

        return result;
    }
}