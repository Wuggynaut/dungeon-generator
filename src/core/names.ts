import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";
import type {LanguagePhonology, Phoneme, SyllablePortion, VowelHarmony} from "./data/languages.ts";

function sonorityOf(phonemes: Phoneme[], sound: string): number {
    const found = phonemes.find(p => p.text === sound);
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

function vowelClass(harmony: VowelHarmony, sound: string): "front" | "back" | "neutral" {
    for (const ch of sound) {
        if (harmony.front.includes(ch)) return "front";
        if (harmony.back.includes(ch)) return "back";
    }
    return "neutral";
}

function pickHarmonicNucleus(
    rng: Rng,
    lang: LanguagePhonology,
    lockedClass: "front" | "back" | null,
): { text: string; lockedClass: "front" | "back" | null } {
    const allVowels = [...lang.vowels, ...lang.diphthongs];

    if (!lang.vowelHarmony) {
        return { text: rng.pick(allVowels), lockedClass: null };
    }

    const harmony = lang.vowelHarmony;
    const forbidden = lockedClass === "front" ? "back" : lockedClass === "back" ? "front" : null;
    const allowed = forbidden
        ? allVowels.filter(v => vowelClass(harmony, v) !== forbidden)
        : allVowels;

    const picked = rng.pick(allowed);
    const pickedClass = vowelClass(harmony, picked);
    const nextLockedClass = pickedClass === "neutral" ? lockedClass : pickedClass;

    return { text: picked, lockedClass: nextLockedClass };
}

type ConsonantWeights = { single: number; cluster: number; empty: number };

function pickConsonantSound(
    rng: Rng,
    lang: LanguagePhonology,
    clusters: string[],
    weights: ConsonantWeights,
    position: "onset" | "coda",
): { text: string; firstRank: number; lastRank: number } {
    const singles = lang.consonants
        .filter(p => position === "onset" ? (p.onsetOk ?? true) : (p.codaOk ?? true))
        .map(p => p.text);

    const options: SyllablePortion[] = [
        { name: "Single", weight: singles.length > 0 ? weights.single : 0, table: singles },
        { name: "Cluster", weight: clusters.length > 0 ? weights.cluster : 0, table: clusters },
        { name: "Empty", weight: weights.empty },
    ];

    const picked = pickWeighted(rng, options);
    if (!picked.table || picked.table.length === 0) return { text: "", firstRank: -1, lastRank: -1 };
    const text = rng.pick(picked.table);
    const parts = splitCluster(lang.consonants, text);
    return {
        text,
        firstRank: sonorityOf(lang.consonants, parts[0]),
        lastRank: sonorityOf(lang.consonants, parts[parts.length - 1]),
    };
}

function pickNameEnding(rng: Rng, lang:LanguagePhonology) {
    if (lang.nameEndings) return rng.pick(lang.nameEndings);
    const onset = pickConsonantSound(rng, lang, lang.onsetClusters, {
        empty: 7,
        single: 3,
        cluster: 0,
    }, "onset");
    const nucleus = rng.pick([
        ...lang.vowels,
        ...lang.diphthongs,
    ]);

    const coda = pickConsonantSound(rng, lang, lang.codaClusters, {
        empty: 7,
        single: 3,
        cluster: 0,
    }, "coda");

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
    let harmonyClass: "front" | "back" | null = null;

    for (let i = 0; i < count.syllables; i++) {
        let onset = pickConsonantSound(rng, lang, lang.onsetClusters, consonantWeights, "onset");
        let tries = 0;
        while (!boundaryIsLegal(prevCodaRank, onset.firstRank < 0 ? null : onset.firstRank) && tries < 20) {
            onset = pickConsonantSound(rng, lang, lang.onsetClusters, consonantWeights, "onset");
            tries++;
        }

        const nucleusResult = pickHarmonicNucleus(rng, lang, harmonyClass);
        const nucleus = nucleusResult.text;
        harmonyClass = nucleusResult.lockedClass;
        const isFinal = i === count.syllables - 1;
        const codaWeights =
            isFinal
                ? options?.finalCodaWeights ?? consonantWeights
                : consonantWeights;

        const coda = pickConsonantSound(
            rng,
            lang,
            lang.codaClusters,
            codaWeights,
            "coda"
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

export function generateProperNoun(
    lang: LanguagePhonology,
    seed: string,
    slotId: string,
): string {
    const word = generateWord(lang, seed, slotId, {
        syllableCountWeights: [
            { syllables: 2, weight: 5 },
            { syllables: 3, weight: 3 },
        ],
        consonantWeights: { single: 4, cluster: 1, empty: 2 },
        finalCodaWeights: { single: 3, cluster: 0, empty: 4 },
    });
    return word.charAt(0).toUpperCase() + word.slice(1);
}