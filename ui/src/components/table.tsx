import clsx from "clsx";
import type { JSX } from "react";

export type Columns = {
    key: string;
    header_name: string;
    align?: "center" | "right";
}

export type TableProps = {
    columns: Columns[]; 
    data: any[];
    underlines?: boolean;
    color?: string;
    useActions?: (row: any) => JSX.Element;
    rowKey?: (row: any) => string | number;
}

export function Table({columns, data, underlines, color, useActions, rowKey}: TableProps){
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
                    <tr key={rowKey ? rowKey(row) : row.id ?? row.crop_id ?? index}
                    >
                        {columns.map((column) => (
                        <td key={column.key} 
                            className={clsx(         
                                "px-4 py-3 align-top",
                                underlines && "border-b-[0.9px]",
                                column.align == "center" && "text-center",
                                column.align == "right" && "text-right",
                                color === "green" ? "border-[#bcd5ad]" : "border-[#f6b8669c]"
                            )}
                        >
                            {column.key === "actions" ? useActions?.(row) : row[column.key]}
                        </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>

    )
}
