import type {Roll} from "../types/rollTypes.ts";

export default function RollView({roll}: {roll: Roll}) {
    return (
        <div>
            <span><strong>{roll.columns[0]}:</strong> {roll.left.value} </span>
            <text> • </text>
            <span><strong>{roll.columns[1]}:</strong> {roll.right.value}</span>
        </div>
    )
}