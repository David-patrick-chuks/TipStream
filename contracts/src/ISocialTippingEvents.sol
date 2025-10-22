// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Events interface for TipStream Platform
interface ISocialTippingEvents {
    event PostCreated(uint256 indexed postId, address indexed creator, string content, uint256 timestamp);
    event TipSent(uint256 indexed postId, address indexed tipper, address indexed creator, uint256 amount);
    event AutoTipEnabled(uint256 indexed postId, address indexed tipper, uint256 threshold, uint256 amount);
    event AutoTipExecuted(uint256 indexed postId, address indexed tipper, address indexed creator, uint256 amount);
    event DelegationCreated(uint256 indexed postId, address indexed delegator, address indexed delegatee, uint256 threshold, uint256 amount);
    event DelegationRevoked(uint256 indexed postId, address indexed delegator, uint256 autoTipIndex);
}
