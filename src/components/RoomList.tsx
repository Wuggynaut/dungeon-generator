import type { Room, SlotControls } from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";
import { IconButton } from "./IconButton.tsx";
import { DiceIcon } from "./icons/DiceIcon.tsx";
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
                                        controls.reroll(`room.${room.id}.type`);
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
                            // Family is shown as a control only when unaligned; an aligned
                            // room's family follows its faction, changed via allegiance.
                            const unaligned = room.occupantFaction === undefined;
                            const extras = [
                                ...(unaligned ? [{ label: "Family", slot: room.roll.cells[0] }] : []),
                                ...(details ?? []),
                            ];
                            return (
                                <>
                                    <RollView
                                        roll={room.roll}
                                        controls={controls}
                                        hiddenColumns={[0]}
                                        extra={{ label: "Species", slot: room.monster! }}
                                        extras={extras}
                                    />
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.85em", opacity: 0.8 }}>
                                        <span>{unaligned ? "Unaligned" : `Held by Faction ${room.occupantFaction! + 1}`}</span>
                                        <IconButton
                                            label="Reroll allegiance"
                                            onClick={e => { e.stopPropagation(); controls.reroll(`room.${room.id}.occupant`); }}
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