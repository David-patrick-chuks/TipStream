// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./SocialTippingTypes.sol";
import "./ISocialTippingEvents.sol";

// Delegation management contract
contract DelegationManager is ISocialTippingEvents {
    mapping(address => SocialTippingTypes.Delegation[]) public userDelegations;
    
    function createDelegation(
        uint256 postId, 
        uint256 threshold, 
        uint256 amount, 
        address delegatee,
        SocialTippingTypes.Post storage post
    ) internal {
        require(post.creator != address(0), "Post does not exist");
        require(amount > 0, "Delegation amount must be greater than 0");
        require(delegatee != address(0), "Invalid delegatee address");
        
        // Store delegation record
        userDelegations[msg.sender].push(SocialTippingTypes.Delegation({
            delegator: msg.sender,
            delegatee: delegatee,
            postId: postId,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp
        }));
        
        emit DelegationCreated(postId, msg.sender, delegatee, threshold, amount);
    }
    
    function revokeDelegation(
        uint256 postId, 
        uint256 autoTipIndex,
        mapping(uint256 => SocialTippingTypes.AutoTip[]) storage autoTips
    ) internal {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        SocialTippingTypes.AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.tipper == msg.sender, "Only tipper can revoke");
        require(autoTip.active, "Auto-tip is not active");
        
        // Deactivate auto-tip
        autoTip.active = false;
        
        // Refund the amount to the tipper
        payable(msg.sender).transfer(autoTip.amount);
        
        emit DelegationRevoked(postId, msg.sender, autoTipIndex);
    }
    
    function getUserDelegations(address user) external view virtual returns (SocialTippingTypes.Delegation[] memory) {
        return userDelegations[user];
    }
    
    function getDelegationStats(address user) external view virtual returns (
        uint256 totalDelegations,
        uint256 activeDelegations,
        uint256 totalDelegatedAmount
    ) {
        SocialTippingTypes.Delegation[] memory delegations = userDelegations[user];
        totalDelegations = delegations.length;
        
        for (uint256 i = 0; i < delegations.length; i++) {
            if (delegations[i].active) {
                activeDelegations++;
                totalDelegatedAmount += delegations[i].amount;
            }
        }
    }
}
