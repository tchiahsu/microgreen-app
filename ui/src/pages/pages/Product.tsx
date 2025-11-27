import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FiTrash2 } from "react-icons/fi";
// import { FiEdit } from "react-icons/fi";
import { toast } from "sonner";

import type { ProductItem, PackageType, CompositionRow } from "../../types/product";
import type { CropInfo } from "../../types/crop";

export default function Product() {
    const [productData, setProductData] = useState<ProductItem[]>([]);
    const [packagingName, setPackagingName] = useState<PackageType[]>([])
    const [cropData, setCropData] = useState<CropInfo[]>([]);

    const [newProductName, setNewProductName] = useState<string>("");
    const [newWeight, setNewWeight] = useState<number | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [newPackageType, setNewPackageType] = useState<string>("");

    const [adding, setAdding] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const [compositionRow, setCompositionRow] = useState<CompositionRow[]>([
        { crop_id: null, crop_ratio: null },
    ]);

    const productMap: Record<string, {
        crops: { crop_name: string; crop_ratio: number }[];
        sizes: { size_type: string; weight_grams: number; is_active: number}[];
    }> = {};

    for (const p of productData) {
        if (!productMap[p.product_name]) {
            productMap[p.product_name] = { crops: [], sizes: [] };
        }

        if (!productMap[p.product_name].crops.some(c => c.crop_name === p.crop_name)) {
            productMap[p.product_name].crops.push({
                crop_name: p.crop_name,
                crop_ratio: p.crop_ratio,
            });
        }

        if (!productMap[p.product_name].sizes.some(s => s.size_type === p.size_type)) {
            productMap[p.product_name].sizes.push({
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
        if (!newProductName) {
            toast.error("Please add a unique product name.")
            return;
        }
        if (!newWeight) {
            toast.error("Please add a weightage for the product.")
            return;
        }
        if (!newPackageType) {
            toast.error("Please select a packaging type.")
            return;
        }

        const validRows = compositionRow.filter(
            (row) => row.crop_id !== null && row.crop_ratio !== null
        );

        if (validRows.length === 0) {
            toast.error("Please add at least one crop in the composition.");
            return;
        }

        const totalPercent = validRows.reduce(
            (sum, row) => sum + (row.crop_ratio ?? 0), 0
        );

        if (totalPercent > 100) {
            toast.error("Total composition cannot exceed 100%.");
            return;
        }
        if (totalPercent < 100) {
            toast.error("Total composition should add up to 100%");
            return;
        }

        const list_of_composition = validRows.map((row) => ({
            crop_id: row.crop_id as number,
            crop_ratio: (row.crop_ratio as number) / 100,
        }))

        setAdding(true);

        try {
            const packageRow = packagingName.find(p => p.size_type === newPackageType)
            if (!packageRow) {
                toast.error("Package ID not found!")
                return;
            }
            const package_id = packageRow?.package_id;
            const body = {
                product_name: newProductName,
                weight_grams: newWeight,
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

    useEffect(() => {
        fetchProducts();
        fetchPackaging();
        fetchCrops();
    }, []);

    return (
        <div className="flex text-sm font-mono justify-center items-center mt-5">
            <div className="flex flex-col p-5 bg-white/60 rounded-lg w-[60%]">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-semibold text-lg text-[#308261]">Product Offerings</h2>
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
                            <Button className="bg-[#4b734e] font-semibold scale-95 active:scale-85">Add Product Offering</Button>                                                        
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
                                <Label>Weight in grams</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={newWeight ?? ""}
                                    onChange={(w) => setNewWeight(Number(w.target.value))}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label>Package Type</Label>
                                <Select
                                    onValueChange={setNewPackageType}
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

                            <div className="flex flex-row gap-2">
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
                </div>

                <div className="flex justify-center items-center">
                    <Accordion type="single" collapsible>
                        {Object.keys(productMap).sort().map((name) => (
                            <AccordionItem key={name} value={name}>
                                <AccordionTrigger>{name}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4 p-4 bg-white rounded-lg shadow w-full">

                                        <div>
                                            <div className="flex justify-between items-center gap-4">
                                                <div className="flex items-center py-3 text-[#4b734e] font-semibold">Crop Composition</div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button className="bg-[#4b734e] font-semibold scale-90 active:scale-85">Edit Composition</Button>                                                        
                                                    </PopoverTrigger>
                                                    <PopoverContent>
                                                        <div>DIV</div>
                                                    </PopoverContent>
                                                </Popover>
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
                                            <div className="py-2 text-[#4b734e] font-semibold">Offering Sizes</div>
                                            <table className="text-left mb-4 border-collapse text-sm">
                                                <thead>
                                                    <tr>
                                                        <th className="px-6 py-2 font-semibold">Product Size</th>
                                                        <th className="px-6 py-2 font-semibold">Weight (g)</th>
                                                        <th className="px-6 py-2 font-semibold">Status</th>
                                                        <th className="px-6 py-2 font-semibold">Actions</th>
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
                                                                    {/* <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                className="hover:text-blue-600 hover:bg-transparent hover:scale-105 active:scale-95 cursor-pointer bg-transparent text-black"
                                                                            >
                                                                                <FiEdit size={16}/>
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-72 space-y-4">
                                                                            <div className="flex flex-col gap-2">
                                                                                <Label>Product Weight (g)</Label>
                                                                                <Input 
                                                                                    type="number"
                                                                                    min="1"
                                                                                    //value={updateWeight}
                                                                                    onChange={(e) => setUpdateWeight(Number(e.target.value))}
                                                                                />
                                                                            </div>

                                                                            <div className="flex flex-row gap-2 mb-5">
                                                                                <Label>Product Active?</Label>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    //checked={updateActive}
                                                                                    onChange={(e) => setUpdateActive(e.target.checked)}
                                                                                />
                                                                            </div>

                                                                            <Button className="w-full" size="sm">
                                                                                {submitting ? "Saving..." : "Confirm"}
                                                                            </Button>

                                                                        </PopoverContent>
                                                                    </Popover> */}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
