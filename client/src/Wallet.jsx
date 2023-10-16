import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js"
import {toHex} from 'ethereum-cryptography/utils'

/*
  send tx, a signed tx, to server, then server recovers pub key from
  that sig, and only goes through if that public key has those funds
*/

function Wallet({ address, setAddress, balance, setBalance,privateKey,setPrivateKey }) {
  
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    
    //address is publicKey
    const address = toHex(secp256k1.getPublicKey(privateKey));

    setAddress(address);

    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in a private key" value={privateKey} onChange={onChange}></input>
      </label>

      <div>
        Address: {address.slice(0,5)}...{address.slice(address.length - 4)}
      </div>

      <div className="balance">Balance: {balance}</div>
      
    </div>
  );
}

export default Wallet;

