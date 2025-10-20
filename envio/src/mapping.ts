import { AutoTipEnabled, DelegationCreated, DelegationRevoked, PostCreated, TipSent } from "../generated/SocialTipping/SocialTipping";
import { AutoTip, Creator, Delegation, Post, Tip } from "../generated/schema";

export function handlePostCreated(event: PostCreated): void {
  let post = new Post(event.params.postId.toString());
  post.id = event.params.postId.toString();
  post.creator = event.params.creator.toHexString();
  post.content = event.params.content;
  post.timestamp = event.params.timestamp;
  post.totalTips = BigInt.fromI32(0);
  post.tipCount = 0;
  post.engagement = 0;
  post.save();

  // Update creator stats
  let creator = Creator.load(event.params.creator.toHexString());
  if (creator == null) {
    creator = new Creator(event.params.creator.toHexString());
    creator.address = event.params.creator.toHexString();
    creator.totalEarnings = BigInt.fromI32(0);
    creator.postCount = 0;
    creator.tipCount = 0;
  }
  creator.postCount = creator.postCount + 1;
  creator.save();
}

export function handleTipSent(event: TipSent): void {
  let tip = new Tip(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tip.id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  tip.postId = event.params.postId;
  tip.tipper = event.params.tipper.toHexString();
  tip.creator = event.params.creator.toHexString();
  tip.amount = event.params.amount;
  tip.timestamp = event.block.timestamp;
  tip.save();

  // Update post stats
  let post = Post.load(event.params.postId.toString());
  if (post != null) {
    post.totalTips = post.totalTips.plus(event.params.amount);
    post.tipCount = post.tipCount + 1;
    post.save();
  }

  // Update creator stats
  let creator = Creator.load(event.params.creator.toHexString());
  if (creator != null) {
    creator.totalEarnings = creator.totalEarnings.plus(event.params.amount);
    creator.tipCount = creator.tipCount + 1;
    creator.save();
  }
}

export function handleAutoTipEnabled(event: AutoTipEnabled): void {
  let autoTip = new AutoTip(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  autoTip.id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  autoTip.postId = event.params.postId;
  autoTip.tipper = event.params.tipper.toHexString();
  autoTip.threshold = event.params.threshold;
  autoTip.amount = event.params.amount;
  autoTip.active = true;
  autoTip.timestamp = event.block.timestamp;
  autoTip.save();
}

export function handleDelegationCreated(event: DelegationCreated): void {
  let delegation = new Delegation(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  delegation.id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  delegation.postId = event.params.postId;
  delegation.delegator = event.params.delegator.toHexString();
  delegation.delegatee = event.params.delegatee.toHexString();
  delegation.threshold = event.params.threshold;
  delegation.amount = event.params.amount;
  delegation.active = true;
  delegation.timestamp = event.block.timestamp;
  delegation.save();
}

export function handleDelegationRevoked(event: DelegationRevoked): void {
  // Find and update the delegation record
  let delegation = Delegation.load(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  if (delegation != null) {
    delegation.active = false;
    delegation.save();
  }
}
