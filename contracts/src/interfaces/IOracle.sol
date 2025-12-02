// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/**
 * @title IOracle
 * @author FundIf Team
 * @notice Interface for querying prediction market outcomes in the FundIf platform
 * @dev This interface abstracts the oracle layer for prediction market resolution.
 * Campaign contracts use this to determine whether funds should be released to
 * project creators (if the prediction resolved YES) or refunded to contributors
 * (if the prediction resolved NO or remains unresolved).
 *
 * The interface is designed to be implementation-agnostic, allowing integration
 * with various oracle providers such as UMA, Chainlink, or custom Polymarket
 * adapters in production environments.
 */
interface IOracle {
    /**
     * @notice Checks whether a prediction market condition has been resolved
     * @dev Returns true only when the oracle has finalized the outcome for the
     * given conditionId. Callers should always check this before calling
     * getOutcome() to avoid reading uninitialized or invalid outcome data.
     *
     * A condition is considered resolved when:
     * - The prediction market has ended
     * - The oracle has submitted and finalized the outcome
     * - Any dispute period (if applicable) has passed
     *
     * @param conditionId The unique identifier for the prediction market condition.
     * This bytes32 value maps to a specific prediction question
     * (e.g., "Will SpaceX launch Starship by December 2025?")
     * @return resolved True if the condition has been resolved, false otherwise
     */
    function isResolved(bytes32 conditionId) external view returns (bool resolved);

    /**
     * @notice Returns the outcome of a resolved prediction market condition
     * @dev This function should only be called after verifying that isResolved()
     * returns true. The behavior when called on an unresolved condition is
     * implementation-defined and may return arbitrary data.
     *
     * Outcome interpretation:
     * - true: The YES outcome won (prediction came true)
     * - false: The NO outcome won (prediction did not come true)
     *
     * @param conditionId The unique identifier for the prediction market condition.
     * Must match a conditionId that has been previously registered
     * with the oracle implementation
     * @return outcome True if the YES outcome won, false if the NO outcome won
     *
     * @custom:security Callers MUST verify isResolved(conditionId) == true before
     * trusting the return value of this function
     */
    function getOutcome(bytes32 conditionId) external view returns (bool outcome);
}