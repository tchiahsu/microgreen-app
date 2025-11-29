import { useEffect, useState } from "react";
import type { DailyOrderItem } from "../../types/order"
import type { GermItem } from "../../types/crop"
import { Table } from "../../components/table";
import { Calendar28 } from "../../components/date";
import type { Columns } from "../../components/table";

export default function Harvest() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
    const [ordInfo, setOrdInfo] = useState<DailyOrderItem[]>([]);
    const [cropInfo, setCropInfo] = useState<GermItem[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [orderInfo, cropInfo] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/harvests/get_orders_to_deliver/${selectedDate}`),
                    fetch(`http://127.0.0.1:8000/harvests/get_crops_to_harvest/${selectedDate}`),
                ]);

                if (!orderInfo.ok || !cropInfo.ok) {
                    throw new Error("Failed to fetch crop data");
                }

                setOrdInfo(await orderInfo.json());
                setCropInfo(await cropInfo.json());
            } catch (e) {
                console.error(e);
            }
        }
        fetchData();
    }, [selectedDate]);

    const groupedByProductType = Object.entries(
        ordInfo.reduce((acc, row) => {
            if (!acc[row.product_name]){
                acc[row.product_name] = [];
            }
            acc[row.product_name].push(row.package_info);
            return acc;
        }, {} as Record<string, string[]>)
    ).map(([product_name, packages]) => ({
        product_name, 
        package_info: (
            <div className="whitespace-pre-line">
                {packages.join("\n")}
            </div>   
    )}));

    const ordersForToday: Columns[] = [
        {key: "product_name", header_name: "Product Name"},
        {key: "package_info", header_name: "Order Quantity"},
    ];

    const cropsForToday: Columns[] = [
        {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_to_harvest", header_name: "Tray Count",  align: "center"},
    ];

    const noInfo = groupedByProductType.length === 0 && 
                        cropInfo.length === 0;

    
    return (
        <div className="text-sm font-mono px-3 sm:px-4 lg:px-10 pb-10 flex justify-center">
            <div className="w-full max-w-6xl">
                <div className="flex items-start justify-start mb-4">
                    <Calendar28
                        selectedDate={selectedDate}
                        onChange={(value) => setSelectedDate(value)}
                    />
                </div>

                {noInfo ? (
                    <div className="w-full flex justify-center items-center min-h-[220px]">
                        <div className="p-6 sm:p-8 bg-white/60 rounded-lg shadow-md w-full max-w-md text-center">
                            <div className="text-lg font-bold text-red-600">
                                No crops to harvest today. Please select a harvest date.
                            </div>
                        </div> 
                    </div>               
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full">
                        <div className="p-4 sm:p-5 bg-white/60 rounded-lg flex flex-col max-h-[700px]">
                            <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-[#308261]">Orders For Today</h2>
                            <div className="flex-1 overflow-y-auto overflow-x-auto">
                                <Table columns={ordersForToday} data={groupedByProductType} underlines={true}/>
                            </div>
                        </div>
                        <div className="p-4 sm:p-5 bg-white/60 rounded-lg flex flex-col max-h-[700px]">
                            <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-[#308261]">Crops To Harvest Today</h2>
                            <div className="flex-1 overflow-y-auto overflow-x-auto">
                                <Table columns={cropsForToday} data={cropInfo}/>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}