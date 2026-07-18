import {useState} from "react";
import {generateName, generateProperNoun, generateWord} from "../core/names.ts";
import {randomSeed} from "../core/rng.ts";
import {
    finnish,
    german,
    greek,
    type LanguagePhonology,
    latin,
    oldNorse,
    spanish,
    vainan
} from "../core/data/languages.ts";
import {generateMarkovName, markovSupported} from "../core/markovNames.ts";

const LANGUAGES: Record<string, LanguagePhonology> = {
    german,
    spanish,
    oldNorse,
    finnish,
    latin,
    greek,
    vainan,
};

type Mode = "word" | "name" | "properNoun";
type Technique = "sonority" | "markov";


export default function NameGeneratorPage() {
    const [nameList, setNameList] = useState<string[]>([]);
    const [nameCount, setNameCount] = useState("20");
    const [languageKey, setLanguageKey] = useState("german");
    const [mode, setMode] = useState<Mode>("name");
    const [technique, setTechnique] = useState<Technique>("sonority");

    const generateNameList = () => {
        const parsed = Number(nameCount);
        const value = nameCount.trim() === "" || Number.isNaN(parsed)
            ? 20 : parsed;
        const seed = randomSeed();
        const lang = LANGUAGES[languageKey];
        let generate;
        switch (mode) {
            case "name":
                generate = generateName;
                break;
            case "properNoun":
                generate = generateProperNoun;
                break;
            default:
                generate = generateWord;
        }


        const useMarkov = technique === "markov" && markovSupported(lang);

        const names: string[] = [];
        for (let i = 1; i < value + 1; i++) {
            const name = useMarkov
                ? generateMarkovName(lang, seed, `name.${i}`)
                : generate(lang, seed, `name.${i}`);
            names.push(name);
        }
        setNameList(names);
    }

    return (
        <>
            <div>
                <h2>Name Generator</h2>
                <div/>
                <select value={languageKey} onChange={e => setLanguageKey(e.target.value)}>
                    <option value="german">German</option>
                    <option value="spanish">Spanish</option>
                    <option value="oldNorse">Old Norse</option>
                    <option value="finnish">Finnish</option>
                    <option value="latin">Latin</option>
                    <option value="greek">Greek</option>
                    <option value="vainan">Vainan</option>
                </select>
                <select value={mode} onChange={e => setMode(e.target.value as Mode)}>
                    <option value="name">Names</option>
                    <option value="word">Words</option>
                    <option value="properNoun">Proper Nouns</option>
                </select>
                <select value={technique} onChange={e => setTechnique(e.target.value as Technique)}>
                    <option value="sonority">Sonority</option>
                    <option value="markov">Markov</option>
                </select>
                <div/>
                <button onClick={generateNameList}>Generate</button>
                <div/>
                <input
                    type="number"
                    value={nameCount}
                    onChange={e => setNameCount(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && generateNameList()}
                    style={{ width: 64 }}
                />
            </div>
            <ul>
                {nameList.map((name, i) => (
                    <li key={i}>
                        <span>{name}</span>
                    </li>
                ))}
            </ul>
        </>
    )
}