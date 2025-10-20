// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";

contract SocialTipping {
    // Events for Envio indexing
    event PostCreated(uint256 indexed postId, address indexed creator, string content, uint256 timestamp);
    event TipSent(uint256 indexed postId, address indexed tipper, address indexed creator, uint256 amount);
    event AutoTipEnabled(uint256 indexed postId, address indexed tipper, uint256 threshold, uint256 amount);
    event AutoTipExecuted(uint256 indexed postId, address indexed tipper, address indexed creator, uint256 amount);
    event DelegationCreated(uint256 indexed postId, address indexed delegator, address indexed delegatee, uint256 threshold, uint256 amount);
    event DelegationRevoked(uint256 indexed postId, address indexed delegator, uint256 autoTipIndex);
    
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
    
    // State variables
    uint256 public nextPostId = 1;
    mapping(uint256 => Post) public posts;
    mapping(uint256 => AutoTip[]) public autoTips; // postId => autoTips
    mapping(address => uint256) public creatorEarnings;
    mapping(address => Delegation[]) public userDelegations; // user => delegations
    
    // Modifier to check if caller is authorized to execute auto-tip
    modifier onlyAuthorized(uint256 postId, uint256 autoTipIndex) {
        AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(
            msg.sender == autoTip.tipper || msg.sender == autoTip.delegatee,
            "Not authorized to execute this auto-tip"
        );
        _;
    }
    
    // Create a new post
    function createPost(string memory content) external {
        uint256 postId = nextPostId++;
        posts[postId] = Post({
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
    
    // Send a tip to a post
    function sendTip(uint256 postId) external payable {
        require(posts[postId].creator != address(0), "Post does not exist");
        require(msg.value > 0, "Tip amount must be greater than 0");
        
        Post storage post = posts[postId];
        
        // Update post stats
        post.totalTips += msg.value;
        post.tipCount += 1;
        
        // Update creator earnings
        creatorEarnings[post.creator] += msg.value;
        
        // Transfer funds to creator
        payable(post.creator).transfer(msg.value);
        
        emit TipSent(postId, msg.sender, post.creator, msg.value);
    }
    
    // Enable auto-tipping for a post (delegation feature)
    function enableAutoTip(uint256 postId, uint256 threshold, uint256 amount) external payable {
        require(posts[postId].creator != address(0), "Post does not exist");
        require(amount > 0, "Auto-tip amount must be greater than 0");
        require(msg.value >= amount, "Insufficient funds for auto-tip");
        
        autoTips[postId].push(AutoTip({
            tipper: msg.sender,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp,
            delegatee: address(0) // No delegation initially
        }));
        
        emit AutoTipEnabled(postId, msg.sender, threshold, amount);
    }
    
    // Create delegation for auto-tipping (INNOVATION FEATURE)
    function createDelegation(
        uint256 postId, 
        uint256 threshold, 
        uint256 amount, 
        address delegatee
    ) external payable {
        require(posts[postId].creator != address(0), "Post does not exist");
        require(amount > 0, "Delegation amount must be greater than 0");
        require(msg.value >= amount, "Insufficient funds for delegation");
        require(delegatee != address(0), "Invalid delegatee address");
        
        // Create auto-tip with delegation
        autoTips[postId].push(AutoTip({
            tipper: msg.sender,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp,
            delegatee: delegatee
        }));
        
        // Store delegation record
        userDelegations[msg.sender].push(Delegation({
            delegator: msg.sender,
            delegatee: delegatee,
            postId: postId,
            threshold: threshold,
            amount: amount,
            active: true,
            createdAt: block.timestamp
        }));
        
        emit DelegationCreated(postId, msg.sender, delegatee, threshold, amount);
        emit AutoTipEnabled(postId, msg.sender, threshold, amount);
    }
    
    // Execute auto-tip when engagement threshold is met (supports delegation)
    function executeAutoTip(uint256 postId, uint256 autoTipIndex) external onlyAuthorized(postId, autoTipIndex) {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.active, "Auto-tip is not active");
        require(posts[postId].engagement >= autoTip.threshold, "Threshold not met");
        
        Post storage post = posts[postId];
        
        // Transfer funds to creator
        payable(post.creator).transfer(autoTip.amount);
        
        // Update stats
        post.totalTips += autoTip.amount;
        post.tipCount += 1;
        creatorEarnings[post.creator] += autoTip.amount;
        
        // Deactivate auto-tip
        autoTip.active = false;
        
        emit AutoTipExecuted(postId, autoTip.tipper, post.creator, autoTip.amount);
    }
    
    // Revoke delegation
    function revokeDelegation(uint256 postId, uint256 autoTipIndex) external {
        require(autoTipIndex < autoTips[postId].length, "Auto-tip does not exist");
        
        AutoTip storage autoTip = autoTips[postId][autoTipIndex];
        require(autoTip.tipper == msg.sender, "Only tipper can revoke");
        require(autoTip.active, "Auto-tip is not active");
        
        // Deactivate auto-tip
        autoTip.active = false;
        
        // Refund the amount to the tipper
        payable(msg.sender).transfer(autoTip.amount);
        
        emit DelegationRevoked(postId, msg.sender, autoTipIndex);
    }
    
    // Increase engagement (for demo purposes)
    function increaseEngagement(uint256 postId) external {
        require(posts[postId].creator != address(0), "Post does not exist");
        posts[postId].engagement += 1;
        
        // Check if any auto-tips should be triggered
        _checkAndExecuteAutoTips(postId);
    }
    
    // Internal function to check and execute auto-tips when engagement increases
    function _checkAndExecuteAutoTips(uint256 postId) internal {
        AutoTip[] storage postAutoTips = autoTips[postId];
        
        for (uint256 i = 0; i < postAutoTips.length; i++) {
            AutoTip storage autoTip = postAutoTips[i];
            
            if (autoTip.active && posts[postId].engagement >= autoTip.threshold) {
                // Execute the auto-tip
                Post storage post = posts[postId];
                
                // Transfer funds to creator
                payable(post.creator).transfer(autoTip.amount);
                
                // Update stats
                post.totalTips += autoTip.amount;
                post.tipCount += 1;
                creatorEarnings[post.creator] += autoTip.amount;
                
                // Deactivate auto-tip
                autoTip.active = false;
                
                emit AutoTipExecuted(postId, autoTip.tipper, post.creator, autoTip.amount);
            }
        }
    }
    
    // Get post details
    function getPost(uint256 postId) external view returns (Post memory) {
        return posts[postId];
    }
    
    // Get auto-tips for a post
    function getAutoTips(uint256 postId) external view returns (AutoTip[] memory) {
        return autoTips[postId];
    }
    
    // Get creator's total earnings
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
    
    // Get user's delegations
    function getUserDelegations(address user) external view returns (Delegation[] memory) {
        return userDelegations[user];
    }
    
    // Get delegation statistics
    function getDelegationStats(address user) external view returns (
        uint256 totalDelegations,
        uint256 activeDelegations,
        uint256 totalDelegatedAmount
    ) {
        Delegation[] memory delegations = userDelegations[user];
        totalDelegations = delegations.length;
        
        for (uint256 i = 0; i < delegations.length; i++) {
            if (delegations[i].active) {
                activeDelegations++;
                totalDelegatedAmount += delegations[i].amount;
            }
        }
    }
}
