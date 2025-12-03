// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./interfaces/IOracle.sol";

/**
 * @title MockOracle
 * @author FundIf Team
 * @notice A mock prediction market oracle for demonstration and testing purposes
 * @dev Simulates a prediction market oracle like Polymarket or UMA for hackathon demo.
 *      In production, this would be replaced with actual oracle integrations.
 *      This contract allows an owner to manually set outcomes for prediction conditions,
 *      which Campaign contracts then query to determine fund release or refund.
 *
 * @custom:security-contact security@fundif.example
 *
 * Example Usage Flow:
 *      1. Deploy MockOracle
 *      2. Create Campaign with oracle address and conditionId
 *      3. Users contribute funds to Campaign
 *      4. Owner calls setOutcome(conditionId, true/false) when real-world event resolves
 *      5. Anyone calls Campaign.resolve() which reads oracle and releases funds or enables refunds
 */
contract MockOracle is IOracle {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when an outcome is set for a prediction condition
     * @param conditionId The unique identifier for the prediction condition
     * @param outcome The resolved outcome (true = YES, false = NO)
     */
    event OutcomeSet(bytes32 indexed conditionId, bool outcome);

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice The address authorized to set prediction outcomes
     * @dev Set to msg.sender in constructor. In production, this role would be
     *      replaced by decentralized oracle mechanisms.
     */
    address public owner;

    /**
     * @notice Stores the YES/NO outcome for each resolved condition
     * @dev Maps conditionId => outcome where true = YES and false = NO.
     *      Only meaningful when resolved[conditionId] is true.
     */
    mapping(bytes32 => bool) public outcomes;

    /**
     * @notice Tracks whether each condition has been resolved
     * @dev Maps conditionId => isResolved. Must be true before outcome can be read.
     *      Prevents reading uninitialized default values as valid outcomes.
     */
    mapping(bytes32 => bool) public resolved;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the MockOracle with the deployer as owner
     * @dev The owner has exclusive rights to set prediction outcomes.
     *      This centralized control is acceptable for hackathon demos but
     *      would be replaced with decentralized resolution in production.
     */
    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets the outcome for a prediction condition
     * @dev Only callable by the contract owner. Marks the condition as resolved
     *      and stores the outcome. Once resolved, subsequent calls will overwrite
     *      the previous outcome (acceptable for demo; production would prevent this).
     *
     * @param conditionId The unique identifier for the prediction condition.
     *        For demos, use keccak256 of a descriptive string like
     *        keccak256("eth-price-above-5000-jan-2025").
     *        In production, would map to actual Polymarket market IDs.
     *
     * @param outcome The resolved outcome:
     *        - true (YES): The predicted event occurred → funds release to creator
     *        - false (NO): The predicted event did not occur → contributors get refunds
     *
     * Emits an {OutcomeSet} event for off-chain indexing and transparency.
     *
     * Requirements:
     * - Caller MUST be the contract owner
     *
     * Example:
     * ```
     * // Prediction: "Will Bitcoin ETF be approved by SEC in January 2024?"
     * bytes32 conditionId = keccak256(abi.encodePacked("btc-etf-sec-jan-2024"));
     * mockOracle.setOutcome(conditionId, true); // ETF was approved!
     * ```
     */
    function setOutcome(bytes32 conditionId, bool outcome) external {
        require(msg.sender == owner, "MockOracle: caller is not owner");

        outcomes[conditionId] = outcome;
        resolved[conditionId] = true;

        emit OutcomeSet(conditionId, outcome);
    }

    /*//////////////////////////////////////////////////////////////
                           IORACLE INTERFACE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Checks if a prediction condition has been resolved
     * @dev Part of the IOracle interface. Campaign contracts should call this
     *      before calling getOutcome() to avoid reverts. Can also be used by
     *      frontend to show pending vs resolved status.
     *
     * @param conditionId The unique identifier for the prediction condition
     * @return True if setOutcome() has been called for this conditionId
     *
     * Example usage in Campaign contract:
     * ```
     * function resolve() external {
     *     require(oracle.isResolved(conditionId), "Prediction not yet resolved");
     *     bool outcome = oracle.getOutcome(conditionId);
     *     // ... handle fund distribution
     * }
     * ```
     */
    function isResolved(bytes32 conditionId) external view override returns (bool) {
        return resolved[conditionId];
    }

    /**
     * @notice Gets the outcome of a resolved prediction condition
     * @dev Part of the IOracle interface. Reverts if condition is unresolved to
     *      prevent treating the default `false` value as a valid NO outcome.
     *      Campaign contracts use this to determine fund release vs refund logic.
     *
     * @param conditionId The unique identifier for the prediction condition
     * @return outcome True if YES (funds release), false if NO (refunds enabled)
     *
     * Requirements:
     * - Condition MUST be resolved (setOutcome must have been called)
     *
     * Example usage in Campaign contract:
     * ```
     * bool outcome = oracle.getOutcome(conditionId);
     * if (outcome) {
     *     // YES outcome: transfer pooled funds to campaign creator
     *     payable(creator).transfer(address(this).balance);
     * } else {
     *     // NO outcome: enable refund claims for all contributors
     *     refundsEnabled = true;
     * }
     * ```
     */
    function getOutcome(bytes32 conditionId) external view override returns (bool) {
        require(resolved[conditionId], "MockOracle: condition not resolved");
        return outcomes[conditionId];
    }
}