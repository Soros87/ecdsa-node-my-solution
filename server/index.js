const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const {keccak256} = require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());


//private key: 80b389b2993c1de9aab431666d8d802eaba9fe0059a23e09629a28c5c5a13fb5
//public key: 0278fae95673b587832a42dfdb09c72c58be0acf54d14fc0c2eb55e568db1b9544

//private key: 26c036b6c688bd65c446de3869db2a30733e38600d887142a1b6f641a5354064
//public key: 020b253f88476b5b73bfe5dda4f6313f445883f28396d60ec4c95faa0178ea5bf5

//private key:75fc1fe6d0ed6002f3f723773a72373a479ae3295b8427bbb06e4210916d3135
//public key: 02233d694ae6edb1523faebbaed6a67e916da7bc3f1c316b70ad075a639530e65d

//public keys
const balances = {
  "0278fae95673b587832a42dfdb09c72c58be0acf54d14fc0c2eb55e568db1b9544": 100,
  "020b253f88476b5b73bfe5dda4f6313f445883f28396d60ec4c95faa0178ea5bf5": 50,
  "02233d694ae6edb1523faebbaed6a67e916da7bc3f1c316b70ad075a639530e65d": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

  //TODO: get a signature from the client side application
  
  const { sender, sig:sigStringed, msg } = req.body;
  const { recipient, amount } = msg;

  const sig = {
    ...sigStringed,
    r: BigInt(sigStringed.r),
    s: BigInt(sigStringed.s)
  }
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender) === true;

  if(!isValid) res.status(400).send({ message: "Bad signature!"});

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
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
