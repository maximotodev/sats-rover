(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/web/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearNsec",
    ()=>clearNsec,
    "loadNsec",
    ()=>loadNsec,
    "storeNsec",
    ()=>storeNsec
]);
// src/lib/storage.ts
const NSEC_KEY = "satsrover_nsec";
function storeNsec(nsec) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    sessionStorage.setItem(NSEC_KEY, nsec);
}
function loadNsec() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return sessionStorage.getItem(NSEC_KEY);
}
function clearNsec() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    sessionStorage.removeItem(NSEC_KEY);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/lib/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/constants.ts
__turbopack_context__.s([
    "BITCOIN_HUBS",
    ()=>BITCOIN_HUBS
]);
const BITCOIN_HUBS = [
    {
        name: "El Zonte",
        country: "🇸🇻",
        lat: 13.492,
        lon: -89.418,
        desc: "Bitcoin Beach"
    },
    {
        name: "Lugano",
        country: "🇨🇭",
        lat: 46.0037,
        lon: 8.9511,
        desc: "Plan ₿ City"
    },
    {
        name: "Prague",
        country: "🇨🇿",
        lat: 50.0755,
        lon: 14.4378,
        desc: "Home of Trezor"
    },
    {
        name: "Madeira",
        country: "🇵🇹",
        lat: 32.65,
        lon: -16.908,
        desc: "Free Trade Zone"
    },
    {
        name: "Berlin",
        country: "🇩🇪",
        lat: 52.496,
        lon: 13.437,
        desc: "Kreuzberg Area"
    },
    {
        name: "Austin",
        country: "🇺🇸",
        lat: 30.267,
        lon: -97.743,
        desc: "Bitcoin Commons"
    },
    {
        name: "Riga",
        country: "🇱🇻",
        lat: 56.949,
        lon: 24.105,
        desc: "Honeybadger HQ"
    },
    {
        name: "Prospera",
        country: "🇭🇳",
        lat: 16.326,
        lon: -86.538,
        desc: "Roatán Island"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/lib/geoutils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GEOHASH_CITY",
    ()=>GEOHASH_CITY,
    "GEOHASH_EXACT",
    ()=>GEOHASH_EXACT,
    "generateCityId",
    ()=>generateCityId,
    "getExactGeohash",
    ()=>getExactGeohash
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ngeohash$40$0$2e$6$2e$3$2f$node_modules$2f$ngeohash$2f$main$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/ngeohash@0.6.3/node_modules/ngeohash/main.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/constants.ts [app-client] (ecmascript)");
;
;
const GEOHASH_EXACT = 7; // ~150m (User Location)
const GEOHASH_CITY = 3; // ~150km (City Aggregation)
function getExactGeohash(lat, lon) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ngeohash$40$0$2e$6$2e$3$2f$node_modules$2f$ngeohash$2f$main$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].encode(lat, lon, GEOHASH_EXACT);
}
function generateCityId(lat, lon) {
    // 1. Calculate the math-based ID
    const prefix = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$ngeohash$40$0$2e$6$2e$3$2f$node_modules$2f$ngeohash$2f$main$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].encode(lat, lon, GEOHASH_CITY);
    // 2. Try to resolve human-readable names (UI Layer only)
    // We check if this geohash is near a known hub to get the correct Country Code
    let countryCode = "xx";
    let readableName = "Wilderness";
    for (const hub of __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BITCOIN_HUBS"]){
        const dist = getDistanceFromLatLonInKm(lat, lon, hub.lat, hub.lon);
        if (dist < 100) {
            // Broad city match
            countryCode = getCountryCode(hub.country);
            readableName = hub.name;
            break;
        }
    }
    return {
        cityId: `${countryCode}-${prefix}`,
        cityName: readableName,
        country: countryCode.toUpperCase()
    };
}
// Helper: Haversine Distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
// Helper: Map Emoji to ISO Code
function getCountryCode(countryStr) {
    const map = {
        "🇸🇻": "sv",
        "🇨🇭": "ch",
        "🇨🇿": "cz",
        "🇵🇹": "pt",
        "🇩🇪": "de",
        "🇺🇸": "us",
        "🇱🇻": "lv",
        "🇭🇳": "hn"
    };
    return map[countryStr] || "xx";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/hooks/use-nostr.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNostr",
    ()=>useNostr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@nostr-dev-kit+ndk@2.18.1_nostr-tools@2.20.0_typescript@5.9.3_/node_modules/@nostr-dev-kit/ndk/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f$nostr$2d$tools$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/nostr-tools@2.20.0_typescript@5.9.3/node_modules/nostr-tools/lib/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$geoutils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/geoutils.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
let ndkInstance = null;
function useNostr() {
    _s();
    const [ndk, setNdk] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        type: "anon"
    });
    // 1. Initialize & Auto-Restore
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNostr.useEffect": ()=>{
            const init = {
                "useNostr.useEffect.init": async ()=>{
                    if (!ndkInstance) {
                        ndkInstance = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                            explicitRelayUrls: [
                                "wss://relay.damus.io",
                                "wss://relay.primal.net",
                                "wss://nos.lol",
                                "wss://relay.snort.social"
                            ]
                        });
                        try {
                            await ndkInstance.connect();
                            setNdk(ndkInstance);
                        } catch (e) {
                            console.error("Nostr Init Failed", e);
                        }
                    } else {
                        setNdk(ndkInstance);
                    }
                }
            }["useNostr.useEffect.init"];
            init();
        }
    }["useNostr.useEffect"], []);
    // Restore Session
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useNostr.useEffect": ()=>{
            if (ndk && session.type === "anon") {
                const storedNsec = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadNsec"])();
                if (storedNsec) {
                    loginWithNsec(storedNsec, true).catch({
                        "useNostr.useEffect": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNsec"])()
                    }["useNostr.useEffect"]);
                }
            }
        }
    }["useNostr.useEffect"], [
        ndk
    ]);
    // 2. Auth Methods
    const loginWithExtension = async ()=>{
        if (!ndk || !window.nostr) throw new Error("No extension");
        const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKNip07Signer"]();
        ndk.signer = signer;
        const user = await signer.user();
        await user.fetchProfile();
        setSession({
            type: "nip07",
            pubkey: user.pubkey,
            user
        });
    };
    const loginWithNsec = async (nsec, remember = false)=>{
        if (!ndk) return;
        try {
            const { type, data } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f$nostr$2d$tools$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nip19"].decode(nsec);
            if (type !== "nsec") throw new Error("Invalid nsec");
            const hexKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(data).toString("hex");
            const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](hexKey);
            ndk.signer = signer;
            const user = await signer.user();
            await user.fetchProfile();
            if (remember) (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storeNsec"])(nsec);
            else (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNsec"])();
            setSession({
                type: "local_nsec",
                pubkey: user.pubkey,
                user
            });
        } catch (e) {
            console.error("Login failed", e);
            throw e;
        }
    };
    const signup = async (remember = false)=>{
        if (!ndk) return;
        const sk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f$nostr$2d$tools$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSecretKey"])();
        const hexKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(sk).toString("hex");
        const nsec = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3$2f$node_modules$2f$nostr$2d$tools$2f$lib$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nip19"].nsecEncode(sk);
        const signer = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKPrivateKeySigner"](hexKey);
        ndk.signer = signer;
        const user = await signer.user();
        if (remember) (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storeNsec"])(nsec);
        else (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNsec"])();
        setSession({
            type: "local_nsec",
            pubkey: user.pubkey,
            user
        });
        return {
            nsec,
            user
        };
    };
    const updateProfile = async (name, about, picture)=>{
        if (!ndk || !session.user) return;
        await session.user.fetchProfile();
        const existing = session.user.profile || {};
        session.user.profile = {
            ...existing,
            name: name || existing.name,
            about: about || existing.about,
            image: picture || existing.image
        };
        await session.user.publish();
        setSession((prev)=>({
                ...prev,
                user: session.user
            }));
    };
    const logout = ()=>{
        if (ndk) ndk.signer = undefined;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNsec"])();
        setSession({
            type: "anon"
        });
    };
    // 3. ✅ ARCHITECTURE LOCK: Strict Signal Publishing
    const publishSignal = async (merchantName, merchantId, lat, lon, paymentResult, paymentMethod, comment)=>{
        if (session.type === "anon" || !ndk) throw new Error("Auth required");
        // 1. Calculate Deterministic Data (Geophysics)
        const geohash = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$geoutils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getExactGeohash"])(lat, lon);
        const { cityId, cityName, country } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$geoutils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateCityId"])(lat, lon);
        const event = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$nostr$2d$dev$2d$kit$2b$ndk$40$2$2e$18$2e$1_nostr$2d$tools$40$2$2e$20$2e$0_typescript$40$5$2e$9$2e$3_$2f$node_modules$2f40$nostr$2d$dev$2d$kit$2f$ndk$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NDKEvent"](ndk);
        event.kind = 1;
        // Human Content (Social Layer - Backward Compatible)
        const statusEmoji = paymentResult === "success" ? "✅" : paymentResult === "failed" ? "❌" : "👀";
        event.content = `${statusEmoji} ${comment}\n\nChecking in at ${merchantName} ⚡ #satsrover`;
        // Machine Tags (Data Layer - The Real Product)
        event.tags = [
            // Protocol Namespace
            [
                "L",
                "satsrover"
            ],
            [
                "l",
                "checkin",
                "satsrover"
            ],
            [
                "client",
                "satsrover"
            ],
            // Indexing & Discovery
            [
                "t",
                "satsrover"
            ],
            [
                "g",
                geohash
            ],
            // Context Identity
            [
                "place",
                merchantId
            ],
            [
                "city_id",
                cityId
            ],
            // Metadata (UI Helpers)
            [
                "city",
                cityName
            ],
            [
                "country",
                country
            ],
            // Economic Signal
            [
                "status",
                paymentResult
            ],
            [
                "method",
                paymentMethod
            ]
        ];
        try {
            // Use .publish() which returns a Set of relays that accepted the event
            const relays = await event.publish();
            if (relays.size === 0) {
                throw new Error("No relays accepted the event");
            }
            return true;
        } catch (e) {
            console.error("Failed to publish", e);
            // alert("Failed to sign/publish event."); // Remove alert, handle in UI
            return false;
        }
    };
    return {
        ndk,
        session,
        loginWithExtension,
        loginWithNsec,
        signup,
        updateProfile,
        logout,
        publishSignal
    };
}
_s(useNostr, "QrwcTs2tVohnUrCzgXxt8MWY/+w=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/apps/web/src/contexts/NostrSessionContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NostrSessionProvider",
    ()=>NostrSessionProvider,
    "useSession",
    ()=>useSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_@babel+core@7.28.6_react-dom@19.2.3_react@19.2.3__react@19.2.3/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$hooks$2f$use$2d$nostr$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/hooks/use-nostr.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const NostrSessionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function NostrSessionProvider({ children }) {
    _s();
    const nostr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$hooks$2f$use$2d$nostr$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNostr"])();
    const capabilities = {
        canSign: nostr.session.type !== "anon",
        canPublish: nostr.session.type !== "anon",
        canPay: true
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NostrSessionContext.Provider, {
        value: {
            ndk: nostr.ndk,
            session: nostr.session,
            capabilities,
            loginWithExtension: nostr.loginWithExtension,
            loginWithNsec: nostr.loginWithNsec,
            signup: nostr.signup,
            updateProfile: nostr.updateProfile,
            logout: nostr.logout,
            publishSignal: nostr.publishSignal
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/contexts/NostrSessionContext.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(NostrSessionProvider, "ji1ojlBR1IXOqCsDkEw3L2Exp4Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$hooks$2f$use$2d$nostr$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNostr"]
    ];
});
_c = NostrSessionProvider;
function useSession() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_$40$babel$2b$core$40$7$2e$28$2e$6_react$2d$dom$40$19$2e$2$2e$3_react$40$19$2e$2$2e$3_$5f$react$40$19$2e$2$2e$3$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(NostrSessionContext);
    if (!ctx) throw new Error("useSession must be used inside NostrSessionProvider");
    return ctx;
}
_s1(useSession, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "NostrSessionProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_web_src_4fb0c727._.js.map