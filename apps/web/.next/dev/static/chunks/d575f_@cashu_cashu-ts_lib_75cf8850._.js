(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>x,
    "b",
    ()=>H,
    "c",
    ()=>m,
    "d",
    ()=>u,
    "e",
    ()=>w,
    "f",
    ()=>b,
    "g",
    ()=>U,
    "h",
    ()=>E,
    "i",
    ()=>A,
    "j",
    ()=>d,
    "k",
    ()=>L,
    "l",
    ()=>h,
    "m",
    ()=>p,
    "o",
    ()=>$,
    "r",
    ()=>B
]);
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function p(t) {
    return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array";
}
function d(t, e = "") {
    if (!Number.isSafeInteger(t) || t < 0) {
        const n = e && `"${e}" `;
        throw new Error(`${n}expected integer >= 0, got ${t}`);
    }
}
function u(t, e, n = "") {
    const r = p(t), o = t?.length, i = e !== void 0;
    if (!r || i && o !== e) {
        const f = n && `"${n}" `, a = i ? ` of length ${e}` : "", c = r ? `length=${o}` : `type=${typeof t}`;
        throw new Error(f + "expected Uint8Array" + a + ", got " + c);
    }
    return t;
}
function h(t) {
    if (typeof t != "function" || typeof t.create != "function") throw new Error("Hash must wrapped by utils.createHasher");
    d(t.outputLen), d(t.blockLen);
}
function x(t, e = !0) {
    if (t.destroyed) throw new Error("Hash instance has been destroyed");
    if (e && t.finished) throw new Error("Hash#digest() has already been called");
}
function w(t, e) {
    u(t, void 0, "digestInto() output");
    const n = e.outputLen;
    if (t.length < n) throw new Error('"digestInto() output" expected to be of length >=' + n);
}
function b(...t) {
    for(let e = 0; e < t.length; e++)t[e].fill(0);
}
function m(t) {
    return new DataView(t.buffer, t.byteOffset, t.byteLength);
}
function A(t, e) {
    return t << 32 - e | t >>> e;
}
const g = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", y = /* @__PURE__ */ Array.from({
    length: 256
}, (t, e)=>e.toString(16).padStart(2, "0"));
function H(t) {
    if (u(t), g) return t.toHex();
    let e = "";
    for(let n = 0; n < t.length; n++)e += y[t[n]];
    return e;
}
const s = {
    _0: 48,
    _9: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
};
function l(t) {
    if (t >= s._0 && t <= s._9) return t - s._0;
    if (t >= s.A && t <= s.F) return t - (s.A - 10);
    if (t >= s.a && t <= s.f) return t - (s.a - 10);
}
function E(t) {
    if (typeof t != "string") throw new Error("hex string expected, got " + typeof t);
    if (g) return Uint8Array.fromHex(t);
    const e = t.length, n = e / 2;
    if (e % 2) throw new Error("hex string expected, got unpadded hex of length " + e);
    const r = new Uint8Array(n);
    for(let o = 0, i = 0; o < n; o++, i += 2){
        const f = l(t.charCodeAt(i)), a = l(t.charCodeAt(i + 1));
        if (f === void 0 || a === void 0) {
            const c = t[i] + t[i + 1];
            throw new Error('hex string expected, got non-hex character "' + c + '" at index ' + i);
        }
        r[o] = f * 16 + a;
    }
    return r;
}
function L(...t) {
    let e = 0;
    for(let r = 0; r < t.length; r++){
        const o = t[r];
        u(o), e += o.length;
    }
    const n = new Uint8Array(e);
    for(let r = 0, o = 0; r < t.length; r++){
        const i = t[r];
        n.set(i, o), o += i.length;
    }
    return n;
}
function U(t, e = {}) {
    const n = (o, i)=>t(i).update(o).digest(), r = t(void 0);
    return n.outputLen = r.outputLen, n.blockLen = r.blockLen, n.create = (o)=>t(o), Object.assign(n, e), Object.freeze(n);
}
function B(t = 32) {
    const e = typeof globalThis == "object" ? globalThis.crypto : null;
    if (typeof e?.getRandomValues != "function") throw new Error("crypto.getRandomValues must be defined");
    return e.getRandomValues(new Uint8Array(t));
}
const $ = (t)=>({
        oid: Uint8Array.from([
            6,
            9,
            96,
            134,
            72,
            1,
            101,
            3,
            4,
            2,
            t
        ])
    });
;
 //# sourceMappingURL=utils-CZmbiPUC.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>pn,
    "b",
    ()=>xn,
    "h",
    ()=>Re,
    "n",
    ()=>Vt,
    "s",
    ()=>Ht
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
var qe = Object.defineProperty;
var Ne = (n, t, r)=>t in n ? qe(n, t, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: r
    }) : n[t] = r;
