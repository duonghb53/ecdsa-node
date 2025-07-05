const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

console.log("Generating keys for accounts...\n");

// Generate 3 private keys and their corresponding public keys
for (let i = 1; i <= 3; i++) {
  const privateKey = secp.utils.randomPrivateKey();
  const publicKey = secp.getPublicKey(privateKey);
  
  // Generate Ethereum address by hashing the public key (remove the first byte which is the prefix)
  const address = keccak256(publicKey.slice(1));
  
  console.log(`Account ${i}:`);
  console.log(`Private Key: ${toHex(privateKey)}`);
  console.log(`Public Key: ${toHex(publicKey)}`);
  console.log(`Ethereum Address: 0x${toHex(address).slice(-40)}`);
  console.log("---");
} 