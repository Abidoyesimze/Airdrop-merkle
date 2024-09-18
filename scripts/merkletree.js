import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";
import csv from "csv-parser";

const values = [];
fs.createReadStream("merkle.csv")
  .pipe(csv())
  .on("data", (row) => {
    values.push([row.address, row.amount]);
  })
  .on("end", () => {
    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);
    console.log("Merkle Root:", tree.root);
    fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
  });

const tree = StandardMerkleTree.load(
  JSON.parse(fs.readFileSync("tree.json", "utf8"))
);

const proofs = {};
for (const [i, v] of tree.entries()) {
  const proof = tree.getProof(i);
  proofs[v[0]] = proof;
}

fs.writeFileSync("proofs.json", JSON.stringify(proofs, null, 2));
console.log("Proofs have been generated and saved to proofs.json");