var m = (n, t, r)=>Ne(n, typeof t != "symbol" ? t + "" : t, r);
;
function De(n, t, r) {
    return n & t ^ ~n & r;
}
function ke(n, t, r) {
    return n & t ^ n & r ^ t & r;
}
class Te {
    constructor(t, r, e, s){
        m(this, "blockLen");
        m(this, "outputLen");
        m(this, "padOffset");
        m(this, "isLE");
        // For partial updates less than block size
        m(this, "buffer");
        m(this, "view");
        m(this, "finished", !1);
        m(this, "length", 0);
        m(this, "pos", 0);
        m(this, "destroyed", !1);
        this.blockLen = t, this.outputLen = r, this.padOffset = e, this.isLE = s, this.buffer = new Uint8Array(t), this.view = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(this.buffer);
    }
    update(t) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"])(this), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(t);
        const { view: r, buffer: e, blockLen: s } = this, o = t.length;
        for(let i = 0; i < o;){
            const f = Math.min(s - this.pos, o - i);
            if (f === s) {
                const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(t);
                for(; s <= o - i; i += s)this.process(c, i);
                continue;
            }
            e.set(t.subarray(i, i + f), this.pos), this.pos += f, i += f, this.pos === s && (this.process(r, 0), this.pos = 0);
        }
        return this.length += t.length, this.roundClean(), this;
    }
    digestInto(t) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"])(this), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["e"])(t, this), this.finished = !0;
        const { buffer: r, view: e, blockLen: s, isLE: o } = this;
        let { pos: i } = this;
        r[i++] = 128, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["f"])(this.buffer.subarray(i)), this.padOffset > s - i && (this.process(e, 0), i = 0);
        for(let h = i; h < s; h++)r[h] = 0;
        e.setBigUint64(s - 8, BigInt(this.length * 8), o), this.process(e, 0);
        const f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(t), c = this.outputLen;
        if (c % 4) throw new Error("_sha2: outputLen must be aligned to 32bit");
        const l = c / 4, g = this.get();
        if (l > g.length) throw new Error("_sha2: outputLen bigger than state");
        for(let h = 0; h < l; h++)f.setUint32(4 * h, g[h], o);
    }
    digest() {
        const { buffer: t, outputLen: r } = this;
        this.digestInto(t);
        const e = t.slice(0, r);
        return this.destroy(), e;
    }
    _cloneInto(t) {
        t || (t = new this.constructor()), t.set(...this.get());
        const { blockLen: r, buffer: e, length: s, finished: o, destroyed: i, pos: f } = this;
        return t.destroyed = i, t.finished = o, t.length = s, t.pos = f, s % r && t.buffer.set(e), t;
    }
    clone() {
        return this._cloneInto();
    }
}
const Q = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
]), Ve = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
]), J = /* @__PURE__ */ new Uint32Array(64);
class Ye extends Te {
    constructor(t){
        super(64, t, 8, !1);
    }
    get() {
        const { A: t, B: r, C: e, D: s, E: o, F: i, G: f, H: c } = this;
        return [
            t,
            r,
            e,
            s,
            o,
            i,
            f,
            c
        ];
    }
    // prettier-ignore
    set(t, r, e, s, o, i, f, c) {
        this.A = t | 0, this.B = r | 0, this.C = e | 0, this.D = s | 0, this.E = o | 0, this.F = i | 0, this.G = f | 0, this.H = c | 0;
    }
    process(t, r) {
        for(let h = 0; h < 16; h++, r += 4)J[h] = t.getUint32(r, !1);
        for(let h = 16; h < 64; h++){
            const R = J[h - 15], b = J[h - 2], v = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(R, 7) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(R, 18) ^ R >>> 3, _ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(b, 17) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(b, 19) ^ b >>> 10;
            J[h] = _ + J[h - 7] + v + J[h - 16] | 0;
        }
        let { A: e, B: s, C: o, D: i, E: f, F: c, G: l, H: g } = this;
        for(let h = 0; h < 64; h++){
            const R = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(f, 6) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(f, 11) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(f, 25), b = g + R + De(f, c, l) + Ve[h] + J[h] | 0, _ = ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(e, 2) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(e, 13) ^ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(e, 22)) + ke(e, s, o) | 0;
            g = l, l = c, c = f, f = i + b | 0, i = o, o = s, s = e, e = b + _ | 0;
        }
        e = e + this.A | 0, s = s + this.B | 0, o = o + this.C | 0, i = i + this.D | 0, f = f + this.E | 0, c = c + this.F | 0, l = l + this.G | 0, g = g + this.H | 0, this.set(e, s, o, i, f, c, l, g);
    }
    roundClean() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["f"])(J);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["f"])(this.buffer);
    }
}
class Ce extends Ye {
    constructor(){
        super(32);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        m(this, "A", Q[0] | 0);
        m(this, "B", Q[1] | 0);
        m(this, "C", Q[2] | 0);
        m(this, "D", Q[3] | 0);
        m(this, "E", Q[4] | 0);
        m(this, "F", Q[5] | 0);
        m(this, "G", Q[6] | 0);
        m(this, "H", Q[7] | 0);
    }
}
const Ht = /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["g"])(()=>new Ce(), /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["o"])(1));
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Tt = /* @__PURE__ */ BigInt(0), Zt = /* @__PURE__ */ BigInt(1);
function Et(n, t = "") {
    if (typeof n != "boolean") {
        const r = t && `"${t}" `;
        throw new Error(r + "expected boolean, got type=" + typeof n);
    }
    return n;
}
function oe(n) {
    if (typeof n == "bigint") {
        if (!wt(n)) throw new Error("positive bigint expected, got " + n);
    } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"])(n);
    return n;
}
function ht(n) {
    const t = oe(n).toString(16);
    return t.length & 1 ? "0" + t : t;
}
function ie(n) {
    if (typeof n != "string") throw new Error("hex string expected, got " + typeof n);
    return n === "" ? Tt : BigInt("0x" + n);
}
function lt(n) {
    return ie((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(n));
}
function ce(n) {
    return ie((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(Ke((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(n)).reverse()));
}
function Vt(n, t) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"])(t), n = oe(n);
    const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(n.toString(16).padStart(t * 2, "0"));
    if (r.length !== t) throw new Error("number too large");
    return r;
}
function fe(n, t) {
    return Vt(n, t).reverse();
}
function Ke(n) {
    return Uint8Array.from(n);
}
function $e(n) {
    return Uint8Array.from(n, (t, r)=>{
        const e = t.charCodeAt(0);
        if (t.length !== 1 || e > 127) throw new Error(`string contains non-ASCII character "${n[r]}" with code ${e} at position ${r}`);
        return e;
    });
}
const wt = (n)=>typeof n == "bigint" && Tt <= n;
function Me(n, t, r) {
    return wt(n) && wt(t) && wt(r) && t <= n && n < r;
}
function je(n, t, r, e) {
    if (!Me(t, r, e)) throw new Error("expected valid " + n + ": " + r + " <= n < " + e + ", got " + t);
}
function ze(n) {
    let t;
    for(t = 0; n > Tt; n >>= Zt, t += 1);
    return t;
}
const Yt = (n)=>(Zt << BigInt(n)) - Zt;
function Xe(n, t, r) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"])(n, "hashLen"), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"])(t, "qByteLen"), typeof r != "function") throw new Error("hmacFn must be a function");
    const e = (O)=>new Uint8Array(O), s = Uint8Array.of(), o = Uint8Array.of(0), i = Uint8Array.of(1), f = 1e3;
    let c = e(n), l = e(n), g = 0;
    const h = ()=>{
        c.fill(1), l.fill(0), g = 0;
    }, R = (...O)=>r(l, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(c, ...O)), b = (O = s)=>{
        l = R(o, O), c = R(), O.length !== 0 && (l = R(i, O), c = R());
    }, v = ()=>{
        if (g++ >= f) throw new Error("drbg: tried max amount of iterations");
        let O = 0;
        const H = [];
        for(; O < t;){
            c = R();
            const M = c.slice();
            H.push(M), O += c.length;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(...H);
    };
    return (O, H)=>{
        h(), b(O);
        let M;
        for(; !(M = H(v()));)b();
        return h(), M;
    };
}
function Ct(n, t = {}, r = {}) {
    if (!n || typeof n != "object") throw new Error("expected valid options object");
    function e(o, i, f) {
        const c = n[o];
        if (f && c === void 0) return;
        const l = typeof c;
        if (l !== i || c === null) throw new Error(`param "${o}" is invalid: expected ${i}, got ${l}`);
    }
    const s = (o, i)=>Object.entries(o).forEach(([f, c])=>e(f, c, i));
    s(t, !1), s(r, !0);
}
function Xt(n) {
    const t = /* @__PURE__ */ new WeakMap();
    return (r, ...e)=>{
        const s = t.get(r);
        if (s !== void 0) return s;
        const o = n(r, ...e);
        return t.set(r, o), o;
    };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const C = /* @__PURE__ */ BigInt(0), V = /* @__PURE__ */ BigInt(1), rt = /* @__PURE__ */ BigInt(2), ue = /* @__PURE__ */ BigInt(3), ae = /* @__PURE__ */ BigInt(4), le = /* @__PURE__ */ BigInt(5), Ge = /* @__PURE__ */ BigInt(7), de = /* @__PURE__ */ BigInt(8), Fe = /* @__PURE__ */ BigInt(9), he = /* @__PURE__ */ BigInt(16);
function z(n, t) {
    const r = n % t;
    return r >= C ? r : t + r;
}
function $(n, t, r) {
    let e = n;
    for(; t-- > C;)e *= e, e %= r;
    return e;
}
function Gt(n, t) {
    if (n === C) throw new Error("invert: expected non-zero number");
    if (t <= C) throw new Error("invert: expected positive modulus, got " + t);
    let r = z(n, t), e = t, s = C, o = V;
    for(; r !== C;){
        const f = e / r, c = e % r, l = s - o * f;
        e = r, r = c, s = o, o = l;
    }
    if (e !== V) throw new Error("invert: does not exist");
    return z(s, t);
}
function Kt(n, t, r) {
    if (!n.eql(n.sqr(t), r)) throw new Error("Cannot find square root");
}
function ge(n, t) {
    const r = (n.ORDER + V) / ae, e = n.pow(t, r);
    return Kt(n, e, t), e;
}
function Pe(n, t) {
    const r = (n.ORDER - le) / de, e = n.mul(t, rt), s = n.pow(e, r), o = n.mul(t, s), i = n.mul(n.mul(o, rt), s), f = n.mul(o, n.sub(i, n.ONE));
    return Kt(n, f, t), f;
}
function We(n) {
    const t = St(n), r = we(n), e = r(t, t.neg(t.ONE)), s = r(t, e), o = r(t, t.neg(e)), i = (n + Ge) / he;
    return (f, c)=>{
        let l = f.pow(c, i), g = f.mul(l, e);
        const h = f.mul(l, s), R = f.mul(l, o), b = f.eql(f.sqr(g), c), v = f.eql(f.sqr(h), c);
        l = f.cmov(l, g, b), g = f.cmov(R, h, v);
        const _ = f.eql(f.sqr(g), c), O = f.cmov(l, g, _);
        return Kt(f, O, c), O;
    };
}
function we(n) {
    if (n < ue) throw new Error("sqrt is not defined for small field");
    let t = n - V, r = 0;
    for(; t % rt === C;)t /= rt, r++;
    let e = rt;
    const s = St(n);
    for(; Ft(s, e) === 1;)if (e++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
    if (r === 1) return ge;
    let o = s.pow(e, t);
    const i = (t + V) / rt;
    return function(c, l) {
        if (c.is0(l)) return l;
        if (Ft(c, l) !== 1) throw new Error("Cannot find square root");
        let g = r, h = c.mul(c.ONE, o), R = c.pow(l, t), b = c.pow(l, i);
        for(; !c.eql(R, c.ONE);){
            if (c.is0(R)) return c.ZERO;
            let v = 1, _ = c.sqr(R);
            for(; !c.eql(_, c.ONE);)if (v++, _ = c.sqr(_), v === g) throw new Error("Cannot find square root");
            const O = V << BigInt(g - v - 1), H = c.pow(h, O);
            g = v, h = c.sqr(H), R = c.mul(R, h), b = c.mul(b, H);
        }
        return b;
    };
}
function Qe(n) {
    return n % ae === ue ? ge : n % de === le ? Pe : n % he === Fe ? We(n) : we(n);
}
const Je = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
];
function tn(n) {
    const t = {
        ORDER: "bigint",
        BYTES: "number",
        BITS: "number"
    }, r = Je.reduce((e, s)=>(e[s] = "function", e), t);
    return Ct(n, r), n;
}
function en(n, t, r) {
    if (r < C) throw new Error("invalid exponent, negatives unsupported");
    if (r === C) return n.ONE;
    if (r === V) return t;
    let e = n.ONE, s = t;
    for(; r > C;)r & V && (e = n.mul(e, s)), s = n.sqr(s), r >>= V;
    return e;
}
function be(n, t, r = !1) {
    const e = new Array(t.length).fill(r ? n.ZERO : void 0), s = t.reduce((i, f, c)=>n.is0(f) ? i : (e[c] = i, n.mul(i, f)), n.ONE), o = n.inv(s);
    return t.reduceRight((i, f, c)=>n.is0(f) ? i : (e[c] = n.mul(i, e[c]), n.mul(i, f)), o), e;
}
function Ft(n, t) {
    const r = (n.ORDER - V) / rt, e = n.pow(t, r), s = n.eql(e, n.ONE), o = n.eql(e, n.ZERO), i = n.eql(e, n.neg(n.ONE));
    if (!s && !o && !i) throw new Error("invalid Legendre symbol result");
    return s ? 1 : o ? 0 : -1;
}
function nn(n, t) {
    t !== void 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["j"])(t);
    const r = t !== void 0 ? t : n.toString(2).length, e = Math.ceil(r / 8);
    return {
        nBitLength: r,
        nByteLength: e
    };
}
class rn {
    constructor(t, r = {}){
        m(this, "ORDER");
        m(this, "BITS");
        m(this, "BYTES");
        m(this, "isLE");
        m(this, "ZERO", C);
        m(this, "ONE", V);
        m(this, "_lengths");
        m(this, "_sqrt");
        // cached sqrt
        m(this, "_mod");
        if (t <= C) throw new Error("invalid field: expected ORDER > 0, got " + t);
        let e;
        this.isLE = !1, r != null && typeof r == "object" && (typeof r.BITS == "number" && (e = r.BITS), typeof r.sqrt == "function" && (this.sqrt = r.sqrt), typeof r.isLE == "boolean" && (this.isLE = r.isLE), r.allowedLengths && (this._lengths = r.allowedLengths?.slice()), typeof r.modFromBytes == "boolean" && (this._mod = r.modFromBytes));
        const { nBitLength: s, nByteLength: o } = nn(t, e);
        if (o > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
        this.ORDER = t, this.BITS = s, this.BYTES = o, this._sqrt = void 0, Object.preventExtensions(this);
    }
    create(t) {
        return z(t, this.ORDER);
    }
    isValid(t) {
        if (typeof t != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof t);
        return C <= t && t < this.ORDER;
    }
    is0(t) {
        return t === C;
    }
    // is valid and invertible
    isValidNot0(t) {
        return !this.is0(t) && this.isValid(t);
    }
    isOdd(t) {
        return (t & V) === V;
    }
    neg(t) {
        return z(-t, this.ORDER);
    }
    eql(t, r) {
        return t === r;
    }
    sqr(t) {
        return z(t * t, this.ORDER);
    }
    add(t, r) {
        return z(t + r, this.ORDER);
    }
    sub(t, r) {
        return z(t - r, this.ORDER);
    }
    mul(t, r) {
        return z(t * r, this.ORDER);
    }
    pow(t, r) {
        return en(this, t, r);
    }
    div(t, r) {
        return z(t * Gt(r, this.ORDER), this.ORDER);
    }
    // Same as above, but doesn't normalize
    sqrN(t) {
        return t * t;
    }
    addN(t, r) {
        return t + r;
    }
    subN(t, r) {
        return t - r;
    }
    mulN(t, r) {
        return t * r;
    }
    inv(t) {
        return Gt(t, this.ORDER);
    }
    sqrt(t) {
        return this._sqrt || (this._sqrt = Qe(this.ORDER)), this._sqrt(this, t);
    }
    toBytes(t) {
        return this.isLE ? fe(t, this.BYTES) : Vt(t, this.BYTES);
    }
    fromBytes(t, r = !1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(t);
        const { _lengths: e, BYTES: s, isLE: o, ORDER: i, _mod: f } = this;
        if (e) {
            if (!e.includes(t.length) || t.length > s) throw new Error("Field.fromBytes: expected " + e + " bytes, got " + t.length);
            const l = new Uint8Array(s);
            l.set(t, o ? 0 : l.length - t.length), t = l;
        }
        if (t.length !== s) throw new Error("Field.fromBytes: expected " + s + " bytes, got " + t.length);
        let c = o ? ce(t) : lt(t);
        if (f && (c = z(c, i)), !r && !this.isValid(c)) throw new Error("invalid field element: outside of range 0..ORDER");
        return c;
    }
    // TODO: we don't need it here, move out to separate fn
    invertBatch(t) {
        return be(this, t);
    }
    // We can't move this out because Fp6, Fp12 implement it
    // and it's unclear what to return in there.
    cmov(t, r, e) {
        return e ? r : t;
    }
}
function St(n, t = {}) {
    return new rn(n, t);
}
function ye(n) {
    if (typeof n != "bigint") throw new Error("field order must be bigint");
    const t = n.toString(2).length;
    return Math.ceil(t / 8);
}
function me(n) {
    const t = ye(n);
    return t + Math.ceil(t / 2);
}
function Ee(n, t, r = !1) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(n);
    const e = n.length, s = ye(t), o = me(t);
    if (e < 16 || e < o || e > 1024) throw new Error("expected " + o + "-1024 bytes of input, got " + e);
    const i = r ? ce(n) : lt(n), f = z(i, t - V) + V;
    return r ? fe(f, s) : Vt(f, s);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const ct = /* @__PURE__ */ BigInt(0), st = /* @__PURE__ */ BigInt(1);
function pt(n, t) {
    const r = t.negate();
    return n ? r : t;
}
function Pt(n, t) {
    const r = be(n.Fp, t.map((e)=>e.Z));
    return t.map((e, s)=>n.fromAffine(e.toAffine(r[s])));
}
function pe(n, t) {
    if (!Number.isSafeInteger(n) || n <= 0 || n > t) throw new Error("invalid window size, expected [1.." + t + "], got W=" + n);
}
function At(n, t) {
    pe(n, t);
    const r = Math.ceil(t / n) + 1, e = 2 ** (n - 1), s = 2 ** n, o = Yt(n), i = BigInt(n);
    return {
        windows: r,
        windowSize: e,
        mask: o,
        maxNumber: s,
        shiftBy: i
    };
}
function Wt(n, t, r) {
    const { windowSize: e, mask: s, maxNumber: o, shiftBy: i } = r;
    let f = Number(n & s), c = n >> i;
    f > e && (f -= o, c += st);
    const l = t * e, g = l + Math.abs(f) - 1, h = f === 0, R = f < 0, b = t % 2 !== 0;
    return {
        nextN: c,
        offset: g,
        isZero: h,
        isNeg: R,
        isNegF: b,
        offsetF: l
    };
}
const Lt = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap();
function qt(n) {
    return xe.get(n) || 1;
}
function Qt(n) {
    if (n !== ct) throw new Error("invalid wNAF");
}
class sn {
    // Parametrized with a given Point class (not individual point)
    constructor(t, r){
        m(this, "BASE");
        m(this, "ZERO");
        m(this, "Fn");
        m(this, "bits");
        this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = r;
    }
    // non-const time multiplication ladder
    _unsafeLadder(t, r, e = this.ZERO) {
        let s = t;
        for(; r > ct;)r & st && (e = e.add(s)), s = s.double(), r >>= st;
        return e;
    }
    /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */ precomputeWindow(t, r) {
        const { windows: e, windowSize: s } = At(r, this.bits), o = [];
        let i = t, f = i;
        for(let c = 0; c < e; c++){
            f = i, o.push(f);
            for(let l = 1; l < s; l++)f = f.add(i), o.push(f);
            i = f.double();
        }
        return o;
    }
    /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */ wNAF(t, r, e) {
        if (!this.Fn.isValid(e)) throw new Error("invalid scalar");
        let s = this.ZERO, o = this.BASE;
        const i = At(t, this.bits);
        for(let f = 0; f < i.windows; f++){
            const { nextN: c, offset: l, isZero: g, isNeg: h, isNegF: R, offsetF: b } = Wt(e, f, i);
            e = c, g ? o = o.add(pt(R, r[b])) : s = s.add(pt(h, r[l]));
        }
        return Qt(e), {
            p: s,
            f: o
        };
    }
    /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */ wNAFUnsafe(t, r, e, s = this.ZERO) {
        const o = At(t, this.bits);
        for(let i = 0; i < o.windows && e !== ct; i++){
            const { nextN: f, offset: c, isZero: l, isNeg: g } = Wt(e, i, o);
            if (e = f, !l) {
                const h = r[c];
                s = s.add(g ? h.negate() : h);
            }
        }
        return Qt(e), s;
    }
    getPrecomputes(t, r, e) {
        let s = Lt.get(r);
        return s || (s = this.precomputeWindow(r, t), t !== 1 && (typeof e == "function" && (s = e(s)), Lt.set(r, s))), s;
    }
    cached(t, r, e) {
        const s = qt(t);
        return this.wNAF(s, this.getPrecomputes(s, t, e), r);
    }
    unsafe(t, r, e, s) {
        const o = qt(t);
        return o === 1 ? this._unsafeLadder(t, r, s) : this.wNAFUnsafe(o, this.getPrecomputes(o, t, e), r, s);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(t, r) {
        pe(r, this.bits), xe.set(t, r), Lt.delete(t);
    }
    hasCache(t) {
        return qt(t) !== 1;
    }
}
function on(n, t, r, e) {
    let s = t, o = n.ZERO, i = n.ZERO;
    for(; r > ct || e > ct;)r & st && (o = o.add(s)), e & st && (i = i.add(s)), s = s.double(), r >>= st, e >>= st;
    return {
        p1: o,
        p2: i
    };
}
function Jt(n, t, r) {
    if (t) {
        if (t.ORDER !== n) throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
        return tn(t), t;
    } else return St(n, {
        isLE: r
    });
}
function cn(n, t, r = {}, e) {
    if (e === void 0 && (e = n === "edwards"), !t || typeof t != "object") throw new Error(`expected valid ${n} CURVE object`);
    for (const c of [
        "p",
        "n",
        "h"
    ]){
        const l = t[c];
        if (!(typeof l == "bigint" && l > ct)) throw new Error(`CURVE.${c} must be positive bigint`);
    }
    const s = Jt(t.p, r.Fp, e), o = Jt(t.n, r.Fn, e), f = [
        "Gx",
        "Gy",
        "a",
        "b"
    ];
    for (const c of f)if (!s.isValid(t[c])) throw new Error(`CURVE.${c} must be valid field element of CURVE.Fp`);
    return t = Object.freeze(Object.assign({}, t)), {
        CURVE: t,
        Fp: s,
        Fn: o
    };
}
function Be(n, t) {
    return function(e) {
        const s = n(e);
        return {
            secretKey: s,
            publicKey: t(s)
        };
    };
}
class ve {
    constructor(t, r){
        m(this, "oHash");
        m(this, "iHash");
        m(this, "blockLen");
        m(this, "outputLen");
        m(this, "finished", !1);
        m(this, "destroyed", !1);
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["l"])(t), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(r, void 0, "key"), this.iHash = t.create(), typeof this.iHash.update != "function") throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
        const e = this.blockLen, s = new Uint8Array(e);
        s.set(r.length > e ? t.create().update(r).digest() : r);
        for(let o = 0; o < s.length; o++)s[o] ^= 54;
        this.iHash.update(s), this.oHash = t.create();
        for(let o = 0; o < s.length; o++)s[o] ^= 106;
        this.oHash.update(s), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["f"])(s);
    }
    update(t) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"])(this), this.iHash.update(t), this;
    }
    digestInto(t) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"])(this), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(t, this.outputLen, "output"), this.finished = !0, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
    }
    digest() {
        const t = new Uint8Array(this.oHash.outputLen);
        return this.digestInto(t), t;
    }
    _cloneInto(t) {
        t || (t = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash: r, iHash: e, finished: s, destroyed: o, blockLen: i, outputLen: f } = this;
        return t = t, t.finished = s, t.destroyed = o, t.blockLen = i, t.outputLen = f, t.oHash = r._cloneInto(t.oHash), t.iHash = e._cloneInto(t.iHash), t;
    }
    clone() {
        return this._cloneInto();
    }
    destroy() {
        this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
    }
}
const Re = (n, t, r)=>new ve(n, t).update(r).digest();
Re.create = (n, t)=>new ve(n, t);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const te = (n, t)=>(n + (n >= 0 ? t : -t) / Se) / t;
function fn(n, t, r) {
    const [[e, s], [o, i]] = t, f = te(i * n, r), c = te(-s * n, r);
    let l = n - f * e - c * o, g = -f * s - c * i;
    const h = l < F, R = g < F;
    h && (l = -l), R && (g = -g);
    const b = Yt(Math.ceil(ze(r) / 2)) + it;
    if (l < F || l >= b || g < F || g >= b) throw new Error("splitScalar (endomorphism): failed, k=" + n);
    return {
        k1neg: h,
        k1: l,
        k2neg: R,
        k2: g
    };
}
function Ut(n) {
    if (![
        "compact",
        "recovered",
        "der"
    ].includes(n)) throw new Error('Signature format must be "compact", "recovered", or "der"');
    return n;
}
function Nt(n, t) {
    const r = {};
    for (let e of Object.keys(t))r[e] = n[e] === void 0 ? t[e] : n[e];
    return Et(r.lowS, "lowS"), Et(r.prehash, "prehash"), r.format !== void 0 && Ut(r.format), r;
}
class un extends Error {
    constructor(t = ""){
        super(t);
    }
}
const tt = {
    // asn.1 DER encoding utils
    Err: un,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
        encode: (n, t)=>{
            const { Err: r } = tt;
            if (n < 0 || n > 256) throw new r("tlv.encode: wrong tag");
            if (t.length & 1) throw new r("tlv.encode: unpadded data");
            const e = t.length / 2, s = ht(e);
            if (s.length / 2 & 128) throw new r("tlv.encode: long form length too big");
            const o = e > 127 ? ht(s.length / 2 | 128) : "";
            return ht(n) + o + s + t;
        },
        // v - value, l - left bytes (unparsed)
        decode (n, t) {
            const { Err: r } = tt;
            let e = 0;
            if (n < 0 || n > 256) throw new r("tlv.encode: wrong tag");
            if (t.length < 2 || t[e++] !== n) throw new r("tlv.decode: wrong tlv");
            const s = t[e++], o = !!(s & 128);
            let i = 0;
            if (!o) i = s;
            else {
                const c = s & 127;
                if (!c) throw new r("tlv.decode(long): indefinite length not supported");
                if (c > 4) throw new r("tlv.decode(long): byte length is too big");
                const l = t.subarray(e, e + c);
                if (l.length !== c) throw new r("tlv.decode: length bytes not complete");
                if (l[0] === 0) throw new r("tlv.decode(long): zero leftmost byte");
                for (const g of l)i = i << 8 | g;
                if (e += c, i < 128) throw new r("tlv.decode(long): not minimal encoding");
            }
            const f = t.subarray(e, e + i);
            if (f.length !== i) throw new r("tlv.decode: wrong value length");
            return {
                v: f,
                l: t.subarray(e + i)
            };
        }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
        encode (n) {
            const { Err: t } = tt;
            if (n < F) throw new t("integer: negative integers are not allowed");
            let r = ht(n);
            if (Number.parseInt(r[0], 16) & 8 && (r = "00" + r), r.length & 1) throw new t("unexpected DER parsing assertion: unpadded hex");
            return r;
        },
        decode (n) {
            const { Err: t } = tt;
            if (n[0] & 128) throw new t("invalid signature integer: negative");
            if (n[0] === 0 && !(n[1] & 128)) throw new t("invalid signature integer: unnecessary leading zero");
            return lt(n);
        }
    },
    toSig (n) {
        const { Err: t, _int: r, _tlv: e } = tt, s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(n, void 0, "signature"), { v: o, l: i } = e.decode(48, s);
        if (i.length) throw new t("invalid signature: left bytes after parsing");
        const { v: f, l: c } = e.decode(2, o), { v: l, l: g } = e.decode(2, c);
        if (g.length) throw new t("invalid signature: left bytes after parsing");
        return {
            r: r.decode(f),
            s: r.decode(l)
        };
    },
    hexFromSig (n) {
        const { _tlv: t, _int: r } = tt, e = t.encode(2, r.encode(n.r)), s = t.encode(2, r.encode(n.s)), o = e + s;
        return t.encode(48, o);
    }
}, F = BigInt(0), it = BigInt(1), Se = BigInt(2), gt = BigInt(3), an = BigInt(4);
function ln(n, t = {}) {
    const r = cn("weierstrass", n, t), { Fp: e, Fn: s } = r;
    let o = r.CURVE;
    const { h: i, n: f } = o;
    Ct(t, {}, {
        allowInfinityPoint: "boolean",
        clearCofactor: "function",
        isTorsionFree: "function",
        fromBytes: "function",
        toBytes: "function",
        endo: "object"
    });
    const { endo: c } = t;
    if (c && (!e.is0(o.a) || typeof c.beta != "bigint" || !Array.isArray(c.basises))) throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    const l = Oe(e, s);
    function g() {
        if (!e.isOdd) throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function h(A, a, u) {
        const { x: d, y } = a.toAffine(), p = e.toBytes(d);
        if (Et(u, "isCompressed"), u) {
            g();
            const E = !e.isOdd(y);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(Ie(E), p);
        } else return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(Uint8Array.of(4), p, e.toBytes(y));
    }
    function R(A) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(A, void 0, "Point");
        const { publicKey: a, publicKeyUncompressed: u } = l, d = A.length, y = A[0], p = A.subarray(1);
        if (d === a && (y === 2 || y === 3)) {
            const E = e.fromBytes(p);
            if (!e.isValid(E)) throw new Error("bad point: is not on curve, wrong x");
            const x = _(E);
            let w;
            try {
                w = e.sqrt(x);
            } catch (U) {
                const q = U instanceof Error ? ": " + U.message : "";
                throw new Error("bad point: is not on curve, sqrt error" + q);
            }
            g();
            const B = e.isOdd(w);
            return (y & 1) === 1 !== B && (w = e.neg(w)), {
                x: E,
                y: w
            };
        } else if (d === u && y === 4) {
            const E = e.BYTES, x = e.fromBytes(p.subarray(0, E)), w = e.fromBytes(p.subarray(E, E * 2));
            if (!O(x, w)) throw new Error("bad point: is not on curve");
            return {
                x,
                y: w
            };
        } else throw new Error(`bad point: got length ${d}, expected compressed=${a} or uncompressed=${u}`);
    }
    const b = t.toBytes || h, v = t.fromBytes || R;
    function _(A) {
        const a = e.sqr(A), u = e.mul(a, A);
        return e.add(e.add(u, e.mul(A, o.a)), o.b);
    }
    function O(A, a) {
        const u = e.sqr(a), d = _(A);
        return e.eql(u, d);
    }
    if (!O(o.Gx, o.Gy)) throw new Error("bad curve params: generator point");
    const H = e.mul(e.pow(o.a, gt), an), M = e.mul(e.sqr(o.b), BigInt(27));
    if (e.is0(e.add(H, M))) throw new Error("bad curve params: a or b");
    function P(A, a, u = !1) {
        if (!e.isValid(a) || u && e.is0(a)) throw new Error(`bad point coordinate ${A}`);
        return a;
    }
    function Y(A) {
        if (!(A instanceof j)) throw new Error("Weierstrass Point expected");
    }
    function et(A) {
        if (!c || !c.basises) throw new Error("no endo");
        return fn(A, c.basises, s.ORDER);
    }
    const W = Xt((A, a)=>{
        const { X: u, Y: d, Z: y } = A;
        if (e.eql(y, e.ONE)) return {
            x: u,
            y: d
        };
        const p = A.is0();
        a == null && (a = p ? e.ONE : e.inv(y));
        const E = e.mul(u, a), x = e.mul(d, a), w = e.mul(y, a);
        if (p) return {
            x: e.ZERO,
            y: e.ZERO
        };
        if (!e.eql(w, e.ONE)) throw new Error("invZ was invalid");
        return {
            x: E,
            y: x
        };
    }), Ot = Xt((A)=>{
        if (A.is0()) {
            if (t.allowInfinityPoint && !e.is0(A.Y)) return;
            throw new Error("bad point: ZERO");
        }
        const { x: a, y: u } = A.toAffine();
        if (!e.isValid(a) || !e.isValid(u)) throw new Error("bad point: x or y not field elements");
        if (!O(a, u)) throw new Error("bad point: equation left != right");
        if (!A.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
        return !0;
    });
    function ft(A, a, u, d, y) {
        return u = new j(e.mul(u.X, A), u.Y, u.Z), a = pt(d, a), u = pt(y, u), a.add(u);
    }
    const L = class L {
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ constructor(a, u, d){
            m(this, "X");
            m(this, "Y");
            m(this, "Z");
            this.X = P("x", a), this.Y = P("y", u, !0), this.Z = P("z", d), Object.freeze(this);
        }
        static CURVE() {
            return o;
        }
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ static fromAffine(a) {
            const { x: u, y: d } = a || {};
            if (!a || !e.isValid(u) || !e.isValid(d)) throw new Error("invalid affine point");
            if (a instanceof L) throw new Error("projective point not allowed");
            return e.is0(u) && e.is0(d) ? L.ZERO : new L(u, d, e.ONE);
        }
        static fromBytes(a) {
            const u = L.fromAffine(v((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(a, void 0, "point")));
            return u.assertValidity(), u;
        }
        static fromHex(a) {
            return L.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(a));
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */ precompute(a = 8, u = !0) {
            return nt.createCache(this, a), u || this.multiply(gt), this;
        }
        // TODO: return `this`
        /** A point on curve is valid if it conforms to equation. */ assertValidity() {
            Ot(this);
        }
        hasEvenY() {
            const { y: a } = this.toAffine();
            if (!e.isOdd) throw new Error("Field doesn't support isOdd");
            return !e.isOdd(a);
        }
        /** Compare one point to another. */ equals(a) {
            Y(a);
            const { X: u, Y: d, Z: y } = this, { X: p, Y: E, Z: x } = a, w = e.eql(e.mul(u, x), e.mul(p, y)), B = e.eql(e.mul(d, x), e.mul(E, y));
            return w && B;
        }
        /** Flips point to one corresponding to (x, -y) in Affine coordinates. */ negate() {
            return new L(this.X, e.neg(this.Y), this.Z);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
            const { a, b: u } = o, d = e.mul(u, gt), { X: y, Y: p, Z: E } = this;
            let x = e.ZERO, w = e.ZERO, B = e.ZERO, I = e.mul(y, y), U = e.mul(p, p), q = e.mul(E, E), S = e.mul(y, p);
            return S = e.add(S, S), B = e.mul(y, E), B = e.add(B, B), x = e.mul(a, B), w = e.mul(d, q), w = e.add(x, w), x = e.sub(U, w), w = e.add(U, w), w = e.mul(x, w), x = e.mul(S, x), B = e.mul(d, B), q = e.mul(a, q), S = e.sub(I, q), S = e.mul(a, S), S = e.add(S, B), B = e.add(I, I), I = e.add(B, I), I = e.add(I, q), I = e.mul(I, S), w = e.add(w, I), q = e.mul(p, E), q = e.add(q, q), I = e.mul(q, S), x = e.sub(x, I), B = e.mul(q, U), B = e.add(B, B), B = e.add(B, B), new L(x, w, B);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(a) {
            Y(a);
            const { X: u, Y: d, Z: y } = this, { X: p, Y: E, Z: x } = a;
            let w = e.ZERO, B = e.ZERO, I = e.ZERO;
            const U = o.a, q = e.mul(o.b, gt);
            let S = e.mul(u, p), D = e.mul(d, E), k = e.mul(y, x), K = e.add(u, d), Z = e.add(p, E);
            K = e.mul(K, Z), Z = e.add(S, D), K = e.sub(K, Z), Z = e.add(u, y);
            let T = e.add(p, x);
            return Z = e.mul(Z, T), T = e.add(S, k), Z = e.sub(Z, T), T = e.add(d, y), w = e.add(E, x), T = e.mul(T, w), w = e.add(D, k), T = e.sub(T, w), I = e.mul(U, Z), w = e.mul(q, k), I = e.add(w, I), w = e.sub(D, I), I = e.add(D, I), B = e.mul(w, I), D = e.add(S, S), D = e.add(D, S), k = e.mul(U, k), Z = e.mul(q, Z), D = e.add(D, k), k = e.sub(S, k), k = e.mul(U, k), Z = e.add(Z, k), S = e.mul(D, Z), B = e.add(B, S), S = e.mul(T, Z), w = e.mul(K, w), w = e.sub(w, S), S = e.mul(K, D), I = e.mul(T, I), I = e.add(I, S), new L(w, B, I);
        }
        subtract(a) {
            return this.add(a.negate());
        }
        is0() {
            return this.equals(L.ZERO);
        }
        /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */ multiply(a) {
            const { endo: u } = t;
            if (!s.isValidNot0(a)) throw new Error("invalid scalar: out of range");
            let d, y;
            const p = (E)=>nt.cached(this, E, (x)=>Pt(L, x));
            if (u) {
                const { k1neg: E, k1: x, k2neg: w, k2: B } = et(a), { p: I, f: U } = p(x), { p: q, f: S } = p(B);
                y = U.add(S), d = ft(u.beta, I, q, E, w);
            } else {
                const { p: E, f: x } = p(a);
                d = E, y = x;
            }
            return Pt(L, [
                d,
                y
            ])[0];
        }
        /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */ multiplyUnsafe(a) {
            const { endo: u } = t, d = this;
            if (!s.isValid(a)) throw new Error("invalid scalar: out of range");
            if (a === F || d.is0()) return L.ZERO;
            if (a === it) return d;
            if (nt.hasCache(this)) return this.multiply(a);
            if (u) {
                const { k1neg: y, k1: p, k2neg: E, k2: x } = et(a), { p1: w, p2: B } = on(L, d, p, x);
                return ft(u.beta, w, B, y, E);
            } else return nt.unsafe(d, a);
        }
        /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */ toAffine(a) {
            return W(this, a);
        }
        /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */ isTorsionFree() {
            const { isTorsionFree: a } = t;
            return i === it ? !0 : a ? a(L, this) : nt.unsafe(this, f).is0();
        }
        clearCofactor() {
            const { clearCofactor: a } = t;
            return i === it ? this : a ? a(L, this) : this.multiplyUnsafe(i);
        }
        isSmallOrder() {
            return this.multiplyUnsafe(i).is0();
        }
        toBytes(a = !0) {
            return Et(a, "isCompressed"), this.assertValidity(), b(L, this, a);
        }
        toHex(a = !0) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(this.toBytes(a));
        }
        toString() {
            return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
        }
    };
    // base / generator point
    m(L, "BASE", new L(o.Gx, o.Gy, e.ONE)), m(L, "ZERO", new L(e.ZERO, e.ONE, e.ZERO)), // math field
    m(L, "Fp", e), m(L, "Fn", s);
    let j = L;
    const dt = s.BITS, nt = new sn(j, t.endo ? Math.ceil(dt / 2) : dt);
    return j.BASE.precompute(8), j;
}
function Ie(n) {
    return Uint8Array.of(n ? 2 : 3);
}
function Oe(n, t) {
    return {
        secretKey: t.BYTES,
        publicKey: 1 + n.BYTES,
        publicKeyUncompressed: 1 + 2 * n.BYTES,
        publicKeyHasPrefix: !0,
        signature: 2 * t.BYTES
    };
}
function dn(n, t = {}) {
    const { Fn: r } = n, e = t.randomBytes || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"], s = Object.assign(Oe(n.Fp, r), {
        seed: me(r.ORDER)
    });
    function o(b) {
        try {
            const v = r.fromBytes(b);
            return r.isValidNot0(v);
        } catch  {
            return !1;
        }
    }
    function i(b, v) {
        const { publicKey: _, publicKeyUncompressed: O } = s;
        try {
            const H = b.length;
            return v === !0 && H !== _ || v === !1 && H !== O ? !1 : !!n.fromBytes(b);
        } catch  {
            return !1;
        }
    }
    function f(b = e(s.seed)) {
        return Ee((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(b, s.seed, "seed"), r.ORDER);
    }
    function c(b, v = !0) {
        return n.BASE.multiply(r.fromBytes(b)).toBytes(v);
    }
    function l(b) {
        const { secretKey: v, publicKey: _, publicKeyUncompressed: O } = s;
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["m"])(b) || "_lengths" in r && r._lengths || v === _) return;
        const H = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(b, void 0, "key").length;
        return H === _ || H === O;
    }
    function g(b, v, _ = !0) {
        if (l(b) === !0) throw new Error("first arg must be private key");
        if (l(v) === !1) throw new Error("second arg must be public key");
        const O = r.fromBytes(b);
        return n.fromBytes(v).multiply(O).toBytes(_);
    }
    const h = {
        isValidSecretKey: o,
        isValidPublicKey: i,
        randomSecretKey: f
    }, R = Be(f, c);
    return Object.freeze({
        getPublicKey: c,
        getSharedSecret: g,
        keygen: R,
        Point: n,
        utils: h,
        lengths: s
    });
}
function hn(n, t, r = {}) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["l"])(t), Ct(r, {}, {
        hmac: "function",
        lowS: "boolean",
        randomBytes: "function",
        bits2int: "function",
        bits2int_modN: "function"
    }), r = Object.assign({}, r);
    const e = r.randomBytes || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"], s = r.hmac || ((a, u)=>Re(t, a, u)), { Fp: o, Fn: i } = n, { ORDER: f, BITS: c } = i, { keygen: l, getPublicKey: g, getSharedSecret: h, utils: R, lengths: b } = dn(n, r), v = {
        prehash: !0,
        lowS: typeof r.lowS == "boolean" ? r.lowS : !0,
        format: "compact",
        extraEntropy: !1
    }, _ = f * Se < o.ORDER;
    function O(a) {
        const u = f >> it;
        return a > u;
    }
    function H(a, u) {
        if (!i.isValidNot0(u)) throw new Error(`invalid signature ${a}: out of range 1..Point.Fn.ORDER`);
        return u;
    }
    function M() {
        if (_) throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
    }
    function P(a, u) {
        Ut(u);
        const d = b.signature, y = u === "compact" ? d : u === "recovered" ? d + 1 : void 0;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(a, y);
    }
    class Y {
        constructor(u, d, y){
            m(this, "r");
            m(this, "s");
            m(this, "recovery");
            if (this.r = H("r", u), this.s = H("s", d), y != null) {
                if (M(), ![
                    0,
                    1,
                    2,
                    3
                ].includes(y)) throw new Error("invalid recovery id");
                this.recovery = y;
            }
            Object.freeze(this);
        }
        static fromBytes(u, d = v.format) {
            P(u, d);
            let y;
            if (d === "der") {
                const { r: w, s: B } = tt.toSig((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(u));
                return new Y(w, B);
            }
            d === "recovered" && (y = u[0], d = "compact", u = u.subarray(1));
            const p = b.signature / 2, E = u.subarray(0, p), x = u.subarray(p, p * 2);
            return new Y(i.fromBytes(E), i.fromBytes(x), y);
        }
        static fromHex(u, d) {
            return this.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(u), d);
        }
        assertRecovery() {
            const { recovery: u } = this;
            if (u == null) throw new Error("invalid recovery id: must be present");
            return u;
        }
        addRecoveryBit(u) {
            return new Y(this.r, this.s, u);
        }
        recoverPublicKey(u) {
            const { r: d, s: y } = this, p = this.assertRecovery(), E = p === 2 || p === 3 ? d + f : d;
            if (!o.isValid(E)) throw new Error("invalid recovery id: sig.r+curve.n != R.x");
            const x = o.toBytes(E), w = n.fromBytes((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(Ie((p & 1) === 0), x)), B = i.inv(E), I = W((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(u, void 0, "msgHash")), U = i.create(-I * B), q = i.create(y * B), S = n.BASE.multiplyUnsafe(U).add(w.multiplyUnsafe(q));
            if (S.is0()) throw new Error("invalid recovery: point at infinify");
            return S.assertValidity(), S;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
            return O(this.s);
        }
        toBytes(u = v.format) {
            if (Ut(u), u === "der") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(tt.hexFromSig(this));
            const { r: d, s: y } = this, p = i.toBytes(d), E = i.toBytes(y);
            return u === "recovered" ? (M(), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(Uint8Array.of(this.assertRecovery()), p, E)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(p, E);
        }
        toHex(u) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(this.toBytes(u));
        }
    }
    const et = r.bits2int || function(u) {
        if (u.length > 8192) throw new Error("input is too large");
        const d = lt(u), y = u.length * 8 - c;
        return y > 0 ? d >> BigInt(y) : d;
    }, W = r.bits2int_modN || function(u) {
        return i.create(et(u));
    }, Ot = Yt(c);
    function ft(a) {
        return je("num < 2^" + c, a, F, Ot), i.toBytes(a);
    }
    function j(a, u) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(a, void 0, "message"), u ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(t(a), void 0, "prehashed message") : a;
    }
    function dt(a, u, d) {
        const { lowS: y, prehash: p, extraEntropy: E } = Nt(d, v);
        a = j(a, p);
        const x = W(a), w = i.fromBytes(u);
        if (!i.isValidNot0(w)) throw new Error("invalid private key");
        const B = [
            ft(w),
            ft(x)
        ];
        if (E != null && E !== !1) {
            const S = E === !0 ? e(b.secretKey) : E;
            B.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(S, void 0, "extraEntropy"));
        }
        const I = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(...B), U = x;
        function q(S) {
            const D = et(S);
            if (!i.isValidNot0(D)) return;
            const k = i.inv(D), K = n.BASE.multiply(D).toAffine(), Z = i.create(K.x);
            if (Z === F) return;
            const T = i.create(k * i.create(U + Z * w));
            if (T === F) return;
            let jt = (K.x === Z ? 0 : 2) | Number(K.y & it), zt = T;
            return y && O(T) && (zt = i.neg(T), jt ^= 1), new Y(Z, zt, _ ? void 0 : jt);
        }
        return {
            seed: I,
            k2sig: q
        };
    }
    function nt(a, u, d = {}) {
        const { seed: y, k2sig: p } = dt(a, u, d);
        return Xe(t.outputLen, i.BYTES, s)(y, p).toBytes(d.format);
    }
    function L(a, u, d, y = {}) {
        const { lowS: p, prehash: E, format: x } = Nt(y, v);
        if (d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(d, void 0, "publicKey"), u = j(u, E), !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["m"])(a)) {
            const w = a instanceof Y ? ", use sig.toBytes()" : "";
            throw new Error("verify expects Uint8Array signature" + w);
        }
        P(a, x);
        try {
            const w = Y.fromBytes(a, x), B = n.fromBytes(d);
            if (p && w.hasHighS()) return !1;
            const { r: I, s: U } = w, q = W(u), S = i.inv(U), D = i.create(q * S), k = i.create(I * S), K = n.BASE.multiplyUnsafe(D).add(B.multiplyUnsafe(k));
            return K.is0() ? !1 : i.create(K.x) === I;
        } catch  {
            return !1;
        }
    }
    function A(a, u, d = {}) {
        const { prehash: y } = Nt(d, v);
        return u = j(u, y), Y.fromBytes(a, "recovered").recoverPublicKey(u).toBytes();
    }
    return Object.freeze({
        keygen: l,
        getPublicKey: g,
        getSharedSecret: h,
        utils: R,
        lengths: b,
        Point: n,
        sign: nt,
        verify: L,
        recoverPublicKey: A,
        Signature: Y,
        hash: t
    });
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const It = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
}, gn = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
        [
            BigInt("0x3086d221a7d46bcde86c90e49284eb15"),
            -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")
        ],
        [
            BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"),
            BigInt("0x3086d221a7d46bcde86c90e49284eb15")
        ]
    ]
}, wn = /* @__PURE__ */ BigInt(0), Dt = /* @__PURE__ */ BigInt(2);
function bn(n) {
    const t = It.p, r = BigInt(3), e = BigInt(6), s = BigInt(11), o = BigInt(22), i = BigInt(23), f = BigInt(44), c = BigInt(88), l = n * n * n % t, g = l * l * n % t, h = $(g, r, t) * g % t, R = $(h, r, t) * g % t, b = $(R, Dt, t) * l % t, v = $(b, s, t) * b % t, _ = $(v, o, t) * v % t, O = $(_, f, t) * _ % t, H = $(O, c, t) * O % t, M = $(H, f, t) * _ % t, P = $(M, r, t) * g % t, Y = $(P, i, t) * v % t, et = $(Y, e, t) * l % t, W = $(et, Dt, t);
    if (!xt.eql(xt.sqr(W), n)) throw new Error("Cannot find square root");
    return W;
}
const xt = St(It.p, {
    sqrt: bn
}), ot = /* @__PURE__ */ ln(It, {
    Fp: xt,
    endo: gn
}), pn = /* @__PURE__ */ hn(ot, Ht), ee = {};
function Bt(n, ...t) {
    let r = ee[n];
    if (r === void 0) {
        const e = Ht($e(n));
        r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(e, e), ee[n] = r;
    }
    return Ht((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["k"])(r, ...t));
}
const $t = (n)=>n.toBytes(!0).slice(1), Mt = (n)=>n % Dt === wn;
function kt(n) {
    const { Fn: t, BASE: r } = ot, e = t.fromBytes(n), s = r.multiply(e);
    return {
        scalar: Mt(s.y) ? e : t.neg(e),
        bytes: $t(s)
    };
}
function _e(n) {
    const t = xt;
    if (!t.isValidNot0(n)) throw new Error("invalid x: Fail if x ≥ p");
    const r = t.create(n * n), e = t.create(r * n + BigInt(7));
    let s = t.sqrt(e);
    Mt(s) || (s = t.neg(s));
    const o = ot.fromAffine({
        x: n,
        y: s
    });
    return o.assertValidity(), o;
}
const ut = lt;
function Ae(...n) {
    return ot.Fn.create(ut(Bt("BIP0340/challenge", ...n)));
}
function ne(n) {
    return kt(n).bytes;
}
function yn(n, t, r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(32)) {
    const { Fn: e } = ot, s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(n, void 0, "message"), { bytes: o, scalar: i } = kt(t), f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(r, 32, "auxRand"), c = e.toBytes(i ^ ut(Bt("BIP0340/aux", f))), l = Bt("BIP0340/nonce", c, o, s), { bytes: g, scalar: h } = kt(l), R = Ae(g, o, s), b = new Uint8Array(64);
    if (b.set(g, 0), b.set(e.toBytes(e.create(h + R * i)), 32), !Le(b, s, o)) throw new Error("sign: Invalid signature produced");
    return b;
}
function Le(n, t, r) {
    const { Fp: e, Fn: s, BASE: o } = ot, i = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(n, 64, "signature"), f = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(t, void 0, "message"), c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(r, 32, "publicKey");
    try {
        const l = _e(ut(c)), g = ut(i.subarray(0, 32));
        if (!e.isValidNot0(g)) return !1;
        const h = ut(i.subarray(32, 64));
        if (!s.isValidNot0(h)) return !1;
        const R = Ae(s.toBytes(g), $t(l), f), b = o.multiplyUnsafe(h).add(l.multiplyUnsafe(s.neg(R))), { x: v, y: _ } = b.toAffine();
        return !(b.is0() || !Mt(_) || v !== g);
    } catch  {
        return !1;
    }
}
const xn = /* @__PURE__ */ (()=>{
    const r = (e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(48))=>Ee(e, It.n);
    return {
        keygen: Be(r, ne),
        getPublicKey: ne,
        sign: yn,
        verify: Le,
        Point: ot,
        utils: {
            randomSecretKey: r,
            taggedHash: Bt,
            lift_x: _e,
            pointToBytes: $t
        },
        lengths: {
            secretKey: 32,
            publicKey: 32,
            publicKeyHasPrefix: !1,
            signature: 64,
            seed: 48
        }
    };
})();
;
 //# sourceMappingURL=secp256k1-0cl8VzGA.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-t45upHsJ.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "B",
    ()=>Yr,
    "b",
    ()=>Vr,
    "e",
    ()=>Xr,
    "h",
    ()=>Hr
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
;
var fr = {}, G = {};
G.byteLength = Dr;
G.toByteArray = Pr;
G.fromByteArray = Wr;
var S = [], R = [], Mr = typeof Uint8Array < "u" ? Uint8Array : Array, z = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for(var D = 0, kr = z.length; D < kr; ++D)S[D] = z[D], R[z.charCodeAt(D)] = D;
R[45] = 62;
R[95] = 63;
function pr(s) {
    var c = s.length;
    if (c % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    var f = s.indexOf("=");
    f === -1 && (f = c);
    var w = f === c ? 0 : 4 - f % 4;
    return [
        f,
        w
    ];
}
function Dr(s) {
    var c = pr(s), f = c[0], w = c[1];
    return (f + w) * 3 / 4 - w;
}
function $r(s, c, f) {
    return (c + f) * 3 / 4 - f;
}
function Pr(s) {
    var c, f = pr(s), w = f[0], l = f[1], p = new Mr($r(s, w, l)), a = 0, m = l > 0 ? w - 4 : w, B;
    for(B = 0; B < m; B += 4)c = R[s.charCodeAt(B)] << 18 | R[s.charCodeAt(B + 1)] << 12 | R[s.charCodeAt(B + 2)] << 6 | R[s.charCodeAt(B + 3)], p[a++] = c >> 16 & 255, p[a++] = c >> 8 & 255, p[a++] = c & 255;
    return l === 2 && (c = R[s.charCodeAt(B)] << 2 | R[s.charCodeAt(B + 1)] >> 4, p[a++] = c & 255), l === 1 && (c = R[s.charCodeAt(B)] << 10 | R[s.charCodeAt(B + 1)] << 4 | R[s.charCodeAt(B + 2)] >> 2, p[a++] = c >> 8 & 255, p[a++] = c & 255), p;
}
function Or(s) {
    return S[s >> 18 & 63] + S[s >> 12 & 63] + S[s >> 6 & 63] + S[s & 63];
}
function Gr(s, c, f) {
    for(var w, l = [], p = c; p < f; p += 3)w = (s[p] << 16 & 16711680) + (s[p + 1] << 8 & 65280) + (s[p + 2] & 255), l.push(Or(w));
    return l.join("");
}
function Wr(s) {
    for(var c, f = s.length, w = f % 3, l = [], p = 16383, a = 0, m = f - w; a < m; a += p)l.push(Gr(s, a, a + p > m ? m : a + p));
    return w === 1 ? (c = s[f - 1], l.push(S[c >> 2] + S[c << 4 & 63] + "==")) : w === 2 && (c = (s[f - 2] << 8) + s[f - 1], l.push(S[c >> 10] + S[c >> 4 & 63] + S[c << 2 & 63] + "=")), l.join("");
}
var J = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ J.read = function(s, c, f, w, l) {
    var p, a, m = l * 8 - w - 1, B = (1 << m) - 1, F = B >> 1, o = -7, A = f ? l - 1 : 0, _ = f ? -1 : 1, T = s[c + A];
    for(A += _, p = T & (1 << -o) - 1, T >>= -o, o += m; o > 0; p = p * 256 + s[c + A], A += _, o -= 8);
    for(a = p & (1 << -o) - 1, p >>= -o, o += w; o > 0; a = a * 256 + s[c + A], A += _, o -= 8);
    if (p === 0) p = 1 - F;
    else {
        if (p === B) return a ? NaN : (T ? -1 : 1) * (1 / 0);
        a = a + Math.pow(2, w), p = p - F;
    }
    return (T ? -1 : 1) * a * Math.pow(2, p - w);
};
J.write = function(s, c, f, w, l, p) {
    var a, m, B, F = p * 8 - l - 1, o = (1 << F) - 1, A = o >> 1, _ = l === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, T = w ? 0 : p - 1, N = w ? 1 : -1, W = c < 0 || c === 0 && 1 / c < 0 ? 1 : 0;
    for(c = Math.abs(c), isNaN(c) || c === 1 / 0 ? (m = isNaN(c) ? 1 : 0, a = o) : (a = Math.floor(Math.log(c) / Math.LN2), c * (B = Math.pow(2, -a)) < 1 && (a--, B *= 2), a + A >= 1 ? c += _ / B : c += _ * Math.pow(2, 1 - A), c * B >= 2 && (a++, B /= 2), a + A >= o ? (m = 0, a = o) : a + A >= 1 ? (m = (c * B - 1) * Math.pow(2, l), a = a + A) : (m = c * Math.pow(2, A - 1) * Math.pow(2, l), a = 0)); l >= 8; s[f + T] = m & 255, T += N, m /= 256, l -= 8);
    for(a = a << l | m, F += l; F > 0; s[f + T] = a & 255, T += N, a /= 256, F -= 8);
    s[f + T - N] |= W * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ (function(s) {
    const c = G, f = J, w = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    s.Buffer = o, s.SlowBuffer = ar, s.INSPECT_MAX_BYTES = 50;
    const l = 2147483647;
    s.kMaxLength = l;
    const { Uint8Array: p, ArrayBuffer: a, SharedArrayBuffer: m } = globalThis;
    o.TYPED_ARRAY_SUPPORT = B(), !o.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function B() {
        try {
            const n = new p(1), r = {
                foo: function() {
                    return 42;
                }
            };
            return Object.setPrototypeOf(r, p.prototype), Object.setPrototypeOf(n, r), n.foo() === 42;
        } catch  {
            return !1;
        }
    }
    Object.defineProperty(o.prototype, "parent", {
        enumerable: !0,
        get: function() {
            if (o.isBuffer(this)) return this.buffer;
        }
    }), Object.defineProperty(o.prototype, "offset", {
        enumerable: !0,
        get: function() {
            if (o.isBuffer(this)) return this.byteOffset;
        }
    });
    function F(n) {
        if (n > l) throw new RangeError('The value "' + n + '" is invalid for option "size"');
        const r = new p(n);
        return Object.setPrototypeOf(r, o.prototype), r;
    }
    function o(n, r, t) {
        if (typeof n == "number") {
            if (typeof r == "string") throw new TypeError('The "string" argument must be of type string. Received type number');
            return N(n);
        }
        return A(n, r, t);
    }
    o.poolSize = 8192;
    function A(n, r, t) {
        if (typeof n == "string") return W(n, r);
        if (a.isView(n)) return sr(n);
        if (n == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof n);
        if (C(n, a) || n && C(n.buffer, a) || typeof m < "u" && (C(n, m) || n && C(n.buffer, m))) return H(n, r, t);
        if (typeof n == "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
        const i = n.valueOf && n.valueOf();
        if (i != null && i !== n) return o.from(i, r, t);
        const e = lr(n);
        if (e) return e;
        if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof n[Symbol.toPrimitive] == "function") return o.from(n[Symbol.toPrimitive]("string"), r, t);
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof n);
    }
    o.from = function(n, r, t) {
        return A(n, r, t);
    }, Object.setPrototypeOf(o.prototype, p.prototype), Object.setPrototypeOf(o, p);
    function _(n) {
        if (typeof n != "number") throw new TypeError('"size" argument must be of type number');
        if (n < 0) throw new RangeError('The value "' + n + '" is invalid for option "size"');
    }
    function T(n, r, t) {
        return _(n), n <= 0 ? F(n) : r !== void 0 ? typeof t == "string" ? F(n).fill(r, t) : F(n).fill(r) : F(n);
    }
    o.alloc = function(n, r, t) {
        return T(n, r, t);
    };
    function N(n) {
        return _(n), F(n < 0 ? 0 : j(n) | 0);
    }
    o.allocUnsafe = function(n) {
        return N(n);
    }, o.allocUnsafeSlow = function(n) {
        return N(n);
    };
    function W(n, r) {
        if ((typeof r != "string" || r === "") && (r = "utf8"), !o.isEncoding(r)) throw new TypeError("Unknown encoding: " + r);
        const t = K(n, r) | 0;
        let i = F(t);
        const e = i.write(n, r);
        return e !== t && (i = i.slice(0, e)), i;
    }
    function Y(n) {
        const r = n.length < 0 ? 0 : j(n.length) | 0, t = F(r);
        for(let i = 0; i < r; i += 1)t[i] = n[i] & 255;
        return t;
    }
    function sr(n) {
        if (C(n, p)) {
            const r = new p(n);
            return H(r.buffer, r.byteOffset, r.byteLength);
        }
        return Y(n);
    }
    function H(n, r, t) {
        if (r < 0 || n.byteLength < r) throw new RangeError('"offset" is outside of buffer bounds');
        if (n.byteLength < r + (t || 0)) throw new RangeError('"length" is outside of buffer bounds');
        let i;
        return r === void 0 && t === void 0 ? i = new p(n) : t === void 0 ? i = new p(n, r) : i = new p(n, r, t), Object.setPrototypeOf(i, o.prototype), i;
    }
    function lr(n) {
        if (o.isBuffer(n)) {
            const r = j(n.length) | 0, t = F(r);
            return t.length === 0 || n.copy(t, 0, 0, r), t;
        }
        if (n.length !== void 0) return typeof n.length != "number" || X(n.length) ? F(0) : Y(n);
        if (n.type === "Buffer" && Array.isArray(n.data)) return Y(n.data);
    }
    function j(n) {
        if (n >= l) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + l.toString(16) + " bytes");
        return n | 0;
    }
    function ar(n) {
        return +n != n && (n = 0), o.alloc(+n);
    }
    o.isBuffer = function(r) {
        return r != null && r._isBuffer === !0 && r !== o.prototype;
    }, o.compare = function(r, t) {
        if (C(r, p) && (r = o.from(r, r.offset, r.byteLength)), C(t, p) && (t = o.from(t, t.offset, t.byteLength)), !o.isBuffer(r) || !o.isBuffer(t)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
        if (r === t) return 0;
        let i = r.length, e = t.length;
        for(let u = 0, h = Math.min(i, e); u < h; ++u)if (r[u] !== t[u]) {
            i = r[u], e = t[u];
            break;
        }
        return i < e ? -1 : e < i ? 1 : 0;
    }, o.isEncoding = function(r) {
        switch(String(r).toLowerCase()){
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "latin1":
            case "binary":
            case "base64":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return !0;
            default:
                return !1;
        }
    }, o.concat = function(r, t) {
        if (!Array.isArray(r)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (r.length === 0) return o.alloc(0);
        let i;
        if (t === void 0) for(t = 0, i = 0; i < r.length; ++i)t += r[i].length;
        const e = o.allocUnsafe(t);
        let u = 0;
        for(i = 0; i < r.length; ++i){
            let h = r[i];
            if (C(h, p)) u + h.length > e.length ? (o.isBuffer(h) || (h = o.from(h)), h.copy(e, u)) : p.prototype.set.call(e, h, u);
            else if (o.isBuffer(h)) h.copy(e, u);
            else throw new TypeError('"list" argument must be an Array of Buffers');
            u += h.length;
        }
        return e;
    };
    function K(n, r) {
        if (o.isBuffer(n)) return n.length;
        if (a.isView(n) || C(n, a)) return n.byteLength;
        if (typeof n != "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof n);
        const t = n.length, i = arguments.length > 2 && arguments[2] === !0;
        if (!i && t === 0) return 0;
        let e = !1;
        for(;;)switch(r){
            case "ascii":
            case "latin1":
            case "binary":
                return t;
            case "utf8":
            case "utf-8":
                return V(n).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return t * 2;
            case "hex":
                return t >>> 1;
            case "base64":
                return cr(n).length;
            default:
                if (e) return i ? -1 : V(n).length;
                r = ("" + r).toLowerCase(), e = !0;
        }
    }
    o.byteLength = K;
    function wr(n, r, t) {
        let i = !1;
        if ((r === void 0 || r < 0) && (r = 0), r > this.length || ((t === void 0 || t > this.length) && (t = this.length), t <= 0) || (t >>>= 0, r >>>= 0, t <= r)) return "";
        for(n || (n = "utf8");;)switch(n){
            case "hex":
                return Ar(this, r, t);
            case "utf8":
            case "utf-8":
                return v(this, r, t);
            case "ascii":
                return Ir(this, r, t);
            case "latin1":
            case "binary":
                return Fr(this, r, t);
            case "base64":
                return dr(this, r, t);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return Ur(this, r, t);
            default:
                if (i) throw new TypeError("Unknown encoding: " + n);
                n = (n + "").toLowerCase(), i = !0;
        }
    }
    o.prototype._isBuffer = !0;
    function b(n, r, t) {
        const i = n[r];
        n[r] = n[t], n[t] = i;
    }
    o.prototype.swap16 = function() {
        const r = this.length;
        if (r % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for(let t = 0; t < r; t += 2)b(this, t, t + 1);
        return this;
    }, o.prototype.swap32 = function() {
        const r = this.length;
        if (r % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for(let t = 0; t < r; t += 4)b(this, t, t + 3), b(this, t + 1, t + 2);
        return this;
    }, o.prototype.swap64 = function() {
        const r = this.length;
        if (r % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for(let t = 0; t < r; t += 8)b(this, t, t + 7), b(this, t + 1, t + 6), b(this, t + 2, t + 5), b(this, t + 3, t + 4);
        return this;
    }, o.prototype.toString = function() {
        const r = this.length;
        return r === 0 ? "" : arguments.length === 0 ? v(this, 0, r) : wr.apply(this, arguments);
    }, o.prototype.toLocaleString = o.prototype.toString, o.prototype.equals = function(r) {
        if (!o.isBuffer(r)) throw new TypeError("Argument must be a Buffer");
        return this === r ? !0 : o.compare(this, r) === 0;
    }, o.prototype.inspect = function() {
        let r = "";
        const t = s.INSPECT_MAX_BYTES;
        return r = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (r += " ... "), "<Buffer " + r + ">";
    }, w && (o.prototype[w] = o.prototype.inspect), o.prototype.compare = function(r, t, i, e, u) {
        if (C(r, p) && (r = o.from(r, r.offset, r.byteLength)), !o.isBuffer(r)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r);
        if (t === void 0 && (t = 0), i === void 0 && (i = r ? r.length : 0), e === void 0 && (e = 0), u === void 0 && (u = this.length), t < 0 || i > r.length || e < 0 || u > this.length) throw new RangeError("out of range index");
        if (e >= u && t >= i) return 0;
        if (e >= u) return -1;
        if (t >= i) return 1;
        if (t >>>= 0, i >>>= 0, e >>>= 0, u >>>= 0, this === r) return 0;
        let h = u - e, y = i - t;
        const E = Math.min(h, y), g = this.slice(e, u), d = r.slice(t, i);
        for(let x = 0; x < E; ++x)if (g[x] !== d[x]) {
            h = g[x], y = d[x];
            break;
        }
        return h < y ? -1 : y < h ? 1 : 0;
    };
    function Z(n, r, t, i, e) {
        if (n.length === 0) return -1;
        if (typeof t == "string" ? (i = t, t = 0) : t > 2147483647 ? t = 2147483647 : t < -2147483648 && (t = -2147483648), t = +t, X(t) && (t = e ? 0 : n.length - 1), t < 0 && (t = n.length + t), t >= n.length) {
            if (e) return -1;
            t = n.length - 1;
        } else if (t < 0) if (e) t = 0;
        else return -1;
        if (typeof r == "string" && (r = o.from(r, i)), o.isBuffer(r)) return r.length === 0 ? -1 : Q(n, r, t, i, e);
        if (typeof r == "number") return r = r & 255, typeof p.prototype.indexOf == "function" ? e ? p.prototype.indexOf.call(n, r, t) : p.prototype.lastIndexOf.call(n, r, t) : Q(n, [
            r
        ], t, i, e);
        throw new TypeError("val must be string, number or Buffer");
    }
    function Q(n, r, t, i, e) {
        let u = 1, h = n.length, y = r.length;
        if (i !== void 0 && (i = String(i).toLowerCase(), i === "ucs2" || i === "ucs-2" || i === "utf16le" || i === "utf-16le")) {
            if (n.length < 2 || r.length < 2) return -1;
            u = 2, h /= 2, y /= 2, t /= 2;
        }
        function E(d, x) {
            return u === 1 ? d[x] : d.readUInt16BE(x * u);
        }
        let g;
        if (e) {
            let d = -1;
            for(g = t; g < h; g++)if (E(n, g) === E(r, d === -1 ? 0 : g - d)) {
                if (d === -1 && (d = g), g - d + 1 === y) return d * u;
            } else d !== -1 && (g -= g - d), d = -1;
        } else for(t + y > h && (t = h - y), g = t; g >= 0; g--){
            let d = !0;
            for(let x = 0; x < y; x++)if (E(n, g + x) !== E(r, x)) {
                d = !1;
                break;
            }
            if (d) return g;
        }
        return -1;
    }
    o.prototype.includes = function(r, t, i) {
        return this.indexOf(r, t, i) !== -1;
    }, o.prototype.indexOf = function(r, t, i) {
        return Z(this, r, t, i, !0);
    }, o.prototype.lastIndexOf = function(r, t, i) {
        return Z(this, r, t, i, !1);
    };
    function yr(n, r, t, i) {
        t = Number(t) || 0;
        const e = n.length - t;
        i ? (i = Number(i), i > e && (i = e)) : i = e;
        const u = r.length;
        i > u / 2 && (i = u / 2);
        let h;
        for(h = 0; h < i; ++h){
            const y = parseInt(r.substr(h * 2, 2), 16);
            if (X(y)) return h;
            n[t + h] = y;
        }
        return h;
    }
    function xr(n, r, t, i) {
        return P(V(r, n.length - t), n, t, i);
    }
    function Br(n, r, t, i) {
        return P(Sr(r), n, t, i);
    }
    function gr(n, r, t, i) {
        return P(cr(r), n, t, i);
    }
    function Er(n, r, t, i) {
        return P(_r(r, n.length - t), n, t, i);
    }
    o.prototype.write = function(r, t, i, e) {
        if (t === void 0) e = "utf8", i = this.length, t = 0;
        else if (i === void 0 && typeof t == "string") e = t, i = this.length, t = 0;
        else if (isFinite(t)) t = t >>> 0, isFinite(i) ? (i = i >>> 0, e === void 0 && (e = "utf8")) : (e = i, i = void 0);
        else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        const u = this.length - t;
        if ((i === void 0 || i > u) && (i = u), r.length > 0 && (i < 0 || t < 0) || t > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        e || (e = "utf8");
        let h = !1;
        for(;;)switch(e){
            case "hex":
                return yr(this, r, t, i);
            case "utf8":
            case "utf-8":
                return xr(this, r, t, i);
            case "ascii":
            case "latin1":
            case "binary":
                return Br(this, r, t, i);
            case "base64":
                return gr(this, r, t, i);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return Er(this, r, t, i);
            default:
                if (h) throw new TypeError("Unknown encoding: " + e);
                e = ("" + e).toLowerCase(), h = !0;
        }
    }, o.prototype.toJSON = function() {
        return {
            type: "Buffer",
            data: Array.prototype.slice.call(this._arr || this, 0)
        };
    };
    function dr(n, r, t) {
        return r === 0 && t === n.length ? c.fromByteArray(n) : c.fromByteArray(n.slice(r, t));
    }
    function v(n, r, t) {
        t = Math.min(n.length, t);
        const i = [];
        let e = r;
        for(; e < t;){
            const u = n[e];
            let h = null, y = u > 239 ? 4 : u > 223 ? 3 : u > 191 ? 2 : 1;
            if (e + y <= t) {
                let E, g, d, x;
                switch(y){
                    case 1:
                        u < 128 && (h = u);
                        break;
                    case 2:
                        E = n[e + 1], (E & 192) === 128 && (x = (u & 31) << 6 | E & 63, x > 127 && (h = x));
                        break;
                    case 3:
                        E = n[e + 1], g = n[e + 2], (E & 192) === 128 && (g & 192) === 128 && (x = (u & 15) << 12 | (E & 63) << 6 | g & 63, x > 2047 && (x < 55296 || x > 57343) && (h = x));
                        break;
                    case 4:
                        E = n[e + 1], g = n[e + 2], d = n[e + 3], (E & 192) === 128 && (g & 192) === 128 && (d & 192) === 128 && (x = (u & 15) << 18 | (E & 63) << 12 | (g & 63) << 6 | d & 63, x > 65535 && x < 1114112 && (h = x));
                }
            }
            h === null ? (h = 65533, y = 1) : h > 65535 && (h -= 65536, i.push(h >>> 10 & 1023 | 55296), h = 56320 | h & 1023), i.push(h), e += y;
        }
        return mr(i);
    }
    const rr = 4096;
    function mr(n) {
        const r = n.length;
        if (r <= rr) return String.fromCharCode.apply(String, n);
        let t = "", i = 0;
        for(; i < r;)t += String.fromCharCode.apply(String, n.slice(i, i += rr));
        return t;
    }
    function Ir(n, r, t) {
        let i = "";
        t = Math.min(n.length, t);
        for(let e = r; e < t; ++e)i += String.fromCharCode(n[e] & 127);
        return i;
    }
    function Fr(n, r, t) {
        let i = "";
        t = Math.min(n.length, t);
        for(let e = r; e < t; ++e)i += String.fromCharCode(n[e]);
        return i;
    }
    function Ar(n, r, t) {
        const i = n.length;
        (!r || r < 0) && (r = 0), (!t || t < 0 || t > i) && (t = i);
        let e = "";
        for(let u = r; u < t; ++u)e += Lr[n[u]];
        return e;
    }
    function Ur(n, r, t) {
        const i = n.slice(r, t);
        let e = "";
        for(let u = 0; u < i.length - 1; u += 2)e += String.fromCharCode(i[u] + i[u + 1] * 256);
        return e;
    }
    o.prototype.slice = function(r, t) {
        const i = this.length;
        r = ~~r, t = t === void 0 ? i : ~~t, r < 0 ? (r += i, r < 0 && (r = 0)) : r > i && (r = i), t < 0 ? (t += i, t < 0 && (t = 0)) : t > i && (t = i), t < r && (t = r);
        const e = this.subarray(r, t);
        return Object.setPrototypeOf(e, o.prototype), e;
    };
    function I(n, r, t) {
        if (n % 1 !== 0 || n < 0) throw new RangeError("offset is not uint");
        if (n + r > t) throw new RangeError("Trying to access beyond buffer length");
    }
    o.prototype.readUintLE = o.prototype.readUIntLE = function(r, t, i) {
        r = r >>> 0, t = t >>> 0, i || I(r, t, this.length);
        let e = this[r], u = 1, h = 0;
        for(; ++h < t && (u *= 256);)e += this[r + h] * u;
        return e;
    }, o.prototype.readUintBE = o.prototype.readUIntBE = function(r, t, i) {
        r = r >>> 0, t = t >>> 0, i || I(r, t, this.length);
        let e = this[r + --t], u = 1;
        for(; t > 0 && (u *= 256);)e += this[r + --t] * u;
        return e;
    }, o.prototype.readUint8 = o.prototype.readUInt8 = function(r, t) {
        return r = r >>> 0, t || I(r, 1, this.length), this[r];
    }, o.prototype.readUint16LE = o.prototype.readUInt16LE = function(r, t) {
        return r = r >>> 0, t || I(r, 2, this.length), this[r] | this[r + 1] << 8;
    }, o.prototype.readUint16BE = o.prototype.readUInt16BE = function(r, t) {
        return r = r >>> 0, t || I(r, 2, this.length), this[r] << 8 | this[r + 1];
    }, o.prototype.readUint32LE = o.prototype.readUInt32LE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
    }, o.prototype.readUint32BE = o.prototype.readUInt32BE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
    }, o.prototype.readBigUInt64LE = L(function(r) {
        r = r >>> 0, k(r, "offset");
        const t = this[r], i = this[r + 7];
        (t === void 0 || i === void 0) && $(r, this.length - 8);
        const e = t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24, u = this[++r] + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + i * 2 ** 24;
        return BigInt(e) + (BigInt(u) << BigInt(32));
    }), o.prototype.readBigUInt64BE = L(function(r) {
        r = r >>> 0, k(r, "offset");
        const t = this[r], i = this[r + 7];
        (t === void 0 || i === void 0) && $(r, this.length - 8);
        const e = t * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r], u = this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + i;
        return (BigInt(e) << BigInt(32)) + BigInt(u);
    }), o.prototype.readIntLE = function(r, t, i) {
        r = r >>> 0, t = t >>> 0, i || I(r, t, this.length);
        let e = this[r], u = 1, h = 0;
        for(; ++h < t && (u *= 256);)e += this[r + h] * u;
        return u *= 128, e >= u && (e -= Math.pow(2, 8 * t)), e;
    }, o.prototype.readIntBE = function(r, t, i) {
        r = r >>> 0, t = t >>> 0, i || I(r, t, this.length);
        let e = t, u = 1, h = this[r + --e];
        for(; e > 0 && (u *= 256);)h += this[r + --e] * u;
        return u *= 128, h >= u && (h -= Math.pow(2, 8 * t)), h;
    }, o.prototype.readInt8 = function(r, t) {
        return r = r >>> 0, t || I(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
    }, o.prototype.readInt16LE = function(r, t) {
        r = r >>> 0, t || I(r, 2, this.length);
        const i = this[r] | this[r + 1] << 8;
        return i & 32768 ? i | 4294901760 : i;
    }, o.prototype.readInt16BE = function(r, t) {
        r = r >>> 0, t || I(r, 2, this.length);
        const i = this[r + 1] | this[r] << 8;
        return i & 32768 ? i | 4294901760 : i;
    }, o.prototype.readInt32LE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
    }, o.prototype.readInt32BE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
    }, o.prototype.readBigInt64LE = L(function(r) {
        r = r >>> 0, k(r, "offset");
        const t = this[r], i = this[r + 7];
        (t === void 0 || i === void 0) && $(r, this.length - 8);
        const e = this[r + 4] + this[r + 5] * 2 ** 8 + this[r + 6] * 2 ** 16 + (i << 24);
        return (BigInt(e) << BigInt(32)) + BigInt(t + this[++r] * 2 ** 8 + this[++r] * 2 ** 16 + this[++r] * 2 ** 24);
    }), o.prototype.readBigInt64BE = L(function(r) {
        r = r >>> 0, k(r, "offset");
        const t = this[r], i = this[r + 7];
        (t === void 0 || i === void 0) && $(r, this.length - 8);
        const e = (t << 24) + // Overflow
        this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + this[++r];
        return (BigInt(e) << BigInt(32)) + BigInt(this[++r] * 2 ** 24 + this[++r] * 2 ** 16 + this[++r] * 2 ** 8 + i);
    }), o.prototype.readFloatLE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), f.read(this, r, !0, 23, 4);
    }, o.prototype.readFloatBE = function(r, t) {
        return r = r >>> 0, t || I(r, 4, this.length), f.read(this, r, !1, 23, 4);
    }, o.prototype.readDoubleLE = function(r, t) {
        return r = r >>> 0, t || I(r, 8, this.length), f.read(this, r, !0, 52, 8);
    }, o.prototype.readDoubleBE = function(r, t) {
        return r = r >>> 0, t || I(r, 8, this.length), f.read(this, r, !1, 52, 8);
    };
    function U(n, r, t, i, e, u) {
        if (!o.isBuffer(n)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (r > e || r < u) throw new RangeError('"value" argument is out of bounds');
        if (t + i > n.length) throw new RangeError("Index out of range");
    }
    o.prototype.writeUintLE = o.prototype.writeUIntLE = function(r, t, i, e) {
        if (r = +r, t = t >>> 0, i = i >>> 0, !e) {
            const y = Math.pow(2, 8 * i) - 1;
            U(this, r, t, i, y, 0);
        }
        let u = 1, h = 0;
        for(this[t] = r & 255; ++h < i && (u *= 256);)this[t + h] = r / u & 255;
        return t + i;
    }, o.prototype.writeUintBE = o.prototype.writeUIntBE = function(r, t, i, e) {
        if (r = +r, t = t >>> 0, i = i >>> 0, !e) {
            const y = Math.pow(2, 8 * i) - 1;
            U(this, r, t, i, y, 0);
        }
        let u = i - 1, h = 1;
        for(this[t + u] = r & 255; --u >= 0 && (h *= 256);)this[t + u] = r / h & 255;
        return t + i;
    }, o.prototype.writeUint8 = o.prototype.writeUInt8 = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 1, 255, 0), this[t] = r & 255, t + 1;
    }, o.prototype.writeUint16LE = o.prototype.writeUInt16LE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 2, 65535, 0), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    }, o.prototype.writeUint16BE = o.prototype.writeUInt16BE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 2, 65535, 0), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    }, o.prototype.writeUint32LE = o.prototype.writeUInt32LE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 4, 4294967295, 0), this[t + 3] = r >>> 24, this[t + 2] = r >>> 16, this[t + 1] = r >>> 8, this[t] = r & 255, t + 4;
    }, o.prototype.writeUint32BE = o.prototype.writeUInt32BE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 4, 4294967295, 0), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    };
    function tr(n, r, t, i, e) {
        hr(r, i, e, n, t, 7);
        let u = Number(r & BigInt(4294967295));
        n[t++] = u, u = u >> 8, n[t++] = u, u = u >> 8, n[t++] = u, u = u >> 8, n[t++] = u;
        let h = Number(r >> BigInt(32) & BigInt(4294967295));
        return n[t++] = h, h = h >> 8, n[t++] = h, h = h >> 8, n[t++] = h, h = h >> 8, n[t++] = h, t;
    }
    function nr(n, r, t, i, e) {
        hr(r, i, e, n, t, 7);
        let u = Number(r & BigInt(4294967295));
        n[t + 7] = u, u = u >> 8, n[t + 6] = u, u = u >> 8, n[t + 5] = u, u = u >> 8, n[t + 4] = u;
        let h = Number(r >> BigInt(32) & BigInt(4294967295));
        return n[t + 3] = h, h = h >> 8, n[t + 2] = h, h = h >> 8, n[t + 1] = h, h = h >> 8, n[t] = h, t + 8;
    }
    o.prototype.writeBigUInt64LE = L(function(r, t = 0) {
        return tr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), o.prototype.writeBigUInt64BE = L(function(r, t = 0) {
        return nr(this, r, t, BigInt(0), BigInt("0xffffffffffffffff"));
    }), o.prototype.writeIntLE = function(r, t, i, e) {
        if (r = +r, t = t >>> 0, !e) {
            const E = Math.pow(2, 8 * i - 1);
            U(this, r, t, i, E - 1, -E);
        }
        let u = 0, h = 1, y = 0;
        for(this[t] = r & 255; ++u < i && (h *= 256);)r < 0 && y === 0 && this[t + u - 1] !== 0 && (y = 1), this[t + u] = (r / h >> 0) - y & 255;
        return t + i;
    }, o.prototype.writeIntBE = function(r, t, i, e) {
        if (r = +r, t = t >>> 0, !e) {
            const E = Math.pow(2, 8 * i - 1);
            U(this, r, t, i, E - 1, -E);
        }
        let u = i - 1, h = 1, y = 0;
        for(this[t + u] = r & 255; --u >= 0 && (h *= 256);)r < 0 && y === 0 && this[t + u + 1] !== 0 && (y = 1), this[t + u] = (r / h >> 0) - y & 255;
        return t + i;
    }, o.prototype.writeInt8 = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[t] = r & 255, t + 1;
    }, o.prototype.writeInt16LE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 2, 32767, -32768), this[t] = r & 255, this[t + 1] = r >>> 8, t + 2;
    }, o.prototype.writeInt16BE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 2, 32767, -32768), this[t] = r >>> 8, this[t + 1] = r & 255, t + 2;
    }, o.prototype.writeInt32LE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 4, 2147483647, -2147483648), this[t] = r & 255, this[t + 1] = r >>> 8, this[t + 2] = r >>> 16, this[t + 3] = r >>> 24, t + 4;
    }, o.prototype.writeInt32BE = function(r, t, i) {
        return r = +r, t = t >>> 0, i || U(this, r, t, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[t] = r >>> 24, this[t + 1] = r >>> 16, this[t + 2] = r >>> 8, this[t + 3] = r & 255, t + 4;
    }, o.prototype.writeBigInt64LE = L(function(r, t = 0) {
        return tr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    }), o.prototype.writeBigInt64BE = L(function(r, t = 0) {
        return nr(this, r, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function ir(n, r, t, i, e, u) {
        if (t + i > n.length) throw new RangeError("Index out of range");
        if (t < 0) throw new RangeError("Index out of range");
    }
    function er(n, r, t, i, e) {
        return r = +r, t = t >>> 0, e || ir(n, r, t, 4), f.write(n, r, t, i, 23, 4), t + 4;
    }
    o.prototype.writeFloatLE = function(r, t, i) {
        return er(this, r, t, !0, i);
    }, o.prototype.writeFloatBE = function(r, t, i) {
        return er(this, r, t, !1, i);
    };
    function or(n, r, t, i, e) {
        return r = +r, t = t >>> 0, e || ir(n, r, t, 8), f.write(n, r, t, i, 52, 8), t + 8;
    }
    o.prototype.writeDoubleLE = function(r, t, i) {
        return or(this, r, t, !0, i);
    }, o.prototype.writeDoubleBE = function(r, t, i) {
        return or(this, r, t, !1, i);
    }, o.prototype.copy = function(r, t, i, e) {
        if (!o.isBuffer(r)) throw new TypeError("argument should be a Buffer");
        if (i || (i = 0), !e && e !== 0 && (e = this.length), t >= r.length && (t = r.length), t || (t = 0), e > 0 && e < i && (e = i), e === i || r.length === 0 || this.length === 0) return 0;
        if (t < 0) throw new RangeError("targetStart out of bounds");
        if (i < 0 || i >= this.length) throw new RangeError("Index out of range");
        if (e < 0) throw new RangeError("sourceEnd out of bounds");
        e > this.length && (e = this.length), r.length - t < e - i && (e = r.length - t + i);
        const u = e - i;
        return this === r && typeof p.prototype.copyWithin == "function" ? this.copyWithin(t, i, e) : p.prototype.set.call(r, this.subarray(i, e), t), u;
    }, o.prototype.fill = function(r, t, i, e) {
        if (typeof r == "string") {
            if (typeof t == "string" ? (e = t, t = 0, i = this.length) : typeof i == "string" && (e = i, i = this.length), e !== void 0 && typeof e != "string") throw new TypeError("encoding must be a string");
            if (typeof e == "string" && !o.isEncoding(e)) throw new TypeError("Unknown encoding: " + e);
            if (r.length === 1) {
                const h = r.charCodeAt(0);
                (e === "utf8" && h < 128 || e === "latin1") && (r = h);
            }
        } else typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
        if (t < 0 || this.length < t || this.length < i) throw new RangeError("Out of range index");
        if (i <= t) return this;
        t = t >>> 0, i = i === void 0 ? this.length : i >>> 0, r || (r = 0);
        let u;
        if (typeof r == "number") for(u = t; u < i; ++u)this[u] = r;
        else {
            const h = o.isBuffer(r) ? r : o.from(r, e), y = h.length;
            if (y === 0) throw new TypeError('The value "' + r + '" is invalid for argument "value"');
            for(u = 0; u < i - t; ++u)this[u + t] = h[u % y];
        }
        return this;
    };
    const M = {};
    function q(n, r, t) {
        M[n] = class extends t {
            constructor(){
                super(), Object.defineProperty(this, "message", {
                    value: r.apply(this, arguments),
                    writable: !0,
                    configurable: !0
                }), this.name = `${this.name} [${n}]`, this.stack, delete this.name;
            }
            get code() {
                return n;
            }
            set code(e) {
                Object.defineProperty(this, "code", {
                    configurable: !0,
                    enumerable: !0,
                    value: e,
                    writable: !0
                });
            }
            toString() {
                return `${this.name} [${n}]: ${this.message}`;
            }
        };
    }
    q("ERR_BUFFER_OUT_OF_BOUNDS", function(n) {
        return n ? `${n} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds";
    }, RangeError), q("ERR_INVALID_ARG_TYPE", function(n, r) {
        return `The "${n}" argument must be of type number. Received type ${typeof r}`;
    }, TypeError), q("ERR_OUT_OF_RANGE", function(n, r, t) {
        let i = `The value of "${n}" is out of range.`, e = t;
        return Number.isInteger(t) && Math.abs(t) > 2 ** 32 ? e = ur(String(t)) : typeof t == "bigint" && (e = String(t), (t > BigInt(2) ** BigInt(32) || t < -(BigInt(2) ** BigInt(32))) && (e = ur(e)), e += "n"), i += ` It must be ${r}. Received ${e}`, i;
    }, RangeError);
    function ur(n) {
        let r = "", t = n.length;
        const i = n[0] === "-" ? 1 : 0;
        for(; t >= i + 4; t -= 3)r = `_${n.slice(t - 3, t)}${r}`;
        return `${n.slice(0, t)}${r}`;
    }
    function Tr(n, r, t) {
        k(r, "offset"), (n[r] === void 0 || n[r + t] === void 0) && $(r, n.length - (t + 1));
    }
    function hr(n, r, t, i, e, u) {
        if (n > t || n < r) {
            const h = typeof r == "bigint" ? "n" : "";
            let y;
            throw r === 0 || r === BigInt(0) ? y = `>= 0${h} and < 2${h} ** ${(u + 1) * 8}${h}` : y = `>= -(2${h} ** ${(u + 1) * 8 - 1}${h}) and < 2 ** ${(u + 1) * 8 - 1}${h}`, new M.ERR_OUT_OF_RANGE("value", y, n);
        }
        Tr(i, e, u);
    }
    function k(n, r) {
        if (typeof n != "number") throw new M.ERR_INVALID_ARG_TYPE(r, "number", n);
    }
    function $(n, r, t) {
        throw Math.floor(n) !== n ? (k(n, t), new M.ERR_OUT_OF_RANGE("offset", "an integer", n)) : r < 0 ? new M.ERR_BUFFER_OUT_OF_BOUNDS() : new M.ERR_OUT_OF_RANGE("offset", `>= 0 and <= ${r}`, n);
    }
    const Rr = /[^+/0-9A-Za-z-_]/g;
    function Cr(n) {
        if (n = n.split("=")[0], n = n.trim().replace(Rr, ""), n.length < 2) return "";
        for(; n.length % 4 !== 0;)n = n + "=";
        return n;
    }
    function V(n, r) {
        r = r || 1 / 0;
        let t;
        const i = n.length;
        let e = null;
        const u = [];
        for(let h = 0; h < i; ++h){
            if (t = n.charCodeAt(h), t > 55295 && t < 57344) {
                if (!e) {
                    if (t > 56319) {
                        (r -= 3) > -1 && u.push(239, 191, 189);
                        continue;
                    } else if (h + 1 === i) {
                        (r -= 3) > -1 && u.push(239, 191, 189);
                        continue;
                    }
                    e = t;
                    continue;
                }
                if (t < 56320) {
                    (r -= 3) > -1 && u.push(239, 191, 189), e = t;
                    continue;
                }
                t = (e - 55296 << 10 | t - 56320) + 65536;
            } else e && (r -= 3) > -1 && u.push(239, 191, 189);
            if (e = null, t < 128) {
                if ((r -= 1) < 0) break;
                u.push(t);
            } else if (t < 2048) {
                if ((r -= 2) < 0) break;
                u.push(t >> 6 | 192, t & 63 | 128);
            } else if (t < 65536) {
                if ((r -= 3) < 0) break;
                u.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
            } else if (t < 1114112) {
                if ((r -= 4) < 0) break;
                u.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
            } else throw new Error("Invalid code point");
        }
        return u;
    }
    function Sr(n) {
        const r = [];
        for(let t = 0; t < n.length; ++t)r.push(n.charCodeAt(t) & 255);
        return r;
    }
    function _r(n, r) {
        let t, i, e;
        const u = [];
        for(let h = 0; h < n.length && !((r -= 2) < 0); ++h)t = n.charCodeAt(h), i = t >> 8, e = t % 256, u.push(e), u.push(i);
        return u;
    }
    function cr(n) {
        return c.toByteArray(Cr(n));
    }
    function P(n, r, t, i) {
        let e;
        for(e = 0; e < i && !(e + t >= r.length || e >= n.length); ++e)r[e + t] = n[e];
        return e;
    }
    function C(n, r) {
        return n instanceof r || n != null && n.constructor != null && n.constructor.name != null && n.constructor.name === r.name;
    }
    function X(n) {
        return n !== n;
    }
    const Lr = function() {
        const n = "0123456789abcdef", r = new Array(256);
        for(let t = 0; t < 16; ++t){
            const i = t * 16;
            for(let e = 0; e < 16; ++e)r[i + e] = n[t] + n[e];
        }
        return r;
    }();
    function L(n) {
        return typeof BigInt > "u" ? Nr : n;
    }
    function Nr() {
        throw new Error("BigInt not supported");
    }
})(fr);
const O = fr.Buffer;
class Yr {
    static fromHex(c) {
        if (c = c.trim(), c.length === 0) return new Uint8Array(0);
        if (c.length < 2 || c.length & 1) throw new Error("Invalid hex string: odd length.");
        if ((c.startsWith("0x") || c.startsWith("0X")) && (c = c.slice(2)), !c.match(/^[0-9a-fA-F]*$/)) throw new Error("Invalid hex string: contains non-hex characters");
        const w = c.match(/.{1,2}/g);
        if (!w) throw new Error("Invalid hex string");
        return new Uint8Array(w.map((l)=>parseInt(l, 16)));
    }
    static toHex(c) {
        return Array.from(c, (f)=>f.toString(16).padStart(2, "0")).join("");
    }
    static fromString(c) {
        return c = c.trim(), new TextEncoder().encode(c);
    }
    static toString(c) {
        return new TextDecoder("utf-8").decode(c);
    }
    static concat(...c) {
        const f = c.reduce((p, a)=>p + a.length, 0), w = new Uint8Array(f);
        let l = 0;
        for (const p of c)w.set(p, l), l += p.length;
        return w;
    }
    static alloc(c) {
        return new Uint8Array(c);
    }
    static writeBigUint64BE(c) {
        const f = new ArrayBuffer(8);
        return new DataView(f).setBigUint64(0, c, !1), new Uint8Array(f);
    }
    static toBase64(c) {
        if (typeof O < "u") return O.from(c).toString("base64");
        if (c.length > 32768) {
            let f = "";
            for(let w = 0; w < c.length; w += 32768){
                const l = c.slice(w, w + 32768);
                f += btoa(String.fromCharCode(...l));
            }
            return f;
        }
        return btoa(String.fromCharCode(...c));
    }
    static fromBase64(c) {
        if (c = c.trim(), typeof O < "u") return new Uint8Array(O.from(c, "base64"));
        let f = c.replace(/-/g, "+").replace(/_/g, "/");
        for(; f.length % 4;)f += "=";
        return new Uint8Array([
            ...atob(f)
        ].map((w)=>w.charCodeAt(0)));
    }
    static equals(c, f) {
        if (c.length !== f.length) return !1;
        let w = 0;
        for(let l = 0; l < c.length; l++)w |= c[l] ^ f[l];
        return w === 0;
    }
    static compare(c, f) {
        const w = Math.min(c.length, f.length);
        for(let l = 0; l < w; l++){
            if (c[l] < f[l]) return -1;
            if (c[l] > f[l]) return 1;
        }
        return c.length - f.length;
    }
}
function Vr(s) {
    return Hr((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(s));
}
function Hr(s) {
    return BigInt(`0x${s}`);
}
function Xr(s) {
    return Yr.fromBase64(s);
}
;
 //# sourceMappingURL=utils-t45upHsJ.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createRandomPrivateKey",
    ()=>K,
    "deriveKeysetId",
    ()=>O,
    "deserializeMintKeys",
    ()=>S,
    "getKeysetIdInt",
    ()=>w,
    "hashToCurve",
    ()=>B,
    "hash_e",
    ()=>T,
    "pointFromBytes",
    ()=>H,
    "pointFromHex",
    ()=>l,
    "serializeMintKeys",
    ()=>I
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-t45upHsJ.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
;
;
;
const d = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])("536563703235366b315f48617368546f43757276655f43617368755f");
function B(t) {
    const e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(d, t)), n = new Uint32Array(1), o = 2 ** 16;
    for(let s = 0; s < o; s++){
        const m = new Uint8Array(n.buffer), r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(e, m));
        try {
            return l((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(new Uint8Array([
                2
            ]), r)));
        } catch  {
            n[0]++;
        }
    }
    throw new Error("No valid point found");
}
function T(t) {
    const n = t.map((o)=>o.toHex(!1)).join("");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(new TextEncoder().encode(n));
}
function H(t) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.fromHex((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(t));
}
function l(t) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.fromHex(t);
}
const w = (t)=>{
    let e;
    return /^[a-fA-F0-9]+$/.test(t) ? e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t) % BigInt(2 ** 31 - 1) : e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["e"])(t)) % BigInt(2 ** 31 - 1), e;
};
function K() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].utils.randomSecretKey();
}
function I(t) {
    const e = {};
    return Object.keys(t).forEach((n)=>{
        e[n] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(t[n]);
    }), e;
}
function S(t) {
    const e = {};
    return Object.keys(t).forEach((n)=>{
        e[n] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t[n]);
    }), e;
}
function O(t) {
    const n = (r)=>[
            BigInt(r[0]),
            r[1]
        ], o = Object.entries(I(t)).map(n).sort((r, c)=>r[0] < c[0] ? -1 : r[0] > c[0] ? 1 : 0).map(([, r])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r)).reduce((r, c)=>b(r, c), new Uint8Array()), s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(o);
    return "00" + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toHex(s).slice(0, 14);
}
function b(t, e) {
    const n = new Uint8Array(t.length + e.length);
    return n.set(t), n.set(e, t.length), n;
}
;
 //# sourceMappingURL=common.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT12.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "verifyDLEQProof",
    ()=>E,
    "verifyDLEQProof_reblind",
    ()=>B
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
;
;
function _(t, o) {
    if (t.length !== o.length) return !1;
    for(let n = 0; n < t.length; n++)if (t[n] !== o[n]) return !1;
    return !0;
}
const E = (t, o, n, r)=>{
    const s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.Fn.fromBytes(t.s), e = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.Fn.fromBytes(t.e), c = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.BASE.multiply(s), f = r.multiply(e), l = o.multiply(s), u = n.multiply(e), a = c.subtract(f), m = l.subtract(u), y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hash_e"])([
        a,
        m,
        r,
        n
    ]);
    return _(y, t.e);
}, B = (t, o, n, r)=>{
    if (o.r === void 0) throw new Error("verifyDLEQProof_reblind: Undefined blinding factor");
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hashToCurve"])(t), e = n.add(r.multiply(o.r)), c = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.BASE.multiply(o.r), f = s.add(c);
    return E(o, f, e, r);
};
;
 //# sourceMappingURL=NUT12.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/index-Dm_sS4zv.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "H",
    ()=>mt
]);
const gt = typeof globalThis == "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function Mt(e) {
    return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function Jt(e) {
    if (!Number.isSafeInteger(e) || e < 0) throw new Error("positive integer expected, got " + e);
}
function z(e, ...t) {
    if (!Mt(e)) throw new Error("Uint8Array expected");
    if (t.length > 0 && !t.includes(e.length)) throw new Error("Uint8Array expected of length " + t + ", got length=" + e.length);
}
function Ce(e) {
    if (typeof e != "function" || typeof e.create != "function") throw new Error("Hash should be wrapped by utils.createHasher");
    Jt(e.outputLen), Jt(e.blockLen);
}
function kt(e, t = !0) {
    if (e.destroyed) throw new Error("Hash instance has been destroyed");
    if (t && e.finished) throw new Error("Hash#digest() has already been called");
}
function wn(e, t) {
    z(e);
    const r = t.outputLen;
    if (e.length < r) throw new Error("digestInto() expects output buffer of length at least " + r);
}
function lt(...e) {
    for(let t = 0; t < e.length; t++)e[t].fill(0);
}
function Et(e) {
    return new DataView(e.buffer, e.byteOffset, e.byteLength);
}
function Q(e, t) {
    return e << 32 - t | e >>> t;
}
function Ut(e, t) {
    return e << t | e >>> 32 - t >>> 0;
}
const Oe = /* @ts-ignore */ typeof Uint8Array.from([]).toHex == "function" && typeof Uint8Array.fromHex == "function", gn = /* @__PURE__ */ Array.from({
    length: 256
}, (e, t)=>t.toString(16).padStart(2, "0"));
function wt(e) {
    if (z(e), Oe) return e.toHex();
    let t = "";
    for(let r = 0; r < e.length; r++)t += gn[e[r]];
    return t;
}
const et = {
    _0: 48,
    _9: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
};
function ye(e) {
    if (e >= et._0 && e <= et._9) return e - et._0;
    if (e >= et.A && e <= et.F) return e - (et.A - 10);
    if (e >= et.a && e <= et.f) return e - (et.a - 10);
}
function At(e) {
    if (typeof e != "string") throw new Error("hex string expected, got " + typeof e);
    if (Oe) return Uint8Array.fromHex(e);
    const t = e.length, r = t / 2;
    if (t % 2) throw new Error("hex string expected, got unpadded hex of length " + t);
    const n = new Uint8Array(r);
    for(let i = 0, o = 0; i < r; i++, o += 2){
        const s = ye(e.charCodeAt(o)), c = ye(e.charCodeAt(o + 1));
        if (s === void 0 || c === void 0) {
            const f = e[o] + e[o + 1];
            throw new Error('hex string expected, got non-hex character "' + f + '" at index ' + o);
        }
        n[i] = s * 16 + c;
    }
    return n;
}
function qe(e) {
    if (typeof e != "string") throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(e));
}
function oe(e) {
    return typeof e == "string" && (e = qe(e)), z(e), e;
}
function W(...e) {
    let t = 0;
    for(let n = 0; n < e.length; n++){
        const i = e[n];
        z(i), t += i.length;
    }
    const r = new Uint8Array(t);
    for(let n = 0, i = 0; n < e.length; n++){
        const o = e[n];
        r.set(o, i), i += o.length;
    }
    return r;
}
class Le {
}
function se(e) {
    const t = (n)=>e().update(oe(n)).digest(), r = e();
    return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = ()=>e(), t;
}
function ke(e = 32) {
    if (gt && typeof gt.getRandomValues == "function") return gt.getRandomValues(new Uint8Array(e));
    if (gt && typeof gt.randomBytes == "function") return Uint8Array.from(gt.randomBytes(e));
    throw new Error("crypto.getRandomValues must be defined");
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const ce = /* @__PURE__ */ BigInt(0), Qt = /* @__PURE__ */ BigInt(1);
function Tt(e, t = "") {
    if (typeof e != "boolean") {
        const r = t && `"${t}"`;
        throw new Error(r + "expected boolean, got type=" + typeof e);
    }
    return e;
}
function dt(e, t, r = "") {
    const n = Mt(e), i = e?.length, o = t !== void 0;
    if (!n || o && i !== t) {
        const s = r && `"${r}" `, c = o ? ` of length ${t}` : "", f = n ? `length=${i}` : `type=${typeof e}`;
        throw new Error(s + "expected Uint8Array" + c + ", got " + f);
    }
    return e;
}
function Kt(e) {
    const t = e.toString(16);
    return t.length & 1 ? "0" + t : t;
}
function Te(e) {
    if (typeof e != "string") throw new Error("hex string expected, got " + typeof e);
    return e === "" ? ce : BigInt("0x" + e);
}
function $t(e) {
    return Te(wt(e));
}
function Ze(e) {
    return z(e), Te(wt(Uint8Array.from(e).reverse()));
}
function fe(e, t) {
    return At(e.toString(16).padStart(t * 2, "0"));
}
function Ve(e, t) {
    return fe(e, t).reverse();
}
function F(e, t, r) {
    let n;
    if (typeof t == "string") try {
        n = At(t);
    } catch (i) {
        throw new Error(e + " must be hex string or Uint8Array, cause: " + i);
    }
    else if (Mt(t)) n = Uint8Array.from(t);
    else throw new Error(e + " must be hex string or Uint8Array");
    return n.length, n;
}
const jt = (e)=>typeof e == "bigint" && ce <= e;
function yn(e, t, r) {
    return jt(e) && jt(t) && jt(r) && t <= e && e < r;
}
function pn(e, t, r, n) {
    if (!yn(t, r, n)) throw new Error("expected valid " + e + ": " + r + " <= n < " + n + ", got " + t);
}
function Me(e) {
    let t;
    for(t = 0; e > ce; e >>= Qt, t += 1);
    return t;
}
const St = (e)=>(Qt << BigInt(e)) - Qt;
function mn(e, t, r) {
    if (typeof e != "number" || e < 2) throw new Error("hashLen must be a number");
    if (typeof t != "number" || t < 2) throw new Error("qByteLen must be a number");
    if (typeof r != "function") throw new Error("hmacFn must be a function");
    const n = (u)=>new Uint8Array(u), i = (u)=>Uint8Array.of(u);
    let o = n(e), s = n(e), c = 0;
    const f = ()=>{
        o.fill(1), s.fill(0), c = 0;
    }, d = (...u)=>r(s, o, ...u), g = (u = n(0))=>{
        s = d(i(0), u), o = d(), u.length !== 0 && (s = d(i(1), u), o = d());
    }, w = ()=>{
        if (c++ >= 1e3) throw new Error("drbg: tried 1000 values");
        let u = 0;
        const y = [];
        for(; u < t;){
            o = d();
            const m = o.slice();
            y.push(m), u += o.length;
        }
        return W(...y);
    };
    return (u, y)=>{
        f(), g(u);
        let m;
        for(; !(m = y(w()));)g();
        return f(), m;
    };
}
function ae(e, t, r = {}) {
    if (!e || typeof e != "object") throw new Error("expected valid options object");
    function n(i, o, s) {
        const c = e[i];
        if (s && c === void 0) return;
        const f = typeof c;
        if (f !== o || c === null) throw new Error(`param "${i}" is invalid: expected ${o}, got ${f}`);
    }
    Object.entries(t).forEach(([i, o])=>n(i, o, !1)), Object.entries(r).forEach(([i, o])=>n(i, o, !0));
}
function pe(e) {
    const t = /* @__PURE__ */ new WeakMap();
    return (r, ...n)=>{
        const i = t.get(r);
        if (i !== void 0) return i;
        const o = e(r, ...n);
        return t.set(r, o), o;
    };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Y = BigInt(0), $ = BigInt(1), ht = /* @__PURE__ */ BigInt(2), $e = /* @__PURE__ */ BigInt(3), je = /* @__PURE__ */ BigInt(4), De = /* @__PURE__ */ BigInt(5), xn = /* @__PURE__ */ BigInt(7), Fe = /* @__PURE__ */ BigInt(8), En = /* @__PURE__ */ BigInt(9), Ye = /* @__PURE__ */ BigInt(16);
function P(e, t) {
    const r = e % t;
    return r >= Y ? r : t + r;
}
function X(e, t, r) {
    let n = e;
    for(; t-- > Y;)n *= n, n %= r;
    return n;
}
function me(e, t) {
    if (e === Y) throw new Error("invert: expected non-zero number");
    if (t <= Y) throw new Error("invert: expected positive modulus, got " + t);
    let r = P(e, t), n = t, i = Y, o = $;
    for(; r !== Y;){
        const c = n / r, f = n % r, d = i - o * c;
        n = r, r = f, i = o, o = d;
    }
    if (n !== $) throw new Error("invert: does not exist");
    return P(i, t);
}
function ue(e, t, r) {
    if (!e.eql(e.sqr(t), r)) throw new Error("Cannot find square root");
}
function Ge(e, t) {
    const r = (e.ORDER + $) / je, n = e.pow(t, r);
    return ue(e, n, t), n;
}
function vn(e, t) {
    const r = (e.ORDER - De) / Fe, n = e.mul(t, ht), i = e.pow(n, r), o = e.mul(t, i), s = e.mul(e.mul(o, ht), i), c = e.mul(o, e.sub(s, e.ONE));
    return ue(e, c, t), c;
}
function Bn(e) {
    const t = It(e), r = ze(e), n = r(t, t.neg(t.ONE)), i = r(t, n), o = r(t, t.neg(n)), s = (e + xn) / Ye;
    return (c, f)=>{
        let d = c.pow(f, s), g = c.mul(d, n);
        const w = c.mul(d, i), a = c.mul(d, o), u = c.eql(c.sqr(g), f), y = c.eql(c.sqr(w), f);
        d = c.cmov(d, g, u), g = c.cmov(a, w, y);
        const m = c.eql(c.sqr(g), f), H = c.cmov(d, g, m);
        return ue(c, H, f), H;
    };
}
function ze(e) {
    if (e < $e) throw new Error("sqrt is not defined for small field");
    let t = e - $, r = 0;
    for(; t % ht === Y;)t /= ht, r++;
    let n = ht;
    const i = It(e);
    for(; xe(i, n) === 1;)if (n++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
    if (r === 1) return Ge;
    let o = i.pow(n, t);
    const s = (t + $) / ht;
    return function(f, d) {
        if (f.is0(d)) return d;
        if (xe(f, d) !== 1) throw new Error("Cannot find square root");
        let g = r, w = f.mul(f.ONE, o), a = f.pow(d, t), u = f.pow(d, s);
        for(; !f.eql(a, f.ONE);){
            if (f.is0(a)) return f.ZERO;
            let y = 1, m = f.sqr(a);
            for(; !f.eql(m, f.ONE);)if (y++, m = f.sqr(m), y === g) throw new Error("Cannot find square root");
            const H = $ << BigInt(g - y - 1), _ = f.pow(w, H);
            g = y, w = f.sqr(_), a = f.mul(a, w), u = f.mul(u, _);
        }
        return u;
    };
}
function An(e) {
    return e % je === $e ? Ge : e % Fe === De ? vn : e % Ye === En ? Bn(e) : ze(e);
}
const Sn = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
];
function In(e) {
    const t = {
        ORDER: "bigint",
        MASK: "bigint",
        BYTES: "number",
        BITS: "number"
    }, r = Sn.reduce((n, i)=>(n[i] = "function", n), t);
    return ae(e, r), e;
}
function Hn(e, t, r) {
    if (r < Y) throw new Error("invalid exponent, negatives unsupported");
    if (r === Y) return e.ONE;
    if (r === $) return t;
    let n = e.ONE, i = t;
    for(; r > Y;)r & $ && (n = e.mul(n, i)), i = e.sqr(i), r >>= $;
    return n;
}
function Xe(e, t, r = !1) {
    const n = new Array(t.length).fill(r ? e.ZERO : void 0), i = t.reduce((s, c, f)=>e.is0(c) ? s : (n[f] = s, e.mul(s, c)), e.ONE), o = e.inv(i);
    return t.reduceRight((s, c, f)=>e.is0(c) ? s : (n[f] = e.mul(s, n[f]), e.mul(s, c)), o), n;
}
function xe(e, t) {
    const r = (e.ORDER - $) / ht, n = e.pow(t, r), i = e.eql(n, e.ONE), o = e.eql(n, e.ZERO), s = e.eql(n, e.neg(e.ONE));
    if (!i && !o && !s) throw new Error("invalid Legendre symbol result");
    return i ? 1 : o ? 0 : -1;
}
function Pe(e, t) {
    t !== void 0 && Jt(t);
    const r = t !== void 0 ? t : e.toString(2).length, n = Math.ceil(r / 8);
    return {
        nBitLength: r,
        nByteLength: n
    };
}
function It(e, t, r = !1, n = {}) {
    if (e <= Y) throw new Error("invalid field: expected ORDER > 0, got " + e);
    let i, o, s = !1, c;
    if (typeof t == "object" && t != null) {
        if (n.sqrt || r) throw new Error("cannot specify opts in two arguments");
        const a = t;
        a.BITS && (i = a.BITS), a.sqrt && (o = a.sqrt), typeof a.isLE == "boolean" && (r = a.isLE), typeof a.modFromBytes == "boolean" && (s = a.modFromBytes), c = a.allowedLengths;
    } else typeof t == "number" && (i = t), n.sqrt && (o = n.sqrt);
    const { nBitLength: f, nByteLength: d } = Pe(e, i);
    if (d > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let g;
    const w = Object.freeze({
        ORDER: e,
        isLE: r,
        BITS: f,
        BYTES: d,
        MASK: St(f),
        ZERO: Y,
        ONE: $,
        allowedLengths: c,
        create: (a)=>P(a, e),
        isValid: (a)=>{
            if (typeof a != "bigint") throw new Error("invalid field element: expected bigint, got " + typeof a);
            return Y <= a && a < e;
        },
        is0: (a)=>a === Y,
        // is valid and invertible
        isValidNot0: (a)=>!w.is0(a) && w.isValid(a),
        isOdd: (a)=>(a & $) === $,
        neg: (a)=>P(-a, e),
        eql: (a, u)=>a === u,
        sqr: (a)=>P(a * a, e),
        add: (a, u)=>P(a + u, e),
        sub: (a, u)=>P(a - u, e),
        mul: (a, u)=>P(a * u, e),
        pow: (a, u)=>Hn(w, a, u),
        div: (a, u)=>P(a * me(u, e), e),
        // Same as above, but doesn't normalize
        sqrN: (a)=>a * a,
        addN: (a, u)=>a + u,
        subN: (a, u)=>a - u,
        mulN: (a, u)=>a * u,
        inv: (a)=>me(a, e),
        sqrt: o || ((a)=>(g || (g = An(e)), g(w, a))),
        toBytes: (a)=>r ? Ve(a, d) : fe(a, d),
        fromBytes: (a, u = !0)=>{
            if (c) {
                if (!c.includes(a.length) || a.length > d) throw new Error("Field.fromBytes: expected " + c + " bytes, got " + a.length);
                const m = new Uint8Array(d);
                m.set(a, r ? 0 : m.length - a.length), a = m;
            }
            if (a.length !== d) throw new Error("Field.fromBytes: expected " + d + " bytes, got " + a.length);
            let y = r ? Ze(a) : $t(a);
            if (s && (y = P(y, e)), !u && !w.isValid(y)) throw new Error("invalid field element: outside of range 0..ORDER");
            return y;
        },
        // TODO: we don't need it here, move out to separate fn
        invertBatch: (a)=>Xe(w, a),
        // We can't move this out because Fp6, Fp12 implement it
        // and it's unclear what to return in there.
        cmov: (a, u, y)=>y ? u : a
    });
    return Object.freeze(w);
}
function We(e) {
    if (typeof e != "bigint") throw new Error("field order must be bigint");
    const t = e.toString(2).length;
    return Math.ceil(t / 8);
}
function Je(e) {
    const t = We(e);
    return t + Math.ceil(t / 2);
}
function Un(e, t, r = !1) {
    const n = e.length, i = We(t), o = Je(t);
    if (n < 16 || n < o || n > 1024) throw new Error("expected " + o + "-1024 bytes of input, got " + n);
    const s = r ? Ze(e) : $t(e), c = P(s, t - $) + $;
    return r ? Ve(c, i) : fe(c, i);
}
function Kn(e, t, r, n) {
    if (typeof e.setBigUint64 == "function") return e.setBigUint64(t, r, n);
    const i = BigInt(32), o = BigInt(4294967295), s = Number(r >> i & o), c = Number(r & o), f = n ? 4 : 0, d = n ? 0 : 4;
    e.setUint32(t + f, s, n), e.setUint32(t + d, c, n);
}
function Nn(e, t, r) {
    return e & t ^ ~e & r;
}
function _n(e, t, r) {
    return e & t ^ e & r ^ t & r;
}
class le extends Le {
    constructor(t, r, n, i){
        super(), this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.blockLen = t, this.outputLen = r, this.padOffset = n, this.isLE = i, this.buffer = new Uint8Array(t), this.view = Et(this.buffer);
    }
    update(t) {
        kt(this), t = oe(t), z(t);
        const { view: r, buffer: n, blockLen: i } = this, o = t.length;
        for(let s = 0; s < o;){
            const c = Math.min(i - this.pos, o - s);
            if (c === i) {
                const f = Et(t);
                for(; i <= o - s; s += i)this.process(f, s);
                continue;
            }
            n.set(t.subarray(s, s + c), this.pos), this.pos += c, s += c, this.pos === i && (this.process(r, 0), this.pos = 0);
        }
        return this.length += t.length, this.roundClean(), this;
    }
    digestInto(t) {
        kt(this), wn(t, this), this.finished = !0;
        const { buffer: r, view: n, blockLen: i, isLE: o } = this;
        let { pos: s } = this;
        r[s++] = 128, lt(this.buffer.subarray(s)), this.padOffset > i - s && (this.process(n, 0), s = 0);
        for(let w = s; w < i; w++)r[w] = 0;
        Kn(n, i - 8, BigInt(this.length * 8), o), this.process(n, 0);
        const c = Et(t), f = this.outputLen;
        if (f % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
        const d = f / 4, g = this.get();
        if (d > g.length) throw new Error("_sha2: outputLen bigger than state");
        for(let w = 0; w < d; w++)c.setUint32(4 * w, g[w], o);
    }
    digest() {
        const { buffer: t, outputLen: r } = this;
        this.digestInto(t);
        const n = t.slice(0, r);
        return this.destroy(), n;
    }
    _cloneInto(t) {
        t || (t = new this.constructor()), t.set(...this.get());
        const { blockLen: r, buffer: n, length: i, finished: o, destroyed: s, pos: c } = this;
        return t.destroyed = s, t.finished = o, t.length = i, t.pos = c, i % r && t.buffer.set(n), t;
    }
    clone() {
        return this._cloneInto();
    }
}
const ct = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
]), M = /* @__PURE__ */ Uint32Array.from([
    1779033703,
    4089235720,
    3144134277,
    2227873595,
    1013904242,
    4271175723,
    2773480762,
    1595750129,
    1359893119,
    2917565137,
    2600822924,
    725511199,
    528734635,
    4215389547,
    1541459225,
    327033209
]), Nt = /* @__PURE__ */ BigInt(2 ** 32 - 1), Ee = /* @__PURE__ */ BigInt(32);
function Rn(e, t = !1) {
    return t ? {
        h: Number(e & Nt),
        l: Number(e >> Ee & Nt)
    } : {
        h: Number(e >> Ee & Nt) | 0,
        l: Number(e & Nt) | 0
    };
}
function Cn(e, t = !1) {
    const r = e.length;
    let n = new Uint32Array(r), i = new Uint32Array(r);
    for(let o = 0; o < r; o++){
        const { h: s, l: c } = Rn(e[o], t);
        [n[o], i[o]] = [
            s,
            c
        ];
    }
    return [
        n,
        i
    ];
}
const ve = (e, t, r)=>e >>> r, Be = (e, t, r)=>e << 32 - r | t >>> r, yt = (e, t, r)=>e >>> r | t << 32 - r, pt = (e, t, r)=>e << 32 - r | t >>> r, _t = (e, t, r)=>e << 64 - r | t >>> r - 32, Rt = (e, t, r)=>e >>> r - 32 | t << 64 - r;
function nt(e, t, r, n) {
    const i = (t >>> 0) + (n >>> 0);
    return {
        h: e + r + (i / 2 ** 32 | 0) | 0,
        l: i | 0
    };
}
const On = (e, t, r)=>(e >>> 0) + (t >>> 0) + (r >>> 0), qn = (e, t, r, n)=>t + r + n + (e / 2 ** 32 | 0) | 0, Ln = (e, t, r, n)=>(e >>> 0) + (t >>> 0) + (r >>> 0) + (n >>> 0), kn = (e, t, r, n, i)=>t + r + n + i + (e / 2 ** 32 | 0) | 0, Tn = (e, t, r, n, i)=>(e >>> 0) + (t >>> 0) + (r >>> 0) + (n >>> 0) + (i >>> 0), Zn = (e, t, r, n, i, o)=>t + r + n + i + o + (e / 2 ** 32 | 0) | 0, Vn = /* @__PURE__ */ Uint32Array.from([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
]), ft = /* @__PURE__ */ new Uint32Array(64);
class Mn extends le {
    constructor(t = 32){
        super(64, t, 8, !1), this.A = ct[0] | 0, this.B = ct[1] | 0, this.C = ct[2] | 0, this.D = ct[3] | 0, this.E = ct[4] | 0, this.F = ct[5] | 0, this.G = ct[6] | 0, this.H = ct[7] | 0;
    }
    get() {
        const { A: t, B: r, C: n, D: i, E: o, F: s, G: c, H: f } = this;
        return [
            t,
            r,
            n,
            i,
            o,
            s,
            c,
            f
        ];
    }
    // prettier-ignore
    set(t, r, n, i, o, s, c, f) {
        this.A = t | 0, this.B = r | 0, this.C = n | 0, this.D = i | 0, this.E = o | 0, this.F = s | 0, this.G = c | 0, this.H = f | 0;
    }
    process(t, r) {
        for(let w = 0; w < 16; w++, r += 4)ft[w] = t.getUint32(r, !1);
        for(let w = 16; w < 64; w++){
            const a = ft[w - 15], u = ft[w - 2], y = Q(a, 7) ^ Q(a, 18) ^ a >>> 3, m = Q(u, 17) ^ Q(u, 19) ^ u >>> 10;
            ft[w] = m + ft[w - 7] + y + ft[w - 16] | 0;
        }
        let { A: n, B: i, C: o, D: s, E: c, F: f, G: d, H: g } = this;
        for(let w = 0; w < 64; w++){
            const a = Q(c, 6) ^ Q(c, 11) ^ Q(c, 25), u = g + a + Nn(c, f, d) + Vn[w] + ft[w] | 0, m = (Q(n, 2) ^ Q(n, 13) ^ Q(n, 22)) + _n(n, i, o) | 0;
            g = d, d = f, f = c, c = s + u | 0, s = o, o = i, i = n, n = u + m | 0;
        }
        n = n + this.A | 0, i = i + this.B | 0, o = o + this.C | 0, s = s + this.D | 0, c = c + this.E | 0, f = f + this.F | 0, d = d + this.G | 0, g = g + this.H | 0, this.set(n, i, o, s, c, f, d, g);
    }
    roundClean() {
        lt(ft);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0), lt(this.buffer);
    }
}
const Qe = Cn([
    "0x428a2f98d728ae22",
    "0x7137449123ef65cd",
    "0xb5c0fbcfec4d3b2f",
    "0xe9b5dba58189dbbc",
    "0x3956c25bf348b538",
    "0x59f111f1b605d019",
    "0x923f82a4af194f9b",
    "0xab1c5ed5da6d8118",
    "0xd807aa98a3030242",
    "0x12835b0145706fbe",
    "0x243185be4ee4b28c",
    "0x550c7dc3d5ffb4e2",
    "0x72be5d74f27b896f",
    "0x80deb1fe3b1696b1",
    "0x9bdc06a725c71235",
    "0xc19bf174cf692694",
    "0xe49b69c19ef14ad2",
    "0xefbe4786384f25e3",
    "0x0fc19dc68b8cd5b5",
    "0x240ca1cc77ac9c65",
    "0x2de92c6f592b0275",
    "0x4a7484aa6ea6e483",
    "0x5cb0a9dcbd41fbd4",
    "0x76f988da831153b5",
    "0x983e5152ee66dfab",
    "0xa831c66d2db43210",
    "0xb00327c898fb213f",
    "0xbf597fc7beef0ee4",
    "0xc6e00bf33da88fc2",
    "0xd5a79147930aa725",
    "0x06ca6351e003826f",
    "0x142929670a0e6e70",
    "0x27b70a8546d22ffc",
    "0x2e1b21385c26c926",
    "0x4d2c6dfc5ac42aed",
    "0x53380d139d95b3df",
    "0x650a73548baf63de",
    "0x766a0abb3c77b2a8",
    "0x81c2c92e47edaee6",
    "0x92722c851482353b",
    "0xa2bfe8a14cf10364",
    "0xa81a664bbc423001",
    "0xc24b8b70d0f89791",
    "0xc76c51a30654be30",
    "0xd192e819d6ef5218",
    "0xd69906245565a910",
    "0xf40e35855771202a",
    "0x106aa07032bbd1b8",
    "0x19a4c116b8d2d0c8",
    "0x1e376c085141ab53",
    "0x2748774cdf8eeb99",
    "0x34b0bcb5e19b48a8",
    "0x391c0cb3c5c95a63",
    "0x4ed8aa4ae3418acb",
    "0x5b9cca4f7763e373",
    "0x682e6ff3d6b2b8a3",
    "0x748f82ee5defb2fc",
    "0x78a5636f43172f60",
    "0x84c87814a1f0ab72",
    "0x8cc702081a6439ec",
    "0x90befffa23631e28",
    "0xa4506cebde82bde9",
    "0xbef9a3f7b2c67915",
    "0xc67178f2e372532b",
    "0xca273eceea26619c",
    "0xd186b8c721c0c207",
    "0xeada7dd6cde0eb1e",
    "0xf57d4f7fee6ed178",
    "0x06f067aa72176fba",
    "0x0a637dc5a2c898a6",
    "0x113f9804bef90dae",
    "0x1b710b35131c471b",
    "0x28db77f523047d84",
    "0x32caab7b40c72493",
    "0x3c9ebe0a15c9bebc",
    "0x431d67c49c100d4c",
    "0x4cc5d4becb3e42b6",
    "0x597f299cfc657e2a",
    "0x5fcb6fab3ad6faec",
    "0x6c44198c4a475817"
].map((e)=>BigInt(e))), $n = Qe[0], jn = Qe[1], at = /* @__PURE__ */ new Uint32Array(80), ut = /* @__PURE__ */ new Uint32Array(80);
class Dn extends le {
    constructor(t = 64){
        super(128, t, 16, !1), this.Ah = M[0] | 0, this.Al = M[1] | 0, this.Bh = M[2] | 0, this.Bl = M[3] | 0, this.Ch = M[4] | 0, this.Cl = M[5] | 0, this.Dh = M[6] | 0, this.Dl = M[7] | 0, this.Eh = M[8] | 0, this.El = M[9] | 0, this.Fh = M[10] | 0, this.Fl = M[11] | 0, this.Gh = M[12] | 0, this.Gl = M[13] | 0, this.Hh = M[14] | 0, this.Hl = M[15] | 0;
    }
    // prettier-ignore
    get() {
        const { Ah: t, Al: r, Bh: n, Bl: i, Ch: o, Cl: s, Dh: c, Dl: f, Eh: d, El: g, Fh: w, Fl: a, Gh: u, Gl: y, Hh: m, Hl: H } = this;
        return [
            t,
            r,
            n,
            i,
            o,
            s,
            c,
            f,
            d,
            g,
            w,
            a,
            u,
            y,
            m,
            H
        ];
    }
    // prettier-ignore
    set(t, r, n, i, o, s, c, f, d, g, w, a, u, y, m, H) {
        this.Ah = t | 0, this.Al = r | 0, this.Bh = n | 0, this.Bl = i | 0, this.Ch = o | 0, this.Cl = s | 0, this.Dh = c | 0, this.Dl = f | 0, this.Eh = d | 0, this.El = g | 0, this.Fh = w | 0, this.Fl = a | 0, this.Gh = u | 0, this.Gl = y | 0, this.Hh = m | 0, this.Hl = H | 0;
    }
    process(t, r) {
        for(let B = 0; B < 16; B++, r += 4)at[B] = t.getUint32(r), ut[B] = t.getUint32(r += 4);
        for(let B = 16; B < 80; B++){
            const T = at[B - 15] | 0, R = ut[B - 15] | 0, j = yt(T, R, 1) ^ yt(T, R, 8) ^ ve(T, R, 7), st = pt(T, R, 1) ^ pt(T, R, 8) ^ Be(T, R, 7), Z = at[B - 2] | 0, I = ut[B - 2] | 0, tt = yt(Z, I, 19) ^ _t(Z, I, 61) ^ ve(Z, I, 6), J = pt(Z, I, 19) ^ Rt(Z, I, 61) ^ Be(Z, I, 6), K = Ln(st, J, ut[B - 7], ut[B - 16]), b = kn(K, j, tt, at[B - 7], at[B - 16]);
            at[B] = b | 0, ut[B] = K | 0;
        }
        let { Ah: n, Al: i, Bh: o, Bl: s, Ch: c, Cl: f, Dh: d, Dl: g, Eh: w, El: a, Fh: u, Fl: y, Gh: m, Gl: H, Hh: _, Hl: G } = this;
        for(let B = 0; B < 80; B++){
            const T = yt(w, a, 14) ^ yt(w, a, 18) ^ _t(w, a, 41), R = pt(w, a, 14) ^ pt(w, a, 18) ^ Rt(w, a, 41), j = w & u ^ ~w & m, st = a & y ^ ~a & H, Z = Tn(G, R, st, jn[B], ut[B]), I = Zn(Z, _, T, j, $n[B], at[B]), tt = Z | 0, J = yt(n, i, 28) ^ _t(n, i, 34) ^ _t(n, i, 39), K = pt(n, i, 28) ^ Rt(n, i, 34) ^ Rt(n, i, 39), b = n & o ^ n & c ^ o & c, h = i & s ^ i & f ^ s & f;
            _ = m | 0, G = H | 0, m = u | 0, H = y | 0, u = w | 0, y = a | 0, ({ h: w, l: a } = nt(d | 0, g | 0, I | 0, tt | 0)), d = c | 0, g = f | 0, c = o | 0, f = s | 0, o = n | 0, s = i | 0;
            const l = On(tt, K, h);
            n = qn(l, I, J, b), i = l | 0;
        }
        ({ h: n, l: i } = nt(this.Ah | 0, this.Al | 0, n | 0, i | 0)), ({ h: o, l: s } = nt(this.Bh | 0, this.Bl | 0, o | 0, s | 0)), ({ h: c, l: f } = nt(this.Ch | 0, this.Cl | 0, c | 0, f | 0)), ({ h: d, l: g } = nt(this.Dh | 0, this.Dl | 0, d | 0, g | 0)), ({ h: w, l: a } = nt(this.Eh | 0, this.El | 0, w | 0, a | 0)), ({ h: u, l: y } = nt(this.Fh | 0, this.Fl | 0, u | 0, y | 0)), ({ h: m, l: H } = nt(this.Gh | 0, this.Gl | 0, m | 0, H | 0)), ({ h: _, l: G } = nt(this.Hh | 0, this.Hl | 0, _ | 0, G | 0)), this.set(n, i, o, s, c, f, d, g, w, a, u, y, m, H, _, G);
    }
    roundClean() {
        lt(at, ut);
    }
    destroy() {
        lt(this.buffer), this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
}
const de = /* @__PURE__ */ se(()=>new Mn()), Ae = /* @__PURE__ */ se(()=>new Dn());
class tn extends Le {
    constructor(t, r){
        super(), this.finished = !1, this.destroyed = !1, Ce(t);
        const n = oe(r);
        if (this.iHash = t.create(), typeof this.iHash.update != "function") throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen, this.outputLen = this.iHash.outputLen;
        const i = this.blockLen, o = new Uint8Array(i);
        o.set(n.length > i ? t.create().update(n).digest() : n);
        for(let s = 0; s < o.length; s++)o[s] ^= 54;
        this.iHash.update(o), this.oHash = t.create();
        for(let s = 0; s < o.length; s++)o[s] ^= 106;
        this.oHash.update(o), lt(o);
    }
    update(t) {
        return kt(this), this.iHash.update(t), this;
    }
    digestInto(t) {
        kt(this), z(t, this.outputLen), this.finished = !0, this.iHash.digestInto(t), this.oHash.update(t), this.oHash.digestInto(t), this.destroy();
    }
    digest() {
        const t = new Uint8Array(this.oHash.outputLen);
        return this.digestInto(t), t;
    }
    _cloneInto(t) {
        t || (t = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash: r, iHash: n, finished: i, destroyed: o, blockLen: s, outputLen: c } = this;
        return t = t, t.finished = i, t.destroyed = o, t.blockLen = s, t.outputLen = c, t.oHash = r._cloneInto(t.oHash), t.iHash = n._cloneInto(t.iHash), t;
    }
    clone() {
        return this._cloneInto();
    }
    destroy() {
        this.destroyed = !0, this.oHash.destroy(), this.iHash.destroy();
    }
}
const Zt = (e, t, r)=>new tn(e, t).update(r).digest();
Zt.create = (e, t)=>new tn(e, t);
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Bt = BigInt(0), bt = BigInt(1);
function Vt(e, t) {
    const r = t.negate();
    return e ? r : t;
}
function Dt(e, t) {
    const r = Xe(e.Fp, t.map((n)=>n.Z));
    return t.map((n, i)=>e.fromAffine(n.toAffine(r[i])));
}
function en(e, t) {
    if (!Number.isSafeInteger(e) || e <= 0 || e > t) throw new Error("invalid window size, expected [1.." + t + "], got W=" + e);
}
function Ft(e, t) {
    en(e, t);
    const r = Math.ceil(t / e) + 1, n = 2 ** (e - 1), i = 2 ** e, o = St(e), s = BigInt(e);
    return {
        windows: r,
        windowSize: n,
        mask: o,
        maxNumber: i,
        shiftBy: s
    };
}
function Se(e, t, r) {
    const { windowSize: n, mask: i, maxNumber: o, shiftBy: s } = r;
    let c = Number(e & i), f = e >> s;
    c > n && (c -= o, f += bt);
    const d = t * n, g = d + Math.abs(c) - 1, w = c === 0, a = c < 0, u = t % 2 !== 0;
    return {
        nextN: f,
        offset: g,
        isZero: w,
        isNeg: a,
        isNegF: u,
        offsetF: d
    };
}
function Fn(e, t) {
    if (!Array.isArray(e)) throw new Error("array expected");
    e.forEach((r, n)=>{
        if (!(r instanceof t)) throw new Error("invalid point at index " + n);
    });
}
function Yn(e, t) {
    if (!Array.isArray(e)) throw new Error("array of scalars expected");
    e.forEach((r, n)=>{
        if (!t.isValid(r)) throw new Error("invalid scalar at index " + n);
    });
}
const Yt = /* @__PURE__ */ new WeakMap(), nn = /* @__PURE__ */ new WeakMap();
function Gt(e) {
    return nn.get(e) || 1;
}
function Ie(e) {
    if (e !== Bt) throw new Error("invalid wNAF");
}
class Gn {
    // Parametrized with a given Point class (not individual point)
    constructor(t, r){
        this.BASE = t.BASE, this.ZERO = t.ZERO, this.Fn = t.Fn, this.bits = r;
    }
    // non-const time multiplication ladder
    _unsafeLadder(t, r, n = this.ZERO) {
        let i = t;
        for(; r > Bt;)r & bt && (n = n.add(i)), i = i.double(), r >>= bt;
        return n;
    }
    /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */ precomputeWindow(t, r) {
        const { windows: n, windowSize: i } = Ft(r, this.bits), o = [];
        let s = t, c = s;
        for(let f = 0; f < n; f++){
            c = s, o.push(c);
            for(let d = 1; d < i; d++)c = c.add(s), o.push(c);
            s = c.double();
        }
        return o;
    }
    /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */ wNAF(t, r, n) {
        if (!this.Fn.isValid(n)) throw new Error("invalid scalar");
        let i = this.ZERO, o = this.BASE;
        const s = Ft(t, this.bits);
        for(let c = 0; c < s.windows; c++){
            const { nextN: f, offset: d, isZero: g, isNeg: w, isNegF: a, offsetF: u } = Se(n, c, s);
            n = f, g ? o = o.add(Vt(a, r[u])) : i = i.add(Vt(w, r[d]));
        }
        return Ie(n), {
            p: i,
            f: o
        };
    }
    /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */ wNAFUnsafe(t, r, n, i = this.ZERO) {
        const o = Ft(t, this.bits);
        for(let s = 0; s < o.windows && n !== Bt; s++){
            const { nextN: c, offset: f, isZero: d, isNeg: g } = Se(n, s, o);
            if (n = c, !d) {
                const w = r[f];
                i = i.add(g ? w.negate() : w);
            }
        }
        return Ie(n), i;
    }
    getPrecomputes(t, r, n) {
        let i = Yt.get(r);
        return i || (i = this.precomputeWindow(r, t), t !== 1 && (typeof n == "function" && (i = n(i)), Yt.set(r, i))), i;
    }
    cached(t, r, n) {
        const i = Gt(t);
        return this.wNAF(i, this.getPrecomputes(i, t, n), r);
    }
    unsafe(t, r, n, i) {
        const o = Gt(t);
        return o === 1 ? this._unsafeLadder(t, r, i) : this.wNAFUnsafe(o, this.getPrecomputes(o, t, n), r, i);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(t, r) {
        en(r, this.bits), nn.set(t, r), Yt.delete(t);
    }
    hasCache(t) {
        return Gt(t) !== 1;
    }
}
function zn(e, t, r, n) {
    let i = t, o = e.ZERO, s = e.ZERO;
    for(; r > Bt || n > Bt;)r & bt && (o = o.add(i)), n & bt && (s = s.add(i)), i = i.double(), r >>= bt, n >>= bt;
    return {
        p1: o,
        p2: s
    };
}
function Xn(e, t, r, n) {
    Fn(r, e), Yn(n, t);
    const i = r.length, o = n.length;
    if (i !== o) throw new Error("arrays of points and scalars must have equal length");
    const s = e.ZERO, c = Me(BigInt(i));
    let f = 1;
    c > 12 ? f = c - 3 : c > 4 ? f = c - 2 : c > 0 && (f = 2);
    const d = St(f), g = new Array(Number(d) + 1).fill(s), w = Math.floor((t.BITS - 1) / f) * f;
    let a = s;
    for(let u = w; u >= 0; u -= f){
        g.fill(s);
        for(let m = 0; m < o; m++){
            const H = n[m], _ = Number(H >> BigInt(u) & d);
            g[_] = g[_].add(r[m]);
        }
        let y = s;
        for(let m = g.length - 1, H = s; m > 0; m--)H = H.add(g[m]), y = y.add(H);
        if (a = a.add(y), u !== 0) for(let m = 0; m < f; m++)a = a.double();
    }
    return a;
}
function He(e, t, r) {
    if (t) {
        if (t.ORDER !== e) throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
        return In(t), t;
    } else return It(e, {
        isLE: r
    });
}
function Pn(e, t, r = {}, n) {
    if (n === void 0 && (n = e === "edwards"), !t || typeof t != "object") throw new Error(`expected valid ${e} CURVE object`);
    for (const f of [
        "p",
        "n",
        "h"
    ]){
        const d = t[f];
        if (!(typeof d == "bigint" && d > Bt)) throw new Error(`CURVE.${f} must be positive bigint`);
    }
    const i = He(t.p, r.Fp, n), o = He(t.n, r.Fn, n), c = [
        "Gx",
        "Gy",
        "a",
        "b"
    ];
    for (const f of c)if (!i.isValid(t[f])) throw new Error(`CURVE.${f} must be valid field element of CURVE.Fp`);
    return t = Object.freeze(Object.assign({}, t)), {
        CURVE: t,
        Fp: i,
        Fn: o
    };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const Ue = (e, t)=>(e + (e >= 0 ? t : -t) / rn) / t;
function Wn(e, t, r) {
    const [[n, i], [o, s]] = t, c = Ue(s * e, r), f = Ue(-i * e, r);
    let d = e - c * n - f * o, g = -c * i - f * s;
    const w = d < ot, a = g < ot;
    w && (d = -d), a && (g = -g);
    const u = St(Math.ceil(Me(r) / 2)) + vt;
    if (d < ot || d >= u || g < ot || g >= u) throw new Error("splitScalar (endomorphism): failed, k=" + e);
    return {
        k1neg: w,
        k1: d,
        k2neg: a,
        k2: g
    };
}
function te(e) {
    if (![
        "compact",
        "recovered",
        "der"
    ].includes(e)) throw new Error('Signature format must be "compact", "recovered", or "der"');
    return e;
}
function zt(e, t) {
    const r = {};
    for (let n of Object.keys(t))r[n] = e[n] === void 0 ? t[n] : e[n];
    return Tt(r.lowS, "lowS"), Tt(r.prehash, "prehash"), r.format !== void 0 && te(r.format), r;
}
class Jn extends Error {
    constructor(t = ""){
        super(t);
    }
}
const it = {
    // asn.1 DER encoding utils
    Err: Jn,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
        encode: (e, t)=>{
            const { Err: r } = it;
            if (e < 0 || e > 256) throw new r("tlv.encode: wrong tag");
            if (t.length & 1) throw new r("tlv.encode: unpadded data");
            const n = t.length / 2, i = Kt(n);
            if (i.length / 2 & 128) throw new r("tlv.encode: long form length too big");
            const o = n > 127 ? Kt(i.length / 2 | 128) : "";
            return Kt(e) + o + i + t;
        },
        // v - value, l - left bytes (unparsed)
        decode (e, t) {
            const { Err: r } = it;
            let n = 0;
            if (e < 0 || e > 256) throw new r("tlv.encode: wrong tag");
            if (t.length < 2 || t[n++] !== e) throw new r("tlv.decode: wrong tlv");
            const i = t[n++], o = !!(i & 128);
            let s = 0;
            if (!o) s = i;
            else {
                const f = i & 127;
                if (!f) throw new r("tlv.decode(long): indefinite length not supported");
                if (f > 4) throw new r("tlv.decode(long): byte length is too big");
                const d = t.subarray(n, n + f);
                if (d.length !== f) throw new r("tlv.decode: length bytes not complete");
                if (d[0] === 0) throw new r("tlv.decode(long): zero leftmost byte");
                for (const g of d)s = s << 8 | g;
                if (n += f, s < 128) throw new r("tlv.decode(long): not minimal encoding");
            }
            const c = t.subarray(n, n + s);
            if (c.length !== s) throw new r("tlv.decode: wrong value length");
            return {
                v: c,
                l: t.subarray(n + s)
            };
        }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
        encode (e) {
            const { Err: t } = it;
            if (e < ot) throw new t("integer: negative integers are not allowed");
            let r = Kt(e);
            if (Number.parseInt(r[0], 16) & 8 && (r = "00" + r), r.length & 1) throw new t("unexpected DER parsing assertion: unpadded hex");
            return r;
        },
        decode (e) {
            const { Err: t } = it;
            if (e[0] & 128) throw new t("invalid signature integer: negative");
            if (e[0] === 0 && !(e[1] & 128)) throw new t("invalid signature integer: unnecessary leading zero");
            return $t(e);
        }
    },
    toSig (e) {
        const { Err: t, _int: r, _tlv: n } = it, i = F("signature", e), { v: o, l: s } = n.decode(48, i);
        if (s.length) throw new t("invalid signature: left bytes after parsing");
        const { v: c, l: f } = n.decode(2, o), { v: d, l: g } = n.decode(2, f);
        if (g.length) throw new t("invalid signature: left bytes after parsing");
        return {
            r: r.decode(c),
            s: r.decode(d)
        };
    },
    hexFromSig (e) {
        const { _tlv: t, _int: r } = it, n = t.encode(2, r.encode(e.r)), i = t.encode(2, r.encode(e.s)), o = n + i;
        return t.encode(48, o);
    }
}, ot = BigInt(0), vt = BigInt(1), rn = BigInt(2), Ct = BigInt(3), Qn = BigInt(4);
function xt(e, t) {
    const { BYTES: r } = e;
    let n;
    if (typeof t == "bigint") n = t;
    else {
        let i = F("private key", t);
        try {
            n = e.fromBytes(i);
        } catch  {
            throw new Error(`invalid private key: expected ui8a of size ${r}, got ${typeof t}`);
        }
    }
    if (!e.isValidNot0(n)) throw new Error("invalid private key: out of range [1..N-1]");
    return n;
}
function tr(e, t = {}) {
    const r = Pn("weierstrass", e, t), { Fp: n, Fn: i } = r;
    let o = r.CURVE;
    const { h: s, n: c } = o;
    ae(t, {}, {
        allowInfinityPoint: "boolean",
        clearCofactor: "function",
        isTorsionFree: "function",
        fromBytes: "function",
        toBytes: "function",
        endo: "object",
        wrapPrivateKey: "boolean"
    });
    const { endo: f } = t;
    if (f && (!n.is0(o.a) || typeof f.beta != "bigint" || !Array.isArray(f.basises))) throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    const d = sn(n, i);
    function g() {
        if (!n.isOdd) throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function w(K, b, h) {
        const { x: l, y: p } = b.toAffine(), x = n.toBytes(l);
        if (Tt(h, "isCompressed"), h) {
            g();
            const A = !n.isOdd(p);
            return W(on(A), x);
        } else return W(Uint8Array.of(4), x, n.toBytes(p));
    }
    function a(K) {
        dt(K, void 0, "Point");
        const { publicKey: b, publicKeyUncompressed: h } = d, l = K.length, p = K[0], x = K.subarray(1);
        if (l === b && (p === 2 || p === 3)) {
            const A = n.fromBytes(x);
            if (!n.isValid(A)) throw new Error("bad point: is not on curve, wrong x");
            const v = m(A);
            let E;
            try {
                E = n.sqrt(v);
            } catch (L) {
                const C = L instanceof Error ? ": " + L.message : "";
                throw new Error("bad point: is not on curve, sqrt error" + C);
            }
            g();
            const S = n.isOdd(E);
            return (p & 1) === 1 !== S && (E = n.neg(E)), {
                x: A,
                y: E
            };
        } else if (l === h && p === 4) {
            const A = n.BYTES, v = n.fromBytes(x.subarray(0, A)), E = n.fromBytes(x.subarray(A, A * 2));
            if (!H(v, E)) throw new Error("bad point: is not on curve");
            return {
                x: v,
                y: E
            };
        } else throw new Error(`bad point: got length ${l}, expected compressed=${b} or uncompressed=${h}`);
    }
    const u = t.toBytes || w, y = t.fromBytes || a;
    function m(K) {
        const b = n.sqr(K), h = n.mul(b, K);
        return n.add(n.add(h, n.mul(K, o.a)), o.b);
    }
    function H(K, b) {
        const h = n.sqr(b), l = m(K);
        return n.eql(h, l);
    }
    if (!H(o.Gx, o.Gy)) throw new Error("bad curve params: generator point");
    const _ = n.mul(n.pow(o.a, Ct), Qn), G = n.mul(n.sqr(o.b), BigInt(27));
    if (n.is0(n.add(_, G))) throw new Error("bad curve params: a or b");
    function B(K, b, h = !1) {
        if (!n.isValid(b) || h && n.is0(b)) throw new Error(`bad point coordinate ${K}`);
        return b;
    }
    function T(K) {
        if (!(K instanceof I)) throw new Error("ProjectivePoint expected");
    }
    function R(K) {
        if (!f || !f.basises) throw new Error("no endo");
        return Wn(K, f.basises, i.ORDER);
    }
    const j = pe((K, b)=>{
        const { X: h, Y: l, Z: p } = K;
        if (n.eql(p, n.ONE)) return {
            x: h,
            y: l
        };
        const x = K.is0();
        b == null && (b = x ? n.ONE : n.inv(p));
        const A = n.mul(h, b), v = n.mul(l, b), E = n.mul(p, b);
        if (x) return {
            x: n.ZERO,
            y: n.ZERO
        };
        if (!n.eql(E, n.ONE)) throw new Error("invZ was invalid");
        return {
            x: A,
            y: v
        };
    }), st = pe((K)=>{
        if (K.is0()) {
            if (t.allowInfinityPoint && !n.is0(K.Y)) return;
            throw new Error("bad point: ZERO");
        }
        const { x: b, y: h } = K.toAffine();
        if (!n.isValid(b) || !n.isValid(h)) throw new Error("bad point: x or y not field elements");
        if (!H(b, h)) throw new Error("bad point: equation left != right");
        if (!K.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
        return !0;
    });
    function Z(K, b, h, l, p) {
        return h = new I(n.mul(h.X, K), h.Y, h.Z), b = Vt(l, b), h = Vt(p, h), b.add(h);
    }
    class I {
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ constructor(b, h, l){
            this.X = B("x", b), this.Y = B("y", h, !0), this.Z = B("z", l), Object.freeze(this);
        }
        static CURVE() {
            return o;
        }
        /** Does NOT validate if the point is valid. Use `.assertValidity()`. */ static fromAffine(b) {
            const { x: h, y: l } = b || {};
            if (!b || !n.isValid(h) || !n.isValid(l)) throw new Error("invalid affine point");
            if (b instanceof I) throw new Error("projective point not allowed");
            return n.is0(h) && n.is0(l) ? I.ZERO : new I(h, l, n.ONE);
        }
        static fromBytes(b) {
            const h = I.fromAffine(y(dt(b, void 0, "point")));
            return h.assertValidity(), h;
        }
        static fromHex(b) {
            return I.fromBytes(F("pointHex", b));
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */ precompute(b = 8, h = !0) {
            return J.createCache(this, b), h || this.multiply(Ct), this;
        }
        // TODO: return `this`
        /** A point on curve is valid if it conforms to equation. */ assertValidity() {
            st(this);
        }
        hasEvenY() {
            const { y: b } = this.toAffine();
            if (!n.isOdd) throw new Error("Field doesn't support isOdd");
            return !n.isOdd(b);
        }
        /** Compare one point to another. */ equals(b) {
            T(b);
            const { X: h, Y: l, Z: p } = this, { X: x, Y: A, Z: v } = b, E = n.eql(n.mul(h, v), n.mul(x, p)), S = n.eql(n.mul(l, v), n.mul(A, p));
            return E && S;
        }
        /** Flips point to one corresponding to (x, -y) in Affine coordinates. */ negate() {
            return new I(this.X, n.neg(this.Y), this.Z);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
            const { a: b, b: h } = o, l = n.mul(h, Ct), { X: p, Y: x, Z: A } = this;
            let v = n.ZERO, E = n.ZERO, S = n.ZERO, U = n.mul(p, p), L = n.mul(x, x), C = n.mul(A, A), N = n.mul(p, x);
            return N = n.add(N, N), S = n.mul(p, A), S = n.add(S, S), v = n.mul(b, S), E = n.mul(l, C), E = n.add(v, E), v = n.sub(L, E), E = n.add(L, E), E = n.mul(v, E), v = n.mul(N, v), S = n.mul(l, S), C = n.mul(b, C), N = n.sub(U, C), N = n.mul(b, N), N = n.add(N, S), S = n.add(U, U), U = n.add(S, U), U = n.add(U, C), U = n.mul(U, N), E = n.add(E, U), C = n.mul(x, A), C = n.add(C, C), U = n.mul(C, N), v = n.sub(v, U), S = n.mul(C, L), S = n.add(S, S), S = n.add(S, S), new I(v, E, S);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(b) {
            T(b);
            const { X: h, Y: l, Z: p } = this, { X: x, Y: A, Z: v } = b;
            let E = n.ZERO, S = n.ZERO, U = n.ZERO;
            const L = o.a, C = n.mul(o.b, Ct);
            let N = n.mul(h, x), O = n.mul(l, A), k = n.mul(p, v), D = n.add(h, l), q = n.add(x, A);
            D = n.mul(D, q), q = n.add(N, O), D = n.sub(D, q), q = n.add(h, p);
            let V = n.add(x, v);
            return q = n.mul(q, V), V = n.add(N, k), q = n.sub(q, V), V = n.add(l, p), E = n.add(A, v), V = n.mul(V, E), E = n.add(O, k), V = n.sub(V, E), U = n.mul(L, q), E = n.mul(C, k), U = n.add(E, U), E = n.sub(O, U), U = n.add(O, U), S = n.mul(E, U), O = n.add(N, N), O = n.add(O, N), k = n.mul(L, k), q = n.mul(C, q), O = n.add(O, k), k = n.sub(N, k), k = n.mul(L, k), q = n.add(q, k), N = n.mul(O, q), S = n.add(S, N), N = n.mul(V, q), E = n.mul(D, E), E = n.sub(E, N), N = n.mul(D, O), U = n.mul(V, U), U = n.add(U, N), new I(E, S, U);
        }
        subtract(b) {
            return this.add(b.negate());
        }
        is0() {
            return this.equals(I.ZERO);
        }
        /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */ multiply(b) {
            const { endo: h } = t;
            if (!i.isValidNot0(b)) throw new Error("invalid scalar: out of range");
            let l, p;
            const x = (A)=>J.cached(this, A, (v)=>Dt(I, v));
            if (h) {
                const { k1neg: A, k1: v, k2neg: E, k2: S } = R(b), { p: U, f: L } = x(v), { p: C, f: N } = x(S);
                p = L.add(N), l = Z(h.beta, U, C, A, E);
            } else {
                const { p: A, f: v } = x(b);
                l = A, p = v;
            }
            return Dt(I, [
                l,
                p
            ])[0];
        }
        /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */ multiplyUnsafe(b) {
            const { endo: h } = t, l = this;
            if (!i.isValid(b)) throw new Error("invalid scalar: out of range");
            if (b === ot || l.is0()) return I.ZERO;
            if (b === vt) return l;
            if (J.hasCache(this)) return this.multiply(b);
            if (h) {
                const { k1neg: p, k1: x, k2neg: A, k2: v } = R(b), { p1: E, p2: S } = zn(I, l, x, v);
                return Z(h.beta, E, S, p, A);
            } else return J.unsafe(l, b);
        }
        multiplyAndAddUnsafe(b, h, l) {
            const p = this.multiplyUnsafe(h).add(b.multiplyUnsafe(l));
            return p.is0() ? void 0 : p;
        }
        /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */ toAffine(b) {
            return j(this, b);
        }
        /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */ isTorsionFree() {
            const { isTorsionFree: b } = t;
            return s === vt ? !0 : b ? b(I, this) : J.unsafe(this, c).is0();
        }
        clearCofactor() {
            const { clearCofactor: b } = t;
            return s === vt ? this : b ? b(I, this) : this.multiplyUnsafe(s);
        }
        isSmallOrder() {
            return this.multiplyUnsafe(s).is0();
        }
        toBytes(b = !0) {
            return Tt(b, "isCompressed"), this.assertValidity(), u(I, this, b);
        }
        toHex(b = !0) {
            return wt(this.toBytes(b));
        }
        toString() {
            return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
        }
        // TODO: remove
        get px() {
            return this.X;
        }
        get py() {
            return this.X;
        }
        get pz() {
            return this.Z;
        }
        toRawBytes(b = !0) {
            return this.toBytes(b);
        }
        _setWindowSize(b) {
            this.precompute(b);
        }
        static normalizeZ(b) {
            return Dt(I, b);
        }
        static msm(b, h) {
            return Xn(I, i, b, h);
        }
        static fromPrivateKey(b) {
            return I.BASE.multiply(xt(i, b));
        }
    }
    I.BASE = new I(o.Gx, o.Gy, n.ONE), I.ZERO = new I(n.ZERO, n.ONE, n.ZERO), I.Fp = n, I.Fn = i;
    const tt = i.BITS, J = new Gn(I, t.endo ? Math.ceil(tt / 2) : tt);
    return I.BASE.precompute(8), I;
}
function on(e) {
    return Uint8Array.of(e ? 2 : 3);
}
function sn(e, t) {
    return {
        secretKey: t.BYTES,
        publicKey: 1 + e.BYTES,
        publicKeyUncompressed: 1 + 2 * e.BYTES,
        publicKeyHasPrefix: !0,
        signature: 2 * t.BYTES
    };
}
function er(e, t = {}) {
    const { Fn: r } = e, n = t.randomBytes || ke, i = Object.assign(sn(e.Fp, r), {
        seed: Je(r.ORDER)
    });
    function o(u) {
        try {
            return !!xt(r, u);
        } catch  {
            return !1;
        }
    }
    function s(u, y) {
        const { publicKey: m, publicKeyUncompressed: H } = i;
        try {
            const _ = u.length;
            return y === !0 && _ !== m || y === !1 && _ !== H ? !1 : !!e.fromBytes(u);
        } catch  {
            return !1;
        }
    }
    function c(u = n(i.seed)) {
        return Un(dt(u, i.seed, "seed"), r.ORDER);
    }
    function f(u, y = !0) {
        return e.BASE.multiply(xt(r, u)).toBytes(y);
    }
    function d(u) {
        const y = c(u);
        return {
            secretKey: y,
            publicKey: f(y)
        };
    }
    function g(u) {
        if (typeof u == "bigint") return !1;
        if (u instanceof e) return !0;
        const { secretKey: y, publicKey: m, publicKeyUncompressed: H } = i;
        if (r.allowedLengths || y === m) return;
        const _ = F("key", u).length;
        return _ === m || _ === H;
    }
    function w(u, y, m = !0) {
        if (g(u) === !0) throw new Error("first arg must be private key");
        if (g(y) === !1) throw new Error("second arg must be public key");
        const H = xt(r, u);
        return e.fromHex(y).multiply(H).toBytes(m);
    }
    return Object.freeze({
        getPublicKey: f,
        getSharedSecret: w,
        keygen: d,
        Point: e,
        utils: {
            isValidSecretKey: o,
            isValidPublicKey: s,
            randomSecretKey: c,
            // TODO: remove
            isValidPrivateKey: o,
            randomPrivateKey: c,
            normPrivateKeyToScalar: (u)=>xt(r, u),
            precompute (u = 8, y = e.BASE) {
                return y.precompute(u, !1);
            }
        },
        lengths: i
    });
}
function nr(e, t, r = {}) {
    Ce(t), ae(r, {}, {
        hmac: "function",
        lowS: "boolean",
        randomBytes: "function",
        bits2int: "function",
        bits2int_modN: "function"
    });
    const n = r.randomBytes || ke, i = r.hmac || ((h, ...l)=>Zt(t, h, W(...l))), { Fp: o, Fn: s } = e, { ORDER: c, BITS: f } = s, { keygen: d, getPublicKey: g, getSharedSecret: w, utils: a, lengths: u } = er(e, r), y = {
        prehash: !1,
        lowS: typeof r.lowS == "boolean" ? r.lowS : !1,
        format: void 0,
        //'compact' as ECDSASigFormat,
        extraEntropy: !1
    }, m = "compact";
    function H(h) {
        const l = c >> vt;
        return h > l;
    }
    function _(h, l) {
        if (!s.isValidNot0(l)) throw new Error(`invalid signature ${h}: out of range 1..Point.Fn.ORDER`);
        return l;
    }
    function G(h, l) {
        te(l);
        const p = u.signature, x = l === "compact" ? p : l === "recovered" ? p + 1 : void 0;
        return dt(h, x, `${l} signature`);
    }
    class B {
        constructor(l, p, x){
            this.r = _("r", l), this.s = _("s", p), x != null && (this.recovery = x), Object.freeze(this);
        }
        static fromBytes(l, p = m) {
            G(l, p);
            let x;
            if (p === "der") {
                const { r: S, s: U } = it.toSig(dt(l));
                return new B(S, U);
            }
            p === "recovered" && (x = l[0], p = "compact", l = l.subarray(1));
            const A = s.BYTES, v = l.subarray(0, A), E = l.subarray(A, A * 2);
            return new B(s.fromBytes(v), s.fromBytes(E), x);
        }
        static fromHex(l, p) {
            return this.fromBytes(At(l), p);
        }
        addRecoveryBit(l) {
            return new B(this.r, this.s, l);
        }
        recoverPublicKey(l) {
            const p = o.ORDER, { r: x, s: A, recovery: v } = this;
            if (v == null || ![
                0,
                1,
                2,
                3
            ].includes(v)) throw new Error("recovery id invalid");
            if (c * rn < p && v > 1) throw new Error("recovery id is ambiguous for h>1 curve");
            const S = v === 2 || v === 3 ? x + c : x;
            if (!o.isValid(S)) throw new Error("recovery id 2 or 3 invalid");
            const U = o.toBytes(S), L = e.fromBytes(W(on((v & 1) === 0), U)), C = s.inv(S), N = R(F("msgHash", l)), O = s.create(-N * C), k = s.create(A * C), D = e.BASE.multiplyUnsafe(O).add(L.multiplyUnsafe(k));
            if (D.is0()) throw new Error("point at infinify");
            return D.assertValidity(), D;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
            return H(this.s);
        }
        toBytes(l = m) {
            if (te(l), l === "der") return At(it.hexFromSig(this));
            const p = s.toBytes(this.r), x = s.toBytes(this.s);
            if (l === "recovered") {
                if (this.recovery == null) throw new Error("recovery bit must be present");
                return W(Uint8Array.of(this.recovery), p, x);
            }
            return W(p, x);
        }
        toHex(l) {
            return wt(this.toBytes(l));
        }
        // TODO: remove
        assertValidity() {}
        static fromCompact(l) {
            return B.fromBytes(F("sig", l), "compact");
        }
        static fromDER(l) {
            return B.fromBytes(F("sig", l), "der");
        }
        normalizeS() {
            return this.hasHighS() ? new B(this.r, s.neg(this.s), this.recovery) : this;
        }
        toDERRawBytes() {
            return this.toBytes("der");
        }
        toDERHex() {
            return wt(this.toBytes("der"));
        }
        toCompactRawBytes() {
            return this.toBytes("compact");
        }
        toCompactHex() {
            return wt(this.toBytes("compact"));
        }
    }
    const T = r.bits2int || function(l) {
        if (l.length > 8192) throw new Error("input is too large");
        const p = $t(l), x = l.length * 8 - f;
        return x > 0 ? p >> BigInt(x) : p;
    }, R = r.bits2int_modN || function(l) {
        return s.create(T(l));
    }, j = St(f);
    function st(h) {
        return pn("num < 2^" + f, h, ot, j), s.toBytes(h);
    }
    function Z(h, l) {
        return dt(h, void 0, "message"), l ? dt(t(h), void 0, "prehashed message") : h;
    }
    function I(h, l, p) {
        if ([
            "recovered",
            "canonical"
        ].some((O)=>O in p)) throw new Error("sign() legacy options not supported");
        const { lowS: x, prehash: A, extraEntropy: v } = zt(p, y);
        h = Z(h, A);
        const E = R(h), S = xt(s, l), U = [
            st(S),
            st(E)
        ];
        if (v != null && v !== !1) {
            const O = v === !0 ? n(u.secretKey) : v;
            U.push(F("extraEntropy", O));
        }
        const L = W(...U), C = E;
        function N(O) {
            const k = T(O);
            if (!s.isValidNot0(k)) return;
            const D = s.inv(k), q = e.BASE.multiply(k).toAffine(), V = s.create(q.x);
            if (V === ot) return;
            const Ht = s.create(D * s.create(C + V * S));
            if (Ht === ot) return;
            let we = (q.x === V ? 0 : 2) | Number(q.y & vt), ge = Ht;
            return x && H(Ht) && (ge = s.neg(Ht), we ^= 1), new B(V, ge, we);
        }
        return {
            seed: L,
            k2sig: N
        };
    }
    function tt(h, l, p = {}) {
        h = F("message", h);
        const { seed: x, k2sig: A } = I(h, l, p);
        return mn(t.outputLen, s.BYTES, i)(x, A);
    }
    function J(h) {
        let l;
        const p = typeof h == "string" || Mt(h), x = !p && h !== null && typeof h == "object" && typeof h.r == "bigint" && typeof h.s == "bigint";
        if (!p && !x) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
        if (x) l = new B(h.r, h.s);
        else if (p) {
            try {
                l = B.fromBytes(F("sig", h), "der");
            } catch (A) {
                if (!(A instanceof it.Err)) throw A;
            }
            if (!l) try {
                l = B.fromBytes(F("sig", h), "compact");
            } catch  {
                return !1;
            }
        }
        return l || !1;
    }
    function K(h, l, p, x = {}) {
        const { lowS: A, prehash: v, format: E } = zt(x, y);
        if (p = F("publicKey", p), l = Z(F("message", l), v), "strict" in x) throw new Error("options.strict was renamed to lowS");
        const S = E === void 0 ? J(h) : B.fromBytes(F("sig", h), E);
        if (S === !1) return !1;
        try {
            const U = e.fromBytes(p);
            if (A && S.hasHighS()) return !1;
            const { r: L, s: C } = S, N = R(l), O = s.inv(C), k = s.create(N * O), D = s.create(L * O), q = e.BASE.multiplyUnsafe(k).add(U.multiplyUnsafe(D));
            return q.is0() ? !1 : s.create(q.x) === L;
        } catch  {
            return !1;
        }
    }
    function b(h, l, p = {}) {
        const { prehash: x } = zt(p, y);
        return l = Z(l, x), B.fromBytes(h, "recovered").recoverPublicKey(l).toBytes();
    }
    return Object.freeze({
        keygen: d,
        getPublicKey: g,
        getSharedSecret: w,
        utils: a,
        lengths: u,
        Point: e,
        sign: tt,
        verify: K,
        recoverPublicKey: b,
        Signature: B,
        hash: t
    });
}
function rr(e) {
    const t = {
        a: e.a,
        b: e.b,
        p: e.Fp.ORDER,
        n: e.n,
        h: e.h,
        Gx: e.Gx,
        Gy: e.Gy
    }, r = e.Fp;
    let n = e.allowedPrivateKeyLengths ? Array.from(new Set(e.allowedPrivateKeyLengths.map((s)=>Math.ceil(s / 2)))) : void 0;
    const i = It(t.n, {
        BITS: e.nBitLength,
        allowedLengths: n,
        modFromBytes: e.wrapPrivateKey
    }), o = {
        Fp: r,
        Fn: i,
        allowInfinityPoint: e.allowInfinityPoint,
        endo: e.endo,
        isTorsionFree: e.isTorsionFree,
        clearCofactor: e.clearCofactor,
        fromBytes: e.fromBytes,
        toBytes: e.toBytes
    };
    return {
        CURVE: t,
        curveOpts: o
    };
}
function ir(e) {
    const { CURVE: t, curveOpts: r } = rr(e), n = {
        hmac: e.hmac,
        randomBytes: e.randomBytes,
        lowS: e.lowS,
        bits2int: e.bits2int,
        bits2int_modN: e.bits2int_modN
    };
    return {
        CURVE: t,
        curveOpts: r,
        hash: e.hash,
        ecdsaOpts: n
    };
}
function or(e, t) {
    const r = t.Point;
    return Object.assign({}, t, {
        ProjectivePoint: r,
        CURVE: Object.assign({}, e, Pe(r.Fn.ORDER, r.Fn.BITS))
    });
}
function sr(e) {
    const { CURVE: t, curveOpts: r, hash: n, ecdsaOpts: i } = ir(e), o = tr(t, r), s = nr(o, n, i);
    return or(e, s);
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function cr(e, t) {
    const r = (n)=>sr({
            ...e,
            hash: n
        });
    return {
        ...r(t),
        create: r
    };
}
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */ const he = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
}, fr = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
        [
            BigInt("0x3086d221a7d46bcde86c90e49284eb15"),
            -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")
        ],
        [
            BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"),
            BigInt("0x3086d221a7d46bcde86c90e49284eb15")
        ]
    ]
}, Ke = /* @__PURE__ */ BigInt(2);
function ar(e) {
    const t = he.p, r = BigInt(3), n = BigInt(6), i = BigInt(11), o = BigInt(22), s = BigInt(23), c = BigInt(44), f = BigInt(88), d = e * e * e % t, g = d * d * e % t, w = X(g, r, t) * g % t, a = X(w, r, t) * g % t, u = X(a, Ke, t) * d % t, y = X(u, i, t) * u % t, m = X(y, o, t) * y % t, H = X(m, c, t) * m % t, _ = X(H, f, t) * H % t, G = X(_, c, t) * m % t, B = X(G, r, t) * g % t, T = X(B, s, t) * y % t, R = X(T, n, t) * d % t, j = X(R, Ke, t);
    if (!ee.eql(ee.sqr(j), e)) throw new Error("Cannot find square root");
    return j;
}
const ee = It(he.p, {
    sqrt: ar
}), rt = cr({
    ...he,
    Fp: ee,
    lowS: !0,
    endo: fr
}, de), ur = /* @__PURE__ */ Uint8Array.from([
    7,
    4,
    13,
    1,
    10,
    6,
    15,
    3,
    12,
    0,
    9,
    5,
    2,
    14,
    11,
    8
]), cn = Uint8Array.from(new Array(16).fill(0).map((e, t)=>t)), lr = cn.map((e)=>(9 * e + 5) % 16), fn = /* @__PURE__ */ (()=>{
    const r = [
        [
            cn
        ],
        [
            lr
        ]
    ];
    for(let n = 0; n < 4; n++)for (let i of r)i.push(i[n].map((o)=>ur[o]));
    return r;
})(), an = fn[0], un = fn[1], ln = /* @__PURE__ */ [
    [
        11,
        14,
        15,
        12,
        5,
        8,
        7,
        9,
        11,
        13,
        14,
        15,
        6,
        7,
        9,
        8
    ],
    [
        12,
        13,
        11,
        15,
        6,
        9,
        9,
        7,
        12,
        15,
        11,
        13,
        7,
        8,
        7,
        7
    ],
    [
        13,
        15,
        14,
        11,
        7,
        7,
        6,
        8,
        13,
        14,
        13,
        12,
        5,
        5,
        6,
        9
    ],
    [
        14,
        11,
        12,
        14,
        8,
        6,
        5,
        5,
        15,
        12,
        15,
        14,
        9,
        9,
        8,
        6
    ],
    [
        15,
        12,
        13,
        13,
        9,
        5,
        8,
        6,
        14,
        11,
        12,
        11,
        8,
        6,
        5,
        5
    ]
].map((e)=>Uint8Array.from(e)), dr = /* @__PURE__ */ an.map((e, t)=>e.map((r)=>ln[t][r])), hr = /* @__PURE__ */ un.map((e, t)=>e.map((r)=>ln[t][r])), br = /* @__PURE__ */ Uint32Array.from([
    0,
    1518500249,
    1859775393,
    2400959708,
    2840853838
]), wr = /* @__PURE__ */ Uint32Array.from([
    1352829926,
    1548603684,
    1836072691,
    2053994217,
    0
]);
function Ne(e, t, r, n) {
    return e === 0 ? t ^ r ^ n : e === 1 ? t & r | ~t & n : e === 2 ? (t | ~r) ^ n : e === 3 ? t & n | r & ~n : t ^ (r | ~n);
}
const Ot = /* @__PURE__ */ new Uint32Array(16);
class gr extends le {
    constructor(){
        super(64, 20, 8, !0), this.h0 = 1732584193, this.h1 = -271733879, this.h2 = -1732584194, this.h3 = 271733878, this.h4 = -1009589776;
    }
    get() {
        const { h0: t, h1: r, h2: n, h3: i, h4: o } = this;
        return [
            t,
            r,
            n,
            i,
            o
        ];
    }
    set(t, r, n, i, o) {
        this.h0 = t | 0, this.h1 = r | 0, this.h2 = n | 0, this.h3 = i | 0, this.h4 = o | 0;
    }
    process(t, r) {
        for(let u = 0; u < 16; u++, r += 4)Ot[u] = t.getUint32(r, !0);
        let n = this.h0 | 0, i = n, o = this.h1 | 0, s = o, c = this.h2 | 0, f = c, d = this.h3 | 0, g = d, w = this.h4 | 0, a = w;
        for(let u = 0; u < 5; u++){
            const y = 4 - u, m = br[u], H = wr[u], _ = an[u], G = un[u], B = dr[u], T = hr[u];
            for(let R = 0; R < 16; R++){
                const j = Ut(n + Ne(u, o, c, d) + Ot[_[R]] + m, B[R]) + w | 0;
                n = w, w = d, d = Ut(c, 10) | 0, c = o, o = j;
            }
            for(let R = 0; R < 16; R++){
                const j = Ut(i + Ne(y, s, f, g) + Ot[G[R]] + H, T[R]) + a | 0;
                i = a, a = g, g = Ut(f, 10) | 0, f = s, s = j;
            }
        }
        this.set(this.h1 + c + g | 0, this.h2 + d + a | 0, this.h3 + w + i | 0, this.h4 + n + s | 0, this.h0 + o + f | 0);
    }
    roundClean() {
        lt(Ot);
    }
    destroy() {
        this.destroyed = !0, lt(this.buffer), this.set(0, 0, 0, 0, 0);
    }
}
const yr = /* @__PURE__ */ se(()=>new gr());
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */ function ne(e) {
    return e instanceof Uint8Array || ArrayBuffer.isView(e) && e.constructor.name === "Uint8Array";
}
function dn(e, t) {
    return Array.isArray(t) ? t.length === 0 ? !0 : e ? t.every((r)=>typeof r == "string") : t.every((r)=>Number.isSafeInteger(r)) : !1;
}
function pr(e) {
    if (typeof e != "function") throw new Error("function expected");
    return !0;
}
function re(e, t) {
    if (typeof t != "string") throw new Error(`${e}: string expected`);
    return !0;
}
function be(e) {
    if (!Number.isSafeInteger(e)) throw new Error(`invalid integer: ${e}`);
}
function ie(e) {
    if (!Array.isArray(e)) throw new Error("array expected");
}
function hn(e, t) {
    if (!dn(!0, t)) throw new Error(`${e}: array of strings expected`);
}
function mr(e, t) {
    if (!dn(!1, t)) throw new Error(`${e}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function bn(...e) {
    const t = (o)=>o, r = (o, s)=>(c)=>o(s(c)), n = e.map((o)=>o.encode).reduceRight(r, t), i = e.map((o)=>o.decode).reduce(r, t);
    return {
        encode: n,
        decode: i
    };
}
// @__NO_SIDE_EFFECTS__
function xr(e) {
    const t = typeof e == "string" ? e.split("") : e, r = t.length;
    hn("alphabet", t);
    const n = new Map(t.map((i, o)=>[
            i,
            o
        ]));
    return {
        encode: (i)=>(ie(i), i.map((o)=>{
                if (!Number.isSafeInteger(o) || o < 0 || o >= r) throw new Error(`alphabet.encode: digit index outside alphabet "${o}". Allowed: ${e}`);
                return t[o];
            })),
        decode: (i)=>(ie(i), i.map((o)=>{
                re("alphabet.decode", o);
                const s = n.get(o);
                if (s === void 0) throw new Error(`Unknown letter: "${o}". Allowed: ${e}`);
                return s;
            }))
    };
}
// @__NO_SIDE_EFFECTS__
function Er(e = "") {
    return re("join", e), {
        encode: (t)=>(hn("join.decode", t), t.join(e)),
        decode: (t)=>(re("join.decode", t), t.split(e))
    };
}
function _e(e, t, r) {
    if (t < 2) throw new Error(`convertRadix: invalid from=${t}, base cannot be less than 2`);
    if (r < 2) throw new Error(`convertRadix: invalid to=${r}, base cannot be less than 2`);
    if (ie(e), !e.length) return [];
    let n = 0;
    const i = [], o = Array.from(e, (c)=>{
        if (be(c), c < 0 || c >= t) throw new Error(`invalid integer: ${c}`);
        return c;
    }), s = o.length;
    for(;;){
        let c = 0, f = !0;
        for(let d = n; d < s; d++){
            const g = o[d], w = t * c, a = w + g;
            if (!Number.isSafeInteger(a) || w / t !== c || a - g !== w) throw new Error("convertRadix: carry overflow");
            const u = a / r;
            c = a % r;
            const y = Math.floor(u);
            if (o[d] = y, !Number.isSafeInteger(y) || y * r + c !== a) throw new Error("convertRadix: carry overflow");
            if (f) y ? f = !1 : n = d;
            else continue;
        }
        if (i.push(c), f) break;
    }
    for(let c = 0; c < e.length - 1 && e[c] === 0; c++)i.push(0);
    return i.reverse();
}
// @__NO_SIDE_EFFECTS__
function vr(e) {
    be(e);
    const t = 2 ** 8;
    return {
        encode: (r)=>{
            if (!ne(r)) throw new Error("radix.encode input should be Uint8Array");
            return _e(Array.from(r), t, e);
        },
        decode: (r)=>(mr("radix.decode", r), Uint8Array.from(_e(r, e, t)))
    };
}
function Br(e, t) {
    return be(e), pr(t), {
        encode (r) {
            if (!ne(r)) throw new Error("checksum.encode: input should be Uint8Array");
            const n = t(r).slice(0, e), i = new Uint8Array(r.length + e);
            return i.set(r), i.set(n, r.length), i;
        },
        decode (r) {
            if (!ne(r)) throw new Error("checksum.decode: input should be Uint8Array");
            const n = r.slice(0, -e), i = r.slice(-e), o = t(n).slice(0, e);
            for(let s = 0; s < e; s++)if (o[s] !== i[s]) throw new Error("Invalid checksum");
            return n;
        }
    };
}
const Ar = /* @__NO_SIDE_EFFECTS__ */ (e)=>/* @__PURE__ */ bn(/* @__PURE__ */ vr(58), /* @__PURE__ */ xr(e), /* @__PURE__ */ Er("")), Sr = /* @__PURE__ */ Ar("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"), Ir = (e)=>/* @__PURE__ */ bn(Br(4, (t)=>e(e(t))), Sr);
/*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */ const qt = rt.ProjectivePoint, Xt = Ir(de);
function Re(e) {
    z(e);
    const t = e.length === 0 ? "0" : wt(e);
    return BigInt("0x" + t);
}
function Hr(e) {
    if (typeof e != "bigint") throw new Error("bigint expected");
    return At(e.toString(16).padStart(64, "0"));
}
const Ur = qe("Bitcoin seed"), Pt = {
    private: 76066276,
    public: 76067358
}, Wt = 2147483648, Kr = (e)=>yr(de(e)), Nr = (e)=>Et(e).getUint32(0, !1), Lt = (e)=>{
    if (!Number.isSafeInteger(e) || e < 0 || e > 2 ** 32 - 1) throw new Error("invalid number, should be from 0 to 2**32-1, got " + e);
    const t = new Uint8Array(4);
    return Et(t).setUint32(0, e, !1), t;
};
class mt {
    get fingerprint() {
        if (!this.pubHash) throw new Error("No publicKey set!");
        return Nr(this.pubHash);
    }
    get identifier() {
        return this.pubHash;
    }
    get pubKeyHash() {
        return this.pubHash;
    }
    get privateKey() {
        return this.privKeyBytes || null;
    }
    get publicKey() {
        return this.pubKey || null;
    }
    get privateExtendedKey() {
        const t = this.privateKey;
        if (!t) throw new Error("No private key");
        return Xt.encode(this.serialize(this.versions.private, W(new Uint8Array([
            0
        ]), t)));
    }
    get publicExtendedKey() {
        if (!this.pubKey) throw new Error("No public key");
        return Xt.encode(this.serialize(this.versions.public, this.pubKey));
    }
    static fromMasterSeed(t, r = Pt) {
        if (z(t), 8 * t.length < 128 || 8 * t.length > 512) throw new Error("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + t.length);
        const n = Zt(Ae, Ur, t);
        return new mt({
            versions: r,
            chainCode: n.slice(32),
            privateKey: n.slice(0, 32)
        });
    }
    static fromExtendedKey(t, r = Pt) {
        const n = Xt.decode(t), i = Et(n), o = i.getUint32(0, !1), s = {
            versions: r,
            depth: n[4],
            parentFingerprint: i.getUint32(5, !1),
            index: i.getUint32(9, !1),
            chainCode: n.slice(13, 45)
        }, c = n.slice(45), f = c[0] === 0;
        if (o !== r[f ? "private" : "public"]) throw new Error("Version mismatch");
        return f ? new mt({
            ...s,
            privateKey: c.slice(1)
        }) : new mt({
            ...s,
            publicKey: c
        });
    }
    static fromJSON(t) {
        return mt.fromExtendedKey(t.xpriv);
    }
    constructor(t){
        if (this.depth = 0, this.index = 0, this.chainCode = null, this.parentFingerprint = 0, !t || typeof t != "object") throw new Error("HDKey.constructor must not be called directly");
        if (this.versions = t.versions || Pt, this.depth = t.depth || 0, this.chainCode = t.chainCode || null, this.index = t.index || 0, this.parentFingerprint = t.parentFingerprint || 0, !this.depth && (this.parentFingerprint || this.index)) throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
        if (t.publicKey && t.privateKey) throw new Error("HDKey: publicKey and privateKey at same time.");
        if (t.privateKey) {
            if (!rt.utils.isValidPrivateKey(t.privateKey)) throw new Error("Invalid private key");
            this.privKey = typeof t.privateKey == "bigint" ? t.privateKey : Re(t.privateKey), this.privKeyBytes = Hr(this.privKey), this.pubKey = rt.getPublicKey(t.privateKey, !0);
        } else if (t.publicKey) this.pubKey = qt.fromHex(t.publicKey).toRawBytes(!0);
        else throw new Error("HDKey: no public or private key provided");
        this.pubHash = Kr(this.pubKey);
    }
    derive(t) {
        if (!/^[mM]'?/.test(t)) throw new Error('Path must start with "m" or "M"');
        if (/^[mM]'?$/.test(t)) return this;
        const r = t.replace(/^[mM]'?\//, "").split("/");
        let n = this;
        for (const i of r){
            const o = /^(\d+)('?)$/.exec(i), s = o && o[1];
            if (!o || o.length !== 3 || typeof s != "string") throw new Error("invalid child index: " + i);
            let c = +s;
            if (!Number.isSafeInteger(c) || c >= Wt) throw new Error("Invalid index");
            o[2] === "'" && (c += Wt), n = n.deriveChild(c);
        }
        return n;
    }
    deriveChild(t) {
        if (!this.pubKey || !this.chainCode) throw new Error("No publicKey or chainCode set");
        let r = Lt(t);
        if (t >= Wt) {
            const c = this.privateKey;
            if (!c) throw new Error("Could not derive hardened child key");
            r = W(new Uint8Array([
                0
            ]), c, r);
        } else r = W(this.pubKey, r);
        const n = Zt(Ae, this.chainCode, r), i = Re(n.slice(0, 32)), o = n.slice(32);
        if (!rt.utils.isValidPrivateKey(i)) throw new Error("Tweak bigger than curve order");
        const s = {
            versions: this.versions,
            chainCode: o,
            depth: this.depth + 1,
            parentFingerprint: this.fingerprint,
            index: t
        };
        try {
            if (this.privateKey) {
                const c = P(this.privKey + i, rt.CURVE.n);
                if (!rt.utils.isValidPrivateKey(c)) throw new Error("The tweak was out of range or the resulted private key is invalid");
                s.privateKey = c;
            } else {
                const c = qt.fromHex(this.pubKey).add(qt.fromPrivateKey(i));
                if (c.equals(qt.ZERO)) throw new Error("The tweak was equal to negative P, which made the result key invalid");
                s.publicKey = c.toRawBytes(!0);
            }
            return new mt(s);
        } catch  {
            return this.deriveChild(t + 1);
        }
    }
    sign(t) {
        if (!this.privateKey) throw new Error("No privateKey set!");
        return z(t, 32), rt.sign(t, this.privKey).toCompactRawBytes();
    }
    verify(t, r) {
        if (z(t, 32), z(r, 64), !this.publicKey) throw new Error("No publicKey set!");
        let n;
        try {
            n = rt.Signature.fromCompact(r);
        } catch  {
            return !1;
        }
        return rt.verify(n, t, this.publicKey);
    }
    wipePrivateData() {
        return this.privKey = void 0, this.privKeyBytes && (this.privKeyBytes.fill(0), this.privKeyBytes = void 0), this;
    }
    toJSON() {
        return {
            xpriv: this.privateExtendedKey,
            xpub: this.publicExtendedKey
        };
    }
    serialize(t, r) {
        if (!this.chainCode) throw new Error("No chainCode set");
        return z(r, 33), W(Lt(t), new Uint8Array([
            this.depth
        ]), Lt(this.parentFingerprint), Lt(this.index), this.chainCode, r);
    }
}
;
 //# sourceMappingURL=index-Dm_sS4zv.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/NUT09-DNug3BMz.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "a",
    ()=>w,
    "b",
    ()=>j,
    "c",
    ()=>U,
    "d",
    ()=>x,
    "e",
    ()=>D,
    "f",
    ()=>T,
    "i",
    ()=>u
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$index$2d$Dm_sS4zv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/index-Dm_sS4zv.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-t45upHsJ.js [app-client] (ecmascript)");
;
;
;
;
function w(r) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toBase64(r).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function D(r) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromBase64(r);
}
function U(r) {
    const e = JSON.stringify(r);
    return v(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toBase64(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromString(e)));
}
function j(r) {
    const e = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toString(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromBase64($(r)));
    return JSON.parse(e);
}
function $(r) {
    return r.replace(/-/g, "+").replace(/_/g, "/").split("=")[0];
}
function v(r) {
    return r.replace(/\+/g, "-").replace(/\//g, "_").split("=")[0];
}
function u(r) {
    if (typeof r != "string" || r.length === 0) return !1;
    const e = /^[A-Za-z0-9\-_]+={0,2}$/, a = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!e.test(r) && !a.test(r)) return !1;
    const n = r.replace(/-/g, "+").replace(/_/g, "/"), o = (4 - n.length % 4) % 4;
    if (o > 2) return !1;
    const c = n + "=".repeat(o);
    try {
        const f = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromBase64(c), s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toBase64(f), g = s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), l = n.replace(/=+$/, "");
        return s.replace(/=+$/, "") === l || g === l;
    } catch  {
        return !1;
    }
}
const S = "m/129372'/0'", x = (r, e, a)=>{
    const n = /^[a-fA-F0-9]+$/.test(e);
    if (!n && u(e) || n && e.startsWith("00")) return i(r, e, a, 0);
    if (n && e.startsWith("01")) return p(r, e, a, 0);
    throw new Error(`Unrecognized keyset ID version ${e.slice(0, 2)}`);
}, T = (r, e, a)=>{
    const n = /^[a-fA-F0-9]+$/.test(e);
    if (!n && u(e) || n && e.startsWith("00")) return i(r, e, a, 1);
    if (n && e.startsWith("01")) return p(r, e, a, 1);
    throw new Error(`Unrecognized keyset ID version ${e.slice(0, 2)}`);
}, p = (r, e, a, n)=>{
    let o = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromString("Cashu_KDF_HMAC_SHA256"), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromHex(e), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].writeBigUint64BE(BigInt(a)));
    switch(n){
        case 0:
            o = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(o, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromHex("00"));
            break;
        case 1:
            o = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].concat(o, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromHex("01"));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"], r, o);
}, i = (r, e, a, n)=>{
    const o = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$index$2d$Dm_sS4zv$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["H"].fromMasterSeed(r), c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getKeysetIdInt"])(e), f = `${S}/${c}'/${a}'/${n}`, s = o.derive(f);
    if (s.privateKey === null) throw new Error("Could not derive private key");
    return s.privateKey;
};
;
 //# sourceMappingURL=NUT09-DNug3BMz.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common/NUT11.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseP2PKSecret",
    ()=>e
]);
const e = (r)=>{
    try {
        return r instanceof Uint8Array && (r = new TextDecoder().decode(r)), JSON.parse(r);
    } catch  {
        throw new Error("can't parse secret");
    }
};
;
 //# sourceMappingURL=NUT11.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT11.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createP2PKsecret",
    ()=>x,
    "getP2PKExpectedKWitnessPubkeys",
    ()=>w,
    "getP2PKLocktime",
    ()=>K,
    "getP2PKNSigs",
    ()=>$,
    "getP2PKSigFlag",
    ()=>F,
    "getP2PKWitnessPubkeys",
    ()=>k,
    "getP2PKWitnessRefundkeys",
    ()=>I,
    "getP2PKWitnessSignatures",
    ()=>y,
    "getSignedOutput",
    ()=>b,
    "getSignedOutputs",
    ()=>O,
    "hasP2PKSignedProof",
    ()=>S,
    "signBlindedMessage",
    ()=>E,
    "signP2PKProof",
    ()=>T,
    "signP2PKProofs",
    ()=>N,
    "signP2PKSecret",
    ()=>p,
    "verifyP2PKSecretSignature",
    ()=>h
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common/NUT11.es.js [app-client] (ecmascript)");
;
;
;
const x = (t)=>{
    const e = [
        "P2PK",
        {
            nonce: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(32)),
            data: t
        }
    ];
    return JSON.stringify(e);
}, p = (t, e)=>{
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(new TextEncoder().encode(t)), n = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].sign(s, e);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(n);
}, E = (t, e)=>{
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(new TextEncoder().encode(t)), n = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].sign(s, e);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(n);
}, h = (t, e, s)=>{
    try {
        const n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(new TextEncoder().encode(e)), r = s.length === 66 ? s.slice(2) : s;
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].verify((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t), n, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r))) return !0;
    } catch (n) {
        console.error("verifyP2PKsecret error:", n);
    }
    return !1;
}, S = (t, e)=>e.witness ? y(e.witness).some((n)=>{
        try {
            return h(n, e.secret, t);
        } catch  {
            return !1;
        }
    }) : !1;
