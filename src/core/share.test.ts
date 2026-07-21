import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "./share.ts";
import { defaultConfig } from "./config.ts";
import type { RoomType } from "../types/rollTypes.ts";

describe("share with config", () => {
    it("round-trips a customized pool", () => {
        const custom: RoomType = {
            name: "Vault",
            weight: 3,
            table: { columns: [{ label: "A", values: ["x"] }, { label: "B", values: ["y"] }] },
        };
        const state = {
            seed: "abc",
            config: { ...defaultConfig, roomTypes: [...defaultConfig.roomTypes, custom] },
            overrides: {},
            notes: {},
        };
        const back = decodeState(encodeState(state));
        expect(back).toEqual(state);
    });

    it("falls back to default config on a link without one", () => {
        const back = decodeState(encodeState({ seed: "abc", overrides: {}, notes: {} } as never));
        expect(back?.config).toEqual(defaultConfig);
    });
});