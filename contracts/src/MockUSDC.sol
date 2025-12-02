// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for testnet and hackathon demo purposes
 * @dev This contract allows anyone to mint tokens - DO NOT use in production
 */
contract MockUSDC is ERC20 {
    /// @notice The amount of tokens dispensed by the faucet (10,000 USDC)
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** 6;

    /**
     * @notice Initializes the MockUSDC token
     * @dev Sets name to "USD Coin" and symbol to "USDC"
     */
    constructor() ERC20("USD Coin", "USDC") {}

    /**
     * @notice Returns the number of decimals used for token amounts
     * @dev USDC uses 6 decimals, unlike the default 18 for ERC20
     * @return The number of decimals (6)
     */
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Mints tokens to a specified address
     * @dev Anyone can call this function - for testnet use only
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in smallest units, 6 decimals)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Mints 10,000 USDC to the caller
     * @dev Convenience function for easy testing
     */
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}