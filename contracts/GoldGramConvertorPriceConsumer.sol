// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";

contract GoldGramConvertorPriceConsumer {
    using SignedSafeMath for int;
    AggregatorV3Interface internal priceFeed;
    
    int gramPerTroyOunceForDivision = 311034768;
    
    /**
     * Network: Mainnet
     * Aggregator: XAU/USD
     * Address: 0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6
     */
    constructor() {
        priceFeed = AggregatorV3Interface(0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (, int price,,,) = priceFeed.latestRoundData();
         
        int priceConvertedForDivision = price.mul(10000000);
        
        return (priceConvertedForDivision.div(gramPerTroyOunceForDivision));
    }
}
