// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";



contract BoredApeAirdrop is Ownable{

    bytes32 public merkleRoot;
    IERC20 public token;
    address public constant BAYC_ADDRESS = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;
    

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);

    
    constructor(address _token, bytes32 _merkleRoot) Ownable(msg.sender){
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }
    


    function ClaimAirdrop(bytes32[] memory proof, uint256 amount) public {
        require(msg.sender != address(0), "address Zero detected");
        require(!hasClaimed[msg.sender], "Address has already claimed");
         require(IERC721(BAYC_ADDRESS).balanceOf(msg.sender) > 0, "Must own a BAYC NFT");
        
    
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount))));
    
        require(MerkleProof.verify(proof, merkleRoot, leaf), "Invalid proof");
    
        
        hasClaimed[msg.sender] = true;
    
        IERC20(token).transfer(msg.sender, amount);
        emit AirdropClaimed(msg.sender, amount);
    }
    

    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Token transfer failed");
    }

}