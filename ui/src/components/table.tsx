import clsx from "clsx";

export type Columns = {
    key: string;
    header_name: string;
    align?: "center" | "right";
}

export type TableProps = {
    columns: Columns[]; 
    data: any[];
}

export function Table({columns, data}: TableProps){
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
                                "px-4 py-3 ",
                                column.align == "center" && "text-center",
                                column.align == "right" && "text-right"
                            )}
                        >
                            {row[column.key]}
                        </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>

    )
}