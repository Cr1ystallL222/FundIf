// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/// @title IOracle
/// @notice Interface for a prediction market oracle that resolves binary outcomes
interface IOracle {
    /// @notice Checks whether a condition has been resolved by the oracle
    /// @param conditionId The unique identifier of the condition to check
    /// @return True if the condition has been resolved, false otherwise
    function isResolved(bytes32 conditionId) external view returns (bool);

    /// @notice Returns the outcome of a resolved condition
    /// @dev Should only be called after verifying isResolved() returns true
    /// @param conditionId The unique identifier of the condition
    /// @return True for YES outcome, false for NO outcome
    function getOutcome(bytes32 conditionId) external view returns (bool);
}