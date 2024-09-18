// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; 

error AccessRestricted();
error AlreadyClaimed();
error MustOwnBAYC();

contract Merkle {
    IERC20 public token;
    bytes32 public merkleRoot;
    address owner;
    IERC721 public baycAddress;

    
    address constant BAYC_ADDRESS = 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D;

    constructor(address _token, bytes32 _merkleRoot) {
        token = IERC20(_token);  
        merkleRoot = _merkleRoot;
        owner = msg.sender;
        baycAddress = IERC721(BAYC_ADDRESS);
    }

    struct User {
        address claimant;
        uint amount;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert AccessRestricted();
        }
        _;
    }

    mapping(address => User) public claimedUsers;

    event Claimed(address indexed claimant, uint256 amount); 

    function claim(uint256 _amount, bytes32[] calldata _merkleProof) external {
        if (claimedUsers[msg.sender].amount != 0) {
            revert AlreadyClaimed();
        }

       
        if (baycAddress.balanceOf(msg.sender) == 0) {
            revert MustOwnBAYC();
        }

        // Verify the Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid Merkle proof");
        
        
        claimedUsers[msg.sender] = User(msg.sender, _amount);

       
        require(token.transfer(msg.sender, _amount), "Token transfer failed");

        emit Claimed(msg.sender, _amount);
    }

    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        merkleRoot = _newMerkleRoot;
    }

}
