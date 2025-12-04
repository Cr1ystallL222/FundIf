// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @author FundIf Team
 * @notice A mock USDC token for testnet and demo purposes in the FundIf platform
 * @dev This contract simulates USDC behavior for the FundIf prediction-gated 
 *      crowdfunding platform. It allows unrestricted minting for testing purposes,
 *      which would never be permitted in production. Uses 6 decimals to match 
 *      real USDC on mainnet for seamless migration.
 *
 * @custom:security-contact security@fundif.xyz
 * @custom:hackathon This is a demonstration contract - DO NOT deploy to mainnet
 */
contract MockUSDC is ERC20 {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Number of decimals for token amounts, matching real USDC
    uint8 private constant DECIMALS = 6;

    /// @notice Amount distributed per faucet call: 10,000 USDC (10000 * 10^6)
    uint256 public constant FAUCET_AMOUNT = 10_000 * 10 ** DECIMALS;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when tokens are minted via the public mint function
     * @param to The address that received the minted tokens
     * @param amount The amount of tokens minted in smallest units
     */
    event Minted(address indexed to, uint256 amount);

    /**
     * @notice Emitted when a user claims tokens from the faucet
     * @param recipient The address that received the faucet tokens
     * @param amount The amount of tokens distributed (always FAUCET_AMOUNT)
     */
    event FaucetClaimed(address indexed recipient, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploys the MockUSDC token with standard USDC naming
     * @dev Initializes with name "USD Coin" and symbol "USDC" to match real USDC
     *      No initial supply is minted; users obtain tokens via mint() or faucet()
     */
    constructor() ERC20("USD Coin", "USDC") {}

    /*//////////////////////////////////////////////////////////////
                            ERC20 OVERRIDES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the number of decimals used for token display
     * @dev Overrides OpenZeppelin's default of 18 decimals to match real USDC's 6
     *      This is critical for accurate value representation:
     *      - 1 USDC = 1,000,000 (1e6) base units
     *      - 0.01 USDC (1 cent) = 10,000 base units
     * @return Number of decimals (always 6)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /*//////////////////////////////////////////////////////////////
                           TESTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mints an arbitrary amount of tokens to any address
     * @dev WARNING: This function has no access control - FOR TESTING ONLY
     *      Real USDC restricts minting to Circle's authorized contracts.
     *      
     *      Amount examples for common values:
     *      - 1 USDC = 1_000_000 (1e6)
     *      - 100 USDC = 100_000_000 (1e8)
     *      - 1000 USDC = 1_000_000_000 (1e9)
     *
     * @param to The recipient address for the minted tokens
     * @param amount The quantity to mint in base units (6 decimal places)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @notice Distributes 10,000 USDC to the caller for testing
     * @dev Convenience function for hackathon demos and testing workflows.
     *      Can be called unlimited times by any address.
     *      
     *      Typical usage flow:
     *      1. User calls faucet() to receive test USDC
     *      2. User approves Campaign contract to spend their USDC
     *      3. User contributes to a FundIf campaign
     */
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }
}