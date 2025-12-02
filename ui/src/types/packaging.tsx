import type { CompositionRow } from "../types/product"

export type SizeDialogState = {
    mode: "add" | "edit";
    productName: string;
    sizeType: string;
    weight: number | null;
    isActive: boolean;
} | null

export type CompDialogState = {
    productName: string;
    rows: CompositionRow[];
} | null;

export type PackagingEditState = {
    originalName: string | null;
    sizeType: string;
}
