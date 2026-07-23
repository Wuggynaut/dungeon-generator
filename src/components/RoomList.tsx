import type { Room, SlotControls } from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";
import { IconButton } from "./IconButton.tsx";
import { DiceIcon } from "./icons/DiceIcon.tsx";
import { monstersByGroup } from "../core/data/monsters.ts";
import * as slots from "../core/slots.ts";
import styles from "./RoomList.module.css";

type RoomListProps = {
    rooms: Room[];
    numberByRoomId: Map<number, number>;
    selected: number | null;
    onSelect: (roomId: number) => void;
    controls: SlotControls;
};

export function RoomList({ rooms, numberByRoomId, selected, onSelect, controls }: RoomListProps) {
    const ordered = [...rooms].sort(
        (a, b) => (numberByRoomId.get(a.id) ?? 0) - (numberByRoomId.get(b.id) ?? 0),
    );

    return (
        <section>
            <h2>Rooms</h2>
            <ul className={styles.list}>
                {ordered.map(room => (
                    <li
                        key={room.id}
                        className={`${styles.item} ${room.id === selected ? styles.selected : ''}`}
                        onClick={() => onSelect(room.id)}
                    >
                        <div className={styles.header}>
                            <strong className={styles.heading}>
                                #{numberByRoomId.get(room.id)}: {room.type}
                            </strong>
                            <span className={styles.actions}>
                                <IconButton
                                    label="Reroll room type"
                                    onClick={e => {
                                        e.stopPropagation();
                                        controls.reroll(slots.room.type(room.id));
                                    }}
                                >
                                    <DiceIcon />
                                </IconButton>
                            </span>
                        </div>
                        {(() => {
                            const details = room.details?.map(d => ({ label: "Detail", slot: d }));
                            const isMonster = room.type === "Monster" && room.monster !== undefined;
                            if (!isMonster) {
                                return <RollView roll={room.roll} controls={controls} extras={details} />;
                            }
                            const unaligned = room.occupantFaction === undefined;
                            const speciesRerollable =
                                unaligned || (monstersByGroup[room.family ?? ""]?.length ?? 0) > 1;
                            return (
                                <>
                                    <RollView
                                        roll={room.roll}
                                        controls={controls}
                                        extra={{ label: "Species", slot: room.monster!, rerollable: speciesRerollable }}
                                        extras={details}
                                    />
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85em", opacity: 0.8 }}>
                                        <span>{unaligned ? "Unaligned" : `Held by Faction ${room.occupantFaction! + 1}`}</span>
                                        <IconButton
                                            label="Reroll allegiance"
                                            onClick={e => { e.stopPropagation(); controls.reroll(slots.room.occupant(room.id)); }}
                                        >
                                            <DiceIcon />
                                        </IconButton>
                                    </div>
                                </>
                            );
                        })()}
                    </li>
                ))}
            </ul>
        </section>
    );
}