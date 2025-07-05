import { useState } from "react";
import server from "./server";
import { toHex, hexToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp from "ethereum-cryptography/secp256k1";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      // Create a message to sign
      const message = {
        sender: address,
        recipient: recipient,
        amount: parseInt(sendAmount),
      };
      
      // Convert message to string and hash it
      const messageStr = JSON.stringify(message);
      const messageHash = keccak256(new TextEncoder().encode(messageStr));
      
      // Sign the message hash with the private key and get recovery bit
      const [signature, recovery] = await secp.sign(messageHash, hexToBytes(privateKey), {
        recovered: true,
      });
      
      console.log("Signature:", toHex(signature));
      console.log("Recovery bit:", recovery);
      
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: toHex(signature),
        recovery: recovery,
        messageHash: toHex(messageHash),
      });
      setBalance(balance);
      setSendAmount("");
      setRecipient("");
      setPrivateKey("");
    } catch (ex) {
      console.error("Transfer error:", ex);
      if (ex.response && ex.response.data) {
        alert(ex.response.data.message);
      } else {
        alert("Transfer failed. Please check your inputs and try again.");
      }
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Private Key
        <input
          placeholder="Enter your private key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0xc66f47a6c80a11f2471374c46369caf9e29339da"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
