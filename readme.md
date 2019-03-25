# @futuretense/stellar-musig

Three round m-of-m key aggregation for Stellar using the MuSig signature scheme

## Installation

`npm install @futuretense/stellar-musig`

## Usage

#### Import the library
```javascript
import * as musig from '@futuretense/stellar-musig';
```

#### Set up a configuration object
```javascript
const keys1 = StellarSdk.Keypair.random();
const keys2 = StellarSdk.Keypair.random();

const config = new musig.Config([
    keys1.publicKey(),
    keys2.publicKey()
]);

const publicKey = config.publicKey;
```

#### Create user sessions
```javascript
const transaction = new StellarSdk.TransactionBuilder(...)
                    ...
                    .build();

const session1 = new musig.Session(config, keys1, {tx: transaction});
const session2 = new musig.Session(config, keys2, {tx: transaction});
```

#### Round #1
```javascript
const c1 = session1.getLocalCommitment();
const c2 = session2.getLocalCommitment();
session1.setRemoteCommitment(...c2);
session2.setRemoteCommitment(...c1);
```

#### Round #2
```javascript
const n1 = session1.getLocalNonce();
const n2 = session2.getLocalNonce();
session1.setRemoteNonce(...n2);
session2.setRemoteNonce(...n1);
```

#### Round #3
```javascript
const s1 = session1.getLocalSignature();
const s2 = session2.getLocalSignature();
session1.setRemoteSignature(...s2);
session2.setRemoteSignature(...s1);
```

#### Verify the signature
```javascript
const signature = session1.aggregateSignature;
const vk = StellarSdk.Keypair.fromPublicKey(publicKey);
console.log(vk.verify(message, signature));
```

Copyright &copy; 2019 Future Tense, LLC