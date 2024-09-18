MerkleAirdrop.sol
This contract contains the core functionality for the token airdrop, including:

Constructor:
Accepts the ERC20 token address, the Merkle root, and the owner's address as parameters.
depositIntoContract():
Allows the owner to deposit tokens into the contract.
Emits the DepositIntoContractSuccessful event upon successful deposit.
claimTokens():
Allows eligible users to claim their airdrop by submitting a Merkle proof.
Web3CXI.sol
This is a standard ERC20 token contract that supports basic token functionality. It is used as the token for the airdrop.

Test Details
The test suite is designed to simulate the following scenarios:

Token Deposit: Ensures the contract owner can deposit tokens into the Merkle Airdrop contract.
Token Claim: Tests whether users who are part of the Merkle tree can successfully claim their tokens using a valid proof.
Example Test
typescript
Copy code
it("Should allow the owner to deposit tokens into the contract", async function () {
  await token.connect(owner).approve(merkleAirdrop.address, 500);

  const tx = await merkleAirdrop.depositIntoContract(500);
  await tx.wait();

  await expect(merkleAirdrop.depositIntoContract(500))
    .to.emit(merkleAirdrop, "DepositIntoContractSuccessful")
    .withArgs(await owner.getAddress(), 500);
});
Usage
Airdrop Workflow
Deploy the Contracts: Deploy the ERC20 token (Web3CXI.sol) and the Airdrop contract (MerkleAirdrop.sol).

Generate Merkle Tree: Use MerkleTree.js to generate a Merkle tree from the list of eligible users and their airdrop amounts. Store the Merkle root in the contract during deployment.

Claiming Tokens: Eligible users generate a Merkle proof and submit it to the contract via claimTokens() to receive their airdrop.

Example of Generating Merkle Tree
typescript
Copy code
const users = [
  { address: '0xabc...', amount: 1000 },
  { address: '0xdef...', amount: 2000 },
];

// Generate Merkle Tree leaves
const leaves = users.map((user) =>
  keccak256(
    ethers.utils.solidityPack(
      ["address", "uint256"],
      [user.address, user.amount]
    )
  )
);

// Create Merkle Tree
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
const merkleRoot = merkleTree.getRoot();
License
This project is licensed under the MIT License.

This README provides an overview of the contract, setup instructions, and details about how the contract works.