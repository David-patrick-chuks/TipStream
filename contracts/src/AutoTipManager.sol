// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./SocialTippingTypes.sol";
import "./ISocialTippingEvents.sol";

// Auto-tip management contract
contract AutoTipManager is ISocialTippingEvents {
    mapping(uint256 => SocialTippingTypes.AutoTip[]) public autoTips;
    
    // Modifier to check if caller is authorized to execute auto-tip
    modifier onlyAuthorized(uint256 postId, uint256 autoTipIndex) {
        SocialTippingTypes.AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(
            msg.sender == autoTip.tipper || msg.sender == autoTip.delegatee,
            "Not authorized to execute this auto-tip"
        );
        _;
    }
    
    function enableAutoTip(
        uint256 postId, 
        uint256 threshold, 
        uint256 amount,
        SocialTippingTypes.Post storage post
    ) internal {
        require(post.creator != address(0), "Post does not exist");
        require(amount > 0, "Auto-tip amount must be greater than 0");
        
        autoTips[postId].push(SocialTippingTypes.AutoTip({
            tipper: msg.sender,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp,
            delegatee: address(0)
        }));
        
        emit AutoTipEnabled(postId, msg.sender, threshold, amount);
    }
    
    function executeAutoTip(
        uint256 postId, 
        uint256 autoTipIndex,
        SocialTippingTypes.Post storage post
    ) internal onlyAuthorized(postId, autoTipIndex) {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        SocialTippingTypes.AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.active, "Auto-tip is not active");
        require(post.engagement >= autoTip.threshold, "Threshold not met");
        
        // Transfer funds to creator
        payable(post.creator).transfer(autoTip.amount);
        
        // Update stats
        post.totalTips += autoTip.amount;
        post.tipCount += 1;
        
        // Deactivate auto-tip
        autoTip.active = false;
        
        emit AutoTipExecuted(postId, autoTip.tipper, post.creator, autoTip.amount);
    }
    
    function getAutoTips(uint256 postId) external view virtual returns (SocialTippingTypes.AutoTip[] memory) {
        return autoTips[postId];
    }
    
    function checkAndExecuteAutoTips(uint256 postId, SocialTippingTypes.Post storage post) internal {
        SocialTippingTypes.AutoTip[] storage postAutoTips = autoTips[postId];
        
        for (uint256 i = 0; i < postAutoTips.length; i++) {
            SocialTippingTypes.AutoTip storage autoTip = postAutoTips[i];
            
            if (autoTip.active && post.engagement >= autoTip.threshold) {
                // Execute the auto-tip
                payable(post.creator).transfer(autoTip.amount);
                
                // Update stats
                post.totalTips += autoTip.amount;
                post.tipCount += 1;
                
                // Deactivate auto-tip
                autoTip.active = false;
                
                emit AutoTipExecuted(postId, autoTip.tipper, post.creator, autoTip.amount);
            }
        }
    }
}
