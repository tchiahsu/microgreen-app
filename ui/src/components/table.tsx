import clsx from "clsx";
import type { JSX } from "react";

export type Columns = {
    key: string;
    header_name: string;
    align?: "center" | "right";
}

export type TableProps = {
    columns: Columns[]; 
    data: Record<string, unknown>[];
    underlines?: boolean;
    useActions?: (row: any) => JSX.Element;
}

export function Table({columns, data, underlines, useActions}: TableProps){
    return (
        <table className="w-full text-left">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} 
                        className={clsx(
                                "px-4 py-3 font-semibold",
                                column.align == "center" && "text-center",
                                column.align == "right" && "text-right"
                            )}
                        >
                            {column.header_name}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        {columns.map((column) => (
                        <td key={column.key} 
                            className={clsx(         
                                "px-4 py-3 align-top",
                                underlines && "border-b-[0.9px] border-[#f6b8669c]",
                                column.align == "center" && "text-center",
                                column.align == "right" && "text-right"
                            )}
                        >
                            {column.key === "actions" ? useActions && useActions(row) :
                                row[column.key] != null ? String(row[column.key]) : ""}
                        </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>

    )
}
