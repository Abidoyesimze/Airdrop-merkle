import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { Contract, Signer } from "ethers";

describe("merkle", function() {
  describe("Merkle", function () {
    let Merkle: any, merkle: Contract, Web3CXI: any, token: Contract, MockBAYC: any, bayc: Contract;
    let owner: Signer, addr1: Signer, addr2: Signer, addrs: Signer[];
    let merkleTree: MerkleTree, root: string;

    beforeEach(async function () {
      // Deploy Web3CXI token
      Web3CXI = await ethers.getContractFactory("Web3CXI");
      token = await Web3CXI.deploy();
       

      // Deploy mock BAYC
      MockBAYC = await ethers.getContractFactory("mockBAYC");
      bayc = await MockBAYC.deploy();
      bayc =  await bayc.deployed();

      [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
      const leaves = [
        { address: await addr1.getAddress(), amount: ethers.parseEther("100") },
        { address: await addr2.getAddress(), amount: ethers.parseEther("200") },
      ].map((x) => ethers.solidityPackedKeccak256(["address", "uint256"], [x.address, x.amount]));
      merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
      root = merkleTree.getHexRoot();

      // Deploy Merkle contract
      Merkle = await ethers.getContractFactory("Merkle");
      merkle = await Merkle.deploy(token.address, root);
      await merkle.deployed();

      // Transfer tokens to Merkle contract
      await token.transfer(merkle.address, ethers.parseEther("1000"));

      // Mint BAYC NFTs to addr1 and addr2
      await bayc.mint(await addr1.getAddress());
      await bayc.mint(await addr2.getAddress());
    });

    describe("Deployment", function () {
      it("Should set the right token", async function () {
        expect(await merkle.token()).to.equal(token.address);
      });
    });
  });
});