/// <reference types="@vechain/connex-types" />
import { DriverNoVendor } from './driver-no-vendor';
import { Net, Wallet } from './interfaces';
/** class fully implements DriverInterface */
export declare class Driver extends DriverNoVendor {
    private readonly wallet?;
    /**
     * create driver instance
     * it will fetch config(genesis, head) via net as construction params
     * @param net
     * @param wallet
     */
    static connect(net: Net, wallet?: Wallet): Promise<Driver>;
    /** handler to receive txs committed */
    onTxCommit?: (txObj: TxObject) => void;
    /** params for tx construction */
    txParams: {
        expiration: number;
        gasPriceCoef: number;
    };
    constructor(net: Net, genesis: Connex.Thor.Block, initialHead?: Connex.Thor.Status['head'], wallet?: Wallet | undefined);
    signTx(msg: Connex.Vendor.TxMessage, options: Connex.Signer.TxOptions): Promise<Connex.Vendor.TxResponse>;
    signCert(msg: Connex.Vendor.CertMessage, options: Connex.Signer.CertOptions): Promise<Connex.Vendor.CertResponse>;
    private findKey;
    private sendTx;
    private estimateGas;
}
export interface TxObject {
    id: string;
    raw: string;
    resend(): Promise<void>;
}
