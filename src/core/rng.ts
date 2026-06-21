export function mulberry32(seed: number): () => number {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function xmur3(str: string): () => number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

export function hashSeed(str: string): number {
    return xmur3(str)();
}

export function makeChildRng(masterSeed: string, label: string): Rng {
    const childSeed = hashSeed(`${masterSeed}:${label}`);
    return makeRng(childSeed);
}

export interface Rng {
    next(): number;
    int(n: number): number;
    die(sides: number): number;
    pick<T>(arr: T[]): T;
}

export function makeRng(seed: number): Rng {
    const next = mulberry32(seed);
    const int = (n: number) => Math.floor(next() * n);
    return {
        next,
        int,
        die: (sides: number) => int(sides) + 1,
        pick: <T>(arr: T[]): T => arr[int(arr.length)],
    };
}

