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
                        <RollView
                            roll={room.roll}
                            controls={controls}
                            extra={room.monster ? { label: "Monster", slot: room.monster } : undefined}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
}