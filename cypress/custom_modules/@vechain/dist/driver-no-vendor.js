"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverNoVendor = void 0;
const promint_1 = require("./promint");
const cache_1 = require("./cache");
const thor_devkit_1 = require("thor-devkit");
const common_1 = require("./common");
/** class implements Connex.Driver leaves out Vendor related methods */
class DriverNoVendor {
    constructor(net, genesis, initialHead) {
        this.net = net;
        this.genesis = genesis;
        this.headResolvers = [];
        this.int = new promint_1.PromInt();
        this.cache = new cache_1.Cache();
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
        const cacheKey = `explain-${thor_devkit_1.blake2b256(JSON.stringify(arg)).toString('hex')}`;
        return this.cache.getTied(cacheKey, revision, () => this.httpPost('accounts/*', arg, { revision }), cacheHints);
    }
    filterEventLogs(arg, cacheHints) {
        const cacheKey = `event-${thor_devkit_1.blake2b256(JSON.stringify(arg)).toString('hex')}`;
        return this.cache.getTied(cacheKey, this.head.id, () => this.httpPost('logs/event', arg), cacheHints);
    }
    filterTransferLogs(arg, cacheHints) {
        const cacheKey = `transfer-${thor_devkit_1.blake2b256(JSON.stringify(arg)).toString('hex')}`;
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
                    if (err instanceof promint_1.InterruptedError) {
                        break;
                    }
                }
                if (attemptWs) {
                    try {
                        yield this.trackWs();
                    }
                    catch (err) {
                        if (err instanceof promint_1.InterruptedError) {
                            break;
                        }
                    }
                }
                try {
                    yield this.int.wrap(common_1.sleep(8 * 1000));
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
exports.DriverNoVendor = DriverNoVendor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJpdmVyLW5vLXZlbmRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kcml2ZXItbm8tdmVuZG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLHVDQUFxRDtBQUNyRCxtQ0FBK0I7QUFDL0IsNkNBQXdDO0FBQ3hDLHFDQUFnQztBQUVoQyx1RUFBdUU7QUFDdkUsTUFBYSxjQUFjO0lBU3ZCLFlBQ3VCLEdBQVEsRUFDbEIsT0FBMEIsRUFDbkMsV0FBd0M7UUFGckIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUNsQixZQUFPLEdBQVAsT0FBTyxDQUFtQjtRQVIvQixrQkFBYSxHQUFHLEVBQXVCLENBQUE7UUFDOUIsUUFBRyxHQUFHLElBQUksaUJBQU8sRUFBRSxDQUFBO1FBQ25CLFVBQUssR0FBRyxJQUFJLGFBQUssRUFBRSxDQUFBO1FBQ3BDLGdEQUFnRDtRQUMvQixvQkFBZSxHQUFpQyxFQUFFLENBQUE7UUFPL0QsSUFBSSxXQUFXLEVBQUU7WUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQTtTQUMxQjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksR0FBRztnQkFDUixFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2dCQUN0QixTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7Z0JBQzVCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXO2dCQUNoQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7YUFDN0IsQ0FBQTtTQUNKO1FBQ0QsS0FBSyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDL0IsQ0FBQztJQUVELHVDQUF1QztJQUNoQyxLQUFLO1FBQ1IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQTtJQUN4QixDQUFDO0lBRUQsa0JBQWtCO0lBQ1gsUUFBUTtRQUNYLE9BQU8s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