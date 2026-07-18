import { Generator } from "./markov/generator.ts";
import { makeChildRng } from "./rng.ts";
import { trainingCorpora } from "./data/corpora.ts";
import type { LanguagePhonology } from "./data/languages.ts";

// Build each model once and cache it, keyed by corpus name.
// Training scans 200 words; you don't want to redo it on every name.
const modelCache = new Map<string, { model: Generator; trainingSet: Set<string> }>();

function getModel(corpusKey: string) {
    const cached = modelCache.get(corpusKey);
    if (cached) return cached;
    const corpus = trainingCorpora[corpusKey];
    const model = new Generator(corpus, 3, 0.01, true);
    const trainingSet = new Set(corpus.map(w => w.toLowerCase()));
    const entry = { model, trainingSet };
    modelCache.set(corpusKey, entry);
    return entry;
}

export function markovSupported(lang: LanguagePhonology): boolean {
    return lang.markovCorpusKey != null;
}

export function generateMarkovName(lang: LanguagePhonology, seed: string, slotId: string): string {
    const key = lang.markovCorpusKey;
    if (key == null) throw new Error(`${lang.name} has no Markov corpus`);
    const { model, trainingSet } = getModel(key);

    let result = "name";
    for (let tries = 0; tries < 40; tries++) {
        const rng = makeChildRng(seed, `${slotId}.${tries}`);
        const raw = model.generate(rng).replaceAll("#", "");
        // reject exact copies of training data and length outliers
        if (raw.length < 3 || raw.length > 12) continue;
        if (trainingSet.has(raw.toLowerCase())) continue;
        result = raw;
        break;
    }
    return result.charAt(0).toUpperCase() + result.slice(1);
}