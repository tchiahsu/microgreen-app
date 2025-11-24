import { useEffect, useState } from "react";
import { Table } from "../../components/table";
import { CropActions } from "../../components/cropActions";
import type { CropInfo, CropUpdate } from "../../types/crop"

export default function Crop() {
    const [cropInfo, setCropInfo] = useState<CropInfo[]>([]);
    const [search, setSearch] = useState("");

    async function fetchData() {
        try {
            const cropInfo = await fetch(`http://127.0.0.1:8000/crops/grow_information`);

            if (!cropInfo.ok) {
                throw new Error("Failed to fetch crop data");
            }

            setCropInfo(await cropInfo.json());
        } catch (e) {
            console.error(e);
        }
    }

    async function handleUpdate(updated: CropUpdate) {
        try {
            const cleanedData = Object.fromEntries(
                Object.entries(updated).filter(([_, value]) => value != null)
            );

            const res = await fetch("http://127.0.0.1:8000/crops/", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedData)
            });

            if (!res.ok) {
                console.error("Failed to update order")
                return;
            }

            const result = await res.json();

            await fetchData();
        } catch (err) {
            console.error("Update error:", err)
            throw err
        }
    }


    const cropInformation = [
        {key: "crop_name", header_name: "Crop Name"},
        {key: "seed_type", header_name: "Seed Type"},
        {key: "sow_rate", header_name: "Sow Rate", align: "center"},
        {key: "overnight_soak", header_name: "Overnight Soak", align: "center"},
        {key: "days_direct_light", header_name: "Days Direct Light", align: "center"},
        {key: "days_indirect_light", header_name: "Days Indirect Light", align: "center"},
        {key: "rack_grow_days", header_name: "Rack Grow Days", align: "center"},
        {key: "lead_time", header_name: "Lead Time", align: "center"},
        {key: "yield_per_tray", header_name: "Yields Per Tray", align: "center"},
        {key: "germination_type", header_name: "Germination Type", align: "center"},
        {key: "actions", header_name: "", align: "center"},
    ];

    function generalize (str: string) {
        return str
            .normalize("NFKC")
            .trim()
            .replace(/[^\w\s]+/g, "")
            .replace(/\s+/g, " ")
            .toLowerCase();
    };

    const searchCrops = cropInfo.filter(crop =>
        generalize(crop.crop_name).includes(generalize(search))
    );

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="text-sm font-mono">
            <div className="flex w-full items-start justify-between gap-6 px-20">
                <div className="p-5 bg-white/60 rounded-lg h-170 flex flex-col ">
                    <h2 className="font-semibold text-lg mb-5 text-[#308261] shrink-0">Crop Information</h2> 
                    <input
                        type="text"
                        placeholder="Search for crops"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 p-2 border border-[#308261] rounded-lg w-full"
                    />
                    
                    <div className="flex-1 overflow-y-auto">
                        <Table 
                            columns={cropInformation} 
                            data={searchCrops} 
                            underlines={true}
                            useActions={(row) => (
                                <CropActions item={row as CropInfo} onUpdate={handleUpdate}/>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
        );
    }