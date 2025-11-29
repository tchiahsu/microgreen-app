import { useEffect, useState } from "react";
import type { PlantingItem, GermItem } from "../../types/crop";
import { Table } from "../../components/table";
import { Calendar28 } from "../../components/date";
import type { Columns } from "../../components/table";

export default function Home() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
    const [plantingInfo, setPlantingInfo] = useState<PlantingItem[]>([]);
    const [outGerm, setOutGerm] = useState<GermItem[]>([]);
    const [switchGerm, setSwitchGerm] = useState<GermItem[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const [plantInfo, germInfo, switchInfo] = await Promise.all([
                    fetch(`http://127.0.0.1:8000/home/planting_summary/${selectedDate}`),
                    fetch(`http://127.0.0.1:8000/home/germination_summary/${selectedDate}`),
                    fetch(`http://127.0.0.1:8000/home/light_switch_summary/${selectedDate}`),
                ]);

                if (!plantInfo.ok || !germInfo.ok || !switchInfo.ok) {
                    throw new Error("Failed to fetch crop data");
                }

                setPlantingInfo(await plantInfo.json());
                setOutGerm(await germInfo.json());
                setSwitchGerm(await switchInfo.json());
            } catch (e) {
                console.error(e);
            }
        }

        fetchData();
    }, [selectedDate]);

    const plantingColumns: Columns[] = [
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];

    const germinationColumns: Columns[] = [
        {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];

     const switchColumns: Columns[] = [
         {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];


    return (
        <div className="flex justify-center text-sm font-mono px-4 sm:px-6 lg:px-10 pb-10">
            <div className="flex flex-col w-full max-w-6xl">
                <div className="flex items-start justify-start gap-5 mb-5">
                    <Calendar28
                        selectedDate={selectedDate}
                        onChange={(value) => setSelectedDate(value)}
                    />
                </div>

                <div className="grid gap-4 lg:gap-6 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-[3fr_4fr_4fr]">

                    <div className="p-4 sm:p-5 bg-white/60 rounded-lg flex flex-col min-h-[260px] max-h-[700px]">
                        <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-[#308261] shrink-0">Planting Summary</h2>
                        <div className="flex-1 overflow-y-auto overflow-x-auto">
                            <Table columns={plantingColumns} data={plantingInfo}/>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-white/60 rounded-lg flex flex-col min-h-[260px] max-h-[700px]">
                        <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-[#308261]">Germination Summary</h2>
                        <div className="flex-1 overflow-y-auto overflow-x-auto">
                            <Table columns={germinationColumns} data={outGerm}/>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 bg-white/60 rounded-lg flex flex-col min-h-[260px] max-h-[700px]">
                        <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-[#308261]">Switch Summary</h2>
                        <div className="flex-1 overflow-y-auto overflow-x-auto">
                            <Table columns={switchColumns} data={switchGerm}/>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}