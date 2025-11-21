import { useEffect, useState } from "react";
import type { PlantingItem, GermItem } from "../../types/crop";

export default function Crop() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
    const [plantingInfo, setPlantingInfo] = useState<PlantingItem[]>([]);
    const [outGerm, setOutGerm] = useState<GermItem[]>([]);
    const [switchGerm, setSwitchGerm] = useState<GermItem[]>([]);

    useEffect(() => {
        async function fetchDate() {
            try {
                console.log(selectedDate)
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

        fetchDate();
    }, [selectedDate]);

    return (
        <div className="p-6 text-sm font-mono z-100">
            <div className="flex items-center gap-4">
                <input
                    id="date"
                    type="date"
                    className="border border-gray-400 rounded-lg px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
            <div className="mb-2">
                <h2 className="font-semibold">Planting Summary</h2>
                <pre className="p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(plantingInfo, null, 2)}
                </pre>
            </div>
            <div className="mb-2">
                <h2 className="font-semibold">Germination Summary</h2>
                <pre className="p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(outGerm, null, 2)}
                </pre>
            </div>
            <div className="mb-2">
                <h2 className="font-semibold">Switch Summary</h2>
                <pre className="p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(switchGerm, null, 2)}
                </pre>
            </div>
        </div>
    );
}