// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;

    event newWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave[] waves;

    mapping(address => uint256) lastWavedAt;

    constructor() payable {
        console.log("I AM A SMART CONTRACT!");
        seed = (block.difficulty + block.timestamp) % 100;
    }

    function wave(string memory _message) public {
        // require(
        //     lastWavedAt[msg.sender] + 2 minutes < block.timestamp,
        //     "Wait 2 minutes"
        // );

        lastWavedAt[msg.sender] = block.timestamp;

        console.log("%s HAS WAVED %s!", msg.sender, _message);
        totalWaves += 1;

        waves.push(Wave(msg.sender, _message, block.timestamp));

        // seed = (block.difficulty + block.timestamp + seed) % 100;
        // console.log("Random seed generated: ", seed);

        // if (seed < 50) {
        //     console.log("%s HAS WON!", msg.sender);
        //     uint256 prizeAmount = 0.0001 ether;
        //     require(
        //         prizeAmount <= address(this).balance,
        //         "Trying to withdraw more money than contract has"
        //     );
        //     (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        //     require(success, "Failed to withdraw money from contract");
        // }
        // emit newWave(msg.sender, block.timestamp, _message);
        console.log("%s HAS WON!", msg.sender);
        uint256 prizeAmount = 0.02 ether;
        require(
            prizeAmount <= address(this).balance,
            "Trying to withdraw more money than contract has"
        );
        (bool success, ) = (msg.sender).call{value: prizeAmount}("");
        require(success, "Failed to withdraw money from contract");
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("WE HAVE A TOTAL OF %d WAVES", totalWaves);
        return totalWaves;
    }
}
