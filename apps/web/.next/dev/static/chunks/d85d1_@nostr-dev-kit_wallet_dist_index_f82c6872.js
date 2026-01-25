(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/@nostr-dev-kit+wallet@0.8.10_@cashu+cashu-ts@2.9.0_@cashu+crypto@0.3.4_@types+react@19.2.9_no_fwpkg24lbmq4tqcqpzlpwb6wvm/node_modules/@nostr-dev-kit/wallet/dist/index.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NDKCashuDeposit",
    ()=>NDKCashuDeposit,
    "NDKCashuWallet",
    ()=>NDKCashuWallet,
    "NDKCashuWalletBackup",
    ()=>NDKCashuWalletBackup,
    "NDKNWCWallet",
    ()=>NDKNWCWallet,
    "NDKNutzapMonitor",
    ()=>NDKNutzapMonitor,
    "NDKWallet",
    ()=>NDKWallet,
    "NDKWalletStatus",
    ()=>NDKWalletStatus,
    "NDKWebLNWallet",
    ()=>NDKWebLNWallet,
    "WalletState",
    ()=>WalletState,
    "calculateNewState",
    ()=>calculateNewState,
    "consolidateMintTokens",
    ()=>consolidateMintTokens,
    "consolidateTokens",
    ()=>consolidateTokens,
    "createMintCacheCallbacks",
    ()=>createMintCacheCallbacks,
    "createMintDiscoveryStore",
    ()=>createMintDiscoveryStore,
    "getBolt11Amount",
    ()=>getBolt11Amount,
    "getBolt11Description",
    ()=>getBolt11Description,
    "getBolt11ExpiresAt",
    ()=>getBolt11ExpiresAt,
    "getCashuMintRecommendations",
    ()=>getCashuMintRecommendations,
    "update",
    ()=>update
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@nostr-dev-kit+ndk@2.18.1_nostr-tools@2.20.0_typescript@5.9.3_/node_modules/@nostr-dev-kit/ndk/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$10_$40$types$2b$react$40$19$2e$2$2e$9_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/zustand@5.0.10_@types+react@19.2.9_react@19.2.3/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tseep$40$1$2e$3$2e$1$2f$node_modules$2f$tseep$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tseep@1.3.1/node_modules/tseep/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/cashu-ts.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$sync$40$0$2e$3$2e$6_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$sync$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@nostr-dev-kit+sync@0.3.6_typescript@5.9.3/node_modules/@nostr-dev-kit/sync/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$debug$40$4$2e$4$2e$3$2f$node_modules$2f$debug$2f$src$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$light$2d$bolt11$2d$decoder$40$3$2e$2$2e$0$2f$node_modules$2f$light$2d$bolt11$2d$decoder$2f$bolt11$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/light-bolt11-decoder@3.2.0/node_modules/light-bolt11-decoder/bolt11.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$webln$40$0$2e$3$2e$2$2f$node_modules$2f$webln$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/webln@0.3.2/node_modules/webln/lib/index.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
// src/nip87/mint-store.ts
async function fetchMintInfo(url, ndk) {
    if (ndk.cacheAdapter?.getCacheData) {
        try {
            const cached = await ndk.cacheAdapter.getCacheData("wallet:mint:info", url);
            if (cached) {
                return {
                    isOnline: true,
                    info: cached
                };
            }
        } catch (e) {
            console.error("Error reading mint info from cache:", e);
        }
    }
    try {
        const response = await fetch(`${url}/v1/info`);
        if (response.ok) {
            const info = await response.json();
            if (ndk.cacheAdapter?.setCacheData) {
                try {
                    await ndk.cacheAdapter.setCacheData("wallet:mint:info", url, info);
                } catch (e) {
                    console.error("Error caching mint info:", e);
                }
            }
            return {
                isOnline: true,
                info
            };
        }
        return {
            isOnline: false
        };
    } catch  {
        return {
            isOnline: false
        };
    }
}
function createMintDiscoveryStore(ndk, options = {}) {
    const { network = "mainnet", timeout = 1e4, followUsers } = options;
    let mintSub;
    let recSub;
    let timeoutId;
    const mintsMap = /* @__PURE__ */ new Map();
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$zustand$40$5$2e$0$2e$10_$40$types$2b$react$40$19$2e$2$2e$9_react$40$19$2e$2$2e$3$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])()((set, get)=>({
            mints: [],
            progress: {
                announcementsFound: 0,
                recommendationsFound: 0
            },
            getMint: (url)=>mintsMap.get(url),
            getTopMints: (limit = 10, minRecommendations = 0)=>{
                let filtered = get().mints;
                if (minRecommendations > 0) {
                    filtered = filtered.filter((m)=>m.recommendations.length >= minRecommendations);
                }
                return filtered.sort((a, b)=>b.score - a.score).slice(0, limit);
            },
            searchMints: (query)=>{
                const lowerQuery = query.toLowerCase();
                return get().mints.filter((mint)=>mint.url.toLowerCase().includes(lowerQuery) || mint.name?.toLowerCase().includes(lowerQuery) || mint.description?.toLowerCase().includes(lowerQuery));
            },
            recommendMint: async (url, review)=>{
                const rec = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKMintRecommendation"](ndk);
                rec.recommendedKind = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintAnnouncement;
                rec.urls = [
                    url
                ];
                rec.review = review;
                await rec.sign();
                await rec.publish();
            },
            stop: ()=>{
                mintSub?.stop();
                recSub?.stop();
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        }));
    mintSub = ndk.subscribe({
        kinds: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintAnnouncement
        ],
        limit: 100
    }, {
        closeOnEose: false
    });
    const recFilter = {
        kinds: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EcashMintRecommendation
        ],
        "#k": [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintAnnouncement.toString()
        ],
        limit: 500
    };
    if (followUsers && followUsers.length > 0) {
        recFilter.authors = followUsers;
    }
    recSub = ndk.subscribe(recFilter, {
        closeOnEose: false
    });
    mintSub.on("event", async (event)=>{
        const mint = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuMintAnnouncement"].from(event);
        if (!mint) return;
        if (network && mint.network !== network) return;
        const url = mint.url;
        if (!url) return;
        const existing = mintsMap.get(url);
        const mintData = {
            url,
            identifier: mint.identifier,
            network: mint.network,
            nuts: mint.nuts || [],
            name: mint.metadata?.name,
            description: mint.metadata?.description,
            icon: mint.metadata?.icon,
            longDescription: mint.metadata?.longDescription,
            contact: mint.metadata?.contact,
            motd: mint.metadata?.motd,
            recommendations: existing?.recommendations || [],
            score: existing?.score || 0,
            lastUpdated: Date.now()
        };
        mintsMap.set(url, mintData);
        store.setState((state)=>({
                mints: Array.from(mintsMap.values()),
                progress: {
                    ...state.progress,
                    announcementsFound: state.progress.announcementsFound + 1
                }
            }));
        fetchMintInfo(url, ndk).then(({ isOnline, info })=>{
            const existing2 = mintsMap.get(url);
            if (!existing2) return;
            mintsMap.set(url, {
                ...existing2,
                isOnline,
                name: info?.name || existing2.name,
                description: info?.description || existing2.description,
                icon: info?.icon || existing2.icon,
                longDescription: info?.longDescription || existing2.longDescription,
                contact: info?.contact || existing2.contact,
                motd: info?.motd || existing2.motd,
                lastUpdated: Date.now()
            });
            store.setState({
                mints: Array.from(mintsMap.values())
            });
        });
    });
    recSub.on("event", async (event)=>{
        const rec = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKMintRecommendation"].from(event);
        if (!rec) return;
        const urls = rec.urls;
        for (const url of urls){
            const mint = mintsMap.get(url);
            if (mint) {
                mint.recommendations.push(rec);
                mint.score = mint.recommendations.length;
                mintsMap.set(url, {
                    ...mint
                });
            } else {
                mintsMap.set(url, {
                    url,
                    nuts: [],
                    recommendations: [
                        rec
                    ],
                    score: 1,
                    lastUpdated: Date.now()
                });
            }
            store.setState((state)=>({
                    mints: Array.from(mintsMap.values()),
                    progress: {
                        ...state.progress,
                        recommendationsFound: state.progress.recommendationsFound + 1
                    }
                }));
        }
    });
    if (timeout > 0) {
        timeoutId = setTimeout(()=>{
            store.getState().stop();
        }, timeout);
    }
    return store;
}
var mintWallets = /* @__PURE__ */ new Map();
var mintWalletPromises = /* @__PURE__ */ new Map();
function mintKey(mint, unit, pk) {
    if (pk) {
        const pkStr = new TextDecoder().decode(pk);
        return `${mint}-${unit}-${pkStr}`;
    }
    return `${mint}-${unit}`;
}
async function walletForMint(mint, { pk, timeout = 5e3, mintInfo, mintKeys, onMintInfoNeeded, onMintInfoLoaded, onMintKeysNeeded, onMintKeysLoaded } = {}) {
    const startTime = Date.now();
    const ts = ()=>`+${Date.now() - startTime}ms`;
    if (onMintInfoNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint info: ${mint}`);
        const cacheStartTime = Date.now();
        mintInfo ??= await onMintInfoNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintInfo) {
            console.log(`[MINT-CACHE ${ts()}] \u2713 Cache HIT for mint info: ${mint} (${cacheTime}ms)`, {
                name: mintInfo.name
            });
        } else {
            console.log(`[MINT-CACHE ${ts()}] \u2717 Cache MISS for mint info: ${mint} (${cacheTime}ms)`);
        }
    }
    if (onMintKeysNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint keys: ${mint}`);
        const cacheStartTime = Date.now();
        mintKeys ??= await onMintKeysNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintKeys) {
            console.log(`[MINT-CACHE ${ts()}] \u2713 Cache HIT for mint keys: ${mint} (${cacheTime}ms)`, {
                count: mintKeys.length
            });
        } else {
            console.log(`[MINT-CACHE ${ts()}] \u2717 Cache MISS for mint keys: ${mint} (${cacheTime}ms)`);
        }
    }
    if (!mintInfo && onMintInfoLoaded) {
        console.log(`[MINT-CACHE ${ts()}] Fetching mint info from ${mint}/v1/info`);
        const fetchStartTime = Date.now();
        mintInfo = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"].getInfo(mint);
        const fetchTime = Date.now() - fetchStartTime;
        console.log(`[MINT-CACHE ${ts()}] Caching mint info: ${mint} (fetched in ${fetchTime}ms)`, {
            name: mintInfo.name
        });
        onMintInfoLoaded?.(mint, mintInfo);
    }
    const unit = "sat";
    const key = mintKey(mint, unit, pk);
    if (mintWallets.has(key)) {
        console.log(`[MINT-CACHE ${ts()}] Returning cached wallet instance: ${mint}`);
        return mintWallets.get(key);
    }
    if (mintWalletPromises.has(key)) {
        console.log(`[MINT-CACHE ${ts()}] Wallet loading in progress, returning existing promise: ${mint}`);
        return mintWalletPromises.get(key);
    }
    if (!mintInfo) {
        if (onMintInfoNeeded) {
            console.log(`[MINT-CACHE ${ts()}] Querying cache for mint info (second check): ${mint}`);
            const cacheStartTime = Date.now();
            mintInfo = await onMintInfoNeeded(mint);
            const cacheTime = Date.now() - cacheStartTime;
            if (mintInfo) {
                console.log(`[MINT-CACHE ${ts()}] \u2713 Cache HIT for mint info (second check): ${mint} (${cacheTime}ms)`, {
                    name: mintInfo.name
                });
            } else {
                console.log(`[MINT-CACHE ${ts()}] \u2717 Cache MISS for mint info (second check): ${mint} (${cacheTime}ms)`);
            }
        }
        if (!mintInfo && onMintInfoLoaded) {
            console.log(`[MINT-CACHE ${ts()}] Fetching mint info from ${mint}/v1/info (second check)`);
            const fetchStartTime = Date.now();
            mintInfo = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"].getInfo(mint);
            const fetchTime = Date.now() - fetchStartTime;
            console.log(`[MINT-CACHE ${ts()}] Caching mint info (second check): ${mint} (fetched in ${fetchTime}ms)`, {
                name: mintInfo.name
            });
            onMintInfoLoaded(mint, mintInfo);
        }
    }
    if (!mintKeys && onMintKeysNeeded) {
        console.log(`[MINT-CACHE ${ts()}] Querying cache for mint keys (second check): ${mint}`);
        const cacheStartTime = Date.now();
        mintKeys = await onMintKeysNeeded(mint);
        const cacheTime = Date.now() - cacheStartTime;
        if (mintKeys) {
            console.log(`[MINT-CACHE ${ts()}] \u2713 Cache HIT for mint keys (second check): ${mint} (${cacheTime}ms)`, {
                count: mintKeys.length
            });
        } else {
            console.log(`[MINT-CACHE ${ts()}] \u2717 Cache MISS for mint keys (second check): ${mint} (${cacheTime}ms)`);
        }
    }
    const wallet = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuWallet"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"](mint), {
        unit,
        bip39seed: pk,
        mintInfo,
        keys: mintKeys
    });
    const loadPromise = new Promise(async (resolve)=>{
        try {
            console.log(`[MINT-CACHE ${ts()}] Loading mint wallet: ${mint}`);
            const loadStartTime = Date.now();
            const timeoutPromise = new Promise((_, rejectTimeout)=>{
                setTimeout(()=>{
                    rejectTimeout(new Error("timeout loading mint"));
                }, timeout);
            });
            await Promise.race([
                wallet.loadMint(),
                timeoutPromise
            ]);
            const loadTime = Date.now() - loadStartTime;
            console.log(`[MINT-CACHE ${ts()}] Mint wallet loaded: ${mint} (${loadTime}ms)`);
            mintWallets.set(key, wallet);
            mintWalletPromises.delete(key);
            if (wallet.keys) {
                console.log(`[MINT-CACHE ${ts()}] Caching mint keys after loadMint: ${mint}`, {
                    count: wallet.keys.size
                });
                onMintKeysLoaded?.(mint, wallet.keys);
            }
            resolve(wallet);
        } catch (e) {
            console.error(`[WALLET ${ts()}] error loading mint`, mint, e.message);
            mintWalletPromises.delete(key);
            resolve(null);
        }
    });
    mintWalletPromises.set(key, loadPromise);
    return loadPromise;
}
// src/wallets/mint.ts
function createMintCacheCallbacks(adapter) {
    return {
        onMintInfoNeeded: async (mint)=>{
            if (!adapter.getCacheData) return void 0;
            return adapter.getCacheData("wallet:mint:info", mint);
        },
        onMintInfoLoaded: async (mint, info)=>{
            if (!adapter.setCacheData) return;
            await adapter.setCacheData("wallet:mint:info", mint, info);
        },
        onMintKeysNeeded: async (mint)=>{
            if (!adapter.getCacheData) return void 0;
            return adapter.getCacheData("wallet:mint:keys", mint);
        },
        onMintKeysLoaded: async (mint, keysets)=>{
            if (!adapter.setCacheData) return;
            const keysArray = Array.from(keysets.values());
            await adapter.setCacheData("wallet:mint:keys", mint, keysArray);
        }
    };
}
async function getCashuWallet(mint) {
    if (this.cashuWallets.has(mint)) return this.cashuWallets.get(mint);
    const w = await walletForMint(mint, {
        onMintInfoNeeded: this.onMintInfoNeeded,
        onMintInfoLoaded: this.onMintInfoLoaded,
        onMintKeysNeeded: this.onMintKeysNeeded,
        onMintKeysLoaded: this.onMintKeysLoaded
    });
    if (!w) throw new Error(`unable to load wallet for mint ${mint}`);
    this.cashuWallets.set(mint, w);
    return w;
}
// src/wallets/index.ts
var NDKWalletStatus = /* @__PURE__ */ ((NDKWalletStatus2)=>{
    NDKWalletStatus2["INITIAL"] = "initial";
    NDKWalletStatus2["LOADING"] = "loading";
    NDKWalletStatus2["READY"] = "ready";
    NDKWalletStatus2["FAILED"] = "failed";
    return NDKWalletStatus2;
})(NDKWalletStatus || {});
var NDKWallet = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tseep$40$1$2e$3$2e$1$2f$node_modules$2f$tseep$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EventEmitter"] {
    cashuWallets = /* @__PURE__ */ new Map();
    onMintInfoNeeded;
    onMintInfoLoaded;
    onMintKeysNeeded;
    onMintKeysLoaded;
    getCashuWallet = getCashuWallet.bind(this);
    ndk;
    constructor(ndk){
        super();
        this.ndk = ndk;
    }
    status = "initial" /* INITIAL */ ;
    get type() {
        throw new Error("Not implemented");
    }
    /**
   * An ID of this wallet
   */ walletId = "unknown";
    /**
   * Get the balance of this wallet
   */ get balance() {
        throw new Error("Not implemented");
    }
    /**
   * Redeem a set of nutzaps into an NWC wallet.
   *
   * This function gets an invoice from the NWC wallet until the total amount of the nutzaps is enough to pay for the invoice
   * when accounting for fees.
   *
   * @param cashuWallet - The cashu wallet to redeem the nutzaps into
   * @param nutzapIds - The IDs of the nutzaps to redeem
   * @param proofs - The proofs to redeem
   * @param privkey - The private key needed to redeem p2pk proofs.
   */ redeemNutzaps(_nutzaps, _privkey, _opts) {
        throw new Error("Not implemented");
    }
};
function getBolt11ExpiresAt(bolt11) {
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$light$2d$bolt11$2d$decoder$40$3$2e$2$2e$0$2f$node_modules$2f$light$2d$bolt11$2d$decoder$2f$bolt11$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(bolt11);
    const expiry = decoded.expiry;
    const timestamp = decoded.sections.find((section)=>section.name === "timestamp").value;
    if (typeof expiry === "number" && typeof timestamp === "number") {
        return expiry + timestamp;
    }
    return void 0;
}
function getBolt11Amount(bolt11) {
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$light$2d$bolt11$2d$decoder$40$3$2e$2$2e$0$2f$node_modules$2f$light$2d$bolt11$2d$decoder$2f$bolt11$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(bolt11);
    const section = decoded.sections.find((section2)=>section2.name === "amount");
    const val = section?.value;
    return Number(val);
}
function getBolt11Description(bolt11) {
    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$light$2d$bolt11$2d$decoder$40$3$2e$2$2e$0$2f$node_modules$2f$light$2d$bolt11$2d$decoder$2f$bolt11$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["decode"])(bolt11);
    const section = decoded.sections.find((section2)=>section2.name === "description");
    const val = section?.value;
    return val;
}
// src/wallets/cashu/quote.ts
var NDKCashuQuote = class _NDKCashuQuote extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"] {
    quoteId;
    mint;
    amount;
    unit;
    _wallet;
    static kind = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuQuote;
    constructor(ndk, event){
        super(ndk, event);
        this.kind ??= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuQuote;
    }
    static async from(event) {
        const quote = new _NDKCashuQuote(event.ndk, event);
        const original = event;
        try {
            await quote.decrypt();
        } catch  {
            quote.content = original.content;
        }
        try {
            const content = JSON.parse(quote.content);
            quote.quoteId = content.quoteId;
            quote.mint = content.mint;
            quote.amount = content.amount;
            quote.unit = content.unit;
        } catch (_e) {
            return;
        }
        return quote;
    }
    set wallet(wallet) {
        this._wallet = wallet;
    }
    set invoice(invoice) {
        const bolt11Expiry = getBolt11ExpiresAt(invoice);
        if (bolt11Expiry) this.tags.push([
            "expiration",
            bolt11Expiry.toString()
        ]);
    }
    async save() {
        if (!this.ndk) throw new Error("NDK is required");
        this.content = JSON.stringify({
            quoteId: this.quoteId,
            mint: this.mint,
            amount: this.amount,
            unit: this.unit
        });
        await this.encrypt(this.ndk.activeUser, void 0, "nip44");
        await this.sign();
        await this.publish(this._wallet?.relaySet);
    }
};
async function createOutTxEvent(ndk, paymentRequest, paymentResult, relaySet, { nutzaps } = {}) {
    let description = paymentRequest.paymentDescription;
    let amount;
    if (paymentRequest.pr) {
        amount = getBolt11Amount(paymentRequest.pr);
        description ??= getBolt11Description(paymentRequest.pr);
        if (amount) amount /= 1e3;
    } else {
        amount = paymentRequest.amount;
    }
    if (!amount) {
        console.error("BUG: Unable to find amount for paymentRequest", paymentRequest);
    }
    const txEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuWalletTx"](ndk);
    txEvent.direction = "out";
    txEvent.amount = amount ?? 0;
    txEvent.mint = paymentResult.mint;
    txEvent.description = description;
    if (paymentResult.fee) txEvent.fee = paymentResult.fee;
    if (paymentRequest.target) {
        txEvent.tags.push(paymentRequest.target.tagReference());
        if (!(paymentRequest.target instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKUser"])) {
            txEvent.tags.push([
                "p",
                paymentRequest.target.pubkey
            ]);
        }
    }
    if (nutzaps) {
        txEvent.description ??= "nutzap redeem";
        for (const nutzap of nutzaps)txEvent.addRedeemedNutzap(nutzap);
    }
    if (paymentResult.stateUpdate?.created) txEvent.createdTokens = [
        paymentResult.stateUpdate.created
    ];
    if (paymentResult.stateUpdate?.deleted) txEvent.destroyedTokenIds = paymentResult.stateUpdate.deleted;
    if (paymentResult.stateUpdate?.reserved) txEvent.reservedTokens = [
        paymentResult.stateUpdate.reserved
    ];
    await txEvent.sign();
    txEvent.publish(relaySet);
    return txEvent;
}
async function createInTxEvent(ndk, proofs, mint, updateStateResult, { nutzaps, fee, description }, relaySet) {
    const txEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuWalletTx"](ndk);
    const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["proofsTotalBalance"])(proofs);
    txEvent.direction = "in";
    txEvent.amount = amount;
    txEvent.mint = mint;
    txEvent.description = description;
    if (updateStateResult.created) txEvent.createdTokens = [
        updateStateResult.created
    ];
    if (updateStateResult.deleted) txEvent.destroyedTokenIds = updateStateResult.deleted;
    if (updateStateResult.reserved) txEvent.reservedTokens = [
        updateStateResult.reserved
    ];
    if (nutzaps) for (const nutzap of nutzaps)txEvent.addRedeemedNutzap(nutzap);
    if (fee) txEvent.fee = fee;
    await txEvent.sign();
    txEvent.publish(relaySet);
    return txEvent;
}
// src/wallets/cashu/deposit.ts
var d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$debug$40$4$2e$4$2e$3$2f$node_modules$2f$debug$2f$src$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("ndk-wallet:cashu:deposit");
function randomMint(wallet) {
    const mints = wallet.mints;
    const mint = mints[Math.floor(Math.random() * mints.length)];
    return mint;
}
var NDKCashuDeposit = class _NDKCashuDeposit extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tseep$40$1$2e$3$2e$1$2f$node_modules$2f$tseep$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EventEmitter"] {
    mint;
    amount;
    quoteId;
    wallet;
    checkTimeout;
    checkIntervalLength = 2500;
    finalized = false;
    quoteEvent;
    constructor(wallet, amount, mint){
        super();
        this.wallet = wallet;
        this.mint = mint || randomMint(wallet);
        this.amount = amount;
    }
    static fromQuoteEvent(wallet, quote) {
        if (!quote.amount) throw new Error("quote has no amount");
        if (!quote.mint) throw new Error("quote has no mint");
        const deposit = new _NDKCashuDeposit(wallet, quote.amount, quote.mint);
        deposit.quoteId = quote.quoteId;
        return deposit;
    }
    /**
   * Creates a quote ID and start monitoring for payment.
   *
   * Once a payment is received, the deposit will emit a "success" event.
   *
   * @param pollTime - time in milliseconds between checks
   * @returns
   */ async start(pollTime = 2500) {
        const cashuWallet = await this.wallet.getCashuWallet(this.mint);
        const quote = await cashuWallet.createMintQuote(this.amount);
        d("created quote %s for %d %s", quote.quote, this.amount, this.mint);
        this.quoteId = quote.quote;
        this.wallet.depositMonitor.addDeposit(this);
        setTimeout(this.check.bind(this, pollTime), pollTime);
        this.createQuoteEvent(quote.quote, quote.request).then((event)=>this.quoteEvent = event);
        return quote.request;
    }
    /**
   * This generates a 7374 event containing the quote ID
   * with an optional expiration set to the bolt11 expiry (if there is one)
   */ async createQuoteEvent(quoteId, bolt11) {
        const { ndk } = this.wallet;
        const quoteEvent = new NDKCashuQuote(ndk);
        quoteEvent.quoteId = quoteId;
        quoteEvent.mint = this.mint;
        quoteEvent.amount = this.amount;
        quoteEvent.wallet = this.wallet;
        quoteEvent.invoice = bolt11;
        try {
            await quoteEvent.save();
            d("saved quote on event %s", quoteEvent.rawEvent());
        } catch (e) {
            d("error saving quote on event %s", e.relayErrors);
        }
        return quoteEvent;
    }
    async runCheck() {
        if (!this.finalized) await this.finalize();
        if (!this.finalized) this.delayCheck();
    }
    delayCheck() {
        setTimeout(()=>{
            this.runCheck();
            this.checkIntervalLength += 500;
        }, this.checkIntervalLength);
    }
    /**
   * Check if the deposit has been finalized.
   * @param timeout A timeout in milliseconds to wait before giving up.
   */ async check(timeout) {
        this.runCheck();
        if (timeout) {
            setTimeout(()=>{
                clearTimeout(this.checkTimeout);
            }, timeout);
        }
    }
    async finalize() {
        if (!this.quoteId) throw new Error("No quoteId set.");
        let proofs;
        try {
            d("Checking for minting status of %s", this.quoteId);
            const cashuWallet = await this.wallet.getCashuWallet(this.mint);
            const proofsWeHave = await this.wallet.state.getProofs({
                mint: this.mint
            });
            proofs = await cashuWallet.mintProofs(this.amount, this.quoteId, {
                proofsWeHave
            });
            if (proofs.length === 0) return;
        } catch (e) {
            if (e.message.match(/not paid/i)) return;
            if (e.message.match(/already issued/i)) {
                d("Mint is saying the quote has already been issued, destroying quote event: %s", e.message);
                this.destroyQuoteEvent();
                this.finalized = true;
                return;
            }
            if (e.message.match(/rate limit/i)) {
                d("Mint seems to be rate limiting, lowering check interval");
                this.checkIntervalLength += 5e3;
                return;
            }
            d(e.message);
            return;
        }
        try {
            this.finalized = true;
            const updateRes = await this.wallet.state.update({
                store: proofs,
                mint: this.mint
            }, "Deposit");
            const tokenEvent = updateRes.created;
            if (!tokenEvent) throw new Error("no token event created");
            createInTxEvent(this.wallet.ndk, proofs, this.mint, updateRes, {
                description: "Deposit"
            }, this.wallet.relaySet);
            this.emit("success", tokenEvent);
            this.destroyQuoteEvent();
        } catch (e) {
            this.emit("error", e.message);
            console.error(e);
        }
    }
    async destroyQuoteEvent() {
        if (!this.quoteEvent) return;
        const deleteEvent = await this.quoteEvent.delete(void 0, false);
        deleteEvent.publish(this.wallet.relaySet);
    }
};
var NDKCashuDepositMonitor = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tseep$40$1$2e$3$2e$1$2f$node_modules$2f$tseep$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EventEmitter"] {
    deposits = /* @__PURE__ */ new Map();
    addDeposit(deposit) {
        const { quoteId } = deposit;
        if (!quoteId) throw new Error("deposit has no quote ID");
        if (this.deposits.has(quoteId)) return false;
        deposit.once("success", (_token)=>{
            this.removeDeposit(quoteId);
        });
        this.deposits.set(quoteId, deposit);
        this.emit("change");
        return true;
    }
    removeDeposit(quoteId) {
        this.deposits.delete(quoteId);
        this.emit("change");
    }
};
// src/wallets/cashu/event-handlers/deletion.ts
async function handleEventDeletion(event) {
    const deletedIds = event.getMatchingTags("e").map((tag)=>tag[1]);
    for (const deletedId of deletedIds){
        this.state.removeTokenId(deletedId);
    }
}
// src/wallets/cashu/event-handlers/quote.ts
async function handleQuote(event) {
    const quote = await NDKCashuQuote.from(event);
    if (!quote) return;
    const oneHourAgo = Date.now() / 1e3 - 3600;
    if (event.created_at && event.created_at < oneHourAgo) {
        return;
    }
    const deposit = NDKCashuDeposit.fromQuoteEvent(this, quote);
    if (this.depositMonitor.addDeposit(deposit)) {
        deposit.finalize();
    }
}
async function handleToken(event) {
    if (this.state.tokens.has(event.id)) return;
    const token = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuToken"].from(event);
    if (!token) {
        return;
    }
    for (const deletedTokenId of token.deletedTokens){
        this.state.removeTokenId(deletedTokenId);
    }
    this.state.addToken(token);
}
setInterval(()=>{}, 5e3);
// src/wallets/cashu/event-handlers/index.ts
var handlers = {
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken]: handleToken,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuQuote]: handleQuote,
    [__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EventDeletion]: handleEventDeletion
};
var balanceUpdateTimer = null;
async function eventHandler(event) {
    const handler = handlers[event.kind];
    if (handler) {
        if (balanceUpdateTimer) clearTimeout(balanceUpdateTimer);
        await handler.call(this, event);
        balanceUpdateTimer = setTimeout(()=>{
            this.emit("balance_updated");
        }, 100);
    }
}
async function eventDupHandler(_event, _relay, _timeSinceFirstSeen, _sub, _fromCache) {}
var d2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$debug$40$4$2e$4$2e$3$2f$node_modules$2f$debug$2f$src$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("ndk-wallet:cashu:validate");
async function consolidateTokens() {
    d2("checking %d tokens for spent proofs", this.state.tokens.size);
    const mints = new Set(this.state.getMintsProofs({
        validStates: /* @__PURE__ */ new Set([
            "available",
            "reserved",
            "deleted"
        ])
    }).keys());
    d2("found %d mints", mints.size);
    mints.forEach((mint)=>{
        consolidateMintTokens(mint, this);
    });
}
async function consolidateMintTokens(mint, wallet, allProofs, onResult, onFailure) {
    allProofs ??= wallet.state.getProofs({
        mint,
        includeDeleted: true,
        onlyAvailable: false
    });
    const _wallet = await walletForMint(mint);
    if (!_wallet) {
        return;
    }
    let proofStates = [];
    try {
        proofStates = await _wallet.checkProofsStates(allProofs);
    } catch (e) {
        onFailure?.(e.message);
        return;
    }
    const spentProofs = [];
    const unspentProofs = [];
    const pendingProofs = [];
    allProofs.forEach((proof, index)=>{
        const { state } = proofStates[index];
        if (state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckStateEnum"].SPENT) {
            spentProofs.push(proof);
        } else if (state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckStateEnum"].UNSPENT) {
            unspentProofs.push(proof);
        } else {
            pendingProofs.push(proof);
        }
    });
    const walletChange = {
        mint,
        store: unspentProofs,
        destroy: spentProofs
    };
    onResult?.(walletChange);
    spentProofs.reduce((acc, proof)=>acc + proof.amount, 0);
    if (walletChange.destroy?.length === 0) return;
    walletChange.store?.push(...pendingProofs);
    const totalPendingProofs = pendingProofs.reduce((acc, proof)=>acc + proof.amount, 0);
    wallet.state.reserveProofs(pendingProofs, totalPendingProofs);
    return wallet.state.update(walletChange, "Consolidate");
}
// src/wallets/cashu/wallet/fee.ts
function calculateFee(intendedAmount, providedProofs, returnedProofs) {
    const totalProvided = providedProofs.reduce((acc, p)=>acc + p.amount, 0);
    const totalReturned = returnedProofs.reduce((acc, p)=>acc + p.amount, 0);
    const totalFee = totalProvided - intendedAmount - totalReturned;
    if (totalFee < 0) {
        throw new Error("Invalid fee calculation: received more proofs than sent to mint");
    }
    return totalFee;
}
// src/wallets/cashu/wallet/effect.ts
async function withProofReserve(wallet, cashuWallet, mint, amountWithFees, amountWithoutFees, cb) {
    cashuWallet ??= await wallet.getCashuWallet(mint);
    const availableMintProofs = wallet.state.getProofs({
        mint,
        onlyAvailable: true
    });
    const proofs = cashuWallet.selectProofsToSend(availableMintProofs, amountWithFees);
    const fetchedAmount = proofs.send.reduce((a, b)=>a + b.amount, 0);
    if (fetchedAmount < amountWithFees) return null;
    wallet.state.reserveProofs(proofs.send, amountWithFees);
    let cbResult = null;
    let proofsChange = null;
    let updateRes = null;
    try {
        cbResult = await cb(proofs.send, availableMintProofs);
        if (!cbResult) return null;
        proofsChange = {
            mint,
            store: cbResult.change,
            destroy: proofs.send
        };
        updateRes = await wallet.state.update(proofsChange);
    } catch (e) {
        wallet.state.unreserveProofs(proofs.send, amountWithFees, "available");
        throw e;
    }
    if (!cbResult) return null;
    return {
        result: cbResult.result,
        proofsChange,
        stateUpdate: updateRes,
        mint,
        fee: calculateFee(amountWithoutFees, proofs.send, cbResult.change)
    };
}
// src/wallets/cashu/pay/ln.ts
async function payLn(wallet, pr, { amount, unit } = {}) {
    let invoiceAmount = getBolt11Amount(pr);
    if (!invoiceAmount) throw new Error("invoice amount is required");
    invoiceAmount = invoiceAmount / 1e3;
    if (amount && unit) {
        if (unit === "msat") {
            amount = amount / 1e3;
        }
    }
    const eligibleMints = wallet.getMintsWithBalance(invoiceAmount + 3);
    if (!eligibleMints.length) {
        return null;
    }
    for (const mint of eligibleMints){
        try {
            const result = await executePayment(mint, pr, amount ?? invoiceAmount, wallet);
            if (result) {
                if (amount) {
                    result.fee = calculateFee(amount, result.proofsChange?.destroy ?? [], result.proofsChange?.store ?? []);
                }
                return result;
            }
        } catch (error) {
            wallet.warn(`Failed to execute payment with min ${mint}: ${error}`);
        }
    }
    return null;
}
async function executePayment(mint, pr, amountWithoutFees, wallet) {
    const cashuWallet = await wallet.getCashuWallet(mint);
    try {
        const meltQuote = await cashuWallet.createMeltQuote(pr);
        const amountToSend = meltQuote.amount + meltQuote.fee_reserve;
        const result = await withProofReserve(wallet, cashuWallet, mint, amountToSend, amountWithoutFees, async (proofsToUse, _allOurProofs)=>{
            const meltResult = await cashuWallet.meltProofs(meltQuote, proofsToUse);
            if (meltResult.quote.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeltQuoteState"].PAID) {
                return {
                    result: {
                        preimage: meltResult.quote.payment_preimage ?? ""
                    },
                    change: meltResult.change
                };
            }
            return null;
        });
        return result;
    } catch (e) {
        if (e instanceof Error) {
            if (e.message.match(/already spent/i)) {
                setTimeout(()=>{
                    consolidateMintTokens(mint, wallet);
                }, 2500);
            } else {
                throw e;
            }
        }
        return null;
    }
}
// src/utils/cashu.ts
function ensureIsCashuPubkey(pubkey) {
    if (!pubkey) return;
    let _pubkey = pubkey;
    if (_pubkey.length === 64) _pubkey = `02${_pubkey}`;
    if (_pubkey.length !== 66) throw new Error("Invalid pubkey");
    return _pubkey;
}
async function mintProofs(wallet, quote, amount, mint, p2pk) {
    const mintTokenAttempt = (resolve, reject, attempt)=>{
        const pubkey = ensureIsCashuPubkey(p2pk);
        wallet.mintProofs(amount, quote.quote, {
            pubkey
        }).then((mintProofs2)=>{
            console.debug("minted tokens", mintProofs2);
            resolve({
                proofs: mintProofs2,
                mint
            });
        }).catch((e)=>{
            attempt++;
            if (attempt <= 3) {
                console.error("error minting tokens", e);
                setTimeout(()=>mintTokenAttempt(resolve, reject, attempt), attempt * 1500);
            } else {
                reject(e);
            }
        });
    };
    return new Promise((resolve, reject)=>{
        mintTokenAttempt(resolve, reject, 0);
    });
}
// src/wallets/cashu/pay/nut.ts
async function createToken(wallet, amount, recipientMints, p2pk) {
    console.log("[createToken] Starting token creation", {
        amount,
        recipientMints,
        p2pk
    });
    p2pk = ensureIsCashuPubkey(p2pk);
    const myMintsWithEnoughBalance = wallet.getMintsWithBalance(amount);
    console.log("[createToken] My mints with enough balance", myMintsWithEnoughBalance);
    const hasRecipientMints = recipientMints && recipientMints.length > 0;
    const mintsInCommon = hasRecipientMints ? findMintsInCommon([
        recipientMints,
        myMintsWithEnoughBalance
    ]) : myMintsWithEnoughBalance;
    console.log("[createToken] Mints in common", {
        hasRecipientMints,
        mintsInCommon
    });
    for (const mint of mintsInCommon){
        console.log("[createToken] Attempting to create token in mint", mint);
        try {
            const res = await createTokenInMint(wallet, mint, amount, p2pk);
            if (res) {
                console.log("[createToken] Successfully created token in mint", mint);
                return res;
            }
            console.log("[createToken] Failed to create token in mint", mint);
        } catch (e) {
            console.error("[createToken] Error creating token in mint", mint, e);
        }
    }
    if (hasRecipientMints) {
        console.log("[createToken] Attempting cross-mint transfer");
        return await createTokenWithMintTransfer(wallet, amount, recipientMints, p2pk);
    }
    console.error("[createToken] All token creation attempts failed");
    return null;
}
async function createTokenInMint(wallet, mint, amount, p2pk) {
    console.log("[createTokenInMint] Starting", {
        mint,
        amount,
        p2pk
    });
    const cashuWallet = await wallet.getCashuWallet(mint);
    console.log("[createTokenInMint] Got cashu wallet for mint", mint);
    try {
        const result = await withProofReserve(wallet, cashuWallet, mint, amount, amount, async (proofsToUse, allOurProofs)=>{
            console.log("[createTokenInMint] Inside withProofReserve callback", {
                proofsToUseCount: proofsToUse.length,
                allOurProofsCount: allOurProofs.length
            });
            const sendResult = await cashuWallet.send(amount, proofsToUse, {
                pubkey: p2pk,
                proofsWeHave: allOurProofs
            });
            console.log("[createTokenInMint] Send result", {
                sendCount: sendResult.send.length,
                keepCount: sendResult.keep.length
            });
            return {
                result: {
                    proofs: sendResult.send,
                    mint
                },
                change: sendResult.keep,
                mint
            };
        });
        console.log("[createTokenInMint] Success", result);
        return result;
    } catch (e) {
        console.error("[createTokenInMint] Error", {
            mint,
            error: e.message,
            stack: e.stack
        });
    }
    return null;
}
async function createTokenWithMintTransfer(wallet, amount, recipientMints, p2pk) {
    const generateQuote = async ()=>{
        const generateQuoteFromSomeMint = async (mint3)=>{
            const targetMintWallet3 = await walletForMint(mint3);
            if (!targetMintWallet3) throw new Error(`unable to load wallet for mint ${mint3}`);
            const quote3 = await targetMintWallet3.createMintQuote(amount);
            return {
                quote: quote3,
                mint: mint3,
                targetMintWallet: targetMintWallet3
            };
        };
        const quotesPromises = recipientMints.map(generateQuoteFromSomeMint);
        const { quote: quote2, mint: mint2, targetMintWallet: targetMintWallet2 } = await Promise.any(quotesPromises);
        if (!quote2) {
            throw new Error("failed to get quote from any mint");
        }
        return {
            quote: quote2,
            mint: mint2,
            targetMintWallet: targetMintWallet2
        };
    };
    const { quote, mint: targetMint, targetMintWallet } = await generateQuote();
    if (!quote) {
        return null;
    }
    const invoiceAmount = getBolt11Amount(quote.request);
    if (!invoiceAmount) throw new Error("invoice amount is required");
    const invoiceAmountInSat = invoiceAmount / 1e3;
    if (invoiceAmountInSat > amount) throw new Error(`invoice amount is more than the amount passed in (${invoiceAmountInSat} vs ${amount})`);
    const payLNResult = await payLn(wallet, quote.request, {
        amount
    });
    if (!payLNResult) {
        return null;
    }
    const { proofs, mint } = await mintProofs(targetMintWallet, quote, amount, targetMint, p2pk);
    return {
        ...payLNResult,
        result: {
            proofs,
            mint
        },
        fee: payLNResult.fee
    };
}
function findMintsInCommon(mintCollections) {
    const mintCounts = /* @__PURE__ */ new Map();
    for (const mints of mintCollections){
        for (const mint of mints){
            const normalizedMint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeUrl"])(mint);
            if (!mintCounts.has(normalizedMint)) {
                mintCounts.set(normalizedMint, 1);
            } else {
                mintCounts.set(normalizedMint, mintCounts.get(normalizedMint) + 1);
            }
        }
    }
    const commonMints = [];
    for (const [mint, count] of mintCounts.entries()){
        if (count === mintCollections.length) {
            commonMints.push(mint);
        }
    }
    return commonMints;
}
// src/wallets/cashu/wallet/payment.ts
var PaymentHandler = class {
    wallet;
    constructor(wallet){
        this.wallet = wallet;
    }
    /**
   * Pay a LN invoice with this wallet. This will used cashu proofs to pay a bolt11.
   */ async lnPay(payment, createTxEvent = true) {
        if (!payment.pr) throw new Error("pr is required");
        const invoiceAmount = getBolt11Amount(payment.pr);
        if (!invoiceAmount) throw new Error("invoice amount is required");
        if (payment.amount && invoiceAmount > payment.amount) {
            throw new Error("invoice amount is more than the amount passed in");
        }
        const res = await payLn(this.wallet, payment.pr, {
            amount: payment.amount,
            unit: payment.unit
        });
        if (!res?.result?.preimage) return;
        if (createTxEvent) {
            createOutTxEvent(this.wallet.ndk, payment, res, this.wallet.relaySet);
        }
        return res.result;
    }
    /**
   * Swaps tokens to a specific amount, optionally locking to a p2pk.
   */ async cashuPay(payment) {
        console.log("[PaymentHandler.cashuPay] Starting cashu payment", {
            originalAmount: payment.amount,
            unit: payment.unit,
            mints: payment.mints,
            p2pk: payment.p2pk,
            allowIntramintFallback: payment.allowIntramintFallback
        });
        const satPayment = {
            ...payment
        };
        if (satPayment.unit?.startsWith("msat")) {
            satPayment.amount = satPayment.amount / 1e3;
            satPayment.unit = "sat";
            console.log("[PaymentHandler.cashuPay] Converted msat to sat", {
                newAmount: satPayment.amount,
                newUnit: satPayment.unit
            });
        }
        console.log("[PaymentHandler.cashuPay] Creating token with mints", payment.mints);
        let createResult = await createToken(this.wallet, satPayment.amount, payment.mints, payment.p2pk);
        if (!createResult?.result) {
            console.log("[PaymentHandler.cashuPay] Token creation failed with specified mints");
            if (payment.allowIntramintFallback) {
                console.log("[PaymentHandler.cashuPay] Attempting intramint fallback");
                createResult = await createToken(this.wallet, satPayment.amount, void 0, payment.p2pk);
            }
            if (!createResult?.result) {
                console.error("[PaymentHandler.cashuPay] Token creation failed completely");
                return;
            }
        }
        console.log("[PaymentHandler.cashuPay] Token created successfully", {
            proofsCount: createResult.result.proofs.length,
            mint: createResult.result.mint
        });
        createOutTxEvent(this.wallet.ndk, satPayment, createResult, this.wallet.relaySet);
        return createResult.result;
    }
};
// src/wallets/cashu/wallet/state/balance.ts
function getBalance(opts) {
    const proofs = this.getProofEntries(opts);
    return proofs.reduce((sum, proof)=>sum + proof.proof.amount, 0);
}
function getMintsBalances({ onlyAvailable } = {
    onlyAvailable: true
}) {
    const balances = {};
    const proofs = this.getProofEntries({
        onlyAvailable
    });
    for (const proof of proofs){
        if (!proof.mint) continue;
        balances[proof.mint] ??= 0;
        balances[proof.mint] += proof.proof.amount;
    }
    return balances;
}
// src/wallets/cashu/wallet/state/proofs.ts
function addProof(proofEntry) {
    this.proofs.set(proofEntry.proof.C, proofEntry);
    this.journal.push({
        memo: "Added proof",
        timestamp: Date.now(),
        metadata: {
            type: "proof",
            id: proofEntry.proof.C,
            amount: proofEntry.proof.amount,
            mint: proofEntry.mint
        }
    });
}
function reserveProofs(proofs, amount) {
    for (const proof of proofs){
        this.updateProof(proof, {
            state: "reserved"
        });
    }
    this.reserveAmounts.push(amount);
}
function unreserveProofs(proofs, amount, newState) {
    for (const proof of proofs){
        this.updateProof(proof, {
            state: newState
        });
    }
    const index = this.reserveAmounts.indexOf(amount);
    if (index !== -1) {
        this.reserveAmounts.splice(index, 1);
    } else {
        throw new Error(`BUG: Amount ${amount} not found in reserveAmounts`);
    }
}
function getProofEntries(opts = {}) {
    const proofs = /* @__PURE__ */ new Map();
    const validStates = /* @__PURE__ */ new Set([
        "available"
    ]);
    let { mint, onlyAvailable, includeDeleted } = opts;
    onlyAvailable ??= true;
    if (!onlyAvailable) validStates.add("reserved");
    if (includeDeleted) validStates.add("deleted");
    for (const proofEntry of this.proofs.values()){
        if (mint && proofEntry.mint !== mint) continue;
        if (!validStates.has(proofEntry.state)) continue;
        if (!proofEntry.proof) continue;
        proofs.set(proofEntry.proof.C, proofEntry);
    }
    return Array.from(proofs.values());
}
function updateProof(proof, state) {
    const proofC = proof.C;
    const currentState = this.proofs.get(proofC);
    if (!currentState) throw new Error("Proof not found");
    const newState = {
        ...currentState,
        ...state
    };
    this.proofs.set(proofC, newState);
    this.journal.push({
        memo: `Updated proof state: ${JSON.stringify(state)}`,
        timestamp: Date.now(),
        metadata: {
            type: "proof",
            id: proofC,
            amount: proof.amount,
            mint: currentState.mint
        }
    });
}
// src/wallets/cashu/wallet/state/token.ts
function addToken(token) {
    if (!token.mint) throw new Error("BUG: Token has no mint");
    const currentEntry = this.tokens.get(token.id);
    const state = currentEntry?.state ?? "available";
    this.tokens.set(token.id, {
        token,
        state
    });
    for (const proof of token.proofs){
        maybeAssociateProofWithToken(this, proof, token, state);
    }
}
function maybeAssociateProofWithToken(walletState, proof, token, state) {
    const proofC = proof.C;
    const proofEntry = walletState.proofs.get(proofC);
    if (!proofEntry) {
        walletState.addProof({
            mint: token.mint,
            state,
            tokenId: token.id,
            timestamp: token.created_at,
            proof
        });
        return true;
    }
    if (proofEntry.tokenId) {
        if (proofEntry.tokenId === token.id) {
            return null;
        }
        const existingTokenEntry = walletState.tokens.get(proofEntry.tokenId);
        if (!existingTokenEntry) {
            throw new Error(`BUG: Token id ${proofEntry.tokenId} not found, was expected to be associated with proof ${proofC}`);
        }
        const existingToken = existingTokenEntry.token;
        if (existingToken) {
            if (existingToken.created_at && (!token.created_at || token.created_at < existingToken.created_at)) {
                return false;
            }
        }
        walletState.updateProof(proof, {
            tokenId: token.id,
            state
        });
        return true;
    }
    walletState.updateProof(proof, {
        tokenId: token.id,
        state
    });
    return true;
}
function removeTokenId(tokenId) {
    const currentEntry = this.tokens.get(tokenId) || {};
    this.tokens.set(tokenId, {
        ...currentEntry,
        state: "deleted"
    });
    for (const proofEntry of this.proofs.values()){
        const { proof } = proofEntry;
        if (proofEntry.tokenId === tokenId) {
            if (!proof) {
                throw new Error("BUG: Proof entry has no proof");
            }
            this.updateProof(proof, {
                state: "deleted"
            });
        }
    }
}
async function update(stateChange, _memo) {
    updateInternalState(this, stateChange);
    this.wallet.emit("balance_updated");
    return updateExternalState(this, stateChange);
}
function updateInternalState(walletState, stateChange) {
    if (stateChange.store && stateChange.store.length > 0) {
        for (const proof of stateChange.store){
            walletState.addProof({
                mint: stateChange.mint,
                state: "available",
                proof,
                timestamp: Date.now()
            });
        }
    }
    if (stateChange.destroy && stateChange.destroy.length > 0) {
        for (const proof of stateChange.destroy){
            walletState.updateProof(proof, {
                state: "deleted"
            });
        }
    }
    if (stateChange.reserve && stateChange.reserve.length > 0) {
        throw new Error("BUG: Proofs should not be reserved via update");
    }
}
async function updateExternalState(walletState, stateChange) {
    const newState = calculateNewState(walletState, stateChange);
    if (newState.deletedTokenIds.size > 0) {
        const deleteEvent = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](walletState.wallet.ndk, {
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EventDeletion,
            tags: [
                [
                    "k",
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken.toString()
                ],
                ...Array.from(newState.deletedTokenIds).map((id)=>[
                        "e",
                        id
                    ])
            ]
        });
        await deleteEvent.sign();
        publishWithRetry(walletState, deleteEvent, walletState.wallet.relaySet);
        for (const tokenId of newState.deletedTokenIds){
            walletState.removeTokenId(tokenId);
        }
    }
    const res = {};
    if (newState.saveProofs.length > 0) {
        const newToken = await createTokenEvent(walletState, stateChange.mint, newState);
        res.created = newToken;
    }
    return res;
}
async function publishWithRetry(walletState, event, relaySet, retryTimeout = 10 * 1e3) {
    let publishResult;
    publishResult = await event.publish(relaySet);
    let type;
    if (event.kind === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EventDeletion) type = "deletion";
    if (event.kind === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken) type = "token";
    if (event.kind === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet) type = "wallet";
    const journalEntryMetadata = {
        type,
        id: event.id,
        relayUrl: relaySet?.relayUrls.join(",")
    };
    if (publishResult) {
        walletState.journal.push({
            memo: `Publish kind:${event.kind} succeesfully`,
            timestamp: Date.now(),
            metadata: journalEntryMetadata
        });
        return publishResult;
    }
    walletState.journal.push({
        memo: "Publish failed",
        timestamp: Date.now(),
        metadata: journalEntryMetadata
    });
    setTimeout(()=>{
        publishWithRetry(walletState, event, relaySet, retryTimeout);
    }, retryTimeout);
}
async function createTokenEvent(walletState, mint, newState) {
    const newToken = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuToken"](walletState.wallet.ndk);
    newToken.mint = mint;
    newToken.proofs = newState.saveProofs;
    await newToken.toNostrEvent();
    walletState.addToken(newToken);
    newToken.deletedTokens = Array.from(newState.deletedTokenIds);
    await newToken.sign();
    walletState.addToken(newToken);
    publishWithRetry(walletState, newToken, walletState.wallet.relaySet);
    return newToken;
}
function calculateNewState(walletState, stateChange) {
    const destroyProofs = /* @__PURE__ */ new Set();
    for (const proof of stateChange.destroy || [])destroyProofs.add(proof.C);
    const proofsToStore = /* @__PURE__ */ new Map();
    let tokensToDelete;
    for (const proof of stateChange.store || [])proofsToStore.set(proof.C, proof);
    tokensToDelete = getAffectedTokens(walletState, stateChange);
    for (const token of tokensToDelete.values()){
        for (const proof of token.proofs){
            if (destroyProofs.has(proof.C)) continue;
            proofsToStore.set(proof.C, proof);
        }
    }
    return {
        deletedTokenIds: new Set(tokensToDelete.keys()),
        deletedProofs: destroyProofs,
        reserveProofs: [],
        saveProofs: Array.from(proofsToStore.values())
    };
}
function getAffectedTokens(walletState, stateChange) {
    const tokens = /* @__PURE__ */ new Map();
    for (const proof of stateChange.destroy || []){
        const proofEntry = walletState.proofs.get(proof.C);
        if (!proofEntry) {
            continue;
        }
        const tokenId = proofEntry.tokenId;
        if (!tokenId) {
            continue;
        }
        const tokenEntry = walletState.tokens.get(tokenId);
        if (!tokenEntry?.token) {
            continue;
        }
        tokens.set(tokenId, tokenEntry.token);
    }
    return tokens;
}
// src/wallets/cashu/wallet/state/index.ts
var WalletState = class {
    constructor(wallet, reservedProofCs = /* @__PURE__ */ new Set()){
        this.wallet = wallet;
        this.reservedProofCs = reservedProofCs;
    }
    /**
   * the amounts that are intended to be reserved
   * this is the net amount we are trying to pay out,
   * excluding fees and coin sizes
   * e.g. we might want to pay 5 sats, have 2 sats in fees
   * and we're using 2 inputs that add up to 8, the reserve amount is 5
   * while the reserve proofs add up to 8
   */ reserveAmounts = [];
    /**
   * Source of truth of the proofs this wallet has/had.
   */ proofs = /* @__PURE__ */ new Map();
    /**
   * The tokens that are known to this wallet.
   */ tokens = /* @__PURE__ */ new Map();
    journal = [];
    /** This is a debugging function that dumps the state of the wallet */ dump() {
        const res = {
            proofs: Array.from(this.proofs.values()),
            balances: this.getMintsBalance(),
            totalBalance: this.getBalance(),
            tokens: Array.from(this.tokens.values())
        };
        return res;
    }
    /***************************
   * Tokens
   ***************************/ addToken = addToken.bind(this);
    removeTokenId = removeTokenId.bind(this);
    /***************************
   * Proof management
   ***************************/ addProof = addProof.bind(this);
    /**
   * Reserves a number of selected proofs and a specific amount.
   *
   * The amount and total of the proofs don't need to match. We
   * might want to use 5 sats and have 2 proofs of 4 sats each.
   * In that case, the reserve amount is 5, while the reserve proofs
   * add up to 8.
   */ reserveProofs = reserveProofs.bind(this);
    /**
   * Unreserves a number of selected proofs and a specific amount.
   */ unreserveProofs = unreserveProofs.bind(this);
    /**
   * Returns all proof entries, optionally filtered by mint and state
   */ getProofEntries = getProofEntries.bind(this);
    /**
   * Updates information about a proof
   */ updateProof = updateProof.bind(this);
    /**
   * Returns all proofs, optionally filtered by mint and state
   * @param opts.mint - optional mint to filter by
   * @param opts.onlyAvailable - only include available proofs @default true
   * @param opts.includeDeleted - include deleted proofs @default false
   */ getProofs(opts) {
        return this.getProofEntries(opts).map((entry)=>entry.proof);
    }
    getTokens(opts = {
        onlyAvailable: true
    }) {
        const proofEntries = this.getProofEntries(opts);
        const tokens = /* @__PURE__ */ new Map();
        for (const proofEntry of proofEntries){
            const tokenId = proofEntry.tokenId ?? null;
            const current = tokens.get(tokenId) ?? {
                tokenId,
                mint: proofEntry.mint,
                proofEntries: []
            };
            current.token ??= tokenId ? this.tokens.get(tokenId)?.token : void 0;
            current.proofEntries.push(proofEntry);
            tokens.set(tokenId, current);
        }
        return tokens;
    }
    /**
   * Gets a list of proofs for each mint
   * @returns
   */ getMintsProofs({ validStates = /* @__PURE__ */ new Set([
        "available"
    ]) } = {}) {
        const mints = /* @__PURE__ */ new Map();
        for (const entry of this.proofs.values()){
            if (!entry.mint || !entry.proof) continue;
            if (!validStates.has(entry.state)) continue;
            const current = mints.get(entry.mint) || [];
            current.push(entry.proof);
            mints.set(entry.mint, current);
        }
        return mints;
    }
    /***************************
   * Balance
   ***************************/ /**
   * Returns the balance of the wallet, optionally filtered by mint and state
   *
   * @params opts.mint - optional mint to filter by
   * @params opts.onlyAvailable - only include available proofs @default true
   */ getBalance = getBalance.bind(this);
    /**
   * Returns the balances of the different mints
   *
   * @params opts.onlyAvailable - only include available proofs @default true
   */ getMintsBalance = getMintsBalances.bind(this);
    /***************************
   * State update
   ***************************/ update = update.bind(this);
};
// src/wallets/cashu/wallet/index.ts
var NDKCashuWallet = class _NDKCashuWallet extends NDKWallet {
    get type() {
        return "nip-60";
    }
    _p2pk;
    sub;
    status = "initial" /* INITIAL */ ;
    static kind = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet;
    static kinds = [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet
    ];
    /**
   * List of mint URLs configured for this wallet.
   * Modify directly to add/remove mints, then call publish() to save.
   *
   * @example
   * // Add a mint
   * wallet.mints = [...wallet.mints, 'https://mint.example.com'];
   * await wallet.publish();
   *
   * @example
   * // Remove a mint
   * wallet.mints = wallet.mints.filter(url => url !== 'https://old-mint.com');
   * await wallet.publish();
   */ mints = [];
    privkeys = /* @__PURE__ */ new Map();
    signer;
    walletId = "nip-60";
    depositMonitor = new NDKCashuDepositMonitor();
    /**
   * Warnings that have been raised
   */ warnings = [];
    paymentHandler;
    state;
    /**
   * Relay set for wallet events (kinds 7374, 7375, 7376).
   * Modify directly to add/remove relays, then call publish() to save.
   * If undefined, falls back to NIP-65 relay list.
   *
   * @example
   * // Set relays
   * wallet.relaySet = NDKRelaySet.fromRelayUrls(['wss://relay1.com', 'wss://relay2.com'], ndk);
   * await wallet.publish();
   *
   * @example
   * // Clear relays (use NIP-65 fallback)
   * wallet.relaySet = undefined;
   * await wallet.publish();
   */ relaySet;
    _walletRelays = [];
    constructor(ndk){
        super(ndk);
        this.ndk = ndk;
        this.paymentHandler = new PaymentHandler(this);
        this.state = new WalletState(this);
        if (ndk.cacheAdapter?.getCacheData && ndk.cacheAdapter?.setCacheData) {
            const callbacks = createMintCacheCallbacks(ndk.cacheAdapter);
            this.onMintInfoNeeded = callbacks.onMintInfoNeeded;
            this.onMintInfoLoaded = callbacks.onMintInfoLoaded;
            this.onMintKeysNeeded = callbacks.onMintKeysNeeded;
            this.onMintKeysLoaded = callbacks.onMintKeysLoaded;
        }
    }
    /**
   * Generates a backup event for this wallet
   */ async backup(publish = true) {
        if (this.privkeys.size === 0) throw new Error("no privkey to backup");
        const backup = new NDKCashuWalletBackup(this.ndk);
        const privkeys = [];
        for (const [_pubkey, signer] of this.privkeys.entries()){
            privkeys.push(signer.privateKey);
        }
        backup.privkeys = privkeys;
        backup.mints = this.mints;
        if (publish) backup.save(this.relaySet);
        return backup;
    }
    consolidateTokens = consolidateTokens.bind(this);
    /**
   * Generates nuts that can be used to send to someone.
   *
   * Note that this function does not send anything, it just generates a specific amount of proofs.
   * @param amounts
   * @returns
   */ async mintNuts(amounts) {
        let result;
        const totalAmount = amounts.reduce((acc, amount)=>acc + amount, 0);
        for (const mint of this.mints){
            const wallet = await this.getCashuWallet(mint);
            const mintProofs2 = await this.state.getProofs({
                mint
            });
            result = await wallet.send(totalAmount, mintProofs2, {
                proofsWeHave: mintProofs2,
                includeFees: true,
                outputAmounts: {
                    sendAmounts: amounts
                }
            });
            if (result.send.length > 0) {
                const change = {
                    store: result?.keep ?? [],
                    destroy: result.send,
                    mint
                };
                const updateRes = await this.state.update(change);
                createOutTxEvent(this.ndk, {
                    paymentDescription: "minted nuts",
                    amount: amounts.reduce((acc, amount)=>acc + amount, 0)
                }, {
                    result: {
                        proofs: result.send
                    },
                    stateUpdate: updateRes,
                    mint,
                    fee: 0
                }, this.relaySet);
                this.emit("balance_updated");
                return result;
            }
        }
    }
    /**
   * Creates a cashu token that can be sent to someone.
   * This method mints the specified amount and returns an encoded token string.
   *
   * @param amount - Amount in satoshis to send
   * @param memo - Optional memo to include in the token
   * @returns Encoded cashu token string
   *
   * @example
   * const token = await wallet.send(1000, "Coffee payment");
   * // token is a cashu token string that can be shared
   */ async send(amount, memo) {
        if (this.mints.length === 0) throw new Error("No mints configured");
        const result = await this.mintNuts([
            amount
        ]);
        if (!result) throw new Error("Failed to create token");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEncodedToken"])({
            mint: this.mints[0],
            proofs: result.send,
            memo
        });
    }
    /**
   * Loads a wallet information from an event
   * @param event
   */ async loadFromEvent(event) {
        const _event = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](event.ndk, event.rawEvent());
        await _event.decrypt();
        const content = JSON.parse(_event.content);
        for (const tag of content){
            if (tag[0] === "mint") {
                this.mints.push(tag[1]);
            } else if (tag[0] === "privkey") {
                await this.addPrivkey(tag[1]);
            } else if (tag[0] === "relay") {
                this._walletRelays.push(tag[1]);
            }
        }
        await this.getP2pk();
    }
    static async from(event) {
        if (!event.ndk) throw new Error("no ndk instance on event");
        const wallet = new _NDKCashuWallet(event.ndk);
        await wallet.loadFromEvent(event);
        return wallet;
    }
    /**
   * Creates a new NIP-60 wallet with the specified configuration.
   * Generates a private key, publishes the wallet event (kind 17375), and creates a backup (kind 375).
   *
   * @param ndk - NDK instance
   * @param mints - Array of mint URLs to configure
   * @param relays - Optional array of relay URLs for wallet events
   * @returns The newly created and published wallet
   *
   * @example
   * const wallet = await NDKCashuWallet.create(
   *   ndk,
   *   ['https://mint.example.com'],
   *   ['wss://relay.example.com']
   * );
   */ static async create(ndk, mints, relays) {
        const wallet = new _NDKCashuWallet(ndk);
        const signer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"].generate();
        await wallet.addPrivkey(signer.privateKey);
        wallet.mints = mints;
        if (relays && relays.length > 0) {
            wallet.relaySet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKRelaySet"].fromRelayUrls(relays, ndk);
        }
        await wallet.publish();
        await wallet.backup(true);
        return wallet;
    }
    /**
   * Fetches relay configuration for the wallet according to NIP-60.
   * First tries to get relays from encrypted wallet relays,
   * falls back to NIP-65 (kind 10002) relays if not found.
   */ async fetchWalletRelays(pubkey) {
        if (this._walletRelays.length > 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKRelaySet"].fromRelayUrls(this._walletRelays, this.ndk);
        }
        const relayListEvent = await this.ndk.fetchEvent({
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].RelayList
            ],
            authors: [
                pubkey
            ]
        }, {
            cacheUsage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSubscriptionCacheUsage"].PARALLEL
        });
        if (relayListEvent) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKRelayList"].from(relayListEvent).relaySet;
        }
        return void 0;
    }
    /**
   * Starts monitoring the wallet.
   *
   * Use `since` to start syncing state from a specific timestamp. This should be
   * used by storing at the app level a time in which we know we were able to communicate
   * with the relays, for example, by saving the time the wallet has emitted a "ready" event.
   */ async start(opts) {
        const activeUser = this.ndk?.activeUser;
        if (this.status === "ready" /* READY */ ) return Promise.resolve();
        this.setStatus("loading" /* LOADING */ );
        const pubkey = opts?.pubkey ?? activeUser?.pubkey;
        if (!pubkey) throw new Error("no pubkey");
        if (!this.relaySet) {
            this.relaySet = await this.fetchWalletRelays(pubkey);
        }
        const filters = [
            {
                kinds: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken
                ],
                authors: [
                    pubkey
                ]
            },
            {
                kinds: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuQuote
                ],
                authors: [
                    pubkey
                ]
            },
            {
                kinds: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EventDeletion
                ],
                authors: [
                    pubkey
                ],
                "#k": [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken.toString()
                ]
            }
        ];
        if (opts?.since) {
            filters[0].since = opts.since;
            filters[1].since = opts.since;
            filters[2].since = opts.since;
        }
        if (this.ndk.cacheAdapter) {
            const cacheEvents = [];
            const events = await this.ndk.fetchEvents([
                {
                    kinds: [
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuToken
                    ],
                    authors: [
                        pubkey
                    ]
                }
            ], {
                cacheUsage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSubscriptionCacheUsage"].ONLY_CACHE
            });
            cacheEvents.push(...events);
            for (const event of cacheEvents){
                eventHandler.call(this, event);
            }
            this.emit("balance_updated");
        }
        if (this.ndk.cacheAdapter) {
            try {
                const syncResult = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$sync$40$0$2e$3$2e$6_typescript$40$5$2e$9$2e$3$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$sync$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSync"].sync(this.ndk, filters, {
                    relaySet: this.relaySet,
                    autoFetch: true
                });
                for (const event of syncResult.events){
                    eventHandler.call(this, event);
                }
                const subOpts = opts ?? {};
                subOpts.subId ??= "cashu-wallet-state";
                const liveFilters = filters.map((f)=>({
                        ...f,
                        since: Math.floor(Date.now() / 1e3) - 60
                    }));
                this.sub = this.ndk.subscribe(liveFilters, {
                    ...subOpts,
                    relaySet: this.relaySet,
                    closeOnEose: false,
                    onEvent: (event)=>{
                        eventHandler.call(this, event);
                    },
                    onEventDup: eventDupHandler.bind(this)
                });
                this.emit("ready");
                this.setStatus("ready" /* READY */ );
            } catch (error) {
                console.error(`[NDKCashuWallet] Sync failed, falling back to subscription:`, error);
                await this.startWithSubscription(filters, opts);
            }
        } else {
            await this.startWithSubscription(filters, opts);
        }
    }
    /**
   * Starts wallet monitoring using traditional subscription (fallback when sync unavailable)
   */ async startWithSubscription(filters, opts) {
        const subOpts = opts ?? {};
        subOpts.subId ??= "cashu-wallet-state";
        return new Promise((resolve)=>{
            this.sub = this.ndk.subscribe(filters, {
                ...subOpts,
                relaySet: this.relaySet,
                onEvent: (event)=>{
                    eventHandler.call(this, event);
                },
                onEose: async ()=>{
                    this.emit("ready");
                    this.setStatus("ready" /* READY */ );
                    resolve();
                },
                onEventDup: eventDupHandler.bind(this)
            });
        });
    }
    stop() {
        this.sub?.stop();
        this.setStatus("initial" /* INITIAL */ );
    }
    setStatus(status) {
        if (this.status !== status) {
            this.status = status;
            this.emit("status_changed", status);
        }
    }
    /**
   * Returns the p2pk of this wallet or generates a new one if we don't have one
   */ async getP2pk() {
        if (this._p2pk) return this._p2pk;
        if (this.privkeys.size === 0) {
            const signer = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"].generate();
            await this.addPrivkey(signer.privateKey);
        }
        return this.p2pk;
    }
    /**
   * If this wallet has access to more than one privkey, this will return all of them.
   */ get p2pks() {
        return Array.from(this.privkeys.keys());
    }
    async addPrivkey(privkey) {
        const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](privkey);
        const user = await signer.user();
        this.privkeys.set(user.pubkey, signer);
        this._p2pk ??= user.pubkey;
        return this._p2pk;
    }
    get p2pk() {
        if (!this._p2pk) throw new Error("p2pk not set");
        return this._p2pk;
    }
    set p2pk(pubkey) {
        if (this.privkeys.has(pubkey)) {
            this.signer = this.privkeys.get(pubkey);
            this.p2pk = pubkey;
        } else {
            throw new Error(`privkey for ${pubkey} not found`);
        }
    }
    /**
   * Generates the payload for a wallet event
   */ walletPayload() {
        const privkeys = Array.from(this.privkeys.values()).map((signer)=>signer.privateKey);
        const payload = payloadForEvent(privkeys, this.mints);
        if (this._walletRelays.length > 0) {
            payload.push(...this._walletRelays.map((relay)=>[
                    "relay",
                    relay
                ]));
        }
        return payload;
    }
    /**
   * Publishes the wallet configuration (kind 17375) to save changes.
   * Call this after modifying mints or relaySet to persist the configuration.
   *
   * The wallet event contains encrypted mint URLs, private keys, and relay URLs.
   *
   * @example
   * // Add a mint and save
   * wallet.mints.push('https://mint.example.com');
   * await wallet.publish();
   *
   * @example
   * // Update relays and save
   * wallet.relaySet = NDKRelaySet.fromRelayUrls(['wss://relay.example.com'], ndk);
   * await wallet.publish();
   */ async publish() {
        if (this.relaySet) {
            this._walletRelays = Array.from(this.relaySet.relays).map((relay)=>relay.url);
        }
        const event = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](this.ndk, {
            content: JSON.stringify(this.walletPayload()),
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet
        });
        const user = await this.ndk?.signer?.user();
        await event.encrypt(user, void 0, "nip44");
        return event.publish(this.relaySet);
    }
    /**
   * Publishes the CashuMintList (kind 10019) for nutzap reception.
   * This public event tells others which mints and relays to use when sending nutzaps.
   *
   * @example
   * await wallet.publishMintList();
   */ async publishMintList() {
        const mintList = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuMintList"](this.ndk);
        mintList.mints = this.mints;
        if (this.relaySet) {
            mintList.relays = Array.from(this.relaySet.relays).map((relay)=>relay.url);
        }
        mintList.p2pk = this.p2pk;
        return mintList.publishReplaceable(this.relaySet);
    }
    /**
   * Updates wallet configuration (mints and relays) and publishes the changes.
   * Uses publishReplaceable to ensure the event replaces the previous wallet configuration.
   *
   * @param config - Configuration object with mints and optional relays
   *
   * @example
   * // Update mints only
   * await wallet.update({ mints: ['https://mint.example.com'] });
   *
   * @example
   * // Update both mints and relays
   * await wallet.update({
   *   mints: ['https://mint.example.com'],
   *   relays: ['wss://relay.example.com']
   * });
   */ async update(config) {
        this.mints = config.mints;
        if (config.relays && config.relays.length > 0) {
            this.relaySet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKRelaySet"].fromRelayUrls(config.relays, this.ndk);
            this._walletRelays = config.relays;
        } else {
            this.relaySet = void 0;
            this._walletRelays = [];
        }
        const event = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](this.ndk, {
            content: JSON.stringify(this.walletPayload()),
            kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet
        });
        const user = await this.ndk?.signer?.user();
        await event.encrypt(user, void 0, "nip44");
        return event.publishReplaceable(this.relaySet);
    }
    /**
   * Prepares a deposit
   * @param amount
   * @param mint
   *
   * @example
   * const wallet = new NDKCashuWallet(...);
   * const deposit = wallet.deposit(1000, "https://mint.example.com", "sats");
   * deposit.on("success", (token) => {
   * });
   * deposit.on("error", (error) => {
   * });
   *
   * // start monitoring the deposit
   * deposit.start();
   */ deposit(amount, mint) {
        const deposit = new NDKCashuDeposit(this, amount, mint);
        deposit.on("success", (token)=>{
            this.state.addToken(token);
        });
        return deposit;
    }
    /**
   * Receives a token and adds it to the wallet
   * @param token
   * @returns the token event that was created
   */ async receiveToken(token, description) {
        const { mint } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDecodedToken"])(token);
        const wallet = await this.getCashuWallet(mint);
        const proofs = await wallet.receive(token);
        const updateRes = await this.state.update({
            store: proofs,
            mint
        });
        const tokenEvent = updateRes.created;
        createInTxEvent(this.ndk, proofs, mint, updateRes, {
            description
        }, this.relaySet);
        return tokenEvent;
    }
    /**
   * Pay a LN invoice with this wallet
   */ async lnPay(payment, createTxEvent = true) {
        return this.paymentHandler.lnPay(payment, createTxEvent);
    }
    /**
   * Swaps tokens to a specific amount, optionally locking to a p2pk.
   *
   * This function has side effects:
   * - It swaps tokens at the mint
   * - It updates the wallet state (deletes affected tokens, might create new ones)
   * - It creates a wallet transaction event
   *
   * This function returns the proofs that need to be sent to the recipient.
   * @param amount
   */ async cashuPay(payment) {
        return this.paymentHandler.cashuPay(payment);
    }
    wallets = /* @__PURE__ */ new Map();
    async redeemNutzaps(nutzaps, privkey, { mint, proofs, cashuWallet }) {
        if (cashuWallet) {
            mint ??= cashuWallet.mint.mintUrl;
        } else {
            if (!mint) throw new Error("mint not set");
            cashuWallet = await this.getCashuWallet(mint);
        }
        if (!mint) throw new Error("mint not set");
        if (!proofs) throw new Error("proofs not set");
        try {
            const proofsWeHave = this.state.getProofs({
                mint
            });
            const res = await cashuWallet.receive({
                proofs,
                mint
            }, {
                proofsWeHave,
                privkey
            });
            const receivedAmount = proofs.reduce((acc, proof)=>acc + proof.amount, 0);
            const redeemedAmount = res.reduce((acc, proof)=>acc + proof.amount, 0);
            const fee = receivedAmount - redeemedAmount;
            const updateRes = await this.state.update({
                store: res,
                mint
            });
            createInTxEvent(this.ndk, res, mint, updateRes, {
                nutzaps,
                fee
            }, this.relaySet);
            return receivedAmount;
        } catch (e) {
            console.error("error redeeming nutzaps", nutzaps.map((n)=>n.encode()), e);
            throw e;
        }
    }
    warn(msg, event, relays) {
        relays ??= event?.onRelays;
        this.warnings.push({
            msg,
            event,
            relays
        });
        this.emit("warning", {
            msg,
            event,
            relays
        });
    }
    get balance() {
        return {
            amount: this.state.getBalance({
                onlyAvailable: true
            })
        };
    }
    /**
   * Gets the total balance for a specific mint, including reserved proofs
   */ mintBalance(mint) {
        return this.mintBalances[mint] || 0;
    }
    /**
   * Gets all tokens, grouped by mint with their total balances
   */ get mintBalances() {
        return this.state.getMintsBalance({
            onlyAvailable: true
        });
    }
    /**
   * Returns a list of mints that have enough available balance (excluding reserved proofs)
   * to cover the specified amount
   */ getMintsWithBalance(amount) {
        const availableBalances = this.state.getMintsBalance({
            onlyAvailable: true
        });
        return Object.entries(availableBalances).filter(([_, balance])=>balance >= amount).map(([mint])=>mint);
    }
    /**
   * Gets mint information for a specific mint URL.
   * Returns cached info if available, otherwise fetches from the mint.
   */ async getMintInfo(mintUrl) {
        const cashuWallet = await this.getCashuWallet(mintUrl);
        return await cashuWallet.mint.getInfo();
    }
};
var NDKCashuWalletBackup = class _NDKCashuWalletBackup extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"] {
    privkeys = [];
    mints = [];
    constructor(ndk, event){
        super(ndk, event);
        this.kind ??= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWalletBackup;
    }
    static async from(event) {
        if (!event.ndk) throw new Error("no ndk instance on event");
        const backup = new _NDKCashuWalletBackup(event.ndk, event);
        try {
            await backup.decrypt();
            const content = JSON.parse(backup.content);
            for (const tag of content){
                if (tag[0] === "mint") {
                    backup.mints.push(tag[1]);
                } else if (tag[0] === "privkey") {
                    backup.privkeys.push(tag[1]);
                }
            }
        } catch (e) {
            console.error("error decrypting backup event", backup.encode(), e);
            return;
        }
        return backup;
    }
    async save(relaySet) {
        if (!this.ndk) throw new Error("no ndk instance");
        if (!this.privkeys.length) throw new Error("no privkeys");
        this.content = JSON.stringify(payloadForEvent(this.privkeys, this.mints));
        await this.encrypt(this.ndk.activeUser, void 0, "nip44");
        return this.publish(relaySet);
    }
};
function payloadForEvent(privkeys, mints) {
    if (privkeys.length === 0) throw new Error("privkey not set");
    const payload = [
        ...mints.map((mint)=>[
                "mint",
                mint
            ]),
        ...privkeys.map((privkey)=>[
                "privkey",
                privkey
            ])
    ];
    return payload;
}
async function fetchPage(ndk, filter, _knownNutzaps, relaySet) {
    const events = await ndk.fetchEvents(filter, {
        cacheUsage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSubscriptionCacheUsage"].ONLY_RELAY,
        groupable: false,
        subId: "recent-nutzap"
    }, relaySet);
    return Array.from(events).map((e)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKNutzap"].from(e)).filter((n)=>!!n);
}
function groupNutzaps(nutzaps, monitor) {
    const result = /* @__PURE__ */ new Map();
    const getKey = (mint, p2pk = "no-key")=>`${mint}:${p2pk}`;
    for (const nutzap of nutzaps){
        if (!monitor.shouldTryRedeem(nutzap)) continue;
        const mint = nutzap.mint;
        for (const proof of nutzap.proofs){
            const cashuPubkey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["proofP2pk"])(proof) ?? "no-key";
            const key = getKey(mint, cashuPubkey);
            const group = result.get(key) ?? {
                mint,
                cashuPubkey,
                nostrPubkey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cashuPubkeyToNostrPubkey"])(cashuPubkey),
                nutzaps: []
            };
            group.nutzaps.push(nutzap);
            result.set(key, group);
        }
    }
    return Array.from(result.values());
}
async function getProofSpendState(wallet, nutzaps) {
    const result = {
        unspentProofs: [],
        spentProofs: [],
        nutzapsWithUnspentProofs: [],
        nutzapsWithSpentProofs: []
    };
    const proofCs = /* @__PURE__ */ new Set();
    const proofs = [];
    const nutzapMap = /* @__PURE__ */ new Map();
    for (const nutzap of nutzaps){
        for (const proof of nutzap.proofs){
            if (proofCs.has(proof.C)) continue;
            proofCs.add(proof.C);
            proofs.push(proof);
            nutzapMap.set(proof.C, nutzap);
        }
    }
    const states = await wallet.checkProofsStates(proofs);
    for(let i = 0; i < states.length; i++){
        const state = states[i];
        const proof = proofs[i];
        const nutzap = nutzapMap.get(proof.C);
        if (!nutzap) continue;
        if (state.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckStateEnum"].SPENT) {
            result.spentProofs.push(proof);
            if (!result.nutzapsWithSpentProofs.some((n)=>n.id === nutzap.id)) {
                result.nutzapsWithSpentProofs.push(nutzap);
            }
        } else if (state.state === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckStateEnum"].UNSPENT) {
            result.unspentProofs.push(proof);
            if (!result.nutzapsWithUnspentProofs.some((n)=>n.id === nutzap.id)) {
                result.nutzapsWithUnspentProofs.push(nutzap);
            }
        }
    }
    return result;
}
function log(_msg) {}
var NDKNutzapMonitor = class extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tseep$40$1$2e$3$2e$1$2f$node_modules$2f$tseep$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EventEmitter"] {
    store;
    ndk;
    user;
    relaySet;
    sub;
    nutzapStates = /* @__PURE__ */ new Map();
    _wallet;
    mintList;
    privkeys = /* @__PURE__ */ new Map();
    cashuWallets = /* @__PURE__ */ new Map();
    getCashuWallet = getCashuWallet.bind(this);
    onMintInfoNeeded;
    onMintInfoLoaded;
    onMintKeysNeeded;
    onMintKeysLoaded;
    /**
   * Create a new nutzap monitor.
   * @param ndk - The NDK instance.
   * @param user - The user to monitor.
   * @param mintList - An optional mint list to monitor zaps on, if one is not provided, the monitor will use the relay set from the mint list, which is the correct default behavior of NIP-61 zaps.
   * @param store - An optional store to save and load nutzap states to.
   */ constructor(ndk, user, { mintList, store }){
        super();
        this.ndk = ndk;
        this.user = user;
        this.mintList = mintList;
        this.relaySet = mintList?.relaySet;
        this.store = store;
    }
    set wallet(wallet) {
        this._wallet = wallet;
        if (wallet) {
            this.onMintInfoNeeded ??= wallet.onMintInfoNeeded;
            this.onMintInfoLoaded ??= wallet.onMintInfoLoaded;
            this.onMintKeysNeeded ??= wallet.onMintKeysNeeded;
            this.onMintKeysLoaded ??= wallet.onMintKeysLoaded;
            if (wallet instanceof NDKCashuWallet && wallet?.privkeys) {
                for (const [pubkey, signer] of wallet.privkeys.entries()){
                    try {
                        this.addPrivkey(signer);
                    } catch (e) {
                        console.error("failed to add privkey from wallet with pubkey", pubkey, e);
                    }
                }
            }
        }
    }
    get wallet() {
        return this._wallet;
    }
    /**
   * Provide private keys that can be used to redeem nutzaps.
   *
   * This is particularly useful when a NWC wallet is used to receive the nutzaps,
   * since it doesn't have a private key, this allows keeping the private key in a separate
   * place (ideally a NIP-60 wallet event).
   *
   * Multiple keys can be added, and the monitor will use the correct key for the nutzap.
   */ async addPrivkey(signer) {
        const pubkey = (await signer.user()).pubkey;
        if (this.privkeys.has(pubkey)) return;
        this.privkeys.set(pubkey, signer);
        if (!this.sub) return;
        const inMssingPrivKeyState = (state)=>state.status === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].MISSING_PRIVKEY;
        const ensureIsCashuPubkey2 = (state)=>state.nutzap?.p2pk === pubkey;
        const candidateNutzaps = Array.from(this.nutzapStates.values()).filter(inMssingPrivKeyState).filter(ensureIsCashuPubkey2);
        if (candidateNutzaps.length > 0) {
            const nutzaps = candidateNutzaps.map((c)=>c.nutzap).filter((n)=>!!n);
            const groupedNutzaps = groupNutzaps(nutzaps, this);
            for (const group of groupedNutzaps){
                await this.checkAndRedeemGroup(group);
            }
        }
    }
    async addUserPrivKey() {
        const { signer } = this.ndk;
        if (signer instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"]) {
            const user = await signer.user();
            const pubkey = user.pubkey;
            this.privkeys.set(pubkey, signer);
        }
    }
    /**
   * Loads kind:375 backup events and kind:17375 wallet config events from this user
   * to find all backup keys this user might have used.
   */ async getBackupKeys() {
        const backupEvents = await this.ndk.fetchEvents([
            {
                kinds: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWalletBackup,
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet
                ],
                authors: [
                    this.user.pubkey
                ]
            }
        ], void 0, this.relaySet);
        const keys = Array.from(this.privkeys.values());
        const keysNotFound = new Set(keys.map((signer)=>signer.privateKey));
        for (const event of backupEvents){
            if (event.kind === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWalletBackup) {
                const backup = await NDKCashuWalletBackup.from(event);
                if (!backup) continue;
                for (const privkey of backup.privkeys){
                    if (keysNotFound.has(privkey)) keysNotFound.delete(privkey);
                    try {
                        const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](privkey);
                        this.addPrivkey(signer);
                    } catch (e) {
                        console.error("failed to add privkey", privkey, e);
                    }
                }
            } else if (event.kind === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuWallet) {
                try {
                    await event.decrypt();
                    const content = JSON.parse(event.content);
                    for (const tag of content){
                        if (tag[0] === "privkey") {
                            const privkey = tag[1];
                            if (keysNotFound.has(privkey)) keysNotFound.delete(privkey);
                            try {
                                const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](privkey);
                                this.addPrivkey(signer);
                            } catch (e) {
                                console.error("failed to add privkey from wallet config", privkey, e);
                            }
                        }
                    }
                } catch (e) {
                    console.error("failed to decrypt wallet config event", event.encode(), e);
                }
            }
        }
        if (keysNotFound.size > 0) {
            const backup = new NDKCashuWalletBackup(this.ndk);
            backup.privkeys = Array.from(keysNotFound);
            await backup.save(this.relaySet);
        }
    }
    /**
   * Fetches the wallet's mint list from relays.
   * This is used for checking if incoming nutzaps match advertised preferences.
   */ async fetchMintList() {
        const event = await this.ndk.fetchEvent({
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintList
            ],
            authors: [
                this.user.pubkey
            ]
        }, {
            cacheUsage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSubscriptionCacheUsage"].PARALLEL,
            subId: "cashu-mint-list"
        });
        if (event) {
            this.mintList = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuMintList"].from(event);
            return this.mintList;
        }
        return void 0;
    }
    /**
   * Start the nutzap monitor. The monitor will initially look back
   * for nutzaps it doesn't know about and will try to redeem them.
   *
   * @param knownNutzaps - An optional set of nutzaps the app knows about. This is an optimization so that we don't try to redeem nutzaps we know have already been redeemed.
   * @param pageSize - The number of nutzaps to fetch per page.
   *
   */ async start({ filter, opts }) {
        if (this.sub) this.sub.stop();
        if (!this.mintList) {
            try {
                const mintList = await this.fetchMintList();
                log(`Fetched mint list with ${mintList?.mints.length ?? 0} mints`);
            } catch (e) {
                console.error("\u274C Failed to fetch mint list", e);
            }
        }
        try {
            await this.getBackupKeys();
            log(`Got backup keys ${this.privkeys.size}`);
        } catch (e) {
            console.error("\u274C Failed to get backup keys", e);
        }
        await this.addUserPrivKey();
        log(`Added user privkey ${this.privkeys.size}`);
        const since = Math.floor(Date.now() / 1e3);
        const monitorFilter = {
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].Nutzap
            ],
            "#p": [
                this.user.pubkey
            ],
            since
        };
        if (this.store) {
            try {
                const nutzaps = await this.store.getAllNutzaps();
                log(`Loaded ${nutzaps.size} nutzaps`);
                for (const [id, state] of nutzaps.entries()){
                    this.nutzapStates.set(id, state);
                }
                log(`Changed the state of ${nutzaps.size} nutzaps`);
            } catch (e) {
                console.error("\u274C Failed to load nutzaps from store", e);
            }
        }
        try {
            log("Will start processing redeemable nutzaps from store");
            await this.processRedeemableNutzapsFromStore();
            log("Finished processing redeemable nutzaps from store");
        } catch (e) {
            console.error("\u274C Failed to process redeemable nutzaps from store", e);
        }
        try {
            log("Will start processing accumulated nutzaps");
            await this.processAccumulatedNutzaps(filter, opts);
            log(`Finished processing accumulated nutzaps ${this.nutzapStates.size}`);
        } catch (e) {
            console.error("\u274C Failed to process nutzaps", e);
        }
        log(`Running filter ${JSON.stringify(monitorFilter)}`);
        const subscribeOpts = {
            subId: "ndk-wallet:nutzap-monitor",
            cacheUsage: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKSubscriptionCacheUsage"].ONLY_RELAY,
            wrap: false,
            // We skip validation so the user knows about nutzaps that were sent but are not valid
            // this way tooling can be more comprehensive and include nutzaps that were not valid
            skipValidation: true,
            ...opts,
            relaySet: this.relaySet
        };
        this.sub = this.ndk.subscribe(monitorFilter, subscribeOpts, // this.relaySet, // Removed: Passed via opts
        {
            // autoStart handlers (now 3rd argument)
            onEvent: (event)=>this.eventHandler(event)
        });
        return true;
    }
    /**
   * Checks if the group of nutzaps can be redeemed and redeems the ones that can be.
   */ async checkAndRedeemGroup(group, oldestUnspentNutzapTime) {
        const cashuWallet = await this.getCashuWallet(group.mint);
        const spendStates = await getProofSpendState(cashuWallet, group.nutzaps);
        for (const nutzap of spendStates.nutzapsWithSpentProofs){
            this.updateNutzapState(nutzap.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].SPENT,
                nutzap
            });
        }
        for (const nutzap of spendStates.nutzapsWithUnspentProofs){
            this.emit("seen", nutzap);
            this.updateNutzapState(nutzap.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INITIAL,
                nutzap
            });
        }
        if (spendStates.unspentProofs.length > 0) {
            for (const nutzap of spendStates.nutzapsWithUnspentProofs){
                if (!oldestUnspentNutzapTime || oldestUnspentNutzapTime > nutzap.created_at) {
                    oldestUnspentNutzapTime = nutzap.created_at;
                }
            }
            await this.redeemNutzaps(group.mint, spendStates.nutzapsWithUnspentProofs, spendStates.unspentProofs);
        }
    }
    /**
   * Processes nutzaps that have been accumulated while the monitor was offline.
   * @param startOpts
   * @param opts
   */ async processAccumulatedNutzaps(filter = {}, opts) {
        let oldestUnspentNutzapTime;
        const _filter = {
            ...filter
        };
        _filter.kinds = [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].Nutzap
        ];
        _filter["#p"] = [
            this.user.pubkey
        ];
        const knownNutzapIds = new Set(this.nutzapStates.keys());
        const nutzaps = await fetchPage(this.ndk, _filter, knownNutzapIds, this.relaySet);
        log(`We loaded ${nutzaps.length} nutzaps from relays`);
        oldestUnspentNutzapTime = await this.processNutzaps(nutzaps, oldestUnspentNutzapTime);
        if (oldestUnspentNutzapTime) {
            _filter.since = oldestUnspentNutzapTime - 1;
            await this.processAccumulatedNutzaps(_filter, opts);
        }
    }
    stop() {
        this.sub?.stop();
    }
    updateNutzapState(id, state) {
        const currentState = this.nutzapStates.get(id) ?? {};
        if (!currentState.status) state.status ??= __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INITIAL;
        const stateIsUnchanged = Object.entries(state).every(([key, value])=>{
            if (key === "nutzap" && currentState.nutzap && value) {
                return currentState.nutzap.id === value.id;
            }
            return currentState[key] === value;
        });
        if (stateIsUnchanged) return;
        this.nutzapStates.set(id, {
            ...currentState,
            ...state
        });
        this.emit("state_changed", id, currentState.status);
        const serializedState = (state2)=>{
            const res = {
                ...state2
            };
            if (res.nutzap) res.nutzap = res.nutzap.id;
            return JSON.stringify(res);
        };
        const currentStatusStr = serializedState(currentState);
        const newStatusStr = serializedState(state);
        log(`[${id.substring(0, 6)}] ${currentStatusStr} changed to \u{1F449} ${newStatusStr}`);
        this.store?.setNutzapState(id, state);
    }
    async eventHandler(event) {
        if (this.nutzapStates.has(event.id)) return;
        const nutzap = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKNutzap"].from(event);
        if (!nutzap) {
            this.updateNutzapState(event.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].PERMANENT_ERROR,
                errorMessage: "Failed to parse nutzap"
            });
            return;
        }
        if (this.mintList && !this.mintList.mints.includes(nutzap.mint)) {
            this.emit("seen_in_unknown_mint", nutzap);
        }
        this.redeemNutzap(nutzap);
    }
    /**
   * Gathers the necessary information to redeem a nutzap and then redeems it.
   * @param nutzap
   */ async redeemNutzap(nutzap) {
        if (!this.nutzapStates.has(nutzap.id)) this.updateNutzapState(nutzap.id, {
            status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INITIAL,
            nutzap
        });
        const rawP2pk = nutzap.rawP2pk;
        if (rawP2pk) {
            const cashuPubkey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["proofP2pk"])(nutzap.proofs[0]);
            if (cashuPubkey) {
                const nostrPubkey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cashuPubkeyToNostrPubkey"])(cashuPubkey);
                if (nostrPubkey && !this.privkeys.has(nostrPubkey)) {
                    this.updateNutzapState(nutzap.id, {
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].MISSING_PRIVKEY,
                        errorMessage: "No privkey found for p2pk"
                    });
                    return this.nutzapStates.get(nutzap.id);
                }
            }
        }
        await this.redeemNutzaps(nutzap.mint, [
            nutzap
        ], nutzap.proofs);
        return this.nutzapStates.get(nutzap.id);
    }
    /**
   * This function redeems a list of proofs.
   *
   * Proofs will be attempted to be redeemed in a single call, so they will all work or none will.
   * Either call this function with proofs that have been verified to be redeemable or don't group them,
   * and provide a single nutzap per call.
   *
   * All nutzaps MUST be p2pked to the same pubkey.
   *
   * @param mint
   * @param nutzaps
   * @param proofs
   * @param privkey Private key that is needed to redeem the nutzaps.
   * @returns
   */ async redeemNutzaps(mint, nutzaps, proofs) {
        if (!this.wallet) throw new Error("wallet not set");
        if (!this.wallet.redeemNutzaps) throw new Error("wallet does not support redeeming nutzaps");
        const cashuWallet = await this.getCashuWallet(mint);
        const validNutzaps = [];
        if (proofs.length > 0) {
            const cashuPubkey2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["proofP2pk"])(proofs[0]);
            if (!cashuPubkey2) {
                for (const nutzap of nutzaps){
                    this.updateNutzapState(nutzap.id, {
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP,
                        errorMessage: "Invalid nutzap: proof is not p2pk"
                    });
                }
                return;
            }
            const nostrPubkey2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cashuPubkeyToNostrPubkey"])(cashuPubkey2);
            if (!nostrPubkey2) {
                for (const nutzap of nutzaps){
                    this.updateNutzapState(nutzap.id, {
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP,
                        errorMessage: "Invalid nutzap: locked to an invalid public key (not a nostr key)"
                    });
                }
                return;
            }
            const privkey2 = this.privkeys.get(nostrPubkey2);
            if (!privkey2) {
                for (const nutzap of nutzaps){
                    this.updateNutzapState(nutzap.id, {
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].MISSING_PRIVKEY,
                        errorMessage: "No privkey found for p2pk"
                    });
                }
                return;
            }
        }
        for (const nutzap of nutzaps){
            if (!nutzap.isValid) {
                this.updateNutzapState(nutzap.id, {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP,
                    errorMessage: "Invalid nutzap"
                });
                continue;
            }
            const rawP2pk = nutzap.rawP2pk;
            if (!rawP2pk) {
                this.updateNutzapState(nutzap.id, {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP,
                    errorMessage: "Invalid nutzap: locked to an invalid public key (no p2pk)"
                });
                continue;
            }
            if (rawP2pk.length !== 66) {
                this.updateNutzapState(nutzap.id, {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP,
                    errorMessage: `Invalid nutzap: locked to an invalid public key (length ${rawP2pk.length})`
                });
                continue;
            }
            validNutzaps.push(nutzap);
        }
        if (validNutzaps.length === 0) return;
        const cashuPubkey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["proofP2pk"])(proofs[0]);
        if (!cashuPubkey) return;
        const nostrPubkey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cashuPubkeyToNostrPubkey"])(cashuPubkey);
        if (!nostrPubkey) return;
        const privkey = this.privkeys.get(nostrPubkey);
        if (!privkey) {
            for (const nutzap of validNutzaps){
                this.updateNutzapState(nutzap.id, {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].MISSING_PRIVKEY,
                    errorMessage: "No privkey found for p2pk"
                });
            }
            return;
        }
        for (const nutzap of validNutzaps){
            this.updateNutzapState(nutzap.id, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].PROCESSING
            });
        }
        try {
            const totalAmount = await this.wallet.redeemNutzaps(nutzaps, privkey.privateKey, {
                cashuWallet,
                proofs,
                mint
            });
            this.emit("redeemed", nutzaps, totalAmount);
            for (const nutzap of nutzaps){
                const nutzapTotalAmount = proofsTotal(proofsIntersection(proofs, nutzap.proofs));
                this.updateNutzapState(nutzap.id, {
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].REDEEMED,
                    redeemedAmount: nutzapTotalAmount
                });
            }
        } catch (e) {
            console.error("\u274C Failed to redeem nutzaps", e.message);
            if (e.message?.includes("unknown public key size")) {
                for (const nutzap of nutzaps){
                    this.updateNutzapState(nutzap.id, {
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].PERMANENT_ERROR,
                        errorMessage: "Invalid p2pk: unknown public key size"
                    });
                    this.emit("failed", nutzap, "Invalid p2pk: unknown public key size");
                }
            } else {
                for (const nutzap of nutzaps){
                    this.emit("failed", nutzap, e.message);
                }
            }
        }
    }
    shouldTryRedeem(nutzap) {
        const state = this.nutzapStates.get(nutzap.id);
        if (!state) return true;
        if ([
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INITIAL
        ].includes(state.status)) return true;
        if (state.status === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].MISSING_PRIVKEY) {
            const p2pk = state.nutzap?.p2pk;
            if (p2pk && this.privkeys.has(p2pk)) return true;
            return false;
        }
        if ([
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].SPENT,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].REDEEMED
        ].includes(state.status)) return false;
        if ([
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].PERMANENT_ERROR,
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NdkNutzapStatus"].INVALID_NUTZAP
        ].includes(state.status)) return false;
        return false;
    }
    /**
   * Process nutzaps from the store that are in a redeemable state.
   * This includes nutzaps in INITIAL state and those in MISSING_PRIVKEY state
   * for which we now have the private key.
   */ async processRedeemableNutzapsFromStore() {
        const redeemableNutzaps = [];
        for (const [_id, state] of this.nutzapStates.entries()){
            if (!state.nutzap) continue;
            if (this.shouldTryRedeem(state.nutzap)) {
                redeemableNutzaps.push(state.nutzap);
            }
        }
        if (redeemableNutzaps.length === 0) return;
        log(`We found ${redeemableNutzaps.length} redeemable nutzaps in the store`);
        await this.processNutzaps(redeemableNutzaps);
    }
    /**
   * Common method to process a collection of nutzaps:
   * - Group them by mint
   * - Check and redeem each group
   *
   * @param nutzaps The nutzaps to process
   * @param oldestUnspentNutzapTime Optional timestamp to track the oldest unspent nutzap
   * @returns The updated oldestUnspentNutzapTime if any nutzaps were processed
   */ async processNutzaps(nutzaps, oldestUnspentNutzapTime) {
        const groupedNutzaps = groupNutzaps(nutzaps, this);
        for (const group of groupedNutzaps){
            log(`Processing group ${group.mint} with ${group.nutzaps.length} nutzaps`);
            try {
                await this.checkAndRedeemGroup(group, oldestUnspentNutzapTime);
                log(`Finished processing group ${group.mint}`);
            } catch (e) {
                log(`Failed to process group ${group.mint}`);
                console.error(`\u274C Failed to process group ${group.mint}`, e);
            }
        }
        return oldestUnspentNutzapTime;
    }
};
function proofsIntersection(proofs1, proofs2) {
    const proofs2Cs = new Set(proofs2.map((p)=>p.C));
    return proofs1.filter((p)=>proofs2Cs.has(p.C));
}
function proofsTotal(proofs) {
    return proofs.reduce((acc, proof)=>acc + proof.amount, 0);
}
async function getCashuMintRecommendations(ndk, filter) {
    const f = [
        {
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EcashMintRecommendation
            ],
            "#k": [
                "38002"
            ],
            ...filter || {}
        },
        {
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintList
            ],
            ...filter || {}
        }
    ];
    const res = {};
    const recommendations = await ndk.fetchEvents(f);
    for (const event of recommendations){
        switch(event.kind){
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].EcashMintRecommendation:
                for (const uTag of event.getMatchingTags("u")){
                    if (uTag[2] && uTag[2] !== "cashu") continue;
                    const url = uTag[1];
                    if (!url) continue;
                    const entry = res[url] || {
                        events: [],
                        pubkeys: /* @__PURE__ */ new Set()
                    };
                    entry.events.push(event);
                    entry.pubkeys.add(event.pubkey);
                    res[url] = entry;
                }
                break;
            case __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].CashuMintList:
                for (const mintTag of event.getMatchingTags("mint")){
                    const url = mintTag[1];
                    if (!url) continue;
                    const entry = res[url] || {
                        events: [],
                        pubkeys: /* @__PURE__ */ new Set()
                    };
                    entry.events.push(event);
                    entry.pubkeys.add(event.pubkey);
                    res[url] = entry;
                }
                break;
        }
    }
    return res;
}
async function redeemNutzaps(nutzaps, privkey, { cashuWallet, proofs, mint }) {
    proofs ??= nutzaps.flatMap((n)=>n.proofs);
    if (!cashuWallet) {
        if (!mint) throw new Error("No mint provided");
        cashuWallet = await this.getCashuWallet(mint);
    } else {
        mint = cashuWallet.mint.mintUrl;
    }
    const info = await this.getInfo();
    if (!info.methods.includes("make_invoice")) throw new Error("This NWC wallet does not support making invoices");
    const totalAvailable = proofs.reduce((acc, proof)=>acc + proof.amount, 0);
    let sweepAmount = totalAvailable;
    while(sweepAmount > 0){
        const invoice = await this.makeInvoice(sweepAmount * 1e3, "Nutzap redemption");
        const meltQuote = await cashuWallet.createMeltQuote(invoice.invoice);
        const totalRequired = meltQuote.amount + meltQuote.fee_reserve;
        if (totalRequired > totalAvailable) {
            sweepAmount -= meltQuote.fee_reserve;
            continue;
        }
        const result = await cashuWallet.meltProofs(meltQuote, proofs, {
            privkey
        });
        let change;
        if (result.change.length > 0) change = await saveChange(this.ndk, mint, result.change);
        const description = `Nutzap redemption to external wallet (${this.walletId})`;
        createOutTxEvent(this.ndk, {
            pr: invoice.invoice,
            paymentDescription: description
        }, {
            result: {
                preimage: invoice.preimage
            },
            mint,
            fee: meltQuote.fee_reserve,
            proofsChange: {
                store: change?.proofs
            },
            stateUpdate: {
                created: change
            }
        }, this.relaySet, {
            nutzaps
        });
        return sweepAmount;
    }
    throw new Error("Failed to redeem nutzaps");
}
async function saveChange(ndk, mint, change) {
    const totalChange = change.reduce((acc, proof)=>acc + proof.amount, 0);
    if (totalChange === 0) return;
    const token = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKCashuToken"](ndk);
    token.mint = mint;
    token.proofs = change;
    token.publish();
    return token;
}
async function waitForResponse(request) {
    if (!this.pool) throw new Error("Wallet not initialized");
    const sendRequest = ()=>{
        if (waitForEoseTimeout) clearTimeout(waitForEoseTimeout);
        request.publish(this.relaySet);
    };
    const waitForEoseTimeout = setTimeout(sendRequest, 2500);
    return new Promise((resolve, reject)=>{
        const sub = this.ndk.subscribe({
            kinds: [
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].NostrWalletConnectRes
            ],
            "#e": [
                request.id
            ],
            limit: 1
        }, {
            groupable: false,
            pool: this.pool,
            relaySet: this.relaySet,
            onEvent: async (event)=>{
                try {
                    await event.decrypt(event.author, this.signer);
                    const content = JSON.parse(event.content);
                    if (content.error) {
                        reject(content);
                    } else {
                        resolve(content);
                    }
                } catch (e) {
                    console.error("error decrypting event", e);
                    reject({
                        result_type: "error",
                        error: {
                            code: "failed_to_parse_response",
                            message: e.message
                        }
                    });
                } finally{
                    sub.stop();
                }
            },
            onEose: ()=>{
                sendRequest();
            }
        });
    });
}
// src/wallets/nwc/req.ts
async function sendReq(method, params) {
    if (!this.walletService || !this.signer) {
        throw new Error("Wallet not initialized");
    }
    const event = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](this.ndk, {
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKKind"].NostrWalletConnectReq,
        tags: [
            [
                "p",
                this.walletService.pubkey
            ]
        ],
        content: JSON.stringify({
            method,
            params
        })
    });
    await event.encrypt(this.walletService, this.signer, "nip04");
    await event.sign(this.signer);
    const responsePromise = new Promise((resolve, reject)=>{
        waitForResponse.call(this, event).then(resolve).catch(reject);
    });
    if (this.timeout) {
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{
                this.emit("timeout", method);
                reject(new Error(`Request timed out after ${this.timeout}ms`));
            }, this.timeout));
        return Promise.race([
            responsePromise,
            timeoutPromise
        ]);
    }
    return responsePromise;
}
// src/wallets/nwc/index.ts
var d3 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$debug$40$4$2e$4$2e$3$2f$node_modules$2f$debug$2f$src$2f$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("ndk-wallet:nwc");
var NDKNWCWallet = class extends NDKWallet {
    get type() {
        return "nwc";
    }
    status = "initial" /* INITIAL */ ;
    walletId = "nwc";
    pairingCode;
    walletService;
    relaySet;
    signer;
    _balance;
    cachedInfo;
    pool;
    timeout;
    /**
   *
   * @param ndk
   * @param timeout A timeeout to use for all operations.
   */ constructor(ndk, { timeout, pairingCode, pubkey, relayUrls, secret }){
        super(ndk);
        if (pairingCode) {
            const u = new URL(pairingCode);
            pubkey = u.host ?? u.pathname;
            relayUrls = u.searchParams.getAll("relay");
            secret = u.searchParams.get("secret");
            this.pairingCode = pairingCode;
        }
        if (!pubkey || !relayUrls || !secret) throw new Error("Incomplete initialization parameters");
        this.timeout = timeout;
        this.walletService = this.ndk.getUser({
            pubkey
        });
        this.pool = this.getPool(relayUrls);
        this.relaySet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKRelaySet"].fromRelayUrls(relayUrls, this.ndk, true, this.pool);
        this.signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](secret);
        this.pool.on("connect", ()=>{
            this.status = "ready" /* READY */ ;
            this.emit("ready");
        });
        this.pool.on("relay:disconnect", ()=>this.status = "loading" /* LOADING */ );
        this.pool.connect();
        if (this.pool.connectedRelays().length > 0) {
            this.status = "ready" /* READY */ ;
            this.emit("ready");
        }
    }
    getPool(relayUrls) {
        for (const pool of this.ndk.pools)if (pool.name === "NWC") return pool;
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPool"](relayUrls, this.ndk, {
            name: "NWC"
        });
    }
    async lnPay(payment) {
        if (!this.signer) throw new Error("Wallet not initialized");
        d3("lnPay", payment.pr);
        const res = await this.req("pay_invoice", {
            invoice: payment.pr
        });
        d3("lnPay res", res);
        if (res.result) {
            return {
                preimage: res.result.preimage
            };
        }
        this.updateBalance();
        throw new Error(res.error?.message || "Payment failed");
    }
    /**
   * Pay by minting tokens.
   *
   * This creates a quote on a mint, pays it using NWC and then mints the tokens.
   *
   * @param payment - The payment to pay
   * @param onLnPayment - A callback that is called when an LN payment will be processed
   * @returns The payment confirmation
   */ async cashuPay(payment, onLnInvoice, onLnPayment) {
        if (!payment.mints) throw new Error("No mints provided");
        for (const mint of payment.mints){
            let amount = payment.amount;
            amount = amount / 1e3;
            const wallet = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuWallet"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"](mint), {
                unit: "sat"
            });
            let quote;
            try {
                quote = await wallet.createMintQuote(amount);
                d3("cashuPay quote", quote);
                onLnInvoice?.(quote.request);
            } catch (e) {
                console.error("error creating mint quote", e);
                throw e;
            }
            if (!quote) throw new Error("Didnt receive a mint quote");
            try {
                const res = await this.req("pay_invoice", {
                    invoice: quote.request
                });
                if (res.result?.preimage) {
                    onLnPayment?.(mint, res.result.preimage);
                }
                d3("cashuPay res", res);
            } catch (e) {
                const message = e?.error?.message || e?.message || "unknown error";
                console.error("error paying invoice", e, {
                    message
                });
                throw new Error(message);
            }
            this.updateBalance();
            return mintProofs(wallet, quote, amount, mint, payment.p2pk);
        }
    }
    /**
   * Redeem a set of nutzaps into an NWC wallet.
   *
   * This function gets an invoice from the NWC wallet until the total amount of the nutzaps is enough to pay for the invoice
   * when accounting for fees.
   *
   * @param cashuWallet - The cashu wallet to redeem the nutzaps into
   * @param nutzaps - The nutzaps to redeem
   * @param proofs - The proofs to redeem
   * @param mint - The mint to redeem the nutzaps into
   * @param privkey - The private key needed to redeem p2pk proofs.
   */ redeemNutzaps = redeemNutzaps.bind(this);
    /**
   * Fetch the balance of this wallet
   */ async updateBalance() {
        const res = await this.req("get_balance", {});
        if (!res.result) throw new Error("Failed to get balance");
        if (res.error) throw new Error(res.error.message);
        this._balance = {
            amount: res.result?.balance ?? 0
        };
        this._balance.amount /= 1e3;
        this.emit("balance_updated");
    }
    /**
   * Get the balance of this wallet
   */ get balance() {
        return this._balance;
    }
    req = sendReq.bind(this);
    async getInfo(refetch = false) {
        if (refetch) {
            this.cachedInfo = void 0;
        }
        if (this.cachedInfo) return this.cachedInfo;
        const res = await this.req("get_info", {});
        d3("info", res);
        if (!res.result) throw new Error("Failed to get info");
        if (res.error) throw new Error(res.error.message);
        this.cachedInfo = res.result;
        if (res.result.alias) this.walletId = res.result.alias;
        return res.result;
    }
    async listTransactions() {
        const res = await this.req("list_transactions", {});
        if (!res.result) throw new Error("Failed to list transactions");
        return res.result;
    }
    async makeInvoice(amount, description) {
        const res = await this.req("make_invoice", {
            amount,
            description
        });
        if (!res.result) throw new Error("Failed to make invoice");
        return res.result;
    }
};
var NDKLnPay = class {
    wallet;
    info;
    type = "ln";
    constructor(wallet, info){
        this.wallet = wallet;
        this.info = info;
    }
    async pay() {
        if (this.type === "ln") {
            return this.payLn();
        }
        return this.payNut();
    }
    /**
   * Uses LN balance to pay to a mint
   */ async payNut() {
        const { mints, p2pk } = this.info;
        let { amount, unit } = this.info;
        if (!mints) throw new Error("No mints provided");
        if (unit === "msat") {
            amount /= 1e3;
            unit = "sat";
        }
        const quotesPromises = mints.map(async (mint2)=>{
            const wallet2 = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuWallet"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"](mint2), {
                unit
            });
            const quote2 = await wallet2.createMintQuote(amount);
            return {
                quote: quote2,
                mint: mint2
            };
        });
        const { quote, mint } = await Promise.any(quotesPromises);
        if (!quote) {
            console.warn("failed to get quote from any mint");
            throw new Error("failed to get quote from any mint");
        }
        const res = await this.wallet.pay({
            pr: quote.request
        });
        if (!res) {
            console.warn("payment failed");
            throw new Error("payment failed");
        }
        const wallet = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuWallet"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$cashu$2d$ts$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CashuMint"](mint), {
            unit
        });
        const proofs = await wallet.mintProofs(amount, quote.quote, {
            pubkey: p2pk
        });
        console.warn("minted tokens with proofs %o", proofs);
        return {
            proofs,
            mint
        };
    }
    /**
   * Straightforward; uses LN balance to pay a LN invoice
   */ async payLn() {
        const data = this.info;
        if (!data.pr) throw new Error("missing pr");
        const ret = await this.wallet.pay(data);
        return ret ? ret.preimage : void 0;
    }
};
// src/wallets/webln/index.ts
var NDKWebLNWallet = class extends NDKWallet {
    get type() {
        return "webln";
    }
    walletId = "webln";
    status = "initial" /* INITIAL */ ;
    provider;
    _balance;
    constructor(ndk){
        super(ndk);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$webln$40$0$2e$3$2e$2$2f$node_modules$2f$webln$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["requestProvider"])().then((p)=>{
            if (p) {
                this.provider = p;
                this.status = "ready" /* READY */ ;
                this.emit("ready");
            } else {
                this.status = "failed" /* FAILED */ ;
            }
        }).catch(()=>this.status = "failed" /* FAILED */ );
    }
    async pay(payment) {
        if (!this.provider) throw new Error("Provider not ready");
        return this.provider.sendPayment(payment.pr);
    }
    async lnPay(payment) {
        const pay = new NDKLnPay(this, payment);
        const preimage = await pay.payLn();
        if (!preimage) return;
        return {
            preimage
        };
    }
    async cashuPay(payment) {
        const pay = new NDKLnPay(this, payment);
        return pay.payNut();
    }
    async updateBalance() {
        if (!this.provider) {
            return new Promise((resolve)=>{
                this.once("ready", ()=>{
                    resolve();
                });
            });
        }
        const b = await this.provider.getBalance?.();
        if (b) this._balance = {
            amount: b.balance
        };
        return;
    }
    get balance() {
        if (!this.provider) {
            return void 0;
        }
        return this._balance;
    }
};
;
}),
]);

//# sourceMappingURL=d85d1_%40nostr-dev-kit_wallet_dist_index_f82c6872.js.map