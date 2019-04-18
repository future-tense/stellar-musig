
import * as StellarSdk from 'stellar-sdk';

import {
  Round,
  Config as BaseConfig,
  Session as BaseSession
} from '@futuretense/ed25519-musig';

export { Round };

const envelopeType = StellarSdk.xdr.EnvelopeType.envelopeTypeTx().toXDR();

/**
 *
 * @param tx
 * @param networkId
 * @return {*}
 */

function getTransactionHash(
    tx: StellarSdk.Transaction,
    networkId: Buffer,
): Buffer {
    return StellarSdk.hash(
        Buffer.concat([networkId, envelopeType, tx.tx.toXDR()])
    );
}

export class Config extends BaseConfig {

    public constructor(publicKeys: string[]) {
        const keyBufs = publicKeys.map(
            key => StellarSdk.StrKey.decodeEd25519PublicKey(key)
        );
        super(keyBufs);
    }

    get publicKey() {
        return StellarSdk.StrKey.encodeEd25519PublicKey(super.publicKey);
    }
}

export class Session extends BaseSession {

    public constructor(
        config: Config,
        keys: StellarSdk.Keypair,
        {
            tx,
            networkId,
            message
        }: {
            tx?: StellarSdk.Transaction,
            networkId?: Buffer,
            message?: Buffer
        }
    ) {
        const seed = keys._secretSeed;
        if (!message) {
            if (!tx) {
                throw 'Missing transaction';
            }

            if (!networkId) {
                networkId = StellarSdk.Network.networkId();
            }

            message = getTransactionHash(tx, networkId as Buffer);
        }

        super(config, seed, message);
    }
}
