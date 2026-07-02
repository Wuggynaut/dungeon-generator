export type Phoneme = {
    text: string;
    sonority: number; // higher = closer to a vowel
};



export type LanguagePhonology = {
    name: string;
    consonants: Phoneme[];
    vowels: string[];
    diphthongs: string[];
    onsetClusters: string[]; // strings, checked against `consonants` at load time
    codaClusters: string[];
    syllableCountWeights: { syllables: number; weight: number }[];
    nameEndings?: string[];
};

export type SyllablePortion = {
    name: string;
    weight: number;
    table?: string[]; // no table = "empty" option
};

// Standard sonority scale, low to high: stops, fricatives, nasals, liquids.
const RANK = { stop: 1, fricative: 2, nasal: 3, liquid: 4 } as const;

export const german: LanguagePhonology = {
    name: "German",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },
        { text: "f", sonority: RANK.fricative }, { text: "v", sonority: RANK.fricative },
        { text: "s", sonority: RANK.fricative }, { text: "z", sonority: RANK.fricative },
        { text: "sch", sonority: RANK.fricative }, { text: "ch", sonority: RANK.fricative },
        { text: "h", sonority: RANK.fricative }, { text: "w", sonority: RANK.fricative },
        { text: "pf", sonority: RANK.stop }, { text: "tz", sonority: RANK.stop },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u"],
    diphthongs: ["ei", "ai", "au", "eu"],
    onsetClusters: ["kl", "kr", "gl", "gr", "pl", "pr", "bl", "br", "tr", "dr", "fl", "fr"],
    codaClusters: ["rt", "rst", "lt", "nd", "rk", "lk"],
    syllableCountWeights: [
        { syllables: 1, weight: 3 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 4 }, { syllables: 4, weight: 1 },
    ],
    nameEndings: [
        "ric", "rich", "riel", "hart", "ius", "an", "in", "and", "el",  "en",
        "se", "lie", "eth", "ine", "ena", "the", "hild", "gard"
    ],
};

export const vainan: LanguagePhonology = {
    name: "Vainan",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },

        { text: "f", sonority: RANK.fricative }, { text: "v", sonority: RANK.fricative },
        { text: "s", sonority: RANK.fricative },
        { text: "sh", sonority: RANK.fricative }, { text: "h", sonority: RANK.fricative },
        { text: "w", sonority: RANK.fricative },

        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },

        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "y", "u"],
    diphthongs: ["ei", "ai", "oi", "ui", "io", "ue", "yi", "au", "eu"],
    onsetClusters: ["gl", "gr", "pl", "pr", "bl", "br", "tr", "dr", "fl", "fr"],
    codaClusters: ["rf", "ng", "nd"],
    syllableCountWeights: [
        { syllables: 1, weight: 3 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 2 }, { syllables: 4, weight: 1 },
    ],
    nameEndings: [
        "ric", "ro", "riel", "hart", "ius", "an", "in", "ia", "el",  "en",
        "se", "lie", "eth", "ine", "ena", "the", "so", "gard"
    ],
};