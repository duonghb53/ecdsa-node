const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

// Test private key and expected address (using the newly generated ones)
const privateKey = "9dcd8ec6d20d784f8bfee4ad527849976b26e3aecc9f6e525fe7fe47c05176d8";
const expectedAddress = "0x25224a17dc74c676ad57750f97664749fe0c3a94";

console.log("Private Key:", privateKey);
console.log("Expected Address:", expectedAddress);

// Generate public key from private key
const publicKey = secp.getPublicKey(hexToBytes(privateKey));
console.log("Public Key:", toHex(publicKey));

// Derive Ethereum address from public key (remove the first byte which is the prefix)
const addressBytes = keccak256(publicKey.slice(1));
const derivedAddress = `0x${toHex(addressBytes).slice(-40)}`;
console.log("Derived Address:", derivedAddress);
console.log("Addresses match:", derivedAddress === expectedAddress);

// Let's also check what we get when we hash the full public key
const fullAddressBytes = keccak256(publicKey);
const fullDerivedAddress = `0x${toHex(fullAddressBytes).slice(-40)}`;
console.log("Full Public Key Derived Address:", fullDerivedAddress);
console.log("Full addresses match:", fullDerivedAddress === expectedAddress);

// Let's check the generate-keys.js logic
console.log("\n--- Checking generate-keys.js logic ---");
const publicKeyHex = toHex(publicKey);
console.log("Public Key (hex):", publicKeyHex);
console.log("Public Key length:", publicKeyHex.length);
console.log("Last 40 chars:", publicKeyHex.slice(-40));
console.log("Expected from generate-keys:", expectedAddress.slice(2));
console.log("Match:", publicKeyHex.slice(-40) === expectedAddress.slice(2)); 