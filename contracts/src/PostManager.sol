// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/console.sol";
import "./SocialTippingTypes.sol";
import "./ISocialTippingEvents.sol";

// Post management contract
contract PostManager is ISocialTippingEvents {
    using SocialTippingTypes for SocialTippingTypes.Post;
    
    uint256 public nextPostId = 1;
    mapping(uint256 => SocialTippingTypes.Post) public posts;
    
    function createPost(string memory content) public virtual {
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
    
    function getPost(uint256 postId) public view virtual returns (SocialTippingTypes.Post memory) {
        return posts[postId];
    }
    
    function increaseEngagement(uint256 postId) public virtual {
        require(posts[postId].creator != address(0), "Post does not exist");
        posts[postId].engagement += 1;
    }
    
    function increaseEngagementManual(uint256 postId) public virtual {
        require(posts[postId].creator != address(0), "Post does not exist");
        posts[postId].engagement += 1;
    }
    
    function updatePostStats(uint256 postId, uint256 tipAmount) external {
        SocialTippingTypes.Post storage post = posts[postId];
        post.totalTips += tipAmount;
        post.tipCount += 1;
    }
}
