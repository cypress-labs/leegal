var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PromInt, InterruptedError } from './promint';
import { Cache } from './cache';
import { blake2b256 } from 'thor-devkit';
import { sleep } from './common';
/** class implements Connex.Driver leaves out Vendor related methods */
export class DriverNoVendor {
    constructor(net, genesis, initialHead) {
        this.net = net;
        this.genesis = genesis;
        this.headResolvers = [];
        this.int = new PromInt();
        this.cache = new Cache();
        // to merge concurrent identical remote requests
        this.pendingRequests = {};
        if (initialHead) {
            this.head = initialHead;
        }
        else {
            this.head = {
                id: genesis.id,
                number: genesis.number,
                timestamp: genesis.timestamp,
                parentID: genesis.parentID,
                txsFeatures: genesis.txsFeatures,
                gasLimit: genesis.gasLimit
            };
        }
        void this.headTrackerLoop();
    }
    // close the driver to prevent mem leak
    close() {
        this.int.interrupt();
    }
    // implementations
    pollHead() {
        return this.int.wrap(new Promise(resolve => {
            this.headResolvers.push(() => resolve(this.head));
        }));
    }
    getBlock(revision) {
        return this.cache.getBlock(revision, () => this.httpGet(`blocks/${revision}`));
    }
    getTransaction(id, allowPending) {
        return this.cache.getTx(id, () => {
            const query = { head: this.head.id };
            if (allowPending) {
                query.pending = 'true';
            }
            return this.httpGet(`transactions/${id}`, query);
        });
    }
    getReceipt(id) {
        return this.cache.getReceipt(id, () => this.httpGet(`transactions/${id}/receipt`, { head: this.head.id }));
    }
    getAccount(addr, revision) {
        return this.cache.getAccount(addr, revision, () => this.httpGet(`accounts/${addr}`, { revision }));
    }
    getCode(addr, revision) {
        return this.cache.getTied(`code-${addr}`, revision, () => this.httpGet(`accounts/${addr}/code`, { revision }));
    }
    getStorage(addr, key, revision) {
        return this.cache.getTied(`storage-${addr}-${key}`, revision, () => this.httpGet(`accounts/${addr}/storage/${key}`, { revision }));
    }
    explain(arg, revision, cacheHints) {
        const cacheKey = `explain-${blake2b256(JSON.stringify(arg)).toString('hex')}`;
        return this.cache.getTied(cacheKey, revision, () => this.httpPost('accounts/*', arg, { revision }), cacheHints);
    }
    filterEventLogs(arg, cacheHints) {
        const cacheKey = `event-${blake2b256(JSON.stringify(arg)).toString('hex')}`;
        return this.cache.getTied(cacheKey, this.head.id, () => this.httpPost('logs/event', arg), cacheHints);
    }
    filterTransferLogs(arg, cacheHints) {
        const cacheKey = `transfer-${blake2b256(JSON.stringify(arg)).toString('hex')}`;
        return this.cache.getTied(cacheKey, this.head.id, () => this.httpPost('logs/transfer', arg), cacheHints);
    }
    signTx(msg, options) {
        throw new Error('signer not implemented');
    }
    signCert(msg, options) {
        throw new Error('signer not implemented');
    }
    //////
    mergeRequest(req, ...keyParts) {
        const key = JSON.stringify(keyParts);
        const pending = this.pendingRequests[key];
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (pending) {
            return pending;
        }
        return this.pendingRequests[key] = (() => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield req();
            }
            finally {
                delete this.pendingRequests[key];
            }
        }))();
    }
    httpGet(path, query) {
        return this.mergeRequest(() => {
            return this.net.http('GET', path, {
                query,
                validateResponseHeader: this.headerValidator
            });
        }, path, query || '');
    }
    httpPost(path, body, query) {
        return this.mergeRequest(() => {
            return this.net.http('POST', path, {
                query,
                body,
                validateResponseHeader: this.headerValidator
            });
        }, path, query || '', body || '');
    }
    get headerValidator() {
        return (headers) => {
            const xgid = headers['x-genesis-id'];
            if (xgid && xgid !== this.genesis.id) {
                throw new Error(`responded 'x-genesis-id' not matched`);
            }
        };
    }
    emitNewHead() {
        const resolvers = this.headResolvers;
        this.headResolvers = [];
        resolvers.forEach(r => r());
    }
    headTrackerLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            for (;;) {
                let attemptWs = false;
                try {
                    const best = yield this.int.wrap(this.httpGet('blocks/best'));
                    if (best.id !== this.head.id && best.number >= this.head.number) {
                        this.head = {
                            id: best.id,
                            number: best.number,
                            timestamp: best.timestamp,
                            parentID: best.parentID,
                            txsFeatures: best.txsFeatures,
                            gasLimit: best.gasLimit
                        };
                        this.cache.handleNewBlock(this.head, undefined, best);
                        this.emitNewHead();
                        if (Date.now() - this.head.timestamp * 1000 < 60 * 1000) {
                            // nearly synced
                            attemptWs = true;
                        }
                    }
                }
                catch (err) {
                    if (err instanceof InterruptedError) {
                        break;
                    }
                }
                if (attemptWs) {
                    try {
                        yield this.trackWs();
                    }
                    catch (err) {
                        if (err instanceof InterruptedError) {
                            break;
                        }
                    }
                }
                try {
                    yield this.int.wrap(sleep(8 * 1000));
                }
                catch (_a) {
                    break;
                }
            }
        });
    }
    trackWs() {
        return __awaiter(this, void 0, void 0, function* () {
            const wsPath = `subscriptions/beat2?pos=${this.head.parentID}`;
            const wsr = this.net.openWebSocketReader(wsPath);
            try {
                for (;;) {
                    const data = yield this.int.wrap(wsr.read());
                    const beat = JSON.parse(data);
                    if (!beat.obsolete && beat.id !== this.head.id && beat.number >= this.head.number) {
                        this.head = {
                            id: beat.id,
                            number: beat.number,
                            timestamp: beat.timestamp,
                            parentID: beat.parentID,
                            txsFeatures: beat.txsFeatures,
                            gasLimit: beat.gasLimit
                        };
                        this.cache.handleNewBlock(this.head, { k: beat.k, bits: beat.bloom });
                        this.emitNewHead();
                    }
                }
            }
            finally {
                wsr.close();
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLW5vLXZlbmRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kcml2ZXItbm8tdmVuZG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFDckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUMvQixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ3hDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFaEMsdUVBQXVFO0FBQ3ZFLE1BQU0sT0FBTyxjQUFjO0lBU3ZCLFlBQ3VCLEdBQVEsRUFDbEIsT0FBMEIsRUFDbkMsV0FBd0M7UUFGckIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNsQixZQUFPLEdBQVAsT0FBTyxDQUFtQjtRQVIvQixrQkFBYSxHQUFHLEVBQXVCLENBQUE7UUFDOUIsUUFBRyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUE7UUFDbkIsVUFBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUE7UUFDcEMsZ0RBQWdEO1FBQy9CLG9CQUFlLEdBQWlDLEVBQUUsQ0FBQTtRQU8vRCxJQUFJLFdBQVcsRUFBRTtZQUNiLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFBO1NBQzFCO2FBQU07WUFDSCxJQUFJLENBQUMsSUFBSSxHQUFHO2dCQUNSLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRTtnQkFDZCxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07Z0JBQ3RCLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUztnQkFDNUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO2dCQUMxQixXQUFXLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ2hDLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTthQUM3QixDQUFBO1NBQ0o7UUFDRCxLQUFLLElBQUksQ0FBQyxlQUFlLEVB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