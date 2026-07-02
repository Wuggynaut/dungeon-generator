import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";
import type {LanguagePhonology, Phoneme, SyllablePortion} from "./data/languages.ts";

function sonorityOf(phonemes: Phoneme[], sound: string): number {
    const found = phonemes.find(p => sound.startsWith(p.text));
    if (!found) throw new Error(`Unknown consonant sound: ${sound}`);
    return found.sonority;
}

function splitCluster(phonemes: Phoneme[], cluster: string): string[] {
    const sorted = [...phonemes].sort((a, b) => b.text.length - a.text.length);
    const parts: string[] = [];
    let remaining = cluster;
    while (remaining.length > 0) {
        const match = sorted.find(p => remaining.startsWith(p.text));
        if (!match) throw new Error(`Can't parse cluster: ${cluster}`);
        parts.push(match.text);
        remaining = remaining.slice(match.text.length);
    }
    return parts;
}

function isValidOnsetCluster(phonemes: Phoneme[], cluster: string): boolean {
    const ranks = splitCluster(phonemes, cluster).map(s => sonorityOf(phonemes, s));
    for (let i = 1; i < ranks.length; i++) {
        if (ranks[i] <= ranks[i - 1]) return false; // must rise toward the vowel
    }
    return true;
}

function isValidCodaCluster(phonemes: Phoneme[], cluster: string): boolean {
    const ranks = splitCluster(phonemes, cluster).map(s => sonorityOf(phonemes, s));
    for (let i = 1; i < ranks.length; i++) {
        if (ranks[i] >= ranks[i - 1]) return false; // must fall away from the vowel
    }
    return true;
}

function validateLanguage(lang: LanguagePhonology): void {
    for (const c of lang.onsetClusters) {
        if (!isValidOnsetCluster(lang.consonants, c)) {
            throw new Error(`${lang.name}: onset cluster "${c}" violates sonority sequencing`);
        }
    }
    for (const c of lang.codaClusters) {
        if (!isValidCodaCluster(lang.consonants, c)) {
            throw new Error(`${lang.name}: coda cluster "${c}" violates sonority sequencing`);
        }
    }
}

function boundaryIsLegal(codaLastRank: number | null, onsetFirstRank: number | null): boolean {
    if (codaLastRank === null || onsetFirstRank === null) return true; // one side is a vowel
    return codaLastRank !== onsetFirstRank; // two consonants of the same sonority tier are hard to parse as separate
}

type ConsonantWeights = { single: number; cluster: number; empty: number };

function pickConsonantSound(
    rng: Rng,
    lang: LanguagePhonology,
    clusters: string[],
    weights: ConsonantWeights,
): { text: string; lastRank: number } {
    const options: SyllablePortion[] = [
        { name: "Single", weight: weights.single, table: lang.consonants.map(p => p.text) },
        { name: "Cluster", weight: weights.cluster, table: clusters },
        { name: "Empty", weight: weights.empty },
    ];
    const picked = pickWeighted(rng, options);
    if (!picked.table) return { text: "", lastRank: -1 };
    const text = rng.pick(picked.table);
    const parts = splitCluster(lang.consonants, text);
    return { text, lastRank: sonorityOf(lang.consonants, parts[parts.length - 1]) };
}

const DEFAULT_CONSONANT_WEIGHTS: ConsonantWeights = { single: 3, cluster: 1, empty: 2 };

export function generateWord(
    lang: LanguagePhonology,
    seed: string,
    slotId: string,
    options?: {
        syllableCountWeights?: { syllables: number; weight: number }[];
        consonantWeights?: ConsonantWeights;
    },
): string {
    validateLanguage(lang);
    const rng = makeChildRng(seed, slotId);
    const countWeights = options?.syllableCountWeights ?? lang.syllableCountWeights;
    const consonantWeights = options?.consonantWeights ?? DEFAULT_CONSONANT_WEIGHTS;
    const count = pickWeighted(rng, countWeights);

    let word = "";
    let prevCodaRank: number | null = null;

    for (let i = 0; i < count.syllables; i++) {
        let onset = pickConsonantSound(rng, lang, lang.onsetClusters, consonantWeights);
        let tries = 0;
        while (!boundaryIsLegal(prevCodaRank, onset.lastRank < 0 ? null : onset.lastRank) && tries < 20) {
            onset = pickConsonantSound(rng, lang, lang.onsetClusters, consonantWeights);
            tries++;
        }

        const nucleus = rng.pick([...lang.vowels, ...lang.diphthongs]);
        const coda = pickConsonantSound(rng, lang, lang.codaClusters, consonantWeights);

        word += onset.text + nucleus + coda.text;
        prevCodaRank = coda.lastRank < 0 ? null : coda.lastRank;
    }

    return word;
}

export function generateName(lang: LanguagePhonology, seed: string, slotId: string): string {
    const word = generateWord(lang, seed, slotId, {
        syllableCountWeights: [
            { syllables: 1, weight: 1 },
            { syllables: 2, weight: 5 },
            { syllables: 3, weight: 2 },
        ],
        consonantWeights: { single: 4, cluster: 1, empty: 3 },
    });
    return word.charAt(0).toUpperCase() + word.slice(1);
}