// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SocialTipping} from "../src/SocialTipping.sol";

contract SocialTippingScript is Script {
    SocialTipping public socialTipping;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        socialTipping = new SocialTipping();

        vm.stopBroadcast();
        
        console.log("SocialTipping deployed at:", address(socialTipping));
    }
}
