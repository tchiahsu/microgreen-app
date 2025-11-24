import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { FiEdit } from "react-icons/fi";
import { toast } from 'sonner';
import type { CropInfo, CropUpdate } from "../types/crop";

type CropActionsProps = {
    item: CropInfo;
    onUpdate: (data: CropUpdate) => Promise<void>;
};

export function CropActions({item, onUpdate}: CropActionsProps){
    const [open, setOpen] = useState(false);
    const [cropName, setCropName] = useState<string>(item.crop_name);
    const [seedType, setSeedType] = useState<string>(item.seed_type);
    const [sowRate, setSowRate] = useState<number>(item.sow_rate);
    const [overnightSoak, setOvernightSoak] = useState<boolean>(item.overnight_soak);
    const [daysDirect, setDaysDirect] = useState<number>(item.days_direct_light);
    const [daysIndirect, setDaysIndirect] = useState<number>(item.days_indirect_light);
    const [rackGrow, setRackGrow] = useState<number>(item.rack_grow_days);
    const [yieldTray, setYieldTray] = useState<number>(item.yield_per_tray);
    const [germType, setGermType] = useState<string>(item.germination_type);

    async function handleConfirm() {
        const updatedCrop: CropUpdate = {
            crop_id: item.crop_id,
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
        try {
            await onUpdate(updatedCrop);
            toast.success("Crop has been updated succesfully!")
            setOpen(false);
        } catch {
            toast.error("There's been an error when updating the crop.");
        }
    }

    return (
        <div className="flex justify-center">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="hover:text-blue-600">
                        <FiEdit size={16} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto">
                    <h3 className="font-semibold text-lg text-[#308261] sticky top-0 pb-2">
                        Edit {item.crop_name}
                    </h3>

                    <div className="flex flex-col gap-1">
                        <Label>Crop Name</Label>
                        <Input
                            type="text"
                            value={cropName}
                            onChange={(e) => setCropName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Seed Type</Label>
                        <Input
                            type="text"
                            value={seedType}
                            onChange={(e) => setSeedType(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Sow Rate</Label>
                        <Input
                            type="number"
                            value={sowRate}
                            onChange={(e) => setSowRate(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-row gap-3 py-2">
                        <Label>Overnight Soak</Label>
                        <input
                            type="checkbox"
                            checked={overnightSoak}
                            onChange={(e) => setOvernightSoak(e.target.checked)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Days Direct Light</Label>
                        <Input
                            type="number"
                            value={daysDirect}
                            onChange={(e) => setDaysDirect(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Days Indirect Light</Label>
                        <Input
                            type="number"
                            value={daysIndirect}
                            onChange={(e) => setDaysIndirect(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Rack Grow Days</Label>
                        <Input
                            type="number"
                            value={rackGrow}
                            onChange={(e) => setRackGrow(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Yield Per Tray</Label>
                        <Input
                            type="number"
                            value={yieldTray}
                            onChange={(e) => setYieldTray(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label>Germination Type</Label>
                        <Select
                            value={germType}
                            onValueChange={setGermType}
                        >
                            <SelectTrigger><SelectValue placeholder="Select Germination Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem key={"domed"} value={"domed"}>Domed</SelectItem>
                                <SelectItem key={"stacked"} value={"stacked"}>Stacked</SelectItem>
                                <SelectItem key={"blackout"} value={"blackout"}>Blackout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleConfirm} className="w-full sticky">
                        Save Changes
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    )
}