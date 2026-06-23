import type {Overrides} from "../types/rollTypes.ts";
import {compressToEncodedURIComponent, decompressFromEncodedURIComponent} from "lz-string";
import {type Config, defaultConfig} from "./config.ts";

export type ShareState = {
    seed: string;
    config: Config;
    overrides: Overrides;
    notes: Record<string, string>;
};

function isConfig(value: unknown): value is Config {
    if (typeof value !== "object" || value === null) return false;
    const c = value as Record<string, unknown>;
    return (
        typeof c.roomCount === "number" &&
        typeof c.factionCount === "number" &&
        Array.isArray(c.roomTypes)
    );
}

function normalize(raw: unknown): ShareState | null {
    if (typeof raw !== "object" || raw === null) return null;
    const obj = raw as Record<string, unknown>;
    if (typeof obj.seed !== "string") return null;
    return {
        seed: obj.seed,
        config: isConfig(obj.config) ? obj.config : defaultConfig,
        overrides: (obj.overrides as Overrides) ?? {},
        notes: (obj.notes as Record<string, string>) ?? {},
    };
}

export function encodeState(state: ShareState): string {
    return compressToEncodedURIComponent(JSON.stringify(state));
}

export function decodeState(encoded: string): ShareState | null {
    try {
        const json = decompressFromEncodedURIComponent(encoded);
        if (!json) return null;
        return normalize(JSON.parse(json));
    } catch {
        return null;
    }
}

export function toJson(state: ShareState): string {
    return JSON.stringify(state, null, 2);
}

export function fromJson(text: string): ShareState | null {
    try {
        return normalize(JSON.parse(text));
    } catch {
        return null;
    }
}