function w(t) {
    try {
        const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
        if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
        const s = Math.floor(Date.now() / 1e3);
        return K(e) > s ? k(e) : I(e);
    } catch  {}
    return [];
}
function k(t) {
    const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
    if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
    const { data: s, tags: n } = e[1], r = n && n.find((o)=>o[0] === "pubkeys"), i = r && r.length > 1 ? r.slice(1) : [];
    return [
        s,
        ...i
    ].filter(Boolean);
}
function I(t) {
    const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
    if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
    const { tags: s } = e[1], n = s && s.find((r)=>r[0] === "refund");
    return n && n.length > 1 ? n.slice(1).filter(Boolean) : [];
}
function K(t) {
    const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
    if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
    const { tags: s } = e[1], n = s && s.find((r)=>r[0] === "locktime");
    return n && n.length > 1 ? parseInt(n[1], 10) : 1 / 0;
}
function $(t) {
    const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
    if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
    if (!w(e).length) return 0;
    const { tags: n } = e[1], r = Math.floor(Date.now() / 1e3);
    if (K(e) > r) {
        const c = n && n.find((g)=>g[0] === "n_sigs");
        return c && c.length > 1 ? parseInt(c[1], 10) : 1;
    }
    const o = n && n.find((c)=>c[0] === "n_sigs_refund");
    return o && o.length > 1 ? parseInt(o[1], 10) : 1;
}
function F(t) {
    const e = typeof t == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t) : t;
    if (e[0] !== "P2PK") throw new Error('Invalid P2PK secret: must start with "P2PK"');
    const { tags: s } = e[1], n = s && s.find((r)=>r[0] === "sigflag");
    return n && n.length > 1 ? n[1] : "SIG_INPUTS";
}
const y = (t)=>{
    if (!t) return [];
    if (typeof t == "string") try {
        return JSON.parse(t).signatures || [];
    } catch (e) {
        return console.error("Failed to parse witness string:", e), [];
    }
    return t.signatures || [];
}, N = (t, e, s = !1)=>{
    const n = Array.isArray(e) ? e : [
        e
    ];
    return t.map((r, i)=>{
        let o = r;
        for (const c of n)try {
            o = T(o, c);
        } catch (g) {
            const P = g instanceof Error ? g.message : "Unknown error";
            if (s) throw new Error(`Failed signing proof #${i + 1}: ${P}`);
            console.warn(`Proof #${i + 1}: ${P}`);
        }
        return o;
    });
}, T = (t, e)=>{
    const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseP2PKSecret"])(t.secret);
    if (s[0] !== "P2PK") throw new Error("not a P2PK secret");
    const n = typeof e == "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(e) : e, r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].getPublicKey(n)), i = w(s);
    if (!i.length || !i.some((P)=>P.includes(r))) throw new Error(`Signature not required from [02|03]${r}`);
    const o = y(t.witness);
    if (o.some((P)=>{
        try {
            return h(P, t.secret, r);
        } catch  {
            return !1;
        }
    })) throw new Error(`Proof already signed by [02|03]${r}`);
    const g = p(t.secret, n);
    return o.push(g), {
        ...t,
        witness: {
            signatures: o
        }
    };
}, b = (t, e)=>{
    const s = t.B_.toHex(!0), n = E(s, e);
    return t.witness = {
        signatures: [
            n
        ]
    }, t;
}, O = (t, e)=>t.map((s)=>b(s, e));
;
 //# sourceMappingURL=NUT11.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT20.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "signMintQuote",
    ()=>b,
    "verifyMintQuoteSignature",
    ()=>l
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
;
;
function a(t, n) {
    let e = t;
    for (const r of n)e += r.B_;
    const o = new TextEncoder().encode(e);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(o);
}
function b(t, n, e) {
    const o = a(n, e), r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t), s = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].sign(o, r);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(s);
}
function l(t, n, e, o) {
    const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(o);
    let s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t);
    if (s.length !== 33) return !1;
    s = s.slice(1);
    const u = a(n, e);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"].verify(r, u, s);
}
;
 //# sourceMappingURL=NUT20.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "blindMessage",
    ()=>l,
    "constructProofFromPromise",
    ()=>y,
    "createRandomBlindedMessage",
    ()=>x,
    "deserializeProof",
    ()=>T,
    "serializeBlindedMessage",
    ()=>_,
    "serializeProof",
    ()=>P,
    "unblindSignature",
    ()=>C
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-t45upHsJ.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT11.es.js [app-client] (ecmascript)");
;
;
;
;
;
function x(t) {
    return l((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(32), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].utils.randomSecretKey()), t);
}
function l(t, e, n) {
    const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hashToCurve"])(t);
    e || (e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].utils.randomSecretKey()));
    const i = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"].Point.BASE.multiply(e), s = r.add(i);
    return n !== void 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSignedOutput"])({
        B_: s,
        r: e,
        secret: t
    }, n) : {
        B_: s,
        r: e,
        secret: t
    };
}
function C(t, e, n) {
    return t.subtract(n.multiply(e));
}
function y(t, e, n, r) {
    const i = r, s = C(t.C_, e, i);
    return {
        id: t.id,
        amount: t.amount,
        secret: n,
        C: s
    };
}
const P = (t)=>({
        amount: t.amount,
        C: t.C.toHex(!0),
        id: t.id,
        secret: new TextDecoder().decode(t.secret),
        witness: JSON.stringify(t.witness)
    }), T = (t)=>({
        amount: t.amount,
        C: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointFromHex"])(t.C),
        id: t.id,
        secret: new TextEncoder().encode(t.secret),
        witness: t.witness ? JSON.parse(t.witness) : void 0
    }), _ = (t, e)=>({
        B_: t.B_.toHex(!0),
        amount: e
    });
