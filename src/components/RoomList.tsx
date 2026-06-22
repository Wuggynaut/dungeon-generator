import type {Room} from "../types/rollTypes.ts";
import RollView from "./RollView.tsx";

export function RoomList({rooms}:{rooms:Room[]}){
    return (
        <section>
            <h2>Rooms</h2>
            <ul>
                {rooms.map((room:Room)=> (
                    <li key={room.id} id={`room-${room.id}`}>
                        <strong>#{room.id}: {room.type}</strong>
                        <RollView roll={room.roll} />
                    </li>
                ))}
            </ul>
        </section>
    )
}