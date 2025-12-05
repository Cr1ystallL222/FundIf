// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./Campaign.sol";

/**
 * @title CampaignFactory
 * @author FundIf Team
 */
contract CampaignFactory {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    address public immutable usdc;
    address public immutable oracle;
    address[] public campaigns;
    mapping(address => address[]) public campaignsByCreator;
    mapping(address => bool) public isCampaign;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CampaignCreated(
        address indexed campaign,
        address indexed creator,
        string title,
        uint256 goalAmount,
        bytes32 conditionId,
        string marketSlug, // NEW: Added to event for indexing
        uint256 deadline
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address _usdc, address _oracle) {
        require(_usdc != address(0), "CampaignFactory: Invalid USDC address");
        require(_oracle != address(0), "CampaignFactory: Invalid oracle address");

        usdc = _usdc;
        oracle = _oracle;
    }

    /*//////////////////////////////////////////////////////////////
                          CAMPAIGN CREATION
    //////////////////////////////////////////////////////////////*/

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goalAmount,
        address recipient,
        bytes32 conditionId,
        string calldata marketSlug, // NEW: Argument
        uint256 deadline
    ) external returns (address campaignAddress) {
        require(goalAmount > 0, "CampaignFactory: Goal must be > 0");
        require(recipient != address(0), "CampaignFactory: Invalid recipient");
        require(deadline > block.timestamp, "CampaignFactory: Deadline must be future");
        require(bytes(title).length > 0, "CampaignFactory: Title required");
        require(bytes(description).length > 0, "CampaignFactory: Description required");
        // Optionally require slug, though technically logic works without it
        require(bytes(marketSlug).length > 0, "CampaignFactory: Slug required"); 

        Campaign newCampaign = new Campaign(
            usdc,
            oracle,
            msg.sender,
            recipient,
            title,
            description,
            goalAmount,
            conditionId,
            marketSlug, // NEW: Pass to constructor
            deadline
        );

        campaignAddress = address(newCampaign);

        campaigns.push(campaignAddress);
        campaignsByCreator[msg.sender].push(campaignAddress);
        isCampaign[campaignAddress] = true;

        emit CampaignCreated(
            campaignAddress,
            msg.sender,
            title,
            goalAmount,
            conditionId,
            marketSlug,
            deadline
        );

        return campaignAddress;
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    function getCampaignsByCreator(address creator) external view returns (address[] memory) {
        return campaignsByCreator[creator];
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaignsRange(
        uint256 start,
        uint256 end
    ) external view returns (address[] memory result) {
        uint256 length = campaigns.length;

        if (end > length) {
            end = length;
        }

        require(start < end, "CampaignFactory: Invalid range");

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