/// <reference types="@vechain/connex-types" />
/// <reference types="@vechain/connex-framework/dist/driver-interface" />
import { Net } from './interfaces';
/** class implements Connex.Driver leaves out Vendor related methods */
export declare class DriverNoVendor implements Connex.Driver {
    protected readonly net: Net;
    readonly genesis: Connex.Thor.Block;
    head: Connex.Thor.Status['head'];
    private headResolvers;
    private readonly int;
    private readonly cache;
    private readonly pendingRequests;
    constructor(net: Net, genesis: Connex.Thor.Block, initialHead?: Connex.Thor.Status['head']);
    close(): void;
    pollHead(): Promise<Connex.Thor.Status['head']>;
    getBlock(revision: string | number): Promise<Connex.Thor.Block | null>;
    getTransaction(id: string, allowPending: boolean): Promise<Connex.Thor.Transaction | null>;
    getReceipt(id: string): Promise<Connex.Thor.Transaction.Receipt | null>;
    getAccount(addr: string, revision: string): Promise<Connex.Thor.Account>;
    getCode(addr: string, revision: string): Promise<Connex.Thor.Account.Code>;
    getStorage(addr: string, key: string, revision: string): Promise<Connex.Thor.Account.Storage>;
    explain(arg: Connex.Driver.ExplainArg, revision: string, cacheHints?: string[]): Promise<Connex.VM.Output[]>;
    filterEventLogs(arg: Connex.Driver.FilterEventLogsArg, cacheHints?: string[]): Promise<Connex.Thor.Filter.Row<'event'>[]>;
    filterTransferLogs(arg: Connex.Driver.FilterTransferLogsArg, cacheHints?: string[]): Promise<Connex.Thor.Filter.Row<'transfer'>[]>;
    signTx(msg: Connex.Vendor.TxMessage, options: Connex.Signer.TxOptions): Promise<Connex.Vendor.TxResponse>;
    signCert(msg: Connex.Vendor.CertMessage, options: Connex.Signer.CertOptions): Promise<Connex.Vendor.CertResponse>;
    protected mergeRequest(req: () => Promise<any>, ...keyParts: any[]): Promise<any>;
    protected httpGet(path: string, query?: Record<string, string>): Promise<any>;
    protected httpPost(path: string, body: any, query?: Record<string, string>): Promise<any>;
    private get headerValidator();
    private emitNewHead;
    private headTrackerLoop;
    private trackWs;
}
