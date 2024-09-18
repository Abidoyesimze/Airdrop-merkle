import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { Contract, Signer } from "ethers";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

describe("Merkle", function () {
  let merkleAirdrop: any,
  token: any,
  owner: any,
  addr1 = '0xe2A83b15FC300D8457eB9E176f98d92a8FF40a49',
  addr2 = '0x6b4DF334368b09f87B3722449703060EEf284126',
  addr3 = '0x6b4DF334368b09f87B3722449703060EEf284126',
  addrWithoutNFT: any;
  
  let merkleRoot, merkleTree: any;
  let users: any[] = [];
  
  (async function () {
    [owner, addrWithoutNFT] = await ethers.getSigners();

    
    await setBalance(addr1, ethers.parseEther("30"));
    await setBalance(addr2, ethers.parseEther("30"));
    await setBalance(addr3, ethers.parseEther("30"));

    
    const Token = await ethers.getContractFactory("Web3CXI");
    token = await Token.deploy();
    

    
    users = [
      { address: addr1, amount: 30000 },
      { address: addr2, amount: 10000 },
      { address: addr3, amount: 5000 },
      { address: addrWithoutNFT.address, amount: 5000 },
    ];

    const leaves = users.map((user) =>
      keccak256(
        ethers.solidityPacked(
          ["address", "uint256"],
          [user.address, user.amount]
        )
      )
    );
    merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getRoot().toString("hex");

    const MerkleAirdropFactory = await ethers.getContractFactory(
      "Merkle"
    );
    merkleAirdrop = await MerkleAirdropFactory.deploy(token, merkleRoot, owner);

    // Transfer tokens to contract
    await token.transfer(merkleAirdrop, 100000);
  });
  it("Should allow the owner to deposit tokens into the contract", async function () {
    await token.connect(owner).approve(merkleAirdrop, 500);

    const tx = await merkleAirdrop.depositIntoContract(500);
    const receipt = await tx.wait();
    
    await expect(merkleAirdrop.depositIntoContract(500))
      .to.emit(merkleAirdrop, "DepositIntoContractSuccessful")
      .withArgs(owner.address, 500);
  });

  });

  


