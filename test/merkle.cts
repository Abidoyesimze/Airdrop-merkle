import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
const helpers = require("@nomicfoundation/hardhat-network-helpers");
import { expect } from "chai";
import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("MerkleAirdrop", function () {
  async function deployFixture() {
    
    const [owner] = await ethers.getSigners();

    // Deploy ERC20 token
    const ApeCoin = await ethers.getContractFactory("ApeCoin");
    const token = await ApeCoin.deploy();

    const addr1 = "0x76C1cFe708ED1d2FF2073490727f3301117767e9";
    const addr2 = "0x6b4DF334368b09f87B3722449703060EEf284126";
    const addr3 = "0x6b4DF334368b09f87B3722449703060EEf284126";
    

    // Create Merkle tree
    const elements = [
      [addr1, ethers.parseEther("100")],
      [addr2, ethers.parseEther("200")],
      [addr3, ethers.parseEther("300")],
    ];

    const merkleTree = StandardMerkleTree.of(elements, ["address", "uint256"]);
    const root = merkleTree.root;
  

    // Deploy MerkleAirdrop
    const BoredApeAirdrop = await ethers.getContractFactory("BoredApeAirdrop");
    const airdrop = await BoredApeAirdrop.deploy(token, root);

    // Transfer tokens to the airdrop contract
    await token.transfer(await airdrop.getAddress(), ethers.parseEther("1000"));

    return { token, airdrop, owner, addr1, addr2, addr3, merkleTree};
  }

  it("Should deploy the contract with correct ERC20 token and Merkle root", async function () {
    const { token, airdrop, merkleTree} = await loadFixture(deployFixture);

    expect(await airdrop.token()).to.equal(await token.getAddress());
    expect(await airdrop.merkleRoot()).to.equal(merkleTree.root);
  });

  it("Should allow valid claims", async function () {
    const { owner, airdrop, addr1, merkleTree } = await loadFixture(deployFixture);

    await helpers.impersonateAccount(addr1);
    const impersonatedSigner = await ethers.getSigner(addr1);

    await owner.sendTransaction({
      to: impersonatedSigner,
      value: ethers.parseEther("1.0")  // Send 1 ETH
    });

    const leaf = [addr1, ethers.parseEther("100")];
    const proof = merkleTree.getProof(leaf);
  
   
    await (airdrop.connect(impersonatedSigner).ClaimAirdrop(proof, ethers.parseEther("100")))
  });

   it("Should reject invalid claims", async function () {
    const {  owner, airdrop, addr1, addr2, merkleTree } = await loadFixture(deployFixture);

    const leaf = [addr1, ethers.parseEther("100")];
    const proof = merkleTree.getProof(leaf);

    await helpers.impersonateAccount(addr1);
    const impersonatedSigner = await ethers.getSigner(addr1);

    await owner.sendTransaction({
      to: impersonatedSigner,
      value: ethers.parseEther("1.0")  // Send 1 ETH
    });


    await helpers.impersonateAccount(addr2);
    const impersonatedSigner1 = await ethers.getSigner(addr2);

    await owner.sendTransaction({
      to: impersonatedSigner1,
      value: ethers.parseEther("1.0")  // Send 1 ETH
    });


    await expect(
      airdrop.connect(impersonatedSigner1).ClaimAirdrop(proof, ethers.parseEther("100"))
    ).to.be.revertedWith("Invalid proof");

  });

  it("Should reject if amount is wrong", async function () {
    const { owner, airdrop, addr1, merkleTree } = await loadFixture(deployFixture);

    await helpers.impersonateAccount(addr1);
    const impersonatedSigner = await ethers.getSigner(addr1);

    await owner.sendTransaction({
      to: impersonatedSigner,
      value: ethers.parseEther("1.0")  // Send 1 ETH
    });

    const leaf = [addr1, ethers.parseEther("100")];
    const proof = merkleTree.getProof(leaf);
  
   
    await expect(airdrop.connect(impersonatedSigner).ClaimAirdrop(proof, ethers.parseEther("200")))
    .to.be.revertedWith("Invalid proof");
  });

  it("Should prevent double claims", async function () {
    const { owner, airdrop, addr1, merkleTree } = await loadFixture(deployFixture);

    await helpers.impersonateAccount(addr1);
    const impersonatedSigner = await ethers.getSigner(addr1);

    await owner.sendTransaction({
      to: impersonatedSigner,
      value: ethers.parseEther("11.0")  // Send 1 ETH
    });

    const leaf = [addr1, ethers.parseEther("100")];
    const proof = merkleTree.getProof(leaf);
  
   
    await (airdrop.connect(impersonatedSigner).ClaimAirdrop(proof, ethers.parseEther("100")))
    await expect(airdrop.connect(impersonatedSigner).ClaimAirdrop(proof, ethers.parseEther("100")))
    .to.be.revertedWith("Address has already claimed");
  });
})