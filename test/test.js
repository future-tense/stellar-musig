
import test from 'ava';
import * as StellarSdk from 'stellar-sdk';
import * as musig from '../lib';

test('2-of-2 key aggregation', t => {
    const keys1 = StellarSdk.Keypair.random();
    const keys2 = StellarSdk.Keypair.random();

    const conf = new musig.Config([
        keys1.publicKey(),
        keys2.publicKey(),
    ]);

    const account = new StellarSdk.Account(conf.publicKey, '0');
    const transaction = new StellarSdk.TransactionBuilder(account, {fee: 100})
        .addOperation(StellarSdk.Operation.payment({
            source: keys1.publicKey(),
            destination: keys2.publicKey(),
            amount: '1000',
            asset: StellarSdk.Asset.native()
        }))
        .setTimeout(0)
        .build();

    const networkId = StellarSdk.hash(StellarSdk.Networks.PUBLIC);
    const session1 = new musig.Session(conf, keys1, {
        tx: transaction,
        networkId
    });
    const session2 = new musig.Session(conf, keys2, {
        tx: transaction,
        networkId
    });

    //  signing round #1: generate random nonces, and submit commitments
    const c1 = session1.getLocalCommitment();
    const c2 = session2.getLocalCommitment();
    session1.setRemoteCommitment(...c2);
    session2.setRemoteCommitment(...c1);

    //  signing round #2: submit nonces
    const n1 = session1.getLocalNonce();
    const n2 = session2.getLocalNonce();
    session1.setRemoteNonce(...n2);
    session2.setRemoteNonce(...n1);

    //  signing round #3: sign message and submit signature for aggregation
    const s1 = session1.getLocalSignature();
    const s2 = session2.getLocalSignature();
    session1.setRemoteSignature(...s2);
    session2.setRemoteSignature(...s1);

    //  verify signature
    const signature = session1.aggregateSignature;
    const message = session1.message;
    const vk = StellarSdk.Keypair.fromPublicKey(conf.publicKey);
    t.true(vk.verify(message, signature));
});
