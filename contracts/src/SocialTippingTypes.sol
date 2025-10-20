// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Core data structures for Social Tipping Platform
library SocialTippingTypes {
    struct Post {
        uint256 id;
        address creator;
        string content;
        uint256 timestamp;
        uint256 totalTips;
        uint256 tipCount;
        uint256 engagement; // likes, shares, etc.
    }
    
    struct AutoTip {
        address tipper;
        uint256 threshold; // minimum engagement to trigger auto-tip
        uint256 amount;
        bool active;
        uint256 createdAt;
        address delegatee; // who can execute this auto-tip (for delegation)
    }
    
    struct Delegation {
        address delegator;
        address delegatee;
        uint256 postId;
        uint256 threshold;
        uint256 amount;
        bool active;
        uint256 createdAt;
    }
}
