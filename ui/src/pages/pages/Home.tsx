import { useEffect, useState } from "react";
import type { PlantingItem, GermItem } from "../../types/crop";
import { Table } from "../../components/table";

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

    const plantingColumns = [
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];

    const germinationColumns = [
        {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];

     const switchColumns = [
         {key: "planting_date", header_name: "Planting Date"},
        {key: "crop_name", header_name: "Crop Name"},
        {key: "trays_used", header_name: "Tray Count", align: "center"}
    ];


    return (
        <div className="p-6 text-sm font-mono">
            <div className="flex items-center gap-5 mb-5 px-20">
                <input
                    id="date"
                    type="date"
                    className="border border-gray-400 rounded-lg px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
            <div className="flex w-full items-start justify-between px-20">
                <div className="p-5 bg-white/40 rounded-lg">
                    <h2 className="font-semibold text-lg mb-5">Planting Summary</h2>
                    <Table columns={plantingColumns} data={plantingInfo}/>
                </div>
                <div className="p-5 bg-white/40 rounded-lg">
                    <h2 className="font-semibold text-lg mb-5">Germination Summary</h2>
                     <Table columns={germinationColumns} data={outGerm}/>
                </div>
                <div className="p-5 bg-white/40 rounded-lg">
                    <h2 className="font-semibold text-lg mb-5">Switch Summary</h2>
                     <Table columns={switchColumns} data={switchGerm}/>
                </div>
            </div>
        </div>
    );
}