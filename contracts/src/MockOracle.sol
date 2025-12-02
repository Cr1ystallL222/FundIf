// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "./interfaces/IOracle.sol";

/**
 * @title MockOracle
 * @author Prediction Market Demo
 * @notice A mock oracle contract for testing and demonstration purposes
 * @dev Simulates Polymarket resolution functionality for demo purposes.
 *      The owner can manually set outcomes for any condition ID.
 */
contract MockOracle is IOracle {
    /*//////////////////////////////////////////////////////////////
                                 STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice The owner address authorized to set outcomes
    address public immutable owner;

    /// @notice Mapping of condition ID to its resolved outcome
    /// @dev true = YES outcome, false = NO outcome
    mapping(bytes32 conditionId => bool outcome) public outcomes;

    /// @notice Mapping of condition ID to its resolution status
    mapping(bytes32 conditionId => bool isResolved) public resolved;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when an outcome is set for a condition
    /// @param conditionId The unique identifier of the condition
    /// @param outcome The resolved outcome (true = YES, false = NO)
    event OutcomeSet(bytes32 indexed conditionId, bool outcome);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when a non-owner attempts to call an owner-only function
    error NotOwner();

    /// @notice Thrown when attempting to get outcome of an unresolved condition
    /// @param conditionId The condition that has not been resolved
    error ConditionNotResolved(bytes32 conditionId);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Constructs the MockOracle contract
     * @dev Sets msg.sender as the immutable owner
     */
    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /// @notice Restricts function access to the owner
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets the outcome for a specific condition
     * @dev Only callable by the owner. Marks the condition as resolved
     *      and emits an OutcomeSet event. Can be called multiple times
     *      to update an outcome if needed for testing purposes.
     * @param conditionId The unique identifier of the condition to resolve
     * @param outcome The outcome to set (true = YES wins, false = NO wins)
     */
    function setOutcome(bytes32 conditionId, bool outcome) external onlyOwner {
        outcomes[conditionId] = outcome;
        resolved[conditionId] = true;

        emit OutcomeSet(conditionId, outcome);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Checks whether a condition has been resolved
     * @param conditionId The unique identifier of the condition to check
     * @return True if the condition has been resolved, false otherwise
     */
    function isResolved(bytes32 conditionId) external view returns (bool) {
        return resolved[conditionId];
    }

    /**
     * @notice Gets the outcome of a resolved condition
     * @dev Reverts if the condition has not been resolved yet
     * @param conditionId The unique identifier of the condition
     * @return The outcome of the condition (true = YES, false = NO)
     */
    function getOutcome(bytes32 conditionId) external view returns (bool) {
        if (!resolved[conditionId]) {
            revert ConditionNotResolved(conditionId);
        }
        return outcomes[conditionId];
    }
}