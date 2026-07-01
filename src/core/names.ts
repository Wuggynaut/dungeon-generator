import {makeChildRng, pickWeighted, type Rng} from "./rng.ts";

const consonants = ["p", "b", "t", "d", "k", "g", "f", "v", "w", "s", "z", "h", "m", "n", "l", "r", "j", "x"];
const vowels = ["a", "e", "i", "o", "u"];
const onsetClusters = ["pf", "kn", "kl", "kr", "gn", "gl", "gr", "pl", "pr", "bl", "br", "tr", "dr", "fl", "fr", "schl", "schm", "schn", "schw", "schr", "sp", "st", "chr", "pfl", "pfr", "zw", "kw"];
const dipthongs = ["ei", "ai", "ey", "ay", "au", "au", "eu"];
const codaClusters = ["rt", "rst", "nst", "ngst", "cht", "tzt", "lt", "nd", "rd", "mpf", "nkt", "rk", "lk", "ck", "tz", "chs", "ngs", "rz"];

type SyllablePortion = {
    name: string;
    weight: number;
    table?: string[]; // no table = "empty" option
};

const onsets: SyllablePortion[] = [
    {name: "Consonant", weight: 3, table: consonants},
    {name: "Cluster", weight: 1, table: onsetClusters},
    {name: "Empty", weight: 1},
];

const nuclei: SyllablePortion[] = [
    {name: "Vowels", weight: 1, table: vowels},
    {name: "Dipthongs", weight: 1, table: dipthongs},
];

const codas: SyllablePortion[] = [
    {name: "Coda", weight: 1, table: codaClusters},
    {name: "Consonants", weight: 1, table: consonants},
    {name: "Empty", weight: 1},
]

const syllableCount = [
    {syllables: 1, weight: 3},
    {syllables: 2, weight: 10},
    {syllables: 3, weight: 5},
    {syllables: 4, weight: 1},
]

export function generateSyllable (
    rng: Rng,
    prevEndedInConsonant: boolean,
): { text: string, endedInConsonant: boolean, } {
    const onsetPool = prevEndedInConsonant
        ? onsets.filter(p => p.name === "Empty") // must not add a second consonant
        : onsets.filter(p => p.name !== "Empty"); // must not leave two vowels touching

    const onsetPortion = pickWeighted(rng, onsetPool);
    const onset = onsetPortion.table ? rng.pick(onsetPortion.table) : "";
    const nucleusPortion = pickWeighted(rng, nuclei);
    const nucleus = rng.pick(nucleusPortion.table!);
    const codaPortion = pickWeighted(rng, codas);
    const coda = codaPortion.table ? rng.pick(codaPortion.table) : "";

    return {
        text: onset + nucleus + coda,
        endedInConsonant: codaPortion.name !== "Empty",
    };
}

export function generateWord(seed: string, slotId: string): string {
    const rng = makeChildRng(seed, slotId);
    const count = pickWeighted(rng, syllableCount);

    let word = "";
    let prevEndedInConsonant = false;

    for (let i = 0; i < count.syllables; i++) {
        const syllable = generateSyllable(rng, prevEndedInConsonant);
        word += syllable.text;
        prevEndedInConsonant = syllable.endedInConsonant;
    }
    return word;
}