export type Phoneme = {
    text: string;
    sonority: number; // higher = closer to a vowel
    onsetOk?: boolean; // defaults to true. Set false for sounds that can't start a syllable.
    codaOk?: boolean;  // defaults to true.
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
    vowelHarmony?: VowelHarmony;
    markovCorpusKey?: string;
};

export type SyllablePortion = {
    name: string;
    weight: number;
    table?: string[]; // no table = "empty" option
};

export type VowelHarmony = {
    front: string[];
    back: string[];
    neutral: string[];
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
        { text: "ng", sonority: RANK.nasal, onsetOk: false },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u"],
    diphthongs: ["ei", "ai", "au", "eu"],
    onsetClusters: ["kl", "kr", "gl", "gr", "pl", "pr", "bl", "br", "tr", "dr", "fl", "fr",
        "kn", "gn", "schl", "schm", "schn", "schr", "chr", "pfl", "pfr", "kw"],
    codaClusters: ["rt", "rst", "lt", "nd", "rk", "lk", "rd", "mpf", "rz", "nst", "cht"],
    syllableCountWeights: [
        { syllables: 1, weight: 3 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 4 }, { syllables: 4, weight: 1 },
    ],
    nameEndings: [
        "ric", "rich", "riel", "hart", "ius", "an", "in", "and", "el", "en",
        "se", "lie", "eth", "ine", "ena", "the", "hild", "gard",
        "bert", "brecht", "mar", "mut", "wig", "wald", "win", "helm", "bald", "mund",
        "gund", "lind", "traud",
    ],
    markovCorpusKey: "german",
};

export const spanish: LanguagePhonology = {
    name: "Spanish",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },
        { text: "f", sonority: RANK.fricative }, { text: "s", sonority: RANK.fricative }, { text: "j", sonority: RANK.fricative },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u"],
    diphthongs: ["ai", "au", "ei", "eu", "oi", "ia", "ie", "io", "ua", "ue", "uo"],
    onsetClusters: ["pl", "pr", "bl", "br", "tr", "dr", "kl", "kr", "gl", "gr", "fl", "fr"],
    codaClusters: ["ns"],
    syllableCountWeights: [
        { syllables: 1, weight: 2 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 5 }, { syllables: 4, weight: 2 },
    ],
    nameEndings: ["ardo", "ando", "erto", "ico", "ino", "ina", "ita", "ana", "elo", "iel", "ael", "io", "ia"],
    markovCorpusKey: "spanish"
};

export const oldNorse: LanguagePhonology = {
    name: "Old Norse",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },
        { text: "f", sonority: RANK.fricative }, { text: "v", sonority: RANK.fricative },
        { text: "th", sonority: RANK.fricative }, { text: "s", sonority: RANK.fricative }, { text: "h", sonority: RANK.fricative },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal }, { text: "ng", sonority: RANK.nasal, onsetOk: false },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u", "y"],
    diphthongs: ["ei", "au", "ey"],
    onsetClusters: ["pl", "pr", "bl", "br", "tr", "dr", "kl", "kr", "gl", "gr", "fl", "fr", "hl", "hr", "hn", "thr"],
    codaClusters: ["lt", "rn", "st", "rt", "rk", "lk", "nd", "nt"],
    syllableCountWeights: [
        { syllables: 1, weight: 3 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 3 }, { syllables: 4, weight: 1 },
    ],
    nameEndings: ["ulf", "gard", "mund", "stein", "dis", "gunn", "rik", "vald", "leif", "grim", "orn", "vid", "borg"],
    markovCorpusKey: "oldNorse"
};

export const finnish: LanguagePhonology = {
    name: "Finnish",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "t", sonority: RANK.stop }, { text: "k", sonority: RANK.stop },
        { text: "s", sonority: RANK.fricative }, { text: "h", sonority: RANK.fricative },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u", "y", "ä", "ö"],
    diphthongs: ["ai", "ei", "oi", "au", "eu", "ou", "ie", "uo"],
    onsetClusters: [],
    codaClusters: [],
    syllableCountWeights: [
        { syllables: 1, weight: 2 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 4 }, { syllables: 4, weight: 2 },
    ],
    vowelHarmony: {
        front: ["ä", "ö", "y"],
        back: ["a", "o", "u"],
        neutral: ["e", "i"],
    },
    nameEndings: ["nen", "kki", "ainen", "eli", "tar", "kko", "vi", "la", "ni", "i"],
    markovCorpusKey: "finnish"
};

