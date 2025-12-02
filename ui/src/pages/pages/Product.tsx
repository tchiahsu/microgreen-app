import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { toast } from "sonner";

import type { ProductItem, PackageType, CompositionRow } from "../../types/product";
import type { SizeDialogState, CompDialogState, PackagingEditState } from "../../types/packaging";
import type { CropInfo } from "../../types/crop";


const isLiveTraySize = (sizeType: string | undefined | null) => {
    if (!sizeType) return false;
    const s = sizeType.toLowerCase();
    return s.includes("live")
};

export default function Product() {
    const [productData, setProductData] = useState<ProductItem[]>([]);
    const [packagingName, setPackagingName] = useState<PackageType[]>([])
    const [cropData, setCropData] = useState<CropInfo[]>([]);
    const [search, setSearch] = useState("");

    const [newProductName, setNewProductName] = useState<string>("");
    const [newWeight, setNewWeight] = useState<number | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [newPackageType, setNewPackageType] = useState<string>("");

    const [adding, setAdding] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [sizeDialog, setSizeDialog] = useState<SizeDialogState>(null);
    const [compDialog, setCompDialog] = useState<CompDialogState>(null);

    const [packagingEdit, setPackagingEdit] = useState<PackagingEditState | null>(null);
    const [newPackagingName, setNewPackagingName] = useState("");

    const [compositionRow, setCompositionRow] = useState<CompositionRow[]>([
        { crop_id: null, crop_ratio: null },
    ]);

    const productMap: Record<string, {
        displayName: string,
        crops: { crop_id: number; crop_name: string; crop_ratio: number }[];
        sizes: { size_type: string; weight_grams: number | null; is_active: number}[];
    }> = {};

    const normalizeStr = (str: string) =>
        str.normalize("NFKC").trim().replace(/[^\w\s]+/g, "").replace(/\s+/g, " ").toLowerCase();

    for (const p of productData) {
        const product = normalizeStr(p.product_name)

        if (!productMap[product]) {
            productMap[product] = {
                displayName: p.product_name.trim(),
                crops: [],
                sizes: [],
            };
        }

        if (!productMap[product].crops.some(
            (c) => c.crop_id === p.crop_id && c.crop_name === p.crop_name
        )) {
            productMap[product].crops.push({
                crop_id: p.crop_id,
                crop_name: p.crop_name,
                crop_ratio: p.crop_ratio,
            });
        }

        if (!productMap[product].sizes.some(
            (s) => s.size_type === p.size_type && s.weight_grams === p.weight_grams
        )) {
            productMap[product].sizes.push({
                size_type: p.size_type,
                weight_grams: p.weight_grams,
                is_active: p.is_active,
            });
        }

    }

    async function fetchProducts() {
        try {
            const res = await fetch("http://127.0.0.1:8000/product/product_information")
            if (!res.ok) {
                throw new Error("Failed to fetch product data")
            }
            setProductData(await res.json())
        } catch (e) {
            console.error(e)
            setProductData([]);
        }
    }

    async function fetchPackaging() {
        try {
            const res = await fetch("http://127.0.0.1:8000/product/packaging_options")
            if (!res.ok) {
                throw new Error("Failed to fetch packaging data")
            }
            setPackagingName(await res.json())
        } catch (e) {
            console.error(e);
            setPackagingName([]);
        }
    }

    async function fetchCrops() {
        try {
            const res = await fetch(`http://127.0.0.1:8000/crops/grow_information`);
 
            if (!res.ok) {
                throw new Error("Failed to fetch crop data");
            }
 
            setCropData(await res.json());
        } catch (e) {
            console.error(e);
        }
    }

    async function handleAddProduct() {
        const trimName = newProductName.trim();
        if (!trimName) {
            toast.error("Please add a unique product name.");
            return;
        }

        const newKey = normalizeStr(trimName);
        if (productMap[newKey]) {
            toast.error("A product with this name already exists.");
            return;
        }

        const selectedPackage = packagingName.find(
            (p) => p.size_type === newPackageType
        );
        const isLiveTray = isLiveTraySize(selectedPackage?.size_type);

        if (!newPackageType) {
            toast.error("Please select a packaging type.");
            return;
        }

        if (!isLiveTray && (!newWeight || newWeight <= 0)) {
            toast.error("Please add a valid weight for the product.");
            return;
        }

        const validRows = compositionRow.filter(
            (r) => r.crop_id !== null && r.crop_ratio !== null
        );
        if (validRows.length === 0) {
            toast.error("Please add at least one crop in the composition.");
            return;
        }

        const totalPercent = validRows.reduce(
            (sum, row) => sum + (row.crop_ratio ?? 0), 0
        );

        if (totalPercent !== 100) {
            toast.error("Total composition must equal 100%.");
            return;
        }

        const list_of_composition = validRows.map((row) => ({
            crop_id: row.crop_id as number,
            crop_ratio: (row.crop_ratio as number) / 100,
        }))

        setAdding(true);

        try {
            if (!selectedPackage) {
                toast.error("Package ID not found!");
                return;
            }
            const package_id = selectedPackage.package_id;
            const body = {
                product_name: newProductName,
                weight_grams: isLiveTray ? null : newWeight,
                is_active: isActive,
                package_id: package_id,
                list_of_composition
            }

            const res = await fetch("http://127.0.0.1:8000/product/add_product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Failed to add product.")
                toast.error("Failed to add product.")
                return;
            }

            toast.success("Product added successfully!")
            await fetchProducts();

            setNewProductName("");
            setNewWeight(null);
            setIsActive(true);
            setNewPackageType("");
            setCompositionRow([{ crop_id: null, crop_ratio: null }])
            setAddOpen(false);
        } catch (e) {
            console.error("Add product error:", e)
            toast.error("Error adding product. Please try again.")
        } finally {
            setAdding(false);
        }
    }

    function openAddSize(key: string) {
        const group = productMap[key];
        if (!group) return;
        setSizeDialog({
            mode: "add",
            productName: group.displayName,
            sizeType: "",
            weight: null,
            isActive: true,
        });
    }

    function openEditSize(key: string, sizeType: string, weight_grams: number | null, is_active: number) {
        const group = productMap[key];
        if (!group) return
        const liveTray = isLiveTraySize(sizeType)
        setSizeDialog({
            mode: "edit",
            productName: group.displayName,
            sizeType: sizeType,
            weight: liveTray ? null : weight_grams,
            isActive: is_active === 1,
        });
    }

    async function handleSaveSize() {
        if (!sizeDialog) return;

        const { mode, productName, sizeType, weight, isActive } = sizeDialog;
        const pkg = packagingName.find((p) => p.size_type === sizeType);
        const liveTray = isLiveTraySize(pkg?.size_type);

        if (!sizeType) {
            toast.error("Please select a size type");
            return;
        }

        if (!liveTray && (!weight || weight <= 0)) {
            toast.error("Please provide a valid weight.");
            return;
        }

        if (!pkg) {
            toast.error("Could not find package ID for this size.");
            return;
        }

        const body = {
            product_name: productName,
            package_id: pkg.package_id,
            weight_grams: liveTray ? null : weight,
            is_active: isActive,
        };

        try {
            const url = mode === "add"
                ? "http://127.0.0.1:8000/product/add_product_size"
                : "http://127.0.0.1:8000/product/update_product_size";
            
            const res = await fetch(url, {
                method: mode === "add" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Failed to save product size.");
                toast.error("Failed to save product size.");
                return;
            }

            toast.success(
                mode === "add"
                ? "Product size added successfully."
                : "Product size updated successfully."
            );
            setSizeDialog(null);
            await fetchProducts();
        } catch (e) {
            console.error("Error saving product size:", e);
            toast.error("Unexpected error saving product size.");
        }
    }

    function openCompositionDialog(productName: string) {
        const product = productMap[productName];
        if (!product) return;

        const rows: CompositionRow[] = product.crops.map((c) => {
            const crop = cropData.find(cd => cd.crop_name === c.crop_name);
            return {
                crop_id: crop ? crop.crop_id : null,
                crop_ratio: Math.round(c.crop_ratio * 100),
            };
        });

        setCompDialog({
            productName,
            rows: rows.length ? rows : [{ crop_id: null, crop_ratio: null }],
        });
    }

    async function handleSaveComposition() {
        if (!compDialog) return;

        const { productName, rows } = compDialog;
        
        const validRows = rows.filter(
            (row) => row.crop_id !== null && row.crop_ratio !== null
        );

        if (validRows.length === 0) {
            toast.error("Please add at least one crop in the composition.");
            return;
        }

        const totalPercent = validRows.reduce(
            (sum, row) => sum + (row.crop_ratio ?? 0), 0
        );

        if (totalPercent !== 100) {
            toast.error("Total composition must add up to 100%");
            return;
        }

        const list_of_composition = validRows.map((row) => ({
            crop_id: row.crop_id as number,
            crop_ratio: (row.crop_ratio as number) / 100,
        }));

        const body = {
            product_name: productName,
            list_of_composition,
        };

        try {
            const res = await fetch("http://127.0.0.1:8000/product/update_composition", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Faied to update composition.");
                toast.error("Failed to update composition");
                return;
            }

            toast.success("Composition updated successfully.");
            setCompDialog(null);
            await fetchProducts();
        } catch (e) {
            console.error("Error updating composition:", e);
            toast.error("Unexpected error updating composition.");
        }
    }

    async function handleAddPackaging() {
        const trimmed = newPackagingName.trim();

        if (!trimmed) {
            toast.error("Packaging name cannot be empty");
            return;
        }

        if (packagingName.some((p) => p.size_type.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("A packaging option with this name already exists.");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/product/add_packaging", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ size_type: trimmed })
            });

            if (!res.ok) {
                console.error("Failed to add packaging option.");
                toast.error("Failed to add packaging option.");
                return;
            }

            toast.success("Packaging type added.");
            await fetchPackaging();
            setNewPackagingName("");
        } catch (e) {
            console.error(e);
            toast.error("Unexpected error while adding packaging.")
        }
    }

    async function handleUpdatePackaging() {
        if (!packagingEdit) {
            toast.error("No packaging selected for editing")
            return;
        }

        const trimmed = packagingEdit.sizeType.trim();

        if (!trimmed) {
            toast.error("Packaging name cannot be empty.");
            return;
        }

        if (!packagingEdit.originalName) {
            toast.error("Invalid packaging edit request.");
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/product/update_packaging/${packagingEdit.originalName}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ size_type: trimmed }),
            });

            if (!res.ok) {
                toast.error("Failed to update packaging option.");
                return;
            }

            toast.success("Packaging type updated.");
            await fetchPackaging();
            setPackagingEdit(null);
        } catch (e) {
            console.error(e);
            toast.error("Unexpected error while updating packaging.");
        }
    }

    const selectedAddPackage = packagingName.find(
        (p) => p.size_type === newPackageType
    );
    const addIsliveTray = isLiveTraySize(selectedAddPackage?.size_type);

    const filteredProductKeys = Object.keys(productMap).sort().filter((name) => normalizeStr(productMap[name].displayName).includes(normalizeStr(search)))

    useEffect(() => {
        fetchProducts();
        fetchPackaging();
        fetchCrops();
    }, []);

    return (
        <div className="flex text-sm font-mono justify-center items-start mt-5 px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col p-4 bg-white/60 rounded-lg max-w-4xl w-full sm:p-4">
                <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:justify-between sm:items-center">
                    <h2 className="font-semibold text-lg text-[#308261]">Product Offerings</h2>
                    <div className="flex flex-col gap-1 sm:flex-row">
                        <Dialog
                            open={addOpen}
                            onOpenChange={(open) => {
                                setAddOpen(open);
                                if (!open) {
                                    setNewProductName("");
                                    setNewWeight(null);
                                    setIsActive(true);
                                    setNewPackageType("");
                                    setCompositionRow([{ crop_id: null, crop_ratio: null }])
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-[#4b734e] font-semibold scale-95 active:scale-85">+ Add Product</Button>                                                        
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Product Offering</DialogTitle>
                                    <DialogDescription>
                                        Please fill all the fields below to add a new product offering.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-2">
                                    <Label>Product Name</Label>
                                    <Input
                                        type="text"
                                        value={newProductName}
                                        onChange={(n) => setNewProductName(n.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Package Type</Label>
                                    <Select
                                        value={newPackageType}
                                        onValueChange={(v) => {
                                            setNewPackageType(v);
                                            const pkg = packagingName.find(
                                                (p) => p.size_type === v
                                            );
                                            if (isLiveTraySize(pkg?.size_type)) {
                                                setNewWeight(null);
                                            }
                                        }}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select Package Type" /></SelectTrigger>
                                        <SelectContent>
                                            {packagingName.map((p) => (
                                                <SelectItem key={p.size_type} value={p.size_type}>
                                                    {p.size_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Weight in grams</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        disabled={addIsliveTray}
                                        placeholder={addIsliveTray ? "N/A for live tray" : "Enter weight"}
                                        value={addIsliveTray ? "" : newWeight ?? ""}
                                        onChange={(w) => setNewWeight(Number(w.target.value))}
                                    />
                                </div>

                                <div className="flex flex-row gap-2 items-center">
                                    <Label>Is Active?</Label>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(a) => setIsActive(a.target.checked)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Crop Composition (%)</Label>
                                    <div className="space-y-2">
                                        {compositionRow.map((row, index) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <Select
                                                    value={row.crop_id !== null ? String(row.crop_id) : ""}
                                                    onValueChange={(value) => {
                                                        const cropId = Number(value);
                                                        setCompositionRow((prev) => {
                                                            const copy = [...prev];
                                                            copy[index] = { ...copy[index], crop_id: cropId };
                                                            return copy;
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="flex-1"><SelectValue placeholder="Select Crop" /></SelectTrigger>
                                                    <SelectContent>
                                                        {cropData.map((c) => (
                                                            <SelectItem key={c.crop_id} value={String(c.crop_id)}>
                                                                {c.crop_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    className="w-24"
                                                    placeholder="%"
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={row.crop_ratio ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? null : Number(e.target.value);
                                                        setCompositionRow((prev) => {
                                                            const copy = [...prev];
                                                            copy[index] = { ...copy[index], crop_ratio: value };
                                                            return copy;
                                                        });
                                                    }}
                                                />

                                                {compositionRow.length > 1 && (
                                                    <Button
                                                        className="px-3 py-1 bg-transparent hover:bg-transparent hover:text-blue-600 hover:scale-105 active:scale-95 text-gray-500 cursor-pointer"
                                                        onClick={() =>
                                                            setCompositionRow((prev) => prev.filter((_, i) => i !== index))
                                                        }
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Button
                                        className="my-2"
                                        variant="outline"
                                        onClick={() => setCompositionRow((prev) => [...prev, { crop_id: null, crop_ratio: null },])}
                                    >
                                        + Add Crop
                                    </Button>
                                </div>

                                <Button onClick={handleAddProduct} disabled={adding}>
                                    {adding ? "Adding..." : "Add Product"}
                                </Button>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            onOpenChange={(open) => {
                                if (!open) {
                                    setPackagingEdit(null);
                                    setNewPackagingName("");
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button className="bg-[#4b734e] font-semibold scale-95 active:scale-85">Packaging Options</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Packaging Options</DialogTitle>
                                    <DialogDescription>View, add, or edit packaging types.</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 mt-2">
                                    <div>
                                        <div className="text-sm font-semibold mb-2">Existing Packaging Types</div>
                                        <table className="w-full text-left text-sm border-collapse">
                                            <tbody>
                                                {packagingName.map((p) => {
                                                    const isEditing = packagingEdit?.originalName === p.size_type;

                                                    return (
                                                        <tr key={p.package_id ?? p.size_type}>
                                                            <td className="py-1 pr-2">
                                                                {isEditing ? (
                                                                    <Input
                                                                        value={packagingEdit.sizeType}
                                                                        onChange={(e) => setPackagingEdit((prev) => prev ? {...prev, sizeType: e.target.value} : prev)}
                                                                        className="h-8"
                                                                    />
                                                                ) : (
                                                                    p.size_type
                                                                )}
                                                            </td>
                                                            <td className="py-1 text-right space-x-2">
                                                                {isEditing ? (
                                                                    <>
                                                                        <Button size="sm" className="bg-green-700 hover:bg-green-700/60" onClick={handleUpdatePackaging}>
                                                                            <FaSave size={16} />
                                                                        </Button>
                                                                        <Button size="sm" className="bg-red-700 hover:bg-red-700/60" onClick={() => setPackagingEdit(null)}>
                                                                            <MdCancel size={16} />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <Button size="sm" onClick={() => setPackagingEdit({ originalName: p.size_type, sizeType: p.size_type })}>
                                                                        <FiEdit size={16} />
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <hr className="border-gray-300 my-6"/>
                                    <div className="flex flex-col gap-3">
                                        <Label>Add New Packaging Below</Label>
                                        <Input
                                            type="text"
                                            value={newPackagingName}
                                            onChange={(e) => setNewPackagingName(e.target.value)}
                                            placeholder="i.e. Clamshell"
                                        />

                                        <Button
                                            className="w-full mt-2"
                                            onClick={handleAddPackaging}
                                        >
                                            Add Packaging
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-[#4b734e]/60 rounded-md text-xs focus:outline-none foucs:ring-1 focus:ring-[#4b734e] sm:text-sm"
                />
                <Dialog open={!!sizeDialog} onOpenChange={(open) => !open && setSizeDialog(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {sizeDialog?.mode === "add" ? "Add Product Size" : "Edit Product Size"}
                            </DialogTitle>
                            <DialogDescription>
                                {sizeDialog?.productName && `Product: ${sizeDialog.productName}`}
                            </DialogDescription>
                        </DialogHeader>

                        {sizeDialog && (
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex flex-col gap-1">
                                    <Label>Size Type</Label>
                                    <Select
                                        value={sizeDialog.sizeType}
                                        onValueChange={(value) => {
                                            setSizeDialog(prev => {
                                                if (!prev) return prev;
                                                const liveTray = isLiveTraySize(value);
                                                return {
                                                    ...prev,
                                                    sizeType: value,
                                                    weight: liveTray ? null : prev.weight,
                                                };
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {packagingName.map((p) => (
                                                <SelectItem key={p.size_type} value={p.size_type}>
                                                    {p.size_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <Label>Weight (g)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        disabled={isLiveTraySize(sizeDialog.sizeType)}
                                        placeholder={
                                            isLiveTraySize(sizeDialog.sizeType)
                                            ? "Not required for live trays"
                                            : ""
                                        }
                                        value={
                                            isLiveTraySize(sizeDialog.sizeType)
                                            ? ""
                                            : sizeDialog.weight ?? ""
                                        }
                                        onChange={(e) =>
                                            setSizeDialog(prev => prev
                                                ? {...prev, weight: Number(e.target.value) || null}
                                                : prev
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-row gap-2 items-center">
                                    <Label>Active?</Label>
                                    <input
                                        type="checkbox"
                                        checked={sizeDialog.isActive}
                                        onChange={(e) =>
                                            setSizeDialog(prev =>
                                                prev ? { ...prev, isActive: e.target.checked } : prev
                                            )
                                        }
                                    />
                                </div>

                                <Button onClick={handleSaveSize} className="w-full mt-2">
                                    Save
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog open={!!compDialog} onOpenChange={(open) => !open && setCompDialog(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Crop Composition</DialogTitle>
                            <DialogDescription>
                                {compDialog?.productName && (
                                    <span>Product: {compDialog.productName}</span>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        {compDialog && (
                            <div className="flex flex-col gap-2 mt-2">
                                <div className="space-y-2">
                                    {compDialog.rows.map((row, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Select
                                                value={row.crop_id !== null ? String(row.crop_id) : ""}
                                                onValueChange={(value) => {
                                                    const cropId = Number(value);
                                                    setCompDialog(prev => {
                                                        if (!prev) return prev;
                                                        const rows = [...prev.rows];
                                                        rows[index] = { ...rows[index], crop_id: cropId };
                                                        return { ...prev, rows};
                                                    });
                                                }}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Select Crop" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cropData.map((c) => (
                                                        <SelectItem key={c.crop_id} value={String(c.crop_id)}>
                                                            {c.crop_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Input
                                                className="w-24"
                                                placeholder="%"
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={row.crop_ratio ?? ""}
                                                onChange={(e) => {
                                                    const value = e.target.value === "" ? null : Number(e.target.value);
                                                    setCompDialog(prev => {
                                                        if (!prev) return prev;
                                                        const rows = [...prev.rows];
                                                        rows[index] = { ...rows[index], crop_ratio: value };
                                                        return { ...prev, rows};
                                                    });
                                                }}
                                            />

                                            {compDialog.rows.length > 1 && (
                                                <Button
                                                    className="px-3 py-1 bg-transparent hover:bg-transparent hover:text-blue-600 hover:scale-105 active:scale-95 text-gray-500 cursor-pointer"
                                                    onClick={() =>
                                                        setCompDialog(prev => {
                                                            if (!prev) return prev;
                                                            const rows = prev.rows.filter((_, i) => i !== index);
                                                            return { ...prev, rows };
                                                        })
                                                    }
                                                >
                                                    <FiTrash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <Button
                                    className="my-2"
                                    variant="outline"
                                    onClick={() =>
                                        setCompDialog(prev =>
                                            prev ? {
                                                ...prev,
                                                rows: [...prev.rows, { crop_id: null, crop_ratio: null }],
                                            } : prev
                                        )
                                    }
                                >
                                    + Add Crop
                                </Button>

                                <Button onClick={handleSaveComposition} className="w-full mt-2">
                                    Save Composition
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                <div className="flex-1 overflow-y-auto max-h-[60vh] mt-2">
                    <div className="flex justify-center items-center">
                        <Accordion type="single" collapsible>
                            {filteredProductKeys.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    No products match your search.
                                </div>
                            ) : (filteredProductKeys.map((name) => (
                                <AccordionItem key={name} value={name}>
                                    <AccordionTrigger>{productMap[name].displayName}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 p-4 bg-white rounded-lg shadow w-full">
                                            <div>
                                                <div className="flex justify-between items-center gap-4">
                                                    <div className="flex items-center py-3 text-[#4b734e] font-semibold">Crop Composition</div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openCompositionDialog(name)}
                                                    >
                                                        Edit Composition
                                                    </Button>
                                                </div>
                                                <table className="text-left mb-5 border-collapse text-sm">
                                                    <tbody>
                                                        {productMap[name].crops.map((c) => {
                                                            const ratioPercent = (c.crop_ratio * 100).toFixed(1);
                                                            return (
                                                                <tr key={c.crop_name}>
                                                                    <td className="px-6">{ratioPercent}%</td>
                                                                    <td className="px-4 py-1 align-top">{c.crop_name}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center">
                                                    <div className="py-2 text-[#4b734e] font-semibold">Offering Sizes</div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openAddSize(name)}
                                                    >
                                                        + Add Size
                                                    </Button>
                                                </div>
                                                <table className="text-left mb-4 border-collapse text-sm w-full">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-6 py-2 font-semibold">Product Size</th>
                                                            <th className="px-6 py-2 font-semibold">Weight (g)</th>
                                                            <th className="px-6 py-2 font-semibold">Status</th>
                                                            <th className="px-6 py-2 font-semibold text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {productMap[name].sizes.map((s) => {
                                                            const weightVal = s.weight_grams === null ? "-" : `${String(s.weight_grams)}g`;
                                                            const active = s.is_active === 1 ? "Active" : "Inactive";
                                                            return (
                                                                <tr key={s.size_type}>
                                                                    <td className="px-6 py-2 align-top">{s.size_type}</td>
                                                                    <td className="px-6 py-2 align-top">{weightVal}</td>
                                                                    <td className="px-6 py-2 align-top">{active}</td>
                                                                    <td className="flex justify-center">
                                                                        <Button
                                                                            className="bg-transparent hover:bg-transparent hover:text-blue-600 hover:scale-105 active:scale-95 text-black"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                openEditSize(
                                                                                    name,
                                                                                    s.size_type,
                                                                                    s.weight_grams,
                                                                                    s.is_active
                                                                                )
                                                                            }
                                                                        >
                                                                            <FiEdit size={16} />
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    );
}
