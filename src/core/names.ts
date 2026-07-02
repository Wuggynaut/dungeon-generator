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
    if (codaLastRank === null && onsetFirstRank === null) return false; // two vowels touching
    if (codaLastRank === null || onsetFirstRank === null) return true;  // exactly one consonant zone, acceptable
    return codaLastRank !== onsetFirstRank;
}

type ConsonantWeights = { single: number; cluster: number; empty: number };

function pickConsonantSound(
    rng: Rng,
    lang: LanguagePhonology,
    clusters: string[],
    weights: ConsonantWeights,
): { text: string; firstRank: number; lastRank: number } {
    const options = [
        { name: "Single", weight: weights.single, table: lang.consonants.map(p => p.text) },
        { name: "Cluster", weight: weights.cluster, table: clusters },
        { name: "Empty", weight: weights.empty },
    ];
    const picked = pickWeighted(rng, options);
    if (!picked.table) return { text: "", firstRank: -1, lastRank: -1 };
    const text = rng.pick(picked.table);
    const parts = splitCluster(lang.consonants, text);
    return {
        text,
        firstRank: sonorityOf(lang.consonants, parts[0]),
        lastRank: sonorityOf(lang.consonants, parts[parts.length - 1]),
    };
}

function isVowelSound(lang: LanguagePhonology, text: string): boolean {
    return lang.vowels.includes(text) || lang.diphthongs.includes(text) ||
        lang.vowels.some(v => text.endsWith(v)) || lang.diphthongs.some(d => text.endsWith(d));
}

function pickNameEnding(rng: Rng, lang:LanguagePhonology) {
    if (lang.nameEndings) return rng.pick(lang.nameEndings);
    const onset = pickConsonantSound(rng, lang, lang.onsetClusters, {
        empty: 7,
        single: 3,
        cluster: 0,
    });
    const nucleus = rng.pick([
        ...lang.vowels,
        ...lang.diphthongs,
    ]);

    const coda = pickConsonantSound(rng, lang, lang.codaClusters, {
        empty: 7,
        single: 3,
        cluster: 0,
    });

    return onset.text + nucleus + coda.text;
}

const DEFAULT_CONSONANT_WEIGHTS: ConsonantWeights = { single: 3, cluster: 1, empty: 2 };

export function generateWord(
    lang: LanguagePhonology,
    seed: string,
    slotId: string,
    options?: {
        syllableCountWeights?: { syllables: number; weight: number }[];
        consonantWeights?: ConsonantWeights;
        finalCodaWeights?: ConsonantWeights;
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
        while (!boundaryIsLegal(prevCodaRank, onset.firstRank < 0 ? null : onset.firstRank) && tries < 20) {
            onset = pickConsonantSound(rng, lang, lang.onsetClusters, consonantWeights);
            tries++;
        }

        const nucleus = rng.pick([...lang.vowels, ...lang.diphthongs]);
        const isFinal = i === count.syllables - 1;
        const codaWeights =
            isFinal
                ? options?.finalCodaWeights ?? consonantWeights
                : consonantWeights;

        const coda = pickConsonantSound(
            rng,
            lang,
            lang.codaClusters,
            codaWeights
        );

        word += onset.text + nucleus + coda.text;
        prevCodaRank = coda.lastRank < 0 ? null : coda.lastRank;
    }

    return word;
}

function generateStem(lang: LanguagePhonology, seed: string, slotId: string) {
    return generateWord(lang, seed, slotId, {
        syllableCountWeights: [
            { syllables: 1, weight: 5 },
            { syllables: 2, weight: 1 },
        ],
        finalCodaWeights: {
            empty: 8,
            single: 1,
            cluster: 0,
        },
    });
}

export function generateName(lang: LanguagePhonology, seed: string, slotId: string): string {
    const stem = generateStem(lang, seed, slotId);
    const rng = makeChildRng(seed, `${slotId}.ending`);
    let ending = pickNameEnding(rng, lang);

    const stemEndsInVowel = lang.vowels.some(v => stem.endsWith(v)) || lang.diphthongs.some(d => stem.endsWith(d));
    const endingStartsInVowel = lang.vowels.some(v => ending.startsWith(v)) || lang.diphthongs.some(d => ending.startsWith(d));

    if (stemEndsInVowel && endingStartsInVowel) {
        // light linking consonant
        const link = lang.consonants.find(c => c.text.length === 1)?.text ?? "n";
        ending = link + ending;
    } else if (stem.at(-1) === ending.at(0)) {
        ending = ending.slice(1); // duplicate-letter guard
    }

    const name = stem + ending;
    return name.charAt(0).toUpperCase() + name.slice(1);
}