export const latin: LanguagePhonology = {
    name: "Latin",
    consonants: [
        { text: "p", sonority: RANK.stop }, { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },
        { text: "qu", sonority: RANK.stop },
        { text: "f", sonority: RANK.fricative }, { text: "s", sonority: RANK.fricative }, { text: "h", sonority: RANK.fricative },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u"],
    diphthongs: ["ae", "au", "oe", "eu"],
    onsetClusters: ["pl", "pr", "bl", "br", "tr", "dr", "kl", "kr", "gl", "gr", "fl", "fr"],
    codaClusters: ["ns", "rs", "nt", "rt", "lt", "rk"],
    syllableCountWeights: [
        { syllables: 1, weight: 2 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 5 }, { syllables: 4, weight: 2 },
    ],
    nameEndings: ["us", "ius", "a", "ia", "es", "or", "inus", "ella", "ulus", "ix", "ax", "o"],
    markovCorpusKey: "latin"
};

export const greek: LanguagePhonology = {
    name: "Greek",
    consonants: [
        { text: "p", sonority: RANK.stop, codaOk: false }, { text: "b", sonority: RANK.stop, codaOk: false },
        { text: "t", sonority: RANK.stop, codaOk: false }, { text: "d", sonority: RANK.stop, codaOk: false },
        { text: "k", sonority: RANK.stop, codaOk: false }, { text: "g", sonority: RANK.stop, codaOk: false },
        { text: "ph", sonority: RANK.stop, codaOk: false }, { text: "th", sonority: RANK.stop, codaOk: false }, { text: "kh", sonority: RANK.stop, codaOk: false },
        { text: "s", sonority: RANK.fricative },
        { text: "m", sonority: RANK.nasal, codaOk: false }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid, codaOk: false }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u"],
    diphthongs: ["ai", "ei", "oi", "au", "eu", "ou"],
    onsetClusters: ["pl", "pr", "bl", "br", "dr", "kl", "kr", "gl", "gr", "phl", "phr", "thr", "khl", "khr"],
    codaClusters: [],
    syllableCountWeights: [
        { syllables: 1, weight: 2 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 5 }, { syllables: 4, weight: 2 },
    ],
    nameEndings: ["os", "on", "es", "ios", "andros", "ates", "ippos", "a", "ene"],
    markovCorpusKey: "greek",
};

export const vainan: LanguagePhonology = {
    name: "Vainan",
    consonants: [
        { text: "b", sonority: RANK.stop },
        { text: "t", sonority: RANK.stop }, { text: "d", sonority: RANK.stop },
        { text: "k", sonority: RANK.stop }, { text: "g", sonority: RANK.stop },
        { text: "f", sonority: RANK.fricative }, { text: "s", sonority: RANK.fricative },
        { text: "h", sonority: RANK.fricative }, { text: "v", sonority: RANK.fricative },
        { text: "th", sonority: RANK.fricative }, { text: "sh", sonority: RANK.fricative },
        { text: "ch", sonority: RANK.fricative }, { text: "w", sonority: RANK.fricative, codaOk: false },
        { text: "m", sonority: RANK.nasal }, { text: "n", sonority: RANK.nasal },
        { text: "l", sonority: RANK.liquid }, { text: "r", sonority: RANK.liquid },
    ],
    vowels: ["a", "e", "i", "o", "u", "y"],
    diphthongs: ["ai", "ei", "ou", "au", "ia", "ya", "yo", "yu"],
    onsetClusters: ["gw", "fr", "thr"],
    codaClusters: ["rd"],
    syllableCountWeights: [
        { syllables: 1, weight: 2 }, { syllables: 2, weight: 5 },
        { syllables: 3, weight: 2 }, { syllables: 4, weight: 1 },
    ],
    nameEndings: [
        "la", "th", "el", "ka", "ra", "us", "in", "re", "os", "ir",
        "on", "rd", "is", "yn", "ic", "bach", "grym", "ene", "en", "ahl",
        "a", "ith"
    ],
    markovCorpusKey: "vainan",
};