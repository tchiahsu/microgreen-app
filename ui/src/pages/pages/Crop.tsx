import { useEffect, useState } from "react";
import { Table } from "../../components/table";
import { CropActions } from "../../components/cropActions";
import type { CropInfo, CropUpdate } from "../../types/crop";
import type { Columns } from "../../components/table";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import type { EmployeeItem } from "../../types/employee";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

export default function Crop() {
    const [cropInfo, setCropInfo] = useState<CropInfo[]>([]);
    const [search, setSearch] = useState("");

    const [cropName, setCropName] = useState<string>("");
    const [seedType, setSeedType] = useState<string>("");
    const [sowRate, setSowRate] = useState<number>();
    const [overnightSoak, setOvernightSoak] = useState<boolean | null>(null);
    const [daysDirect, setDaysDirect] = useState<number>();
    const [daysIndirect, setDaysIndirect] = useState<number>();
    const [rackGrow, setRackGrow] = useState<number>();
    const [yieldTray, setYieldTray] = useState<number>();
    const [germType, setGermType] = useState<string>("");
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    const [assignEmployee, setAssignEmployee] = useState<EmployeeItem[]>([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [selectedCrop, setSelectedCrop] = useState<number | null>(null);

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

    async function fetchEmployees() {
        try {
            const employeeInfo = await fetch(`http://127.0.0.1:8000/employees/`);

            if (!employeeInfo.ok) {
                throw new Error("Failed to fetch employee data");
            }
            setAssignEmployee(await employeeInfo.json());
        } catch (e) {
            console.error(e);
        }
    }

    async function handleUpdate(updated: CropUpdate) {
        try {
            const cleanedData = Object.fromEntries(
                Object.entries(updated).filter(([value]) => value != null)
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

            await fetchData();
        } catch (err) {
            console.error("Update error:", err)
            throw err
        }
    }

    async function handleAddCrop() {
        if (!cropName) {
            toast.error("Please select a crop name.");
            return;
        }
        if (!seedType) {
            toast.error("Please select a seed type.");
            return;
        }
        if (sowRate == null || sowRate <= 0) {
            toast.error("Sow rate cannot be empty, negative or 0.");
            return;
        }
        if (overnightSoak === null) {
            toast.error("Please specify if overnight soak is requried.");
            return;
        }
        if (daysDirect == null || daysDirect < 0) {
            toast.error("Days under direct light cannot be empty or negative.");
            return;
        }
        if (daysIndirect == null || daysIndirect < 0) {
            toast.error("Days under indirect light cannot be empty or negative.");
            return;
        }
        if (rackGrow == null || rackGrow < 0) {
            toast.error("Days in grow racks cannot be empty or negative.");
            return;
        }
        if (yieldTray == null || yieldTray <= 0) {
            toast.error("The yield per tray cannot be empty, negative or 0.");
            return;
        }
        if (germType !== "stacked" && germType !== "blackout" && germType !== "domed") {
            toast.error("Germination type can either be blackout, stacked, domed.");
            return;
        }
        if (daysDirect + daysIndirect + rackGrow === 0){
            toast.error("The sum of days direct, days indirect, and rack grow days has to be greater than 0.");
            return;
        }

        setAdding(true);

        try {
            const body = {
                crop_name: cropName,
                seed_type: seedType,
                sow_rate: sowRate,
                overnight_soak: overnightSoak,
                germination_type: germType,
                days_direct_light: daysDirect,
                days_indirect_light: daysIndirect,
                rack_grow_days: rackGrow,
                yield_per_tray: yieldTray,
            };

            const res = await fetch("http://127.0.0.1:8000/crops/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                console.error("Failed to add crop", err);
                toast.error("Failed to add crop.")
                return;
            }

            toast.success("Crop added successfully!");
            await fetchData();
            setAddOpen(false);

            setCropName("");
            setSeedType("");
            setSowRate(undefined);
            setOvernightSoak(null);
            setDaysDirect(undefined);
            setDaysIndirect(undefined);
            setRackGrow(undefined);
            setYieldTray(undefined);
            setGermType("");
        } catch (err) {
            console.error("Add crop error:", err);
            toast.error("Error adding crop.")
        } finally {
            setAdding(false);
        }
    }

    async function  handleAssignPlanting(){
        if (!selectedEmployee || !selectedCrop) {
            toast.error("Select an employee and a crop");
            return;
        }

        try{
            const response = await fetch("http://127.0.0.1:8000/employees/assign_planting", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: selectedEmployee, 
                    crop_id: selectedCrop
                })
            });

            if (!response.ok){
                const err = await response.json().catch(() => null);
                throw new Error(err?.detail || "Failed to assign employee");
            }

            toast.success("Employee was successfully assigned to crop. ")
            setAssignOpen(false);
            setSelectedEmployee(null);
            setSelectedCrop(null);
        } catch (err) {
            toast.error(String(err));
        }
    }

    const cropInformation: Columns[] = [
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
        fetchData();
        fetchEmployees();
    }, [])

    return (
        <div className="text-sm font-mono px-3 sm:px-4 lg:px-10 pb-10 flex justify-center">
            <div className="w-full max-w-6xl">
                <div className="p-4 sm:p-5 flex flex-col bg-white/60 rounded-lg min-h-80 mt-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="font-semibold text-lg text-[#308261]">Crop Information</h2> 
                        <div className="flex gap-2">
                            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="bg-[#308261] text-white font-semibold" 
                                        size="sm"
                                    >
                                        Assign Employee
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Assign Employee to Crop</DialogTitle>
                                        <DialogDescription>
                                            Choose an employee and crop to assign planting task.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <Label>Employee</Label>
                                            <Select
                                                value={selectedEmployee?.toString() ?? ""}
                                                onValueChange={(value) => setSelectedEmployee(Number(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choose employee for planting" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {assignEmployee
                                                        .filter(emp => emp.is_active)
                                                        .map(emp => (
                                                            <SelectItem
                                                                key={emp.employee_id}
                                                                value={emp.employee_id.toString()}
                                                            >
                                                                {emp.first_name} {emp.last_name} - {emp.title}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label>Crop</Label>
                                            <Select
                                                value={selectedCrop?.toString() ?? ""}
                                                onValueChange={(value) => setSelectedCrop(Number(value))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choose crop to plant" />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {cropInfo.map(crop => (
                                                        <SelectItem
                                                            key={crop.crop_id}
                                                            value={crop.crop_id.toString()}
                                                        >
                                                            {crop.crop_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleAssignPlanting}
                                            className="bg-[#308261]"
                                        >
                                            Assign Planting
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>


                            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="bg-[#308261] text-white font-semibold" 
                                        size="sm"
                                    >
                                        Add Crop
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add New Crop</DialogTitle>
                                        <DialogDescription>
                                            Fill out these fields to add a new crop.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col">
                                            <label className="font-semibold">Crop Name</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={cropName}
                                                onChange={(e) => setCropName(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Seed Type</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={seedType}
                                                onChange={(e) => setSeedType(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Sow Rate</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="number"
                                                value={sowRate ?? ""}
                                                onChange={(e) => setSowRate(e.target.value === "" ? undefined : Number(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Overnight Soak</label>
                                            <select 
                                                className="p-2 border rounded h-10"
                                                value={overnightSoak === null ? "" : overnightSoak ? "yes" : "no"}
                                                onChange={(e) => setOvernightSoak(e.target.value === "" ? null : e.target.value === "yes")}
                                            >
                                                <option value="">Select</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex flex-col flex-1">
                                                <label className="font-semibold">Days Direct Light</label>
                                                <input
                                                    className="p-2 border rounded h-10"
                                                    type="number"
                                                    value={daysDirect ?? ""}
                                                    onChange={(e) => setDaysDirect(e.target.value === "" ? undefined : Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="flex flex-col flex-1">
                                                <label className="font-semibold">Days Indirect Light</label>
                                                <input
                                                    className="p-2 border rounded h-10"
                                                    type="number"
                                                    value={daysIndirect ?? ""}
                                                    onChange={(e) => setDaysIndirect(e.target.value === "" ? undefined : Number(e.target.value))}
                                            />
                                            </div>

                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Rack Grow Days</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="number"
                                                value={rackGrow ?? ""}
                                                onChange={(e) => setRackGrow(e.target.value === "" ? undefined : Number(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Yield Per Tray</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="number"
                                                value={yieldTray ?? ""}
                                                onChange={(e) => setYieldTray(e.target.value === "" ? undefined : Number(e.target.value))}
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="font-semibold">Germination Type</label>
                                            <select 
                                                className="p-2 border rounded h-10"
                                                value={germType}
                                                onChange={(e) => setGermType(e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                <option value="stacked">Stacked</option>
                                                <option value="blackout">Blackout</option>
                                                <option value="domed">Domed</option>
                                            </select>
                                        </div>

                                        <Button
                                            className="mt-2 bg-[#308261] text-white"
                                            onClick={handleAddCrop}
                                            disabled={adding}
                                        >
                                            {adding ? "Adding..." : "Add Crop"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                        
                    <input
                        type="text"
                        placeholder="Search for crops"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 p-2 border border-[#308261] rounded-lg w-full"
                    />
                        
                    <div className="flex-1 overflow-y-auto">
                        <div className="overflow-x-auto max-h-[60vh]">
                            <Table 
                                columns={cropInformation} 
                                data={searchCrops} 
                                underlines={true}
                                rowKey={(row) => row.crop_id}
                                useActions={(row) => (
                                    <CropActions item={row as CropInfo} onUpdate={handleUpdate}/>
                                )}
                            />
                        </div>
                    </div>                    
                </div>
            </div>
        </div>
    );
}