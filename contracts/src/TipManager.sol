// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./SocialTippingTypes.sol";
import "./ISocialTippingEvents.sol";

// Tip management contract
contract TipManager is ISocialTippingEvents {
    mapping(address => uint256) public creatorEarnings;
    
    function sendTip(
        uint256 postId, 
        SocialTippingTypes.Post storage post
    ) external payable {
        require(post.creator != address(0), "Post does not exist");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        // Update post stats
        post.totalTips += msg.value;
        post.tipCount += 1;
        
        // Update creator earnings
        creatorEarnings[post.creator] += msg.value;
        
        // Transfer funds to creator
        payable(post.creator).transfer(msg.value);
        
        emit TipSent(postId, msg.sender, post.creator, msg.value);
    }
    
    function getCreatorEarnings(address creator) external view virtual returns (uint256) {
        return creatorEarnings[creator];
    }
}
