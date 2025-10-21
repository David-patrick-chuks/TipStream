// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./SocialTippingTypes.sol";
import "./ISocialTippingEvents.sol";
import "./PostManager.sol";
import "./TipManager.sol";
import "./AutoTipManager.sol";
import "./DelegationManager.sol";

/**
 * @title SocialTipping
 * @dev Main contract orchestrating the Web3 Social Tipping Platform
 * @notice Modular architecture with separate managers for different functionalities
 */
contract SocialTipping is 
    ISocialTippingEvents,
    PostManager,
    TipManager,
    AutoTipManager,
    DelegationManager
{
    using SocialTippingTypes for SocialTippingTypes.Post;
    using SocialTippingTypes for SocialTippingTypes.AutoTip;
    using SocialTippingTypes for SocialTippingTypes.Delegation;

    // Constructor
    constructor() {
        // Initialize any required state
    }

    // ============ POST MANAGEMENT ============
    
    /**
     * @dev Create a new post
     * @param content The content of the post
     */
    function createPost(string memory content) external override {
        uint256 postId = nextPostId++;
        posts[postId] = SocialTippingTypes.Post({
            id: postId,
            creator: msg.sender,
            content: content,
            timestamp: block.timestamp,
            totalTips: 0,
            tipCount: 0,
            engagement: 0
        });
        
        emit PostCreated(postId, msg.sender, content, block.timestamp);
    }
    
    /**
     * @dev Get post details
     * @param postId The ID of the post
     * @return Post struct containing post data
     */
    function getPost(uint256 postId) external view override returns (SocialTippingTypes.Post memory) {
        return posts[postId];
    }

    /**
     * @dev Increase engagement for a post (triggers auto-tips)
     * @param postId The ID of the post
     */
    function increaseEngagement(uint256 postId) external override {
        require(posts[postId].creator != address(0), "Post does not exist");
        posts[postId].engagement += 1;
        
        // Check if any auto-tips should be triggered
        SocialTippingTypes.Post storage post = posts[postId];
        checkAndExecuteAutoTips(postId, post);
    }

    /**
     * @dev Increase engagement without triggering auto-execution (for testing)
     * @param postId The ID of the post
     */
    function increaseEngagementManual(uint256 postId) external override {
        require(posts[postId].creator != address(0), "Post does not exist");
        posts[postId].engagement += 1;
    }

    // ============ TIP MANAGEMENT ============

    /**
     * @dev Send a tip to a post
     * @param postId The ID of the post to tip
     */
    function sendTip(uint256 postId) external payable {
        require(posts[postId].creator != address(0), "Post does not exist");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        posts[postId].totalTips += msg.value;
        posts[postId].tipCount += 1;
        
        creatorEarnings[posts[postId].creator] += msg.value;
        
        payable(posts[postId].creator).transfer(msg.value);
        
        emit TipSent(postId, msg.sender, posts[postId].creator, msg.value);
    }

    /**
     * @dev Get creator's total earnings
     * @param creator The address of the creator
     * @return Total earnings in wei
     */
    function getCreatorEarnings(address creator) external view override returns (uint256) {
        return creatorEarnings[creator];
    }

    // ============ AUTO-TIP MANAGEMENT ============

    /**
     * @dev Enable auto-tipping for a post
     * @param postId The ID of the post
     * @param threshold Minimum engagement to trigger auto-tip
     * @param amount Amount to tip when threshold is met
     */
    function enableAutoTip(uint256 postId, uint256 threshold, uint256 amount) external payable {
        require(amount > 0, "Auto-tip amount must be greater than 0");
        require(msg.value >= amount, "Insufficient funds for auto-tip");
        
        require(posts[postId].creator != address(0), "Post does not exist");
        
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
    
    /**
     * @dev Execute auto-tip when engagement threshold is met (supports delegation)
     * @param postId The ID of the post
     * @param autoTipIndex Index of the auto-tip to execute
     */
    function executeAutoTip(uint256 postId, uint256 autoTipIndex) external {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        SocialTippingTypes.AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.active, "Auto-tip is not active");
        require(
            msg.sender == autoTip.tipper || msg.sender == autoTip.delegatee,
            "Not authorized to execute this auto-tip"
        );
        require(posts[postId].engagement >= autoTip.threshold, "Threshold not met");
        
        payable(posts[postId].creator).transfer(autoTip.amount);
        
        posts[postId].totalTips += autoTip.amount;
        posts[postId].tipCount += 1;
        
        autoTip.active = false;
        
        emit AutoTipExecuted(postId, autoTip.tipper, posts[postId].creator, autoTip.amount);
    }

    /**
     * @dev Get auto-tips for a post
     * @param postId The ID of the post
     * @return Array of AutoTip structs
     */
    function getAutoTips(uint256 postId) external view override returns (SocialTippingTypes.AutoTip[] memory) {
        return autoTips[postId];
    }

    // ============ DELEGATION MANAGEMENT ============

    /**
     * @dev Create delegation for auto-tipping (INNOVATION FEATURE)
     * @param postId The ID of the post
     * @param threshold Minimum engagement to trigger auto-tip
     * @param amount Amount to tip when threshold is met
     * @param delegatee Address that can execute the auto-tip
     */
    function createDelegation(
        uint256 postId, 
        uint256 threshold, 
        uint256 amount, 
        address delegatee
    ) external payable {
        require(amount > 0, "Delegation amount must be greater than 0");
        require(msg.value >= amount, "Insufficient funds for delegation");
        require(delegatee != address(0), "Invalid delegatee address");
        
        require(posts[postId].creator != address(0), "Post does not exist");
        
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
        
        // Also create auto-tip with delegation
        autoTips[postId].push(SocialTippingTypes.AutoTip({
            tipper: msg.sender,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp,
            delegatee: delegatee
        }));
        
        emit AutoTipEnabled(postId, msg.sender, threshold, amount);
    }
    
    /**
     * @dev Revoke delegation
     * @param postId The ID of the post
     * @param autoTipIndex Index of the auto-tip to revoke
     */
    function revokeDelegation(uint256 postId, uint256 autoTipIndex) external {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        SocialTippingTypes.AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.tipper == msg.sender, "Only tipper can revoke");
        require(autoTip.active, "Auto-tip is not active");
        
        autoTip.active = false;
        
        payable(msg.sender).transfer(autoTip.amount);
        
        emit DelegationRevoked(postId, msg.sender, autoTipIndex);
    }
    
    /**
     * @dev Get user's delegations
     * @param user The address of the user
     * @return Array of Delegation structs
     */
    function getUserDelegations(address user) external view override returns (SocialTippingTypes.Delegation[] memory) {
        return userDelegations[user];
    }
    
    /**
     * @dev Get delegation statistics
     * @param user The address of the user
     * @return totalDelegations Total number of delegations created
     * @return activeDelegations Number of active delegations
     * @return totalDelegatedAmount Total amount delegated
     */
    function getDelegationStats(address user) external view override returns (
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

    // ============ UTILITY FUNCTIONS ============

    /**
     * @dev Get contract version
     * @return Version string
     */
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    /**
     * @dev Get contract name
     * @return Contract name
     */
    function getName() external pure returns (string memory) {
        return "SocialTipping";
    }
}