;
 //# sourceMappingURL=client.es.js.map
}),
"[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/cashu-ts.es.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CashuAuthMint",
    ()=>X,
    "CashuAuthWallet",
    ()=>Le,
    "CashuMint",
    ()=>q,
    "CashuWallet",
    ()=>is,
    "CheckStateEnum",
    ()=>os,
    "ConsoleLogger",
    ()=>Dt,
    "HttpResponseError",
    ()=>et,
    "LogLevel",
    ()=>v,
    "MeltQuoteState",
    ()=>tt,
    "MintOperationError",
    ()=>Pt,
    "MintQuoteState",
    ()=>yt,
    "NetworkError",
    ()=>At,
    "OutputData",
    ()=>L,
    "PaymentRequest",
    ()=>_t,
    "PaymentRequestTransportType",
    ()=>Ue,
    "decodePaymentRequest",
    ()=>ts,
    "deriveKeysetId",
    ()=>Ie,
    "getBlindedAuthToken",
    ()=>as,
    "getDecodedToken",
    ()=>Se,
    "getDecodedTokenBinary",
    ()=>ss,
    "getEncodedAuthToken",
    ()=>Ce,
    "getEncodedToken",
    ()=>Xe,
    "getEncodedTokenBinary",
    ()=>es,
    "getEncodedTokenV4",
    ()=>Pe,
    "getTokenMetadata",
    ()=>Ze,
    "hasValidDleq",
    ()=>Gt,
    "injectWebSocketImpl",
    ()=>ns,
    "setGlobalRequestOptions",
    ()=>rs
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT12$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT12.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/common.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/secp256k1-0cl8VzGA.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/NUT09-DNug3BMz.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-t45upHsJ.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/utils-CZmbiPUC.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT11.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT20$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client/NUT20.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@cashu+cashu-ts@2.9.0/node_modules/@cashu/cashu-ts/lib/crypto/client.es.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
function ae(n) {
    return typeof n == "number" || typeof n == "string";
}
function wt(n) {
    const t = [];
    return kt(n, t), new Uint8Array(t);
}
function kt(n, t) {
    if (n === null) t.push(246);
    else if (n === void 0) t.push(247);
    else if (typeof n == "boolean") t.push(n ? 245 : 244);
    else if (typeof n == "number") Ft(n, t);
    else if (typeof n == "string") Nt(n, t);
    else if (Array.isArray(n)) ue(n, t);
    else if (n instanceof Uint8Array) ce(n, t);
    else if (// Defensive: POJO only (null/array handled above)
    typeof n == "object" && n !== null && !Array.isArray(n)) he(n, t);
    else throw new Error("Unsupported type");
}
function Ft(n, t) {
    if (n < 24) t.push(n);
    else if (n < 256) t.push(24, n);
    else if (n < 65536) t.push(25, n >> 8, n & 255);
    else if (n < 4294967296) t.push(26, n >> 24, n >> 16 & 255, n >> 8 & 255, n & 255);
    else throw new Error("Unsupported integer size");
}
function ce(n, t) {
    const e = n.length;
    if (e < 24) t.push(64 + e);
    else if (e < 256) t.push(88, e);
    else if (e < 65536) t.push(89, e >> 8 & 255, e & 255);
    else if (e < 4294967296) t.push(90, e >> 24 & 255, e >> 16 & 255, e >> 8 & 255, e & 255);
    else throw new Error("Byte string too long to encode");
    for(let s = 0; s < n.length; s++)t.push(n[s]);
}
function Nt(n, t) {
    const e = new TextEncoder().encode(n), s = e.length;
    if (s < 24) t.push(96 + s);
    else if (s < 256) t.push(120, s);
    else if (s < 65536) t.push(121, s >> 8 & 255, s & 255);
    else if (s < 4294967296) t.push(122, s >> 24 & 255, s >> 16 & 255, s >> 8 & 255, s & 255);
    else throw new Error("String too long to encode");
    for(let o = 0; o < e.length; o++)t.push(e[o]);
}
function ue(n, t) {
    const e = n.length;
    if (e < 24) t.push(128 | e);
    else if (e < 256) t.push(152, e);
    else if (e < 65536) t.push(153, e >> 8, e & 255);
    else throw new Error("Unsupported array length");
    for (const s of n)kt(s, t);
}
function he(n, t) {
    const e = Object.keys(n);
    Ft(e.length, t), t[t.length - 1] |= 160;
    for (const s of e)Nt(s, t), kt(n[s], t);
}
function bt(n) {
    const t = new DataView(n.buffer, n.byteOffset, n.byteLength);
    return rt(t, 0).value;
}
function rt(n, t) {
    if (t >= n.byteLength) throw new Error("Unexpected end of data");
    const e = n.getUint8(t++), s = e >> 5, o = e & 31;
    switch(s){
        case 0:
            return le(n, t, o);
        case 1:
            return de(n, t, o);
        case 2:
            return fe(n, t, o);
        case 3:
            return me(n, t, o);
        case 4:
            return pe(n, t, o);
        case 5:
            return ye(n, t, o);
        case 7:
            return we(n, t, o);
        default:
            throw new Error(`Unsupported major type: ${s}`);
    }
}
function J(n, t, e) {
    if (e < 24) return {
        value: e,
        offset: t
    };
    if (e === 24) return {
        value: n.getUint8(t++),
        offset: t
    };
    if (e === 25) {
        const s = n.getUint16(t, !1);
        return t += 2, {
            value: s,
            offset: t
        };
    }
    if (e === 26) {
        const s = n.getUint32(t, !1);
        return t += 4, {
            value: s,
            offset: t
        };
    }
    if (e === 27) {
        const s = n.getUint32(t, !1), o = n.getUint32(t + 4, !1);
        return t += 8, {
            value: s * 2 ** 32 + o,
            offset: t
        };
    }
    throw new Error(`Unsupported length: ${e}`);
}
function le(n, t, e) {
    const { value: s, offset: o } = J(n, t, e);
    return {
        value: s,
        offset: o
    };
}
function de(n, t, e) {
    const { value: s, offset: o } = J(n, t, e);
    return {
        value: -1 - s,
        offset: o
    };
}
function fe(n, t, e) {
    const { value: s, offset: o } = J(n, t, e);
    if (o + s > n.byteLength) throw new Error("Byte string length exceeds data length");
    return {
        value: new Uint8Array(n.buffer, n.byteOffset + o, s),
        offset: o + s
    };
}
function me(n, t, e) {
    const { value: s, offset: o } = J(n, t, e);
    if (o + s > n.byteLength) throw new Error("String length exceeds data length");
    const r = new Uint8Array(n.buffer, n.byteOffset + o, s);
    return {
        value: new TextDecoder().decode(r),
        offset: o + s
    };
}
function pe(n, t, e) {
    const { value: s, offset: o } = J(n, t, e), r = [];
    let a = o;
    for(let i = 0; i < s; i++){
        const c = rt(n, a);
        r.push(c.value), a = c.offset;
    }
    return {
        value: r,
        offset: a
    };
}
function ye(n, t, e) {
    const { value: s, offset: o } = J(n, t, e), r = {};
    let a = o;
    for(let i = 0; i < s; i++){
        const c = rt(n, a);
        if (!ae(c.value)) throw new Error("Invalid key type");
        const u = rt(n, c.offset);
        r[c.value] = u.value, a = u.offset;
    }
    return {
        value: r,
        offset: a
    };
}
function ge(n) {
    const t = (n & 31744) >> 10, e = n & 1023, s = n & 32768 ? -1 : 1;
    return t === 0 ? s * 2 ** -14 * (e / 1024) : t === 31 ? e ? NaN : s * (1 / 0) : s * 2 ** (t - 15) * (1 + e / 1024);
}
function we(n, t, e) {
    if (e < 24) switch(e){
        case 20:
            return {
                value: !1,
                offset: t
            };
        case 21:
            return {
                value: !0,
                offset: t
            };
        case 22:
            return {
                value: null,
                offset: t
            };
        case 23:
            return {
                value: void 0,
                offset: t
            };
        default:
            throw new Error(`Unknown simple value: ${e}`);
    }
    if (e === 24) return {
        value: n.getUint8(t++),
        offset: t
    };
    if (e === 25) {
        const s = ge(n.getUint16(t, !1));
        return t += 2, {
            value: s,
            offset: t
        };
    }
    if (e === 26) {
        const s = n.getFloat32(t, !1);
        return t += 4, {
            value: s,
            offset: t
        };
    }
    if (e === 27) {
        const s = n.getFloat64(t, !1);
        return t += 8, {
            value: s,
            offset: t
        };
    }
    throw new Error(`Unknown simple or float value: ${e}`);
}
class _t {
    constructor(t, e, s, o, r, a, i = !1, c){
        this.transport = t, this.id = e, this.amount = s, this.unit = o, this.mints = r, this.description = a, this.singleUse = i, this.nut10 = c;
    }
    toRawRequest() {
        const t = {};
        return this.transport && (t.t = this.transport.map((e)=>({
                t: e.type,
                a: e.target,
                g: e.tags
            }))), this.id && (t.i = this.id), this.amount && (t.a = this.amount), this.unit && (t.u = this.unit), this.mints && (t.m = this.mints), this.description && (t.d = this.description), this.singleUse && (t.s = this.singleUse), this.nut10 && (t.nut10 = {
            k: this.nut10.kind,
            d: this.nut10.data,
            t: this.nut10.tags
        }), t;
    }
    toEncodedRequest() {
        const t = this.toRawRequest(), e = wt(t);
        return "creqA" + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toBase64(e);
    }
    getTransport(t) {
        return this.transport?.find((e)=>e.type === t);
    }
    static fromRawRequest(t) {
        const e = t.t ? t.t.map((o)=>({
                type: o.t,
                target: o.a,
                tags: o.g
            })) : void 0, s = t.nut10 ? {
            kind: t.nut10.k,
            data: t.nut10.d,
            tags: t.nut10.t
        } : void 0;
        return new _t(e, t.i, t.a, t.u, t.m, t.d, t.s, s);
    }
    static fromEncodedRequest(t) {
        if (!t.startsWith("creq")) throw new Error("unsupported pr: invalid prefix");
        if (t[4] !== "A") throw new Error("unsupported pr version");
        const s = t.slice(5), o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["e"])(s), r = bt(o);
        return this.fromRawRequest(r);
    }
}
const ke = "A", be = "cashu";
function R(n, t, e, s) {
    if (e) {
        const r = Tt(e);
        if (n === 0 && r === 0) return e;
        const a = e.filter((c)=>c > 0), i = Tt(a);
        if (i > n) throw new Error(`Split is greater than total amount: ${i} > ${n}`);
        if (a.some((c)=>!Qt(c, t))) throw new Error("Provided amount preferences do not match the amounts of the mint keyset.");
        if (i === n) return a;
        e = a, n -= i;
    } else e = [];
    const o = Ot(t, "desc");
    if (!o || o.length === 0) throw new Error("Cannot split amount, keyset is inactive or contains no keys");
    if (o.forEach((r)=>{
        if (n <= 0 || r <= 0) return;
        const a = Math.floor(n / r);
        for(let i = 0; i < a; ++i)e.push(r);
        n %= r;
    }), n !== 0) throw new Error(`Unable to split remaining amount: ${n}`);
    return e.sort((r, a)=>r - a);
}
function Bt(n, t, e, s) {
    const o = [], r = n.map((c)=>c.amount);
    Ot(e, "asc").forEach((c)=>{
        const u = r.filter((l)=>l === c).length, h = Math.max(s - u, 0);
        for(let l = 0; l < h && !(o.reduce((f, d)=>f + d, 0) + c > t); ++l)o.push(c);
    });
    const i = t - o.reduce((c, u)=>c + u, 0);
    return i && R(i, e).forEach((u)=>{
        o.push(u);
    }), o.sort((c, u)=>c - u);
}
function Ot(n, t = "desc") {
    return t == "desc" ? Object.keys(n).map((e)=>parseInt(e)).sort((e, s)=>s - e) : Object.keys(n).map((e)=>parseInt(e)).sort((e, s)=>e - s);
}
function Qt(n, t) {
    return n in t;
}
function _e(n) {
    return Lt((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(n));
}
function Lt(n) {
    return BigInt(`0x${n}`);
}
function Ee(n) {
    return n.toString(16).padStart(64, "0");
}
function pt(n) {
    return /^[a-f0-9]*$/i.test(n);
}
function Et(n) {
    return Array.isArray(n) ? n.some((t)=>!pt(t.id)) : !pt(n.id);
}
function Ae(n, t) {
    Et(n.proofs) || (n.proofs = Ct(n.proofs)), t && (n.proofs = it(n.proofs));
    const e = {
        token: [
            {
                mint: n.mint,
                proofs: n.proofs
            }
        ]
    };
    return n.unit && (e.unit = n.unit), n.memo && (e.memo = n.memo), be + ke + (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(e);
}
function Ct(n) {
    return n.map((t)=>{
        const e = {
            ...t
        };
        return e.id = e.id.slice(0, 16), e;
    });
}
function Xe(n, t) {
    if (Et(n.proofs) || t?.version === 3) {
        if (t?.version === 4) throw new Error("can not encode to v4 token if proofs contain non-hex keyset id");
        return Ae(n, t?.removeDleq);
    }
    return Pe(n, t?.removeDleq);
}
function Pe(n, t) {
    if (t && (n.proofs = it(n.proofs)), n.proofs.forEach((c)=>{
        if (c.dleq && c.dleq.r == null) throw new Error("Missing blinding factor in included DLEQ proof");
    }), Et(n.proofs)) throw new Error("can not encode to v4 token if proofs contain non-hex keyset id");
    n.proofs = Ct(n.proofs);
    const s = Wt(n), o = wt(s), r = "cashu", a = "B", i = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["a"])(o);
    return r + a + i;
}
function Wt(n) {
    const t = {}, e = n.mint;
    for(let o = 0; o < n.proofs.length; o++){
        const r = n.proofs[o];
        t[r.id] ? t[r.id].push(r) : t[r.id] = [
            r
        ];
    }
    const s = {
        m: e,
        u: n.unit || "sat",
        t: Object.keys(t).map((o)=>({
                i: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(o),
                p: t[o].map((r)=>({
                        a: r.amount,
                        s: r.secret,
                        c: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r.C),
                        ...r.dleq && {
                            d: {
                                e: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r.dleq.e),
                                s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r.dleq.s),
                                r: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(r.dleq.r ?? "00")
                            }
                        },
                        ...r.witness && {
                            w: JSON.stringify(r.witness)
                        }
                    }))
            }))
    };
    return n.memo && (s.d = n.memo), s;
}
function jt(n) {
    const t = [];
    n.t.forEach((s)=>s.p.forEach((o)=>{
            t.push({
                secret: o.s,
                C: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(o.c),
                amount: o.a,
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(s.i),
                ...o.d && {
                    dleq: {
                        r: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(o.d.r),
                        s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(o.d.s),
                        e: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(o.d.e)
                    }
                },
                ...o.w && {
                    witness: o.w
                }
            });
        }));
    const e = {
        mint: n.m,
        proofs: t,
        unit: n.u || "sat"
    };
    return n.d && (e.memo = n.d), e;
}
function Se(n, t) {
    n = Ht(n);
    const e = $t(n);
    return e.proofs = Be(e.proofs, t), e;
}
function Ze(n) {
    n = Ht(n);
    const t = $t(n);
    return {
        unit: t.unit || "sat",
        mint: t.mint,
        amount: j(t.proofs),
        incompleteProofs: t.proofs.map((e)=>({
                secret: e.secret,
                C: e.C,
                amount: e.amount,
                ...e.dleq && {
                    dleq: e.dleq
                }
            })),
        ...t.memo && {
            memo: t.memo
        }
    };
}
function $t(n) {
    const t = n.slice(0, 1), e = n.slice(1);
    if (t === "A") {
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(e);
        if (s.token.length > 1) throw new Error("Multi entry token are not supported");
        const o = s.token[0], r = {
            mint: o.mint,
            proofs: o.proofs,
            unit: s.unit || "sat"
        };
        return s.memo && (r.memo = s.memo), r;
    } else if (t === "B") {
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["e"])(e), o = bt(s);
        return jt(o);
    }
    throw new Error("Token version is not supported");
}
function Ie(n, t, e, s = 0, o = !1) {
    if (o) {
        const c = Object.entries(n).sort((l, f)=>+l[0] - +f[0]).map(([, l])=>l).reduce((l, f)=>l + f, ""), u = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(new TextEncoder().encode(c));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toBase64(u).slice(0, 12);
    }
    let r = Object.entries(n).sort((c, u)=>+c[0] - +u[0]).map(([, c])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(c)).reduce((c, u)=>lt(c, u), new Uint8Array()), a, i;
    switch(s){
        case 0:
            return a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(r), i = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toHex(a).slice(0, 14), "00" + i;
        case 1:
            if (!t) throw new Error("Cannot compute keyset ID version 01: unit is required.");
            return r = lt(r, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromString("unit:" + t)), e && (r = lt(r, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].fromString("final_expiry:" + e.toString()))), a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$secp256k1$2d$0cl8VzGA$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["s"])(r), i = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$t45upHsJ$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["B"].toHex(a), "01" + i;
        default:
            throw new Error(`Unrecognized keyset ID version: ${s}`);
    }
}
function lt(n, t) {
    const e = new Uint8Array(n.length + t.length);
    return e.set(n), e.set(t, n.length), e;
}
function N(n) {
    return typeof n == "object";
}
function S(...n) {
    return n.map((t)=>t.replace(/(^\/+|\/+$)/g, "")).join("/");
}
function zt(n) {
    return n.replace(/\/$/, "");
}
function j(n) {
    return n.reduce((t, e)=>t + e.amount, 0);
}
function ts(n) {
    return _t.fromEncodedRequest(n);
}
class Me {
    get value() {
        return this._value;
    }
    set value(t) {
        this._value = t;
    }
    get next() {
        return this._next;
    }
    set next(t) {
        this._next = t;
    }
    constructor(t){
        this._value = t, this._next = null;
    }
}
class qe {
    get first() {
        return this._first;
    }
    set first(t) {
        this._first = t;
    }
    get last() {
        return this._last;
    }
    set last(t) {
        this._last = t;
    }
    get size() {
        return this._size;
    }
    set size(t) {
        this._size = t;
    }
    constructor(){
        this._first = null, this._last = null, this._size = 0;
    }
    enqueue(t) {
        const e = new Me(t);
        return this._size === 0 || !this._last ? (this._first = e, this._last = e) : (this._last.next = e, this._last = e), this._size++, !0;
    }
    dequeue() {
        if (this._size === 0 || !this._first) return null;
        const t = this._first;
        return this._first = t.next, t.next = null, this._size--, t.value;
    }
}
function it(n) {
    return n.map((t)=>{
        const e = {
            ...t
        };
        return delete e.dleq, e;
    });
}
function vt(n) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["i"])(n.id), e = /^[a-fA-F0-9]+$/.test(n.id), s = e ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(n.id)[0] : 0;
    return Ie(n.keys, n.unit, n.final_expiry, s, t && !e) === n.id;
}
function Be(n, t) {
    const e = [];
    for (const s of n){
        let o;
        try {
            o = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(s.id);
        } catch  {
            e.push(s);
            continue;
        }
        if (o[0] === 0) e.push(s);
        else if (o[0] === 1) {
            if (!t) throw new Error("A short keyset ID v2 was encountered, but got no keysets to map it to.");
            let r = !1;
            for (const a of t)if (s.id === a.id.slice(0, s.id.length)) {
                s.id = a.id, e.push(s), r = !0;
                break;
            }
            if (!r) throw new Error(`Couldn't map short keyset ID ${s.id} to any known keysets of the current Mint`);
        } else throw new Error(`Unknown keyset ID version: ${o[0]}`);
    }
    return e;
}
function Gt(n, t) {
    if (n.dleq == null) return !1;
    const e = {
        e: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(n.dleq.e),
        s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(n.dleq.s),
        r: Lt(n.dleq.r ?? "00")
    };
    if (!Qt(n.amount, t.keys)) throw new Error(`undefined key for amount ${n.amount}`);
    const s = t.keys[n.amount];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT12$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyDLEQProof_reblind"])(new TextEncoder().encode(n.secret), e, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointFromHex"])(n.C), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointFromHex"])(s));
}
function ve(...n) {
    const t = n.reduce((o, r)=>o + r.length, 0), e = new Uint8Array(t);
    let s = 0;
    for(let o = 0; o < n.length; o++)e.set(n[o], s), s = s + n[o].length;
    return e;
}
function es(n) {
    const t = new TextEncoder(), e = Wt(n), s = wt(e), o = t.encode("craw"), r = t.encode("B");
    return ve(o, r, s);
}
function ss(n) {
    const t = new TextDecoder(), e = t.decode(n.slice(0, 4)), s = t.decode(new Uint8Array([
        n[4]
    ]));
    if (e !== "craw" || s !== "B") throw new Error("not a valid binary token");
    const o = n.slice(5), r = bt(o);
    return jt(r);
}
function Tt(n) {
    return n.reduce((t, e)=>t + e, 0);
}
function Ht(n) {
    return [
        "web+cashu://",
        "cashu://",
        "cashu:",
        "cashu"
    ].forEach((e)=>{
        n.startsWith(e) && (n = n.slice(e.length));
    }), n;
}
let at;
typeof WebSocket < "u" && (at = WebSocket);
function ns(n) {
    at = n;
}
function Te() {
    if (at === void 0) throw new Error("WebSocket implementation not initialized");
    return at;
}
const v = {
    FATAL: "FATAL",
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
    TRACE: "TRACE"
}, Q = {
    fatal () {},
    error () {},
    warn () {},
    info () {},
    debug () {},
    trace () {},
    log () {}
}, Z = class Z {
    constructor(t = v.INFO){
        this.minLevel = t;
    }
    logToConsole(t, e, s) {
        if (Z.SEVERITY[t] > Z.SEVERITY[this.minLevel]) return;
        const o = `[${t}] `;
        let r = e;
        const a = /* @__PURE__ */ new Set();
        if (s) {
            const i = Object.fromEntries(Object.entries(s).map(([h, l])=>[
                    h,
                    l instanceof Error ? {
                        message: l.message,
                        stack: l.stack
                    } : l
                ]));
            r = e.replace(/\{(\w+)\}/g, (h, l)=>{
                if (l in i && i[l] !== void 0) {
                    a.add(l);
                    const f = i[l];
                    return typeof f == "string" ? f : typeof f == "number" || typeof f == "boolean" ? f.toString() : f == null ? "" : JSON.stringify(f);
                }
                return h;
            });
            const c = Object.fromEntries(Object.entries(i).filter(([h])=>!a.has(h))), u = this.getConsoleMethod(t);
            Object.keys(c).length > 0 ? u(o + r, c) : u(o + r);
        } else this.getConsoleMethod(t)(o + r);
    }
    // Note: NOT static as test suite needs to spy on the output
    getConsoleMethod(t) {
        switch(t){
            case v.FATAL:
            case v.ERROR:
                return console.error;
            case v.WARN:
                return console.warn;
            case v.INFO:
                return console.info;
            case v.DEBUG:
                return console.debug;
            case v.TRACE:
                return console.trace;
            default:
                return console.log;
        }
    }
    // Interface methods
    fatal(t, e) {
        this.logToConsole(v.FATAL, t, e);
    }
    error(t, e) {
        this.logToConsole(v.ERROR, t, e);
    }
    warn(t, e) {
        this.logToConsole(v.WARN, t, e);
    }
    info(t, e) {
        this.logToConsole(v.INFO, t, e);
    }
    debug(t, e) {
        this.logToConsole(v.DEBUG, t, e);
    }
    trace(t, e) {
        this.logToConsole(v.TRACE, t, e);
    }
    log(t, e, s) {
        this.logToConsole(t, e, s);
    }
};
Z.SEVERITY = {
    [v.FATAL]: 0,
    [v.ERROR]: 1,
    [v.WARN]: 2,
    [v.INFO]: 3,
    [v.DEBUG]: 4,
    [v.TRACE]: 5
};
let Dt = Z;
function De() {
    const n = Date.now();
    return {
        elapsed: ()=>Date.now() - n
    };
}
class V {
    constructor(){
        this.connectionMap = /* @__PURE__ */ new Map();
    }
    static getInstance() {
        return V.instance || (V.instance = new V()), V.instance;
    }
    getConnection(t, e) {
        if (this.connectionMap.has(t)) return this.connectionMap.get(t);
        const s = new Re(t, e);
        return this.connectionMap.set(t, s), s;
    }
}
class Re {
    constructor(t, e){
        this.subListeners = {}, this.rpcListeners = {}, this.rpcId = 0, this.onCloseCallbacks = [], this._WS = Te(), this.url = new URL(t), this.messageQueue = new qe(), this._logger = e ?? Q;
    }
    connect() {
        return this.connectionPromise || (this.connectionPromise = new Promise((t, e)=>{
            try {
                this.ws = new this._WS(this.url.toString()), this.onCloseCallbacks = [];
            } catch (s) {
                e(s instanceof Error ? s : new Error(String(s)));
                return;
            }
            this.ws.onopen = ()=>{
                t();
            }, this.ws.onerror = ()=>{
                e(new Error("Failed to open WebSocket"));
            }, this.ws.onmessage = (s)=>{
                this.messageQueue.enqueue(s.data), this.handlingInterval || (this.handlingInterval = setInterval(this.handleNextMessage.bind(this), 0));
            }, this.ws.onclose = (s)=>{
                this.connectionPromise = void 0, this.onCloseCallbacks.forEach((o)=>o(s));
            };
        })), this.connectionPromise;
    }
    sendRequest(t, e) {
        if (this.ws?.readyState !== 1) {
            if (t === "unsubscribe") return;
            throw this._logger.error("Attempted sendRequest, but socket was not open"), new Error("Socket not open");
        }
        const s = this.rpcId;
        this.rpcId++;
        const o = JSON.stringify({
            jsonrpc: "2.0",
            method: t,
            params: e,
            id: s
        });
        this.ws?.send(o);
    }
    /**
   * @deprecated Use cancelSubscription for JSONRPC compliance.
   */ closeSubscription(t) {
        this.ws?.send(JSON.stringify([
            "CLOSE",
            t
        ]));
    }
    addSubListener(t, e) {
        (this.subListeners[t] = this.subListeners[t] || []).push(e);
    }
    addRpcListener(t, e, s) {
        this.rpcListeners[s] = {
            callback: t,
            errorCallback: e
        };
    }
    removeRpcListener(t) {
        delete this.rpcListeners[t];
    }
    removeListener(t, e) {
        if (this.subListeners[t]) {
            if (this.subListeners[t].length === 1) {
                delete this.subListeners[t];
                return;
            }
            this.subListeners[t] = this.subListeners[t].filter((s)=>s !== e);
        }
    }
    async ensureConnection() {
        this.ws?.readyState !== 1 && await this.connect();
    }
    handleNextMessage() {
        if (this.messageQueue.size === 0) {
            clearInterval(this.handlingInterval), this.handlingInterval = void 0;
            return;
        }
        const t = this.messageQueue.dequeue();
        let e;
        try {
            if (e = JSON.parse(t), "result" in e && e.id != null) this.rpcListeners[e.id] && (this.rpcListeners[e.id].callback(), this.removeRpcListener(e.id));
            else if ("error" in e && e.id != null) this.rpcListeners[e.id] && (this.rpcListeners[e.id].errorCallback(new Error(e.error.message)), this.removeRpcListener(e.id));
            else if ("method" in e && !("id" in e)) {
                const s = e.params?.subId;
                if (!s) return;
                if (this.subListeners[s]?.length > 0) {
                    const o = e;
                    this.subListeners[s].forEach((r)=>r(o.params?.payload));
                }
            }
        } catch (s) {
            this._logger.error("Error doing handleNextMessage", {
                e: s
            });
            return;
        }
    }
    createSubscription(t, e, s) {
        if (this.ws?.readyState !== 1) throw this._logger.error("Attempted createSubscription, but socket was not open"), new Error("Socket is not open");
        const o = (Math.random() + 1).toString(36).substring(7);
        return this.addRpcListener(()=>{
            this.addSubListener(o, e);
        }, s, this.rpcId), this.sendRequest("subscribe", {
            ...t,
            subId: o
        }), this.rpcId++, o;
    }
    /**
   * Cancels a subscription, sending an unsubscribe request and handling responses.
   *
   * @param subId The subscription ID to cancel.
   * @param callback The original payload callback to remove.
   * @param errorCallback Optional callback for unsubscribe errors (defaults to logging).
   */ cancelSubscription(t, e, s) {
        this.removeListener(t, e), this.addRpcListener(()=>{
            this._logger.info("Unsubscribed {subId}", {
                subId: t
            });
        }, s || ((o)=>this._logger.error("Unsubscribe failed", {
                e: o
            })), this.rpcId), this.sendRequest("unsubscribe", {
            subId: t
        });
    }
    get activeSubscriptions() {
        return Object.keys(this.subListeners);
    }
    close() {
        this.ws && this.ws?.close();
    }
    onClose(t) {
        this.onCloseCallbacks.push(t);
    }
}
const os = {
    UNSPENT: "UNSPENT",
    PENDING: "PENDING",
    SPENT: "SPENT"
}, tt = {
    UNPAID: "UNPAID",
    PENDING: "PENDING",
    PAID: "PAID"
}, yt = {
    UNPAID: "UNPAID",
    PAID: "PAID",
    ISSUED: "ISSUED"
};
var Ue = /* @__PURE__ */ ((n)=>(n.POST = "post", n.NOSTR = "nostr", n))(Ue || {});
class et extends Error {
    constructor(t, e){
        super(t), this.status = e, this.name = "HttpResponseError", Object.setPrototypeOf(this, et.prototype);
    }
}
class At extends Error {
    constructor(t){
        super(t), this.name = "NetworkError", Object.setPrototypeOf(this, At.prototype);
    }
}
class Pt extends et {
    constructor(t, e){
        super(e || "Unknown mint operation error", 400), this.code = t, this.name = "MintOperationError", Object.setPrototypeOf(this, Pt.prototype);
    }
}
let Vt = {}, Jt = Q;
function rs(n) {
    Vt = n;
}
function Ke(n) {
    Jt = n;
}
async function xe({ endpoint: n, requestBody: t, headers: e, ...s }) {
    const o = t ? JSON.stringify(t) : void 0, r = {
        Accept: "application/json, text/plain, */*",
        ...o ? {
            "Content-Type": "application/json"
        } : void 0,
        ...e
    };
    let a;
    try {
        a = await fetch(n, {
            body: o,
            headers: r,
            ...s
        });
    } catch (i) {
        throw new At(i instanceof Error ? i.message : "Network request failed");
    }
    if (!a.ok) {
        let i;
        try {
            i = await a.json();
        } catch  {
            i = {
                error: "bad response"
            };
        }
        if (a.status === 400 && "code" in i && typeof i.code == "number" && "detail" in i && typeof i.detail == "string") throw new Pt(i.code, i.detail);
        let c = "HTTP request failed";
        throw "error" in i && typeof i.error == "string" ? c = i.error : "detail" in i && typeof i.detail == "string" && (c = i.detail), new et(c, a.status);
    }
    try {
        return await a.json();
    } catch (i) {
        throw Jt.error("Failed to parse HTTP response", {
            err: i
        }), new et("bad response", a.status);
    }
}
async function M(n) {
    return await xe({
        ...n,
        ...Vt
    });
}
function dt(n, t) {
    return n.state || (t.warn("Field 'state' not found in MeltQuoteResponse. Update NUT-05 of mint: https://github.com/cashubtc/nuts/pull/136)"), typeof n.paid == "boolean" && (n.state = n.paid ? tt.PAID : tt.UNPAID)), n;
}
function Rt(n, t) {
    return n.state || (t.warn("Field 'state' not found in MintQuoteResponse. Update NUT-04 of mint: https://github.com/cashubtc/nuts/pull/141)"), typeof n.paid == "boolean" && (n.state = n.paid ? yt.PAID : yt.UNPAID)), n;
}
function Fe(n, t) {
    return Array.isArray(n?.contact) && n?.contact.length > 0 && (n.contact = n.contact.map((e)=>Array.isArray(e) && e.length === 2 && typeof e[0] == "string" && typeof e[1] == "string" ? (t.warn("Mint returned deprecated 'contact' field: Update NUT-06: https://github.com/cashubtc/nuts/pull/117"), {
            method: e[0],
            info: e[1]
        }) : e)), n;
}
class gt {
    constructor(t){
        this._mintInfo = t, t.nuts[22] && (this._protectedEnpoints = {
            cache: {},
            apiReturn: t.nuts[22].protected_endpoints.map((e)=>({
                    method: e.method,
                    regex: new RegExp(e.path)
                }))
        });
    }
    isSupported(t) {
        switch(t){
            case 4:
            case 5:
                return this.checkMintMelt(t);
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 14:
            case 20:
                return this.checkGenericNut(t);
            case 17:
                return this.checkNut17();
            case 15:
                return this.checkNut15();
            default:
                throw new Error("nut is not supported by cashu-ts");
        }
    }
    requiresBlindAuthToken(t) {
        if (!this._protectedEnpoints) return !1;
        if (typeof this._protectedEnpoints.cache[t] == "boolean") return this._protectedEnpoints.cache[t];
        const e = this._protectedEnpoints.apiReturn.some((s)=>s.regex.test(t));
        return this._protectedEnpoints.cache[t] = e, e;
    }
    checkGenericNut(t) {
        return this._mintInfo.nuts[t]?.supported ? {
            supported: !0
        } : {
            supported: !1
        };
    }
    checkMintMelt(t) {
        const e = this._mintInfo.nuts[t];
        return e && e.methods.length > 0 && !e.disabled ? {
            disabled: !1,
            params: e.methods
        } : {
            disabled: !0,
            params: e.methods
        };
    }
    checkNut17() {
        return this._mintInfo.nuts[17] && this._mintInfo.nuts[17].supported.length > 0 ? {
            supported: !0,
            params: this._mintInfo.nuts[17].supported
        } : {
            supported: !1
        };
    }
    checkNut15() {
        return this._mintInfo.nuts[15] && this._mintInfo.nuts[15].methods.length > 0 ? {
            supported: !0,
            params: this._mintInfo.nuts[15].methods
        } : {
            supported: !1
        };
    }
    get contact() {
        return this._mintInfo.contact;
    }
    get description() {
        return this._mintInfo.description;
    }
    get description_long() {
        return this._mintInfo.description_long;
    }
    get name() {
        return this._mintInfo.name;
    }
    get pubkey() {
        return this._mintInfo.pubkey;
    }
    get nuts() {
        return this._mintInfo.nuts;
    }
    get version() {
        return this._mintInfo.version;
    }
    get motd() {
        return this._mintInfo.motd;
    }
    /**
   * Checks if the mint supports creating BOLT12 offers with a description.
   *
   * @returns True if the mint supports offers with a description, false otherwise.
   */ get supportsBolt12Description() {
        return this._mintInfo.nuts[4]?.methods.some((t)=>t.method === "bolt12" && t.options?.description === !0);
    }
}
class q {
    /**
   * @param _mintUrl Requires mint URL to create this object.
   * @param _customRequest If passed, use custom request implementation for network communication
   *   with the mint.
   * @param [authTokenGetter] A function that is called by the CashuMint instance to obtain a NUT-22
   *   BlindedAuthToken (e.g. from a database or localstorage)
   */ constructor(t, e, s, o){
        this._mintUrl = t, this._customRequest = e, this._checkNut22 = !1, this._mintUrl = zt(t), this._customRequest = e, s && (this._checkNut22 = !0, this._authTokenGetter = s), this._logger = o?.logger ?? Q, Ke(this._logger);
    }
    //TODO: v3 - refactor CashuMint to take two or less args.
    get mintUrl() {
        return this._mintUrl;
    }
    /**
   * Fetches mints info at the /info endpoint.
   *
   * @param mintUrl
   * @param customRequest
   */ static async getInfo(t, e, s) {
        const o = s ?? Q, a = await (e || M)({
            endpoint: S(t, "/v1/info")
        });
        return Fe(a, o);
    }
    /**
   * Fetches mints info at the /info endpoint.
   */ async getInfo() {
        return q.getInfo(this._mintUrl, this._customRequest, this._logger);
    }
    async getLazyMintInfo() {
        if (this._mintInfo) return this._mintInfo;
        const t = await q.getInfo(this._mintUrl, this._customRequest);
        return this._mintInfo = new gt(t), this._mintInfo;
    }
    /**
   * Performs a swap operation with ecash inputs and outputs.
   *
   * @param mintUrl
   * @param swapPayload Payload containing inputs and outputs.
   * @param customRequest
   * @returns Signed outputs.
   */ static async swap(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {}, i = await r({
            endpoint: S(t, "/v1/swap"),
            method: "POST",
            requestBody: e,
            headers: a
        });
        if (!N(i) || !Array.isArray(i?.signatures)) throw new Error(i.detail ?? "bad response");
        return i;
    }
    /**
   * Performs a swap operation with ecash inputs and outputs.
   *
   * @param swapPayload Payload containing inputs and outputs.
   * @returns Signed outputs.
   */ async swap(t) {
        const e = await this.handleBlindAuth("/v1/swap");
        return q.swap(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests a new mint quote from the mint.
   *
   * @param mintUrl
   * @param mintQuotePayload Payload for creating a new mint quote.
   * @param customRequest
   * @returns The mint will create and return a new mint quote containing a payment request for the
   *   specified amount and unit.
   */ static async createMintQuote(t, e, s, o, r) {
        const a = r ?? Q, i = s || M, c = o ? {
            "Blind-auth": o
        } : {}, u = await i({
            endpoint: S(t, "/v1/mint/quote/bolt11"),
            method: "POST",
            requestBody: e,
            headers: c
        });
        return Rt(u, a);
    }
    /**
   * Requests a new mint quote from the mint.
   *
   * @param mintQuotePayload Payload for creating a new mint quote.
   * @returns The mint will create and return a new mint quote containing a payment request for the
   *   specified amount and unit.
   */ async createMintQuote(t) {
        const e = await this.handleBlindAuth("/v1/mint/quote/bolt11");
        return q.createMintQuote(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests a new BOLT12 mint quote from the mint using Lightning Network offers.
   *
   * @param mintUrl The mint's base URL.
   * @param mintQuotePayload Payload containing amount, unit, optional description, and required
   *   pubkey.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns A mint quote containing a BOLT12 offer.
   */ static async createMintQuoteBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {};
        return await r({
            endpoint: S(t, "/v1/mint/quote/bolt12"),
            method: "POST",
            requestBody: e,
            headers: a
        });
    }
    /**
   * Requests a new BOLT12 mint quote from the mint using Lightning Network offers.
   *
   * @param mintQuotePayload Payload containing amount, unit, optional description, and required
   *   pubkey.
   * @returns A mint quote containing a BOLT12 offer.
   */ async createMintQuoteBolt12(t) {
        const e = await this.handleBlindAuth("/v1/mint/quote/bolt12");
        return q.createMintQuoteBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Gets an existing mint quote from the mint.
   *
   * @param mintUrl
   * @param quote Quote ID.
   * @param customRequest
   * @returns The mint will create and return a Lightning invoice for the specified amount.
   */ static async checkMintQuote(t, e, s, o, r) {
        const a = r ?? Q, i = s || M, c = o ? {
            "Blind-auth": o
        } : {}, u = await i({
            endpoint: S(t, "/v1/mint/quote/bolt11", e),
            method: "GET",
            headers: c
        });
        return Rt(u, a);
    }
    /**
   * Gets an existing mint quote from the mint.
   *
   * @param quote Quote ID.
   * @returns The mint will create and return a Lightning invoice for the specified amount.
   */ async checkMintQuote(t) {
        const e = await this.handleBlindAuth(`/v1/mint/quote/bolt11/${t}`);
        return q.checkMintQuote(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Gets an existing BOLT12 mint quote from the mint.
   *
   * @param mintUrl The mint's base URL.
   * @param quote Quote ID to check.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns Updated quote with current payment and issuance amounts.
   */ static async checkMintQuoteBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {};
        return await r({
            endpoint: S(t, "/v1/mint/quote/bolt12", e),
            method: "GET",
            headers: a
        });
    }
    /**
   * Gets an existing BOLT12 mint quote from the mint.
   *
   * @param quote Quote ID to check.
   * @returns Updated quote with current payment and issuance amounts.
   */ async checkMintQuoteBolt12(t) {
        const e = await this.handleBlindAuth(`/v1/mint/quote/bolt12/${t}`);
        return q.checkMintQuoteBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Mints new tokens by requesting blind signatures on the provided outputs.
   *
   * @param mintUrl
   * @param mintPayload Payload containing the outputs to get blind signatures on.
   * @param customRequest
   * @returns Serialized blinded signatures.
   */ static async mint(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {}, i = await r({
            endpoint: S(t, "/v1/mint/bolt11"),
            method: "POST",
            requestBody: e,
            headers: a
        });
        if (!N(i) || !Array.isArray(i?.signatures)) throw new Error("bad response");
        return i;
    }
    /**
   * Mints new tokens by requesting blind signatures on the provided outputs.
   *
   * @param mintPayload Payload containing the outputs to get blind signatures on.
   * @returns Serialized blinded signatures.
   */ async mint(t) {
        const e = await this.handleBlindAuth("/v1/mint/bolt11");
        return q.mint(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Mints new tokens using a BOLT12 quote by requesting blind signatures on the provided outputs.
   *
   * @param mintUrl The mint's base URL.
   * @param mintPayload Payload containing the quote ID and outputs to get blind signatures on.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns Serialized blinded signatures for the requested outputs.
   */ static async mintBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {}, i = await r({
            endpoint: S(t, "/v1/mint/bolt12"),
            method: "POST",
            requestBody: e,
            headers: a
        });
        if (!N(i) || !Array.isArray(i?.signatures)) throw new Error("bad response");
        return i;
    }
    /**
   * Mints new tokens using a BOLT12 quote by requesting blind signatures on the provided outputs.
   *
   * @param mintPayload Payload containing the quote ID and outputs to get blind signatures on.
   * @returns Serialized blinded signatures for the requested outputs.
   */ async mintBolt12(t) {
        const e = await this.handleBlindAuth("/v1/mint/bolt12");
        return q.mintBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests a new melt quote from the mint.
   *
   * @param mintUrl
   * @param MeltQuotePayload
   * @returns
   */ static async createMeltQuote(t, e, s, o, r) {
        const a = r ?? Q, i = s || M, c = o ? {
            "Blind-auth": o
        } : {}, u = await i({
            endpoint: S(t, "/v1/melt/quote/bolt11"),
            method: "POST",
            requestBody: e,
            headers: c
        }), h = dt(u, a);
        if (!N(h) || typeof h?.amount != "number" || typeof h?.fee_reserve != "number" || typeof h?.quote != "string") throw new Error("bad response");
        return h;
    }
    /**
   * Requests a new melt quote from the mint.
   *
   * @param MeltQuotePayload
   * @returns
   */ async createMeltQuote(t) {
        const e = await this.handleBlindAuth("/v1/melt/quote/bolt11");
        return q.createMeltQuote(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests a new BOLT12 melt quote from the mint for paying a Lightning Network offer. For
   * amount-less offers, specify the amount in options.amountless.amount_msat.
   *
   * @param mintUrl The mint's base URL.
   * @param meltQuotePayload Payload containing the BOLT12 offer to pay and unit.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns Melt quote with amount, fee reserve, and payment state.
   */ static async createMeltQuoteBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {};
        return await r({
            endpoint: S(t, "/v1/melt/quote/bolt12"),
            method: "POST",
            requestBody: e,
            headers: a
        });
    }
    /**
   * Requests a new BOLT12 melt quote from the mint for paying a Lightning Network offer. For
   * amount-less offers, specify the amount in options.amountless.amount_msat.
   *
   * @param meltQuotePayload Payload containing the BOLT12 offer to pay and unit.
   * @returns Melt quote with amount, fee reserve, and payment state.
   */ async createMeltQuoteBolt12(t) {
        const e = await this.handleBlindAuth("/v1/melt/quote/bolt12");
        return q.createMeltQuoteBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Gets an existing melt quote.
   *
   * @param mintUrl
   * @param quote Quote ID.
   * @returns
   */ static async checkMeltQuote(t, e, s, o, r) {
        const a = r ?? Q, i = s || M, c = o ? {
            "Blind-auth": o
        } : {}, u = await i({
            endpoint: S(t, "/v1/melt/quote/bolt11", e),
            method: "GET",
            headers: c
        }), h = dt(u, a);
        if (!N(h) || typeof h?.amount != "number" || typeof h?.fee_reserve != "number" || typeof h?.quote != "string" || typeof h?.state != "string" || !Object.values(tt).includes(h.state)) throw new Error("bad response");
        return h;
    }
    /**
   * Gets an existing melt quote.
   *
   * @param quote Quote ID.
   * @returns
   */ async checkMeltQuote(t) {
        const e = await this.handleBlindAuth(`/v1/melt/quote/bolt11/${t}`);
        return q.checkMeltQuote(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Gets an existing BOLT12 melt quote from the mint. Returns current payment state (UNPAID,
   * PENDING, or PAID) and payment preimage if paid.
   *
   * @param mintUrl The mint's base URL.
   * @param quote Quote ID to check.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns Updated quote with current payment state and preimage if available.
   */ static async checkMeltQuoteBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {};
        return await r({
            endpoint: S(t, "/v1/melt/quote/bolt12", e),
            method: "GET",
            headers: a
        });
    }
    /**
   * Gets an existing BOLT12 melt quote from the mint. Returns current payment state (UNPAID,
   * PENDING, or PAID) and payment preimage if paid.
   *
   * @param quote Quote ID to check.
   * @returns Updated quote with current payment state and preimage if available.
   */ async checkMeltQuoteBolt12(t) {
        const e = await this.handleBlindAuth(`/v1/melt/quote/bolt12/${t}`);
        return q.checkMeltQuoteBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests the mint to pay for a Bolt11 payment request by providing ecash as inputs to be spent.
   * The inputs contain the amount and the fee_reserves for a Lightning payment. The payload can
   * also contain blank outputs in order to receive back overpaid Lightning fees.
   *
   * @param mintUrl
   * @param meltPayload
   * @param customRequest
   * @returns
   */ static async melt(t, e, s, o, r) {
        const a = r ?? Q, i = s || M, c = o ? {
            "Blind-auth": o
        } : {}, u = await i({
            endpoint: S(t, "/v1/melt/bolt11"),
            method: "POST",
            requestBody: e,
            headers: c
        }), h = dt(u, a);
        if (!N(h) || typeof h?.state != "string" || !Object.values(tt).includes(h.state)) throw new Error("bad response");
        return h;
    }
    /**
   * Ask mint to perform a melt operation. This pays a lightning invoice and destroys tokens
   * matching its amount + fees.
   *
   * @param meltPayload
   * @returns
   */ async melt(t) {
        const e = await this.handleBlindAuth("/v1/melt/bolt11");
        return q.melt(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Requests the mint to pay a BOLT12 offer by providing ecash inputs to be spent. The inputs must
   * cover the amount plus fee reserves. Optional outputs can be included to receive change for
   * overpaid Lightning fees.
   *
   * @param mintUrl The mint's base URL.
   * @param meltPayload Payload containing quote ID, inputs, and optional outputs for change.
   * @param customRequest Optional custom request implementation.
   * @param blindAuthToken Optional authentication token for NUT-22.
   * @returns Payment result with state and optional change signatures.
   */ static async meltBolt12(t, e, s, o) {
        const r = s || M, a = o ? {
            "Blind-auth": o
        } : {};
        return await r({
            endpoint: S(t, "/v1/melt/bolt12"),
            method: "POST",
            requestBody: e,
            headers: a
        });
    }
    /**
   * Requests the mint to pay a BOLT12 offer by providing ecash inputs to be spent. The inputs must
   * cover the amount plus fee reserves. Optional outputs can be included to receive change for
   * overpaid Lightning fees.
   *
   * @param meltPayload Payload containing quote ID, inputs, and optional outputs for change.
   * @returns Payment result with state and optional change signatures.
   */ async meltBolt12(t) {
        const e = await this.handleBlindAuth("/v1/melt/bolt12");
        return q.meltBolt12(this._mintUrl, t, this._customRequest, e);
    }
    /**
   * Checks if specific proofs have already been redeemed.
   *
   * @param mintUrl
   * @param checkPayload
   * @param customRequest
   * @returns Redeemed and unredeemed ordered list of booleans.
   */ static async check(t, e, s) {
        const r = await (s || M)({
            endpoint: S(t, "/v1/checkstate"),
            method: "POST",
            requestBody: e
        });
        if (!N(r) || !Array.isArray(r?.states)) throw new Error("bad response");
        return r;
    }
    /**
   * Get the mints public keys.
   *
   * @param mintUrl
   * @param keysetId Optional param to get the keys for a specific keyset. If not specified, the
   *   keys from all active keysets are fetched.
   * @param customRequest
   * @returns
   */ static async getKeys(t, e, s) {
        e && (e = e.replace(/\//g, "_").replace(/\+/g, "-"));
        const r = await (s || M)({
            endpoint: e ? S(t, "/v1/keys", e) : S(t, "/v1/keys")
        });
        if (!N(r) || !Array.isArray(r.keysets)) throw new Error("bad response");
        return r;
    }
    /**
   * Get the mints public keys.
   *
   * @param keysetId Optional param to get the keys for a specific keyset. If not specified, the
   *   keys from all active keysets are fetched.
   * @returns The mints public keys.
   */ async getKeys(t, e) {
        return await q.getKeys(e || this._mintUrl, t, this._customRequest);
    }
    /**
   * Get the mints keysets in no specific order.
   *
   * @param mintUrl
   * @param customRequest
   * @returns All the mints past and current keysets.
   */ static async getKeySets(t, e) {
        return (e || M)({
            endpoint: S(t, "/v1/keysets")
        });
    }
    /**
   * Get the mints keysets in no specific order.
   *
   * @returns All the mints past and current keysets.
   */ async getKeySets() {
        return q.getKeySets(this._mintUrl, this._customRequest);
    }
    /**
   * Checks if specific proofs have already been redeemed.
   *
   * @param checkPayload
   * @returns Redeemed and unredeemed ordered list of booleans.
   */ async check(t) {
        return q.check(this._mintUrl, t, this._customRequest);
    }
    static async restore(t, e, s) {
        const r = await (s || M)({
            endpoint: S(t, "/v1/restore"),
            method: "POST",
            requestBody: e
        });
        if (!N(r) || !Array.isArray(r?.outputs) || !Array.isArray(r?.signatures)) throw new Error("bad response");
        return r;
    }
    async restore(t) {
        return q.restore(this._mintUrl, t, this._customRequest);
    }
    /**
   * Tries to establish a websocket connection with the websocket mint url according to NUT-17.
   */ async connectWebSocket() {
        if (this.ws) await this.ws.ensureConnection();
        else {
            const t = new URL(this._mintUrl), e = "v1/ws";
            t.pathname && (t.pathname.endsWith("/") ? t.pathname += e : t.pathname += "/" + e), this.ws = V.getInstance().getConnection(`${t.protocol === "https:" ? "wss" : "ws"}://${t.host}${t.pathname}`);
            try {
                await this.ws.connect();
            } catch (s) {
                throw this._logger.error("Failed to connect to WebSocket...", {
                    e: s
                }), new Error("Failed to connect to WebSocket...");
            }
        }
    }
    /**
   * Closes a websocket connection.
   */ disconnectWebSocket() {
        this.ws && this.ws.close();
    }
    get webSocketConnection() {
        return this.ws;
    }
    async handleBlindAuth(t) {
        if (!this._checkNut22) return;
        if ((await this.getLazyMintInfo()).requiresBlindAuthToken(t)) {
            if (!this._authTokenGetter) throw new Error("Can not call a protected endpoint without authProofGetter");
            return this._authTokenGetter();
        }
    }
}
class ft {
    constructor(t, e, s){
        this.amount = t, this.B_ = e, this.id = s;
    }
    getSerializedBlindedMessage() {
        return {
            amount: this.amount,
            B_: this.B_.toHex(!0),
            id: this.id
        };
    }
}
function mt(n) {
    return typeof n == "function";
}
const Ne = /* @__PURE__ */ new Set([
    "locktime",
    "pubkeys",
    "n_sigs",
    "refund",
    "n_sigs_refund"
]), Ut = 1024;
class L {
    constructor(t, e, s){
        this.secret = s, this.blindingFactor = e, this.blindedMessage = t;
    }
    toProof(t, e) {
        let s;
        t.dleq && (s = {
            s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t.dleq.s),
            e: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["h"])(t.dleq.e),
            r: this.blindingFactor
        });
        const o = {
            id: t.id,
            amount: t.amount,
            C_: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointFromHex"])(t.C_)
        }, r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pointFromHex"])(e.keys[t.amount]), a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["constructProofFromPromise"])(o, this.blindingFactor, this.secret, r);
        return {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serializeProof"])(a),
            ...s && {
                dleq: {
                    s: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(s.s),
                    e: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(s.e),
                    r: Ee(s.r ?? BigInt(0))
                }
            }
        };
    }
    static createP2PKData(t, e, s, o) {
        return R(e, s.keys, o).map((a)=>this.createSingleP2PKData(t, a, s.id));
    }
    static createSingleP2PKData(t, e, s) {
        const o = Array.isArray(t.pubkey) ? t.pubkey : [
            t.pubkey
        ], r = t.refundKeys ?? [], a = Math.max(1, Math.min(t.requiredSignatures ?? 1, o.length)), i = Math.max(1, Math.min(t.requiredRefundSignatures ?? 1, r.length || 1)), c = o[0], u = o.slice(1), h = r, l = [], f = t.locktime ?? NaN;
        if (Number.isSafeInteger(f) && f >= 0 && l.push([
            "locktime",
            String(f)
        ]), u.length > 0 && (l.push([
            "pubkeys",
            ...u
        ]), a > 1 && l.push([
            "n_sigs",
            String(a)
        ])), h.length > 0 && (l.push([
            "refund",
            ...h
        ]), i > 1 && l.push([
            "n_sigs_refund",
            String(i)
        ])), t.additionalTags?.length) {
            const m = t.additionalTags.map(([E, ...F], $)=>{
                if (typeof E != "string" || !E) throw new Error(`additionalTags[${$}][0] must be a non empty string`);
                if (Ne.has(E)) throw new Error(`additionalTags must not use reserved key "${E}"`);
                return [
                    E,
                    ...F.map(String)
                ];
            });
            l.push(...m);
        }
        const d = [
            "P2PK",
            {
                nonce: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(32)),
                data: c,
                tags: l
            }
        ], y = JSON.stringify(d), _ = [
            ...y
        ].length;
        if (_ > Ut) throw new Error(`Secret too long (${_} characters), maximum is ${Ut}`);
        const I = new TextEncoder().encode(y), { r: T, B_: b } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blindMessage"])(I);
        return new L(new ft(e, b, s).getSerializedBlindedMessage(), T, I);
    }
    static createRandomData(t, e, s) {
        return R(t, e.keys, s).map((r)=>this.createSingleRandomData(r, e.id));
    }
    static createSingleRandomData(t, e) {
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])(32)), o = new TextEncoder().encode(s), { r, B_: a } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blindMessage"])(o);
        return new L(new ft(t, a, e).getSerializedBlindedMessage(), r, o);
    }
    static createDeterministicData(t, e, s, o, r) {
        return R(t, o.keys, r).map((i, c)=>this.createSingleDeterministicData(i, e, s + c, o.id));
    }
    static createSingleDeterministicData(t, e, s, o) {
        const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["d"])(e, o, s), a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$utils$2d$CZmbiPUC$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["b"])(r), i = new TextEncoder().encode(a), c = _e((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["f"])(e, o, s)), { r: u, B_: h } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blindMessage"])(i, c);
        return new L(new ft(t, h, o).getSerializedBlindedMessage(), u, i);
    }
}
const Oe = 3, Qe = "sat";
class is {
    /**
   * @param mint Cashu mint instance is used to make api calls.
   * @param options.unit Optionally set unit (default is 'sat')
   * @param options.keys Public keys from the mint (will be fetched from mint if not provided)
   * @param options.keysets Keysets from the mint (will be fetched from mint if not provided)
   * @param options.mintInfo Mint info from the mint (will be fetched from mint if not provided)
   * @param options.denominationTarget Target number proofs per denomination (default: see @constant
   *   DEFAULT_DENOMINATION_TARGET)
   * @param options.bip39seed BIP39 seed for deterministic secrets.
   * @param options.keepFactory A function that will be used by all parts of the library that
   *   produce proofs to be kept (change, etc.). This can lead to poor performance, in which case
   *   the seed should be directly provided.
   */ constructor(t, e){
        this._keys = /* @__PURE__ */ new Map(), this._keysets = [], this._seed = void 0, this._unit = Qe, this._mintInfo = void 0, this._denominationTarget = Oe, this.mint = t, this._logger = e?.logger ?? Q, this._logger.warn("cashu-ts v3 has been released. Please upgrade to access the latest features. v2 is now in minimal maintenance mode.");
        let s = [];
        if (e?.keys && !Array.isArray(e.keys) ? s = [
            e.keys
        ] : e?.keys && Array.isArray(e?.keys) && (s = e?.keys), s && s.forEach((o)=>this._keys.set(o.id, o)), e?.unit && (this._unit = e?.unit), e?.keysets && (this._keysets = e.keysets), e?.mintInfo && (this._mintInfo = new gt(e.mintInfo)), e?.denominationTarget && (this._denominationTarget = e.denominationTarget), e?.bip39seed) {
            if (e.bip39seed instanceof Uint8Array) {
                this._seed = e.bip39seed;
                return;
            }
            throw new Error("bip39seed must be a valid UInt8Array");
        }
        e?.keepFactory && (this._keepFactory = e.keepFactory);
    }
    get unit() {
        return this._unit;
    }
    get keys() {
        return this._keys;
    }
    get keysetId() {
        if (!this._keysetId) throw new Error("No keysetId set");
        return this._keysetId;
    }
    set keysetId(t) {
        this._keysetId = t;
    }
    get keysets() {
        return this._keysets;
    }
    get mintInfo() {
        if (!this._mintInfo) throw new Error("Mint info not loaded");
        return this._mintInfo;
    }
    /**
   * Get information about the mint.
   *
   * @returns Mint info.
   */ async getMintInfo() {
        const t = await this.mint.getInfo();
        return this._mintInfo = new gt(t), this._mintInfo;
    }
    /**
   * Get stored information about the mint or request it if not loaded.
   *
   * @returns Mint info.
   */ async lazyGetMintInfo() {
        return this._mintInfo ? this._mintInfo : await this.getMintInfo();
    }
    /**
   * Load mint information, keysets and keys. This function can be called if no keysets are passed
   * in the constructor.
   */ async loadMint() {
        await Promise.all([
            this.getMintInfo(),
            this.getKeys()
        ]);
    }
    /**
   * Choose a keyset to activate based on the lowest input fee.
   *
   * Note: this function will filter out deprecated base64 keysets.
   *
   * @param keysets Keysets to choose from.
   * @returns Active keyset.
   */ getActiveKeyset(t) {
        let e = t.filter((o)=>o.active && o.unit === this._unit);
        e = e.filter((o)=>pt(o.id));
        const s = e.sort((o, r)=>(o.input_fee_ppk ?? 0) - (r.input_fee_ppk ?? 0))[0];
        if (!s) throw new Error("No active keyset found");
        return s;
    }
    /**
   * Get keysets from the mint with the unit of the wallet.
   *
   * @returns Keysets with wallet's unit.
   */ async getKeySets() {
        const e = (await this.mint.getKeySets()).keysets.filter((s)=>s.unit === this._unit);
        return this._keysets = e, this._keysets;
    }
    /**
   * Get all active keys from the mint and set the keyset with the lowest fees as the active wallet
   * keyset.
   *
   * @returns Keyset.
   */ async getAllKeys() {
        const t = await this.mint.getKeys();
        return t.keysets.forEach((e)=>{
            if (!vt(e)) throw new Error(`Couldn't verify keyset ID ${e.id}`);
        }), this._keys = new Map(t.keysets.map((e)=>[
                e.id,
                e
            ])), this.keysetId = this.getActiveKeyset(this._keysets).id, t.keysets;
    }
    /**
   * Get public keys from the mint. If keys were already fetched, it will return those.
   *
   * If `keysetId` is set, it will fetch and return that specific keyset. Otherwise, we select an
   * active keyset with the unit of the wallet.
   *
   * @param keysetId Optional keysetId to get keys for.
   * @param forceRefresh? If set to true, it will force refresh the keyset from the mint.
   * @returns Keyset.
   */ async getKeys(t, e) {
        if ((!(this._keysets.length > 0) || e) && await this.getKeySets(), t || (t = this.getActiveKeyset(this._keysets).id), !this._keysets.find((s)=>s.id === t) && (await this.getKeySets(), !this._keysets.find((s)=>s.id === t))) throw new Error(`could not initialize keys. No keyset with id '${t}' found`);
        if (!this._keys.get(t)) {
            const s = await this.mint.getKeys(t);
            if (!vt(s.keysets[0])) throw new Error(`Couldn't verify keyset ID ${s.keysets[0].id}`);
            this._keys.set(t, s.keysets[0]);
        }
        return this.keysetId = t, this._keys.get(t);
    }
    /**
   * Asserts amount is a positive integer.
   *
   * @param amount To check.
   * @param op Caller method name (or other identifier) for debug.
   * @throws If not.
   */ assertAmount(t, e) {
        if (typeof t != "number" || !Number.isInteger(t) || t <= 0) throw new Error(`Amount must be a positive integer, method: ${e}`);
    }
    /**
   * Receive an encoded or raw Cashu token (only supports single tokens. It will only process the
   * first token in the token array)
   *
   * @param {string | Token} token - Cashu token, either as string or decoded.
   * @param {ReceiveOptions} [options] - Optional configuration for token processing.
   * @returns New token with newly created proofs, token entries that had errors.
   */ async receive(t, e) {
        const { requireDleq: s, keysetId: o, outputAmounts: r, counter: a, pubkey: i, privkey: c, outputData: u, p2pk: h } = e || {};
        this._keysets.length === 0 && await this.getKeySets(), typeof t == "string" && (t = Se(t, this._keysets));
        const l = await this.getKeys(o);
        if (s && t.proofs.some((b)=>!Gt(b, l))) throw new Error("Token contains proofs with invalid DLEQ");
        const f = j(t.proofs) - this.getFeesForProofs(t.proofs);
        let d;
        u ? d = {
            send: u
        } : this._keepFactory && (d = {
            send: this._keepFactory
        });
        const y = this.createSwapPayload(f, t.proofs, l, r, a, i, c, d, h), { signatures: _ } = await this.mint.swap(y.payload), I = y.outputData.map((b, m)=>b.toProof(_[m], l)), T = [];
        return y.sortedIndices.forEach((b, m)=>{
            T[b] = I[m];
        }), T;
    }
    /**
   * Send proofs of a given amount, by providing at least the required amount of proofs.
   *
   * @param amount Amount to send.
   * @param proofs Array of proofs (accumulated amount of proofs must be >= than amount)
   * @param {SendOptions} [options] - Optional parameters for configuring the send operation.
   * @returns {SendResponse}
   */ async send(t, e, s) {
        const { offline: o, includeFees: r, includeDleq: a, keysetId: i, outputAmounts: c, pubkey: u, privkey: h, outputData: l } = s || {};
        if (this.assertAmount(t, "send"), a && (e = e.filter((_)=>_.dleq != null)), j(e) < t) throw new Error("Not enough funds available to send");
        const { keep: f, send: d } = this.selectProofsToSend(e, t, s?.includeFees), y = r ? this.getFeesForProofs(d) : 0;
        if (!o && (j(d) != t + y || // if the exact amount cannot be selected
        c || u || h || i || l)) {
            const _ = await this.swap(t, e, s), { keep: I, send: T } = _, b = _.serialized;
            return {
                keep: I,
                send: T,
                serialized: b
            };
        }
        if (j(d) < t + y) throw new Error("Not enough funds available to send");
        return {
            keep: f,
            send: d
        };
    }
    /**
   * Selects proofs to send based on amount and fee inclusion.
   *
   * @remarks
   * Uses an adapted Randomized Greedy with Local Improvement (RGLI) algorithm, which has a time
   * complexity O(n log n) and space complexity O(n).
   * @param proofs Array of Proof objects available to select from.
   * @param amountToSend The target amount to send.
   * @param includeFees Optional boolean to include fees; Default: false.
   * @returns SendResponse containing proofs to keep and proofs to send.
   * @see https://crypto.ethz.ch/publications/files/Przyda02.pdf
   */ selectProofsToSend(t, e, s = !1) {
        this.assertAmount(e, "selectProofsToSend");
        const o = 60, r = 0, a = 0, i = 1e3, c = 5e3, u = !1, h = De();
        let l = null, f = 1 / 0, d = 0, y = 0;
        const _ = (g, p)=>g - (s ? Math.ceil(p / 1e3) : 0), I = (g)=>{
            const p = [
                ...g
            ];
            for(let k = p.length - 1; k > 0; k--){
                const w = Math.floor(Math.random() * (k + 1));
                [p[k], p[w]] = [
                    p[w],
                    p[k]
                ];
            }
            return p;
        }, T = (g, p, k)=>{
            let w = 0, A = g.length - 1, P = null;
            for(; w <= A;){
                const C = Math.floor((w + A) / 2), z = g[C].exFee;
                (k ? z <= p : z >= p) ? (P = C, k ? w = C + 1 : A = C - 1) : k ? A = C - 1 : w = C + 1;
            }
            return k ? P : w < g.length ? w : null;
        }, b = (g, p)=>{
            const k = p.exFee;
            let w = 0, A = g.length;
            for(; w < A;){
                const P = Math.floor((w + A) / 2);
                g[P].exFee < k ? w = P + 1 : A = P;
            }
            g.splice(w, 0, p);
        }, m = (g, p)=>_(g, p) < e ? 1 / 0 : g + p / 1e3 - e;
        let E = 0, F = 0;
        const $ = t.map((g)=>{
            const p = this.getProofFeePPK(g), k = s ? g.amount - p / 1e3 : g.amount, w = {
                proof: g,
                exFee: k,
                ppkfee: p
            };
            return (!s || k > 0) && (E += g.amount, F += p), w;
        });
        let B = s ? $.filter((g)=>g.exFee > 0) : $;
        if (B.sort((g, p)=>g.exFee - p.exFee), B.length > 0) {
            let g;
            {
                const p = T(B, e, !1);
                if (p !== null) {
                    const k = B[p].exFee, w = T(B, k, !0);
                    if (w === null) throw new Error("Unexpected null rightIndex in binary search");
                    g = w + 1;
                } else g = B.length;
            }
            for(let p = g; p < B.length; p++)E -= B[p].proof.amount, F -= B[p].ppkfee;
            B = B.slice(0, g);
        }
        const st = _(E, F);
        if (e <= 0 || e > st) return {
            keep: t,
            send: []
        };
        const Y = Math.min(Math.ceil(e * (1 + r / 100)), e + a, st);
        for(let g = 0; g < o; g++){
            const p = [];
            let k = 0, w = 0;
            for (const D of I(B)){
                const U = k + D.proof.amount, K = w + D.ppkfee, W = _(U, K);
                if (p.push(D), k = U, w = K, W >= e) break;
            }
            const A = new Set(p), P = B.filter((D)=>!A.has(D)), C = I(Array.from({
                length: p.length
            }, (D, U)=>U)).slice(0, c);
            for (const D of C){
                const U = _(k, w);
                if (U === e || U >= e && U <= Y) break;
                const K = p[D], W = k - K.proof.amount, G = w - K.ppkfee, Yt = _(W, G), St = e - Yt, ct = T(P, St, u);
                if (ct !== null) {
                    const nt = P[ct];
                    (St >= 0 || nt.exFee <= K.exFee) && (p[D] = nt, k = W + nt.proof.amount, w = G + nt.ppkfee, P.splice(ct, 1), b(P, K));
                }
            }
            const z = m(k, w);
            if (z < f) {
                this._logger.debug("selectProofsToSend: best solution found in trial #{trial} - amount: {amount}, delta: {delta}", {
                    trial: g,
                    amount: k,
                    delta: z
                }), l = [
                    ...p
                ].sort((U, K)=>K.exFee - U.exFee), f = z, d = k, y = w;
                const D = [
                    ...l
                ];
                for(; D.length > 1 && f > 0;){
                    const U = D.pop(), K = k - U.proof.amount, W = w - U.ppkfee, G = m(K, W);
                    if (G == 1 / 0) break;
                    G < f && (l = [
                        ...D
                    ], f = G, d = K, y = W, k = K, w = W);
                }
            }
            if (l && f < 1 / 0) {
                const D = _(d, y);
                if (D === e || D >= e && D <= Y) break;
            }
            if (h.elapsed() > i) {
                this._logger.warn("Proof selection took too long. Returning best selection so far.");
                break;
            }
        }
        if (l && f < 1 / 0) {
            const g = l.map((w)=>w.proof), p = new Set(g), k = t.filter((w)=>!p.has(w));
            return this._logger.info("Proof selection took {time}ms", {
                time: h.elapsed()
            }), {
                keep: k,
                send: g
            };
        }
        return {
            keep: t,
            send: []
        };
    }
    /**
   * Calculates the fees based on inputs (proofs)
   *
   * @param proofs Input proofs to calculate fees for.
   * @returns Fee amount.
   * @throws Throws an error if the proofs keyset is unknown.
   */ getFeesForProofs(t) {
        const e = t.reduce((s, o)=>s + this.getProofFeePPK(o), 0);
        return Math.ceil(e / 1e3);
    }
    /**
   * Returns the current fee PPK for a proof according to the cached keyset.
   *
   * @param proof {Proof} A single proof.
   * @returns FeePPK {number} The feePPK for the selected proof.
   * @throws Throws an error if the proofs keyset is unknown.
   */ getProofFeePPK(t) {
        const e = this._keysets.find((s)=>s.id === t.id);
        if (!e) throw new Error(`Could not get fee. No keyset found for keyset id: ${t.id}`);
        return e?.input_fee_ppk || 0;
    }
    /**
   * Calculates the fees based on inputs for a given keyset.
   *
   * @param nInputs Number of inputs.
   * @param keysetId KeysetId used to lookup `input_fee_ppk`
   * @returns Fee amount.
   */ getFeesForKeyset(t, e) {
        return Math.floor(Math.max((t * (this._keysets.find((o)=>o.id === e)?.input_fee_ppk || 0) + 999) / 1e3, 0));
    }
    /**
   * Splits and creates sendable tokens if no amount is specified, the amount is implied by the
   * cumulative amount of all proofs if both amount and preference are set, but the preference
   * cannot fulfill the amount, then we use the default split.
   *
   * @param {SwapOptions} [options] - Optional parameters for configuring the swap operation.
   * @returns Promise of the change- and send-proofs.
   */ async swap(t, e, s) {
        this.assertAmount(t, "swap");
        let { outputAmounts: o } = s || {};
        const { includeFees: r, keysetId: a, counter: i, pubkey: c, privkey: u, proofsWeHave: h, outputData: l, p2pk: f } = s || {}, d = await this.getKeys(a);
        let y = t;
        const _ = j(e);
        let I = o?.sendAmounts || R(y, d.keys);
        if (r) {
            let A = this.getFeesForKeyset(I.length, d.id), P = R(A, d.keys);
            for(; this.getFeesForKeyset(I.concat(P).length, d.id) > A;)A++, P = R(A, d.keys);
            I = I.concat(P), y += A;
        }
        const { keep: T, send: b } = this.selectProofsToSend(e, y, !0), m = j(b) - this.getFeesForProofs(b) - y;
        if (m < 0) throw new Error("Not enough balance to send");
        let E;
        if (!o?.keepAmounts && !h) E = R(m, d.keys);
        else if (!o?.keepAmounts && h) E = Bt(h, m, d.keys, this._denominationTarget);
        else if (o) {
            if (o.keepAmounts?.reduce((A, P)=>A + P, 0) != m) throw new Error("Keep amounts do not match amount to keep");
            E = o.keepAmounts;
        }
        if (y + this.getFeesForProofs(b) > _) throw this._logger.error(`Not enough funds available (${_}) for swap amountToSend: ${y} + fee: ${this.getFeesForProofs(b)} | length: ${b.length}`), new Error("Not enough funds available for swap");
        o = {
            keepAmounts: E,
            sendAmounts: I
        };
        const F = l?.keep || this._keepFactory, $ = l?.send, B = this.createSwapPayload(y, b, d, o, i, c, u, {
            keep: F,
            send: $
        }, f), { signatures: st } = await this.mint.swap(B.payload), Y = B.outputData.map((A, P)=>A.toProof(st[P], d)), g = [], p = [], k = Array(B.keepVector.length), w = Array(Y.length);
        return B.sortedIndices.forEach((A, P)=>{
            k[A] = B.keepVector[P], w[A] = Y[P];
        }), w.forEach((A, P)=>{
            k[P] ? g.push(A) : p.push(A);
        }), {
            keep: [
                ...g,
                ...T
            ],
            send: p
        };
    }
    /**
   * Restores batches of deterministic proofs until no more signatures are returned from the mint.
   *
   * @param [gapLimit=300] The amount of empty counters that should be returned before restoring
   *   ends (defaults to 300). Default is `300`
   * @param [batchSize=100] The amount of proofs that should be restored at a time (defaults to
   *   100). Default is `100`
   * @param [counter=0] The counter that should be used as a starting point (defaults to 0). Default
   *   is `0`
   * @param [keysetId] Which keysetId to use for the restoration. If none is passed the instance's
   *   default one will be used.
   */ async batchRestore(t = 300, e = 100, s = 0, o) {
        const r = Math.ceil(t / e), a = [];
        let i, c = 0;
        for(; c < r;){
            const u = await this.restore(s, e, {
                keysetId: o
            });
            u.proofs.length > 0 ? (c = 0, a.push(...u.proofs), i = u.lastCounterWithSignature) : c++, s += e;
        }
        return {
            proofs: a,
            lastCounterWithSignature: i
        };
    }
    /**
   * Regenerates.
   *
   * @param start Set starting point for count (first cycle for each keyset should usually be 0)
   * @param count Set number of blinded messages that should be generated.
   * @param options.keysetId Set a custom keysetId to restore from. keysetIds can be loaded with
   *   `CashuMint.getKeySets()`
   */ async restore(t, e, s) {
        const { keysetId: o } = s || {}, r = await this.getKeys(o);
        if (!this._seed) throw new Error("CashuWallet must be initialized with a seed to use restore");
        const a = Array(e).fill(0), i = L.createDeterministicData(0, this._seed, t, r, a), { outputs: c, signatures: u } = await this.mint.restore({
            outputs: i.map((d)=>d.blindedMessage)
        }), h = {};
        c.forEach((d, y)=>h[d.B_] = u[y]);
        const l = [];
        let f;
        for(let d = 0; d < i.length; d++){
            const y = h[i[d].blindedMessage.B_];
            y && (f = t + d, i[d].blindedMessage.amount = y.amount, l.push(i[d].toProof(y, r)));
        }
        return {
            proofs: l,
            lastCounterWithSignature: f
        };
    }
    /**
   * Requests a mint quote from the mint. Response returns a Lightning payment request for the
   * requested given amount and unit.
   *
   * @param amount Amount requesting for mint.
   * @param description Optional description for the mint quote.
   * @param pubkey Optional public key to lock the quote to.
   * @returns The mint will return a mint quote with a Lightning invoice for minting tokens of the
   *   specified amount and unit.
   */ async createMintQuote(t, e) {
        this.assertAmount(t, "createMintQuote");
        const s = {
            unit: this._unit,
            amount: t,
            description: e
        }, o = await this.mint.createMintQuote(s);
        return {
            ...o,
            amount: o.amount || t,
            unit: o.unit || this.unit
        };
    }
    /**
   * Requests a mint quote from the mint that is locked to a public key.
   *
   * @param amount Amount requesting for mint.
   * @param pubkey Public key to lock the quote to.
   * @param description Optional description for the mint quote.
   * @returns The mint will return a mint quote with a Lightning invoice for minting tokens of the
   *   specified amount and unit. The quote will be locked to the specified `pubkey`.
   */ async createLockedMintQuote(t, e, s) {
        this.assertAmount(t, "createLockedMintQuote");
        const { supported: o } = (await this.lazyGetMintInfo()).isSupported(20);
        if (!o) throw new Error("Mint does not support NUT-20");
        const r = {
            unit: this._unit,
            amount: t,
            description: s,
            pubkey: e
        }, a = await this.mint.createMintQuote(r);
        if (typeof a.pubkey != "string") throw new Error("Mint returned unlocked mint quote");
        {
            const i = a.pubkey;
            return {
                ...a,
                pubkey: i,
                amount: a.amount || t,
                unit: a.unit || this.unit
            };
        }
    }
    /**
   * Requests a mint quote from the mint. Response returns a Lightning BOLT12 offer for the
   * requested given amount and unit.
   *
   * @param pubkey Public key to lock the quote to.
   * @param options.amount BOLT12 offer amount requesting for mint. If not specified, the offer will
   *   be amountless.
   * @param options.description Description for the mint quote.
   * @returns The mint will return a mint quote with a Lightning invoice for minting tokens of the
   *   specified amount and unit.
   */ async createMintQuoteBolt12(t, e) {
        const s = await this.lazyGetMintInfo();
        if (e?.description && !s.supportsBolt12Description) throw new Error("Mint does not support description for bolt12");
        const o = {
            pubkey: t,
            unit: this._unit,
            amount: e?.amount,
            description: e?.description
        };
        return this.mint.createMintQuoteBolt12(o);
    }
    async checkMintQuote(t) {
        const e = typeof t == "string" ? t : t.quote, s = await this.mint.checkMintQuote(e);
        return typeof t == "string" ? s : {
            ...s,
            amount: s.amount || t.amount,
            unit: s.unit || t.unit
        };
    }
    /**
   * Gets an existing BOLT12 mint quote from the mint.
   *
   * @param quote Quote ID.
   * @returns The latest mint quote for the given quote ID.
   */ async checkMintQuoteBolt12(t) {
        return this.mint.checkMintQuoteBolt12(t);
    }
    async mintProofs(t, e, s) {
        return this._mintProofs("bolt11", t, e, s);
    }
    /**
   * Mint proofs for a given mint quote.
   *
   * @param amount Amount to request. This must be less than or equal to the `quote.amountPaid -
   *   quote.amountIssued`
   * @param {string} quote - ID of mint quote.
   * @param {string} privateKey - Private key to unlock the quote.
   * @param {MintProofOptions} [options] - Optional parameters for configuring the Mint Proof
   *   operation.
   * @returns Proofs.
   */ async mintProofsBolt12(t, e, s, o) {
        return this._mintProofs("bolt12", t, e, {
            ...o,
            privateKey: s
        });
    }
    /**
   * Requests a melt quote from the mint. Response returns amount and fees for a given unit in order
   * to pay a Lightning invoice.
   *
   * @param invoice LN invoice that needs to get a fee estimate.
   * @returns The mint will create and return a melt quote for the invoice with an amount and fee
   *   reserve.
   */ async createMeltQuote(t) {
        const e = {
            unit: this._unit,
            request: t
        }, s = await this.mint.createMeltQuote(e);
        return {
            ...s,
            unit: s.unit || this.unit,
            request: s.request || t
        };
    }
    /**
   * Requests a melt quote from the mint. Response returns amount and fees for a given unit in order
   * to pay a BOLT12 offer.
   *
   * @param offer BOLT12 offer that needs to get a fee estimate.
   * @param amountMsat Amount in millisatoshis for amount-less offers. If this is defined and the
   *   offer has an amount, they **MUST** be equal.
   * @returns The mint will create and return a melt quote for the offer with an amount and fee
   *   reserve.
   */ async createMeltQuoteBolt12(t, e) {
        return this.mint.createMeltQuoteBolt12({
            unit: this._unit,
            request: t,
            options: e ? {
                amountless: {
                    amount_msat: e
                }
            } : void 0
        });
    }
    /**
   * Requests a multi path melt quote from the mint.
   *
   * @param invoice LN invoice that needs to get a fee estimate.
   * @param partialAmount The partial amount of the invoice's total to be paid by this instance.
   * @returns The mint will create and return a melt quote for the invoice with an amount and fee
   *   reserve.
   */ async createMultiPathMeltQuote(t, e) {
        this.assertAmount(e, "createMultiPathMeltQuote");
        const { supported: s, params: o } = (await this.lazyGetMintInfo()).isSupported(15);
        if (!s) throw new Error("Mint does not support NUT-15");
        if (!o?.some((u)=>u.method === "bolt11" && u.unit === this.unit)) throw new Error(`Mint does not support MPP for bolt11 and ${this.unit}`);
        const a = {
            mpp: {
                amount: e
            }
        }, i = {
            unit: this._unit,
            request: t,
            options: a
        };
        return {
            ...await this.mint.createMeltQuote(i),
            request: t,
            unit: this._unit
        };
    }
    async checkMeltQuote(t) {
        const e = typeof t == "string" ? t : t.quote, s = await this.mint.checkMeltQuote(e);
        return typeof t == "string" ? s : {
            ...s,
            request: t.request,
            unit: t.unit
        };
    }
    async checkMeltQuoteBolt12(t) {
        return this.mint.checkMeltQuoteBolt12(t);
    }
    /**
   * Melt proofs for a melt quote. proofsToSend must be at least amount+fee_reserve form the melt
   * quote. This function does not perform coin selection!. Returns melt quote and change proofs.
   *
   * @param meltQuote ID of the melt quote.
   * @param proofsToSend Proofs to melt.
   * @param {MeltProofOptions} [options] - Optional parameters for configuring the Melting Proof
   *   operation.
   * @returns
   */ async meltProofs(t, e, s) {
        return this._meltProofs("bolt11", t, e, s);
    }
    /**
   * Melt proofs for a melt quote. proofsToSend must be at least amount+fee_reserve form the melt
   * quote. This function does not perform coin selection!. Returns melt quote and change proofs.
   *
   * @param meltQuote ID of the melt quote.
   * @param proofsToSend Proofs to melt.
   * @param {MeltProofOptions} [options] - Optional parameters for configuring the Melting Proof
   *   operation.
   * @returns
   */ async meltProofsBolt12(t, e, s) {
        return this._meltProofs("bolt12", t, e, s);
    }
    /**
   * Creates a split payload.
   *
   * @param amount Amount to send.
   * @param proofsToSend Proofs to split*
   * @param outputAmounts? Optionally specify the output's amounts to keep and to send.
   * @param counter? Optionally set counter to derive secret deterministically. CashuWallet class
   *   must be initialized with seed phrase to take effect.
   * @param pubkey? Optionally locks ecash to pubkey. Will not be deterministic, even if counter is
   *   set!
   * @param privkey? Will create a signature on the @param proofsToSend secrets if set.
   * @param customOutputData? Optionally specify your own OutputData (blinded messages)
   * @param p2pk? Optionally specify options to lock the proofs according to NUT-11.
   * @returns
   */ createSwapPayload(t, e, s, o, r, a, i, c, u) {
        const h = e.reduce((m, E)=>m + E.amount, 0);
        o && o.sendAmounts && !o.keepAmounts && (o.keepAmounts = R(h - t - this.getFeesForProofs(e), s.keys));
        const l = h - t - this.getFeesForProofs(e);
        let f = [], d = [];
        if (c?.keep) if (mt(c.keep)) {
            const m = c.keep;
            R(l, s.keys).forEach((F)=>{
                f.push(m(F, s));
            });
        } else f = c.keep;
        else f = this.createOutputData(l, s, r, void 0, o?.keepAmounts, void 0, this._keepFactory);
        if (c?.send) if (mt(c.send)) {
            const m = c.send;
            R(t, s.keys).forEach((F)=>{
                d.push(m(F, s));
            });
        } else d = c.send;
        else d = this.createOutputData(t, s, r ? r + f.length : void 0, a, o?.sendAmounts, u);
        i && (e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signP2PKProofs"])(e, i)), e = it(e), e = e.map((m)=>{
            const E = m.witness && typeof m.witness != "string" ? JSON.stringify(m.witness) : m.witness;
            return {
                ...m,
                witness: E
            };
        });
        const y = [
            ...f,
            ...d
        ], _ = y.map((m, E)=>E).sort((m, E)=>y[m].blindedMessage.amount - y[E].blindedMessage.amount), I = [
            ...Array.from({
                length: f.length
            }, ()=>!0),
            ...Array.from({
                length: d.length
            }, ()=>!1)
        ], T = _.map((m)=>y[m]), b = _.map((m)=>I[m]);
        return {
            payload: {
                inputs: e,
                outputs: T.map((m)=>m.blindedMessage)
            },
            outputData: T,
            keepVector: b,
            sortedIndices: _
        };
    }
    /**
   * Get an array of the states of proofs from the mint (as an array of CheckStateEnum's)
   *
   * @param proofs (only the `secret` field is required)
   * @returns
   */ async checkProofsStates(t) {
        const e = new TextEncoder(), s = t.map((a)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hashToCurve"])(e.encode(a.secret)).toHex(!0)), o = 100, r = [];
        for(let a = 0; a < s.length; a += o){
            const i = s.slice(a, a + o), { states: c } = await this.mint.check({
                Ys: i
            }), u = {};
            c.forEach((h)=>{
                u[h.Y] = h;
            });
            for(let h = 0; h < i.length; h++){
                const l = u[i[h]];
                if (!l) throw new Error("Could not find state for proof with Y: " + i[h]);
                r.push(l);
            }
        }
        return r;
    }
    /**
   * Register a callback to be called whenever a mint quote's state changes.
   *
   * @param quoteIds List of mint quote IDs that should be subscribed to.
   * @param callback Callback function that will be called whenever a mint quote state changes.
   * @param errorCallback
   * @returns
   */ async onMintQuoteUpdates(t, e, s) {
        if (await this.mint.connectWebSocket(), !this.mint.webSocketConnection) throw new Error("failed to establish WebSocket connection.");
        const o = this.mint.webSocketConnection.createSubscription({
            kind: "bolt11_mint_quote",
            filters: t
        }, e, s);
        return ()=>{
            this.mint.webSocketConnection?.cancelSubscription(o, e);
        };
    }
    /**
   * Register a callback to be called whenever a melt quote's state changes.
   *
   * @param quoteIds List of melt quote IDs that should be subscribed to.
   * @param callback Callback function that will be called whenever a melt quote state changes.
   * @param errorCallback
   * @returns
   */ async onMeltQuotePaid(t, e, s) {
        return this.onMeltQuoteUpdates([
            t
        ], (o)=>{
            o.state === tt.PAID && e(o);
        }, s);
    }
    /**
   * Register a callback to be called when a single mint quote gets paid.
   *
   * @param quoteId Mint quote id that should be subscribed to.
   * @param callback Callback function that will be called when this mint quote gets paid.
   * @param errorCallback
   * @returns
   */ async onMintQuotePaid(t, e, s) {
        return this.onMintQuoteUpdates([
            t
        ], (o)=>{
            o.state === yt.PAID && e(o);
        }, s);
    }
    /**
   * Register a callback to be called when a single melt quote gets paid.
   *
   * @param quoteId Melt quote id that should be subscribed to.
   * @param callback Callback function that will be called when this melt quote gets paid.
   * @param errorCallback
   * @returns
   */ async onMeltQuoteUpdates(t, e, s) {
        if (await this.mint.connectWebSocket(), !this.mint.webSocketConnection) throw new Error("failed to establish WebSocket connection.");
        const o = this.mint.webSocketConnection.createSubscription({
            kind: "bolt11_melt_quote",
            filters: t
        }, e, s);
        return ()=>{
            this.mint.webSocketConnection?.cancelSubscription(o, e);
        };
    }
    /**
   * Register a callback to be called whenever a subscribed proof state changes.
   *
   * @param proofs List of proofs that should be subscribed to.
   * @param callback Callback function that will be called whenever a proof's state changes.
   * @param errorCallback
   * @returns
   */ async onProofStateUpdates(t, e, s) {
        if (await this.mint.connectWebSocket(), !this.mint.webSocketConnection) throw new Error("failed to establish WebSocket connection.");
        const o = new TextEncoder(), r = {};
        for(let c = 0; c < t.length; c++){
            const u = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$common$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hashToCurve"])(o.encode(t[c].secret)).toHex(!0);
            r[u] = t[c];
        }
        const a = Object.keys(r), i = this.mint.webSocketConnection.createSubscription({
            kind: "proof_state",
            filters: a
        }, (c)=>{
            e({
                ...c,
                proof: r[c.Y]
            });
        }, s);
        return ()=>{
            this.mint.webSocketConnection?.cancelSubscription(i, e);
        };
    }
    /**
   * Creates blinded messages for a according to @param amounts.
   *
   * @param amount Array of amounts to create blinded messages for.
   * @param counter? Optionally set counter to derive secret deterministically. CashuWallet class
   *   must be initialized with seed phrase to take effect.
   * @param pubkey? Optionally locks ecash to pubkey. Will not be deterministic, even if counter is
   *   set!
   * @param outputAmounts? Optionally specify the output's amounts to keep and to send.
   * @param p2pk? Optionally specify options to lock the proofs according to NUT-11.
   * @param factory? Optionally specify a custom function that produces OutputData (blinded
   *   messages)
   * @returns Blinded messages, secrets, rs, and amounts.
   */ createOutputData(t, e, s, o, r, a, i) {
        let c;
        if (o) c = L.createP2PKData({
            pubkey: o,
            additionalTags: a?.additionalTags
        }, t, e, r);
        else if (s || s === 0) {
            if (!this._seed) throw new Error("cannot create deterministic messages without seed");
            c = L.createDeterministicData(t, this._seed, s, e, r);
        } else a ? c = L.createP2PKData(a, t, e, r) : i ? c = R(t, e.keys).map((h)=>i(h, e)) : c = L.createRandomData(t, e, r);
        return c;
    }
    /**
   * Creates NUT-08 blank outputs (fee returns) for a given fee reserve See:
   * https://github.com/cashubtc/nuts/blob/main/08.md.
   *
   * @param amount Amount to cover with blank outputs.
   * @param keysetId Mint keysetId.
   * @param counter? Optionally set counter to derive secret deterministically. CashuWallet class
   *   must be initialized with seed phrase to take effect.
   * @returns Blinded messages, secrets, and rs.
   */ createBlankOutputs(t, e, s, o) {
        let r = Math.ceil(Math.log2(t)) || 1;
        r < 0 && (r = 0);
        const a = r ? Array(r).fill(0) : [];
        return this.createOutputData(0, e, s, void 0, a, void 0, o);
    }
    /**
   * Mints proofs for a given mint quote created with the bolt11 or bolt12 method.
   *
   * @param method Payment method of the quote.
   * @param amount Amount to mint.
   * @param quote The bolt11 or bolt12 mint quote.
   * @param options Optional parameters for configuring the Mint Proof operation.
   * @returns Proofs.
   */ async _mintProofs(t, e, s, o) {
        this.assertAmount(e, "_mintProofs");
        let { outputAmounts: r } = o || {};
        const { counter: a, pubkey: i, p2pk: c, keysetId: u, proofsWeHave: h, outputData: l, privateKey: f } = o || {}, d = await this.getKeys(u);
        !r && h && (r = {
            keepAmounts: Bt(h, e, d.keys, this._denominationTarget),
            sendAmounts: []
        });
        let y = [];
        if (l) if (mt(l)) {
            const b = R(e, d.keys, r?.keepAmounts);
            for(let m = 0; m < b.length; m++)y.push(l(b[m], d));
        } else y = l;
        else if (this._keepFactory) {
            const b = R(e, d.keys, r?.keepAmounts);
            for(let m = 0; m < b.length; m++)y.push(this._keepFactory(b[m], d));
        } else y = this.createOutputData(e, d, a, i, r?.keepAmounts, c);
        const _ = y.map((b)=>b.blindedMessage), I = {
            outputs: _,
            quote: typeof s == "string" ? s : s.quote
        };
        if (typeof s != "string" && s.pubkey) {
            if (!f) throw new Error("Can not sign locked quote without private key");
            I.signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT20$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signMintQuote"])(f, s.quote, _);
        }
        if (t === "bolt12") {
            const { signatures: b } = await this.mint.mintBolt12(I);
            return y.map((m, E)=>m.toProof(b[E], d));
        }
        const { signatures: T } = await this.mint.mint(I);
        return y.map((b, m)=>b.toProof(T[m], d));
    }
    /**
   * Melt proofs for a given melt quote created with the bolt11 or bolt12 method.
   *
   * @param method Payment method of the quote.
   * @param meltQuote The bolt11 or bolt12 melt quote.
   * @param proofsToSend Proofs to melt.
   * @param options Optional parameters for configuring the Melting Proof operation.
   * @returns Melt quote and change proofs.
   */ async _meltProofs(t, e, s, o) {
        const { keysetId: r, counter: a, privkey: i } = o || {}, c = await this.getKeys(r), u = this.createBlankOutputs(j(s) - e.amount, c, a, this._keepFactory);
        i != null && (s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$crypto$2f$client$2f$NUT11$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signP2PKProofs"])(s, i)), s = it(s), s = s.map((f)=>{
            const d = f.witness && typeof f.witness != "string" ? JSON.stringify(f.witness) : f.witness;
            return {
                ...f,
                witness: d
            };
        });
        const h = {
            quote: e.quote,
            inputs: s,
            outputs: u.map((f)=>f.blindedMessage)
        };
        if (t === "bolt12") {
            const f = await this.mint.meltBolt12(h);
            return {
                quote: {
                    ...f,
                    unit: e.unit,
                    request: e.request
                },
                change: f.change?.map((d, y)=>u[y].toProof(d, c)) ?? []
            };
        }
        const l = await this.mint.melt(h);
        return {
            quote: {
                ...l,
                unit: e.unit,
                request: e.request
            },
            change: l.change?.map((f, d)=>u[d].toProof(f, c)) ?? []
        };
    }
}
class X {
    /**
   * @param _mintUrl Requires mint URL to create this object.
   * @param _customRequest If passed, use custom request implementation for network communication
   *   with the mint.
   */ constructor(t, e){
        this._mintUrl = t, this._customRequest = e, this._mintUrl = zt(t), this._customRequest = e;
    }
    get mintUrl() {
        return this._mintUrl;
    }
    /**
   * Mints new Blinded Authentication tokens by requesting blind signatures on the provided outputs.
   *
   * @param mintUrl
   * @param mintPayload Payload containing the outputs to get blind signatures on.
   * @param clearAuthToken A NUT-21 clear auth token.
   * @param customRequest
   * @returns Serialized blinded signatures.
   */ static async mint(t, e, s, o) {
        const r = o || M, a = {
            "Clear-auth": `${s}`
        }, i = await r({
            endpoint: S(t, "/v1/auth/blind/mint"),
            method: "POST",
            requestBody: e,
            headers: a
        });
        if (!N(i) || !Array.isArray(i?.signatures)) throw new Error("bad response");
        return i;
    }
    /**
   * Mints new Blinded Authentication tokens by requesting blind signatures on the provided outputs.
   *
   * @param mintPayload Payload containing the outputs to get blind signatures on.
   * @param clearAuthToken A NUT-21 clear auth token.
   * @returns Serialized blinded signatures.
   */ async mint(t, e) {
        return X.mint(this._mintUrl, t, e, this._customRequest);
    }
    /**
   * Get the mints public NUT-22 keys.
   *
   * @param mintUrl
   * @param keysetId Optional param to get the keys for a specific keyset. If not specified, the
   *   keys from all active keysets are fetched.
   * @param customRequest
   * @returns
   */ static async getKeys(t, e, s) {
        const r = await (s || M)({
            endpoint: e ? S(t, "/v1/auth/blind/keys", e) : S(t, "/v1/auth/blind/keys")
        });
        if (!N(r) || !Array.isArray(r.keysets)) throw new Error("bad response");
        return r;
    }
    /**
   * Get the mints public NUT-22 keys.
   *
   * @param keysetId Optional param to get the keys for a specific keyset. If not specified, the
   *   keys from all active keysets are fetched.
   * @returns The mints public keys.
   */ async getKeys(t, e) {
        return await X.getKeys(e || this._mintUrl, t, this._customRequest);
    }
    /**
   * Get the mints NUT-22 keysets in no specific order.
   *
   * @param mintUrl
   * @param customRequest
   * @returns All the mints past and current keysets.
   */ static async getKeySets(t, e) {
        return (e || M)({
            endpoint: S(t, "/v1/auth/blind/keysets")
        });
    }
    /**
   * Get the mints NUT-22 keysets in no specific order.
   *
   * @returns All the mints past and current keysets.
   */ async getKeySets() {
        return X.getKeySets(this._mintUrl, this._customRequest);
    }
}
class Le {
    /**
   * @param mint NUT-22 auth mint instance.
   * @param options.keys Public keys from the mint (will be fetched from mint if not provided)
   * @param options.keysets Keysets from the mint (will be fetched from mint if not provided)
   */ constructor(t, e){
        this._keys = /* @__PURE__ */ new Map(), this._keysets = [], this._unit = "auth", this.mint = t;
        let s = [];
        e?.keys && !Array.isArray(e.keys) ? s = [
            e.keys
        ] : e?.keys && Array.isArray(e?.keys) && (s = e?.keys), s && s.forEach((o)=>this._keys.set(o.id, o)), e?.keysets && (this._keysets = e.keysets);
    }
    get keys() {
        return this._keys;
    }
    get keysetId() {
        if (!this._keysetId) throw new Error("No keysetId set");
        return this._keysetId;
    }
    set keysetId(t) {
        this._keysetId = t;
    }
    get keysets() {
        return this._keysets;
    }
    /**
   * Load mint information, keysets and keys. This function can be called if no keysets are passed
   * in the constructor.
   */ async loadMint() {
        await this.getKeySets(), await this.getKeys();
    }
    /**
   * Choose a keyset to activate based on the lowest input fee.
   *
   * Note: this function will filter out deprecated base64 keysets.
   *
   * @param keysets Keysets to choose from.
   * @returns Active keyset.
   */ getActiveKeyset(t) {
        let e = t.filter((o)=>o.active);
        e = e.filter((o)=>o.id.startsWith("00"));
        const s = e.sort((o, r)=>(o.input_fee_ppk ?? 0) - (r.input_fee_ppk ?? 0))[0];
        if (!s) throw new Error("No active keyset found");
        return s;
    }
    /**
   * Get keysets from the mint with the unit of the wallet.
   *
   * @returns Keysets with wallet's unit.
   */ async getKeySets() {
        const e = (await this.mint.getKeySets()).keysets.filter((s)=>s.unit === this._unit);
        return this._keysets = e, this._keysets;
    }
    /**
   * Get all active keys from the mint and set the keyset with the lowest fees as the active wallet
   * keyset.
   *
   * @returns Keyset.
   */ async getAllKeys() {
        const t = await this.mint.getKeys();
        return this._keys = new Map(t.keysets.map((e)=>[
                e.id,
                e
            ])), this.keysetId = this.getActiveKeyset(this._keysets).id, t.keysets;
    }
    /**
   * Get public keys from the mint. If keys were already fetched, it will return those.
   *
   * If `keysetId` is set, it will fetch and return that specific keyset. Otherwise, we select an
   * active keyset with the unit of the wallet.
   *
   * @param keysetId Optional keysetId to get keys for.
   * @param forceRefresh? If set to true, it will force refresh the keyset from the mint.
   * @returns Keyset.
   */ async getKeys(t, e) {
        if ((!(this._keysets.length > 0) || e) && await this.getKeySets(), t || (t = this.getActiveKeyset(this._keysets).id), !this._keysets.find((s)=>s.id === t) && (await this.getKeySets(), !this._keysets.find((s)=>s.id === t))) throw new Error(`could not initialize keys. No keyset with id '${t}' found`);
        if (!this._keys.get(t)) {
            const s = await this.mint.getKeys(t);
            this._keys.set(t, s.keysets[0]);
        }
        return this.keysetId = t, this._keys.get(t);
    }
    /**
   * Mint proofs for a given mint quote.
   *
   * @param amount Amount to request.
   * @param clearAuthToken ClearAuthToken to mint.
   * @param options.keysetId? Optionally set keysetId for blank outputs for returned change.
   * @returns Proofs.
   */ async mintProofs(t, e, s) {
        const o = await this.getKeys(s?.keysetId), r = L.createRandomData(t, o), a = {
            outputs: r.map((u)=>u.blindedMessage)
        }, { signatures: i } = await this.mint.mint(a, e), c = r.map((u, h)=>u.toProof(i[h], o));
        if (c.some((u)=>!Gt(u, o))) throw new Error("Mint returned auth proofs with invalid DLEQ");
        return c;
    }
}
function Ce(n) {
    const t = {
        id: n.id,
        secret: n.secret,
        C: n.C
    }, e = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$cashu$2b$cashu$2d$ts$40$2$2e$9$2e$0$2f$node_modules$2f40$cashu$2f$cashu$2d$ts$2f$lib$2f$NUT09$2d$DNug3BMz$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(t);
    return "auth" + "A" + e;
}
async function as(n, t, e) {
    const s = new X(t);
    return (await new Le(s).mintProofs(n, e)).map((a)=>Ce(a));
}
;
 //# sourceMappingURL=cashu-ts.es.js.map
}),
]);

//# sourceMappingURL=d575f_%40cashu_cashu-ts_lib_75cf8850._.js.map