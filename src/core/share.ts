import type { Overrides, PairedTable, RoomType } from "../types/rollTypes.ts";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { type Config, defaultConfig, type Tables } from "./config.ts";

export type ShareState = {
    seed: string;
    config: Config;
    overrides: Overrides;
    notes: Record<string, string>;
};

function isPairedTable(value: unknown): value is PairedTable {
    if (typeof value !== "object" || value === null) return false;
    const t = value as Record<string, unknown>;
    return (
        Array.isArray(t.columns) &&
        t.columns.length === 2 &&
        t.columns.every(c => typeof c === "string") &&
        Array.isArray(t.rows) &&
        t.rows.every(r => Array.isArray(r) && r.length === 2 && r.every(c => typeof c === "string"))
    );
}

function normalizeTables(value: unknown): Tables {
    const v = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
    const pick = (key: keyof Tables): PairedTable =>
        isPairedTable(v[key]) ? (v[key] as PairedTable) : defaultConfig.tables[key];
    return {
        purpose: pick("purpose"),
        construction: pick("construction"),
        ruination: pick("ruination"),
        traits: pick("traits"),
        agendas: pick("agendas"),
    };
}

function normalizeConfig(value: unknown): Config {
    const c = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
    return {
        roomCount: typeof c.roomCount === "number" ? c.roomCount : defaultConfig.roomCount,
        factionCount: typeof c.factionCount === "number" ? c.factionCount : defaultConfig.factionCount,
        roomTypes: Array.isArray(c.roomTypes) ? (c.roomTypes as RoomType[]) : defaultConfig.roomTypes,
        tables: normalizeTables(c.tables),
    };
}

function normalize(raw: unknown): ShareState | null {
    if (typeof raw !== "object" || raw === null) return null;
    const obj = raw as Record<string, unknown>;
    if (typeof obj.seed !== "string") return null;
    return {
        seed: obj.seed,
        config: normalizeConfig(obj.config),
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