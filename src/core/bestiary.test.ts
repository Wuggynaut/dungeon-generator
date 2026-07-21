import { describe, it, expect } from "vitest";
import { defaultConfig } from "./config.ts";
import { monstersByGroup, groupNames } from "./data/monsters.ts";
import { resolveColumn } from "./data/columnSources.ts";

describe("monster room family column references the bestiary", () => {
    it("the Group column resolves to the live family list", () => {
        const monsterType = defaultConfig.roomTypes.find(rt => rt.name === "Monster");
        expect(monsterType).toBeDefined();
        expect(resolveColumn(monsterType!.table.columns[0].values)).toEqual(groupNames);
    });

    it("every family resolves to a non-empty roster", () => {
        for (const family of groupNames) {
            expect(monstersByGroup[family].length).toBeGreaterThan(0);
        }
    });
});