const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const port = 3042;

app.use(cors());
app.use(express.json());

// Real public keys (Ethereum addresses) generated from private keys
const balances = {
  "0x265e9c17727607bf81991f9ad2ffba8c485fb4e4": 100, // Account 1
  "0xc66f47a6c80a11f2471374c46369caf9e29339da": 50,  // Account 2
  "0xc4f967a0835da8ce57e345b510f2e7668a73777a": 75,  // Account 3
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, recovery, messageHash } = req.body;

  console.log("Received transfer request:", { sender, recipient, amount });

  setInitialBalance(sender);
  setInitialBalance(recipient);

  // Verify signature and recover public key
  try {
    const signatureBytes = hexToBytes(signature);
    const messageHashBytes = hexToBytes(messageHash);
    
    console.log("Signature bytes length:", signatureBytes.length);
    console.log("Message hash:", messageHash);
    console.log("Recovery bit:", recovery);
    
    // Recover the public key using the provided recovery bit
    const publicKey = secp.recoverPublicKey(messageHashBytes, signatureBytes, recovery);
    const recoveredAddress = `0x${toHex(keccak256(publicKey.slice(1))).slice(-40)}`;
    
    console.log("Recovered address:", recoveredAddress);
    console.log("Expected address:", sender);
    
    // Check if the recovered address matches the sender
    if (recoveredAddress !== sender) {
      console.log("Address mismatch:", recoveredAddress, "!=", sender);
      res.status(400).send({ message: "Invalid signature! Address doesn't match." });
      return;
    }
    
    // Check if the sender has enough funds
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
      return;
    }
    
    // Transfer the funds
    balances[sender] -= amount;
    balances[recipient] += amount;
    console.log("Transfer successful:", { sender, recipient, amount });
    res.send({ balance: balances[sender] });
    
  } catch (error) {
    console.error("Signature verification error:", error);
    res.status(400).send({ message: "Invalid signature!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
