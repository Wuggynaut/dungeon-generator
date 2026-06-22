import type { Room } from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";

type RoomListProps = {
    rooms: Room[];
    numberByRoomId: Map<number, number>;
    selected: number | null;
    onSelect: (roomId: number) => void;
};

export function RoomList({ rooms, numberByRoomId, selected, onSelect }: RoomListProps) {
    const ordered = [...rooms].sort(
        (a, b) => (numberByRoomId.get(a.id) ?? 0) - (numberByRoomId.get(b.id) ?? 0),
    );

    return (
        <section>
            <h2>Rooms</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {ordered.map(room => (
                    <li
                        key={room.id}
                        onClick={() => onSelect(room.id)}
                        style={{
                            cursor: "pointer",
                            padding: "6px 8px",
                            borderRadius: 4,
                            background: room.id === selected ? "#dbeafe" : "transparent",
                        }}
                    >
                        <strong>#{numberByRoomId.get(room.id)}: {room.type}</strong>
                        <RollView roll={room.roll} />
                    </li>
                ))}
            </ul>
        </section>
    );
}