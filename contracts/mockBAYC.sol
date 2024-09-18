//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract mockBAYC is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("MockBAYC", "MBAYC") {}

    function mint(address to) public {
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
    }
}