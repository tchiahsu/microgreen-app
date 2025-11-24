export type PlantingItem = {
    name: string;
    trays: number;
};

export type GermItem = {
    date: Date;
    name: string;
    trays: number;
};

export type CropInfo = {
    crop_id: number;
    crop_name: string;
    seed_type: string;
    sow_rate: number;
    overnight_soak: boolean;
    days_direct_light: number;
    days_indirect_light: number;
    lead_time: number;
    rack_grow_days: number;
    yield_per_tray: number;
    germination_type: string;
}

export type CropUpdate = {
    crop_id: number;
    crop_name?: string;
    seed_type?: string;
    sow_rate?: number;
    overnight_soak?: boolean;
    germination_type?: string;
    days_direct_light?: number;
    days_indirect_light?: number;
    rack_grow_days?: number;
    yield_per_tray?: number;
}
