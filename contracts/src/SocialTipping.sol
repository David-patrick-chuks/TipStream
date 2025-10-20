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
        super.createPost(content);
    }

    /**
     * @dev Get post details
     * @param postId The ID of the post
     * @return Post struct containing post data
     */
    function getPost(uint256 postId) external view override returns (SocialTippingTypes.Post memory) {
        return super.getPost(postId);
    }

    /**
     * @dev Increase engagement for a post (triggers auto-tips)
     * @param postId The ID of the post
     */
    function increaseEngagement(uint256 postId) external override {
        super.increaseEngagement(postId);
        
        // Check if any auto-tips should be triggered
        SocialTippingTypes.Post storage post = posts[postId];
        super.checkAndExecuteAutoTips(postId, post);
    }

    /**
     * @dev Increase engagement without triggering auto-execution (for testing)
     * @param postId The ID of the post
     */
    function increaseEngagementManual(uint256 postId) external override {
        super.increaseEngagementManual(postId);
    }

    // ============ TIP MANAGEMENT ============

    /**
     * @dev Send a tip to a post
     * @param postId The ID of the post to tip
     */
    function sendTip(uint256 postId) external payable {
        SocialTippingTypes.Post storage post = posts[postId];
        super.sendTip(postId, post);
    }

    /**
     * @dev Get creator's total earnings
     * @param creator The address of the creator
     * @return Total earnings in wei
     */
    function getCreatorEarnings(address creator) external view override returns (uint256) {
        return super.getCreatorEarnings(creator);
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
        
        SocialTippingTypes.Post storage post = posts[postId];
        super.enableAutoTip(postId, threshold, amount, post);
    }

    /**
     * @dev Execute auto-tip when engagement threshold is met (supports delegation)
     * @param postId The ID of the post
     * @param autoTipIndex Index of the auto-tip to execute
     */
    function executeAutoTip(uint256 postId, uint256 autoTipIndex) external {
        SocialTippingTypes.Post storage post = posts[postId];
        super.executeAutoTip(postId, autoTipIndex, post);
    }

    /**
     * @dev Get auto-tips for a post
     * @param postId The ID of the post
     * @return Array of AutoTip structs
     */
    function getAutoTips(uint256 postId) external view override returns (SocialTippingTypes.AutoTip[] memory) {
        return super.getAutoTips(postId);
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
        
        SocialTippingTypes.Post storage post = posts[postId];
        super.createDelegation(postId, threshold, amount, delegatee, post);
        
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
        super.revokeDelegation(postId, autoTipIndex, autoTips);
    }

    /**
     * @dev Get user's delegations
     * @param user The address of the user
     * @return Array of Delegation structs
     */
    function getUserDelegations(address user) external view override returns (SocialTippingTypes.Delegation[] memory) {
        return super.getUserDelegations(user);
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
        return super.getDelegationStats(user);
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
