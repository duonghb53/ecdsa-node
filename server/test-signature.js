const secp = require("ethereum-cryptography/secp256k1");
const { toHex, hexToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

async function testSignature() {
  // Test private key and address (using the newly generated ones)
  const privateKey = "77edc464d5ba3d0d2713da815564c1944d686f5df6c7504200c00c9272d9e275";
  const address = "0x265e9c17727607bf81991f9ad2ffba8c485fb4e4";

  // Create a test message
  const message = {
    sender: address,
    recipient: "0xc66f47a6c80a11f2471374c46369caf9e29339da",
    amount: 10,
  };

  console.log("Test Message:", message);

  // Convert message to string and hash it
  const messageStr = JSON.stringify(message);
  const messageHash = keccak256(new TextEncoder().encode(messageStr));

  console.log("Message Hash:", toHex(messageHash));

  // Sign the message hash
  const [signature, recovery] = await secp.sign(
    messageHash,
    hexToBytes(privateKey),
    {
      recovered: true,
    }
  );
  console.log("Signature:", toHex(signature));
  console.log("Recovery:", recovery);

  // Try to recover the public key from the signature
  try {
    const publicKey = secp.recoverPublicKey(messageHash, signature, recovery);
    const recoveredAddress = `0x${toHex(keccak256(publicKey.slice(1))).slice(
      -40
    )}`;

    console.log("Recovered Address:", recoveredAddress);
    console.log("Original Address:", address);
    console.log("Addresses match:", recoveredAddress === address);
  } catch (error) {
    console.log("Error recovering public key:", error.message);
  }
}

testSignature().catch(console.error);
