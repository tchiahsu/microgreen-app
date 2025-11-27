import { useEffect, useState } from "react";
import type { DailyOrderItem } from "../../types/order"
import type { GermItem } from "../../types/crop"
import { Table } from "../../components/table";
import { Calendar28 } from "../../components/date";

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

    const ordersForToday = [
        {key: "product_name", header_name: "Product Name"},
        {key: "package_info", header_name: "Order Quantity"},
    ];

    const cropsForToday = [
        {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_to_harvest", header_name: "Tray Count",  align: "center"},
    ];

    const noInfo = groupedByProductType.length === 0 && 
                        cropInfo.length === 0;

    
    return (
        <div className="text-sm font-mono">
            <div className="flex items-center gap-5 mb-5 px-20">
                <Calendar28
                    selectedDate={selectedDate}
                    onChange={(value) => setSelectedDate(value)}
                />
            </div>

            {noInfo ? (
                <div className="w-full flex justify-center items-center h-60">
                    <div className="p-10 bg-white/60 rounded-lg shadow-md w-[450px] text-center">
                        <div className="text=xl font-bold text-red-600">
                            No crops to harvest today.
                        </div>
                    </div> 
                </div>               
            ) : (
                <div className="flex w-full items-start justify-center gap-10">
                    <div className="p-5 bg-white/60 rounded-lg h-160 flex flex-col w-[550px]">
                        <h2 className="font-semibold text-lg mb-5 text-[#308261]">Orders For Today</h2>
                        <div className="flex-1 overflow-y-auto">
                            <Table columns={ordersForToday} data={groupedByProductType} underlines={true}/>
                        </div>
                    </div>
                    <div className="p-5 bg-white/60 rounded-lg h-160 flex flex-col w-[550px]">
                        <h2 className="font-semibold text-lg mb-5 text-[#308261]">Crops To Harvest Today</h2>
                        <div className="flex-1 overflow-y-auto">
                            <Table columns={cropsForToday} data={cropInfo}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}