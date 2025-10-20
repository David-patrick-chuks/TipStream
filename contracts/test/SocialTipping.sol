// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {SocialTipping} from "../src/SocialTipping.sol";

contract SocialTippingTest is Test {
    SocialTipping public socialTipping;
    
    address public creator = makeAddr("creator");
    address public tipper = makeAddr("tipper");
    address public delegatee = makeAddr("delegatee");
    address public anotherUser = makeAddr("anotherUser");
    
    uint256 public constant TIP_AMOUNT = 0.01 ether;
    uint256 public constant AUTO_TIP_AMOUNT = 0.005 ether;
    uint256 public constant ENGAGEMENT_THRESHOLD = 10;

    function setUp() public {
        socialTipping = new SocialTipping();
        
        // Fund test accounts
        vm.deal(creator, 1 ether);
        vm.deal(tipper, 1 ether);
        vm.deal(delegatee, 1 ether);
        vm.deal(anotherUser, 1 ether);
    }

    // Test post creation
    function test_CreatePost() public {
        vm.prank(creator);
        socialTipping.createPost("Hello Web3!");
        
        SocialTipping.Post memory post = socialTipping.getPost(1);
        assertEq(post.id, 1);
        assertEq(post.creator, creator);
        assertEq(post.content, "Hello Web3!");
        assertEq(post.totalTips, 0);
        assertEq(post.tipCount, 0);
        assertEq(post.engagement, 0);
    }

    // Test manual tipping
    function test_SendTip() public {
        // Create post first
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        uint256 creatorBalanceBefore = creator.balance;
        
        // Send tip
        vm.prank(tipper);
        socialTipping.sendTip{value: TIP_AMOUNT}(1);
        
        SocialTipping.Post memory post = socialTipping.getPost(1);
        assertEq(post.totalTips, TIP_AMOUNT);
        assertEq(post.tipCount, 1);
        assertEq(creator.balance, creatorBalanceBefore + TIP_AMOUNT);
        assertEq(socialTipping.getCreatorEarnings(creator), TIP_AMOUNT);
    }

    // Test auto-tip creation
    function test_EnableAutoTip() public {
        // Create post first
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        // Enable auto-tip
        vm.prank(tipper);
        socialTipping.enableAutoTip{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT);
        
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertEq(autoTips.length, 1);
        assertEq(autoTips[0].tipper, tipper);
        assertEq(autoTips[0].threshold, ENGAGEMENT_THRESHOLD);
        assertEq(autoTips[0].amount, AUTO_TIP_AMOUNT);
        assertTrue(autoTips[0].active);
        assertEq(autoTips[0].delegatee, address(0)); // No delegation initially
    }

    // Test delegation creation (INNOVATION FEATURE)
    function test_CreateDelegation() public {
        // Create post first
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        // Create delegation
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT, delegatee);
        
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertEq(autoTips.length, 1);
        assertEq(autoTips[0].tipper, tipper);
        assertEq(autoTips[0].delegatee, delegatee);
        assertTrue(autoTips[0].active);
        
        SocialTipping.Delegation[] memory delegations = socialTipping.getUserDelegations(tipper);
        assertEq(delegations.length, 1);
        assertEq(delegations[0].delegator, tipper);
        assertEq(delegations[0].delegatee, delegatee);
        assertEq(delegations[0].postId, 1);
        assertTrue(delegations[0].active);
    }

    // Test delegation execution by delegatee
    function test_ExecuteAutoTipByDelegatee() public {
        // Create post and delegation
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT, delegatee);
        
        // Increase engagement to meet threshold without triggering auto-execution
        vm.prank(anotherUser);
        for (uint256 i = 0; i < ENGAGEMENT_THRESHOLD; i++) {
            socialTipping.increaseEngagementManual(1);
        }
        
        uint256 creatorBalanceBefore = creator.balance;
        
        // Execute auto-tip by delegatee
        vm.prank(delegatee);
        socialTipping.executeAutoTip(1, 0);
        
        SocialTipping.Post memory post = socialTipping.getPost(1);
        assertEq(post.totalTips, AUTO_TIP_AMOUNT);
        assertEq(post.tipCount, 1);
        assertEq(creator.balance, creatorBalanceBefore + AUTO_TIP_AMOUNT);
        
        // Auto-tip should be deactivated
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertFalse(autoTips[0].active);
    }

    // Test automatic execution when engagement threshold is met
    function test_AutomaticExecutionOnEngagement() public {
        // Create post and auto-tip
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.enableAutoTip{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT);
        
        uint256 creatorBalanceBefore = creator.balance;
        
        // Increase engagement to trigger auto-execution
        vm.prank(anotherUser);
        for (uint256 i = 0; i < ENGAGEMENT_THRESHOLD; i++) {
            socialTipping.increaseEngagement(1);
        }
        
        SocialTipping.Post memory post = socialTipping.getPost(1);
        assertEq(post.totalTips, AUTO_TIP_AMOUNT);
        assertEq(post.tipCount, 1);
        assertEq(creator.balance, creatorBalanceBefore + AUTO_TIP_AMOUNT);
        
        // Auto-tip should be deactivated
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertFalse(autoTips[0].active);
    }

    // Test delegation revocation
    function test_RevokeDelegation() public {
        // Create post and delegation
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT, delegatee);
        
        uint256 tipperBalanceBefore = tipper.balance;
        
        // Revoke delegation
        vm.prank(tipper);
        socialTipping.revokeDelegation(1, 0);
        
        // Auto-tip should be deactivated
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertFalse(autoTips[0].active);
        
        // Tipper should get refund
        assertEq(tipper.balance, tipperBalanceBefore + AUTO_TIP_AMOUNT);
    }

    // Test delegation statistics
    function test_DelegationStats() public {
        // Create post and delegation
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT, delegatee);
        
        (uint256 totalDelegations, uint256 activeDelegations, uint256 totalDelegatedAmount) = 
            socialTipping.getDelegationStats(tipper);
        
        assertEq(totalDelegations, 1);
        assertEq(activeDelegations, 1);
        assertEq(totalDelegatedAmount, AUTO_TIP_AMOUNT);
    }

    // Test authorization - only tipper or delegatee can execute
    function test_OnlyAuthorizedCanExecute() public {
        // Create post and delegation
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, ENGAGEMENT_THRESHOLD, AUTO_TIP_AMOUNT, delegatee);
        
        // Increase engagement
        vm.prank(anotherUser);
        for (uint256 i = 0; i < ENGAGEMENT_THRESHOLD; i++) {
            socialTipping.increaseEngagement(1);
        }
        
        // Unauthorized user cannot execute
        vm.prank(anotherUser);
        vm.expectRevert("Not authorized to execute this auto-tip");
        socialTipping.executeAutoTip(1, 0);
    }

    // Test multiple delegations on same post
    function test_MultipleDelegations() public {
        // Create post
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        // Create multiple delegations
        vm.prank(tipper);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, 5, AUTO_TIP_AMOUNT, delegatee);
        
        vm.prank(anotherUser);
        socialTipping.createDelegation{value: AUTO_TIP_AMOUNT}(1, 10, AUTO_TIP_AMOUNT, delegatee);
        
        SocialTipping.AutoTip[] memory autoTips = socialTipping.getAutoTips(1);
        assertEq(autoTips.length, 2);
        
        // Both should be active
        assertTrue(autoTips[0].active);
        assertTrue(autoTips[1].active);
    }

    // Test edge cases
    function test_EdgeCases() public {
        // Test sending tip to non-existent post
        vm.prank(tipper);
        vm.expectRevert("Post does not exist");
        socialTipping.sendTip{value: TIP_AMOUNT}(999);
        
        // Test zero tip amount
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        vm.expectRevert("Tip amount must be greater than 0");
        socialTipping.sendTip{value: 0}(1);
        
        // Test insufficient funds for auto-tip
        vm.prank(tipper);
        vm.expectRevert("Insufficient funds for auto-tip");
        socialTipping.enableAutoTip{value: 0.001 ether}(1, 5, 0.01 ether);
    }

    // Fuzz test for engagement thresholds
    function testFuzz_EngagementThreshold(uint256 threshold) public {
        vm.assume(threshold > 0 && threshold < 1000); // Reasonable bounds
        
        vm.prank(creator);
        socialTipping.createPost("Test post");
        
        vm.prank(tipper);
        socialTipping.enableAutoTip{value: AUTO_TIP_AMOUNT}(1, threshold, AUTO_TIP_AMOUNT);
        
        // Increase engagement to meet threshold
        vm.prank(anotherUser);
        for (uint256 i = 0; i < threshold; i++) {
            socialTipping.increaseEngagement(1);
        }
        
        SocialTipping.Post memory post = socialTipping.getPost(1);
        assertEq(post.totalTips, AUTO_TIP_AMOUNT);
        assertEq(post.tipCount, 1);
    }
}
