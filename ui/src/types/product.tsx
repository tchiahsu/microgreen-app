export type ProductName = {
    product_name: string;
};

export type PackageType = {
    package_id?: string;
    size_type: string;
}

export type ProductItem = {
    product_id: number;
    crop_id: number;
    product_name: string;
    weight_grams: number;
    crop_ratio: number;
    crop_name: string;
    package_id: number;
    size_type: string;
    is_active: number;
}

export type CompositionRow = {
    crop_id: number | null;
    crop_ratio: number | null;
};