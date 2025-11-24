import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Calendar28 } from "../../components/date";
import { Actions } from "../../components/actions";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import type { ProductOption } from "../../types/product";
import type { Restaurant, RestaurantOption } from "../../types/order";


export default function Order() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [orderData, setOrderData] = useState<Restaurant | null>(null);
    const [restaurantNames, setRestaurantNames] = useState<RestaurantOption[]>([]);
    const [productData, setProductData] = useState<ProductOption[]>([]);
    const [endDate, setEndDate] = useState<string>(selectedDate);
    const [deliveryDate, setDeliveryDate] = useState<string>(selectedDate);
    const [orderType, setOrderType] = useState<string>("");
    const [quantity, setQuantity] = useState<number>();
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const productNames = Array.from(new Set(productData.map((p) => p.product_name)));
    const packageOptions = selectedProductName.length > 0 ? Array.from(new Set(productData.filter((p) => p.product_name === selectedProductName).map((p) => p.size_type))) : [];


    async function fetchOrders(date: string) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/orders/${date}`);
            if (!res.ok) {
                throw new Error("Failed to fetch order data");
            }
            setOrderData(await res.json());
        } catch (e) {
            console.error(e);
            setOrderData(null);
        }
    }

    async function fetchProducts() {
        try {
            const res = await fetch('http://127.0.0.1:8000/product/product_names');
            if (!res.ok) {
                throw new Error("Failed to fetch product data");
            }
            setProductNames(await res.json())
        } catch (e) {
            console.error(e)
            setProductNames([]);
        }
    }

    async function fetchRestaurants() {
        try {
            const res = await fetch('http://127.0.0.1:8000/clients/restaurant_information');
            if (!res.ok) {
                throw new Error("Failed to fetch restaurant data");
            }
            setRestaurantNames(await res.json())
        } catch (e) {
            console.error(e)
            setRestaurantNames([]);
        }
    }

    async function handleAddOrder() {
        if (!selectedRestaurantId) {
            toast.error("Please select a restaurant.");
            return;
        }
        if (!selectedProductId) {
            toast.error("Please select a product.");
            return;
        }
        if (!quantity || quantity <= 0) {
            toast.error("Quantity must be at least 1.");
            return;
        }
        if (!orderType) {
            toast.error("Please select an order type.");
            return;
        }
        if (!deliveryDate) {
            toast.error("Please select a delivery date.");
            return;
        }

        setAdding(true);

        try {
            const body = {
                restaurant_id: selectedRestaurantId,
                product_id: selectedProductId,
                quantity,
                order_type: orderType,
                delivery_date: deliveryDate,
                end_date: endDate || null,
            }
            const res = await fetch("http://127.0.0.1:8000/orders/1/add_order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                console.error("Failed to add order", err);
                toast.error("Failed to add order.")
                return;
            }

            toast.success("Order added successfully!");
            await fetchOrders(selectedDate);
            setAddOpen(false);
            setQuantity(undefined);
            setOrderType("");
            setEndDate("");
            setSelectedProductId(null);
        } catch (err) {
            console.error("Add order error:", err);
            toast.error("Error adding order.")
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdate(orderId: number, body: unknown) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/orders/update_product/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                console.error("Failed to update order")
                return;
            }

            await fetchOrders(selectedDate);
        } catch (err) {
            console.error("Update error:", err)
        }
    }

    async function handleDelete(orderId: number, productId: number) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}/delete_product/${productId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                console.error("Failed to update order")
                return;
            }

            await fetchOrders(selectedDate)
            toast.success("Product removed from order successfully!")
        } catch (err) {
            console.error("Delete error:", err)
            toast.error("Error deleting product.")
        }
    }
    
    useEffect(() => {
        fetchOrders(selectedDate);
        setDeliveryDate(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        fetchRestaurants();
        fetchProducts();
    }, [])

    return (
        <div className="flex justify-center">
            <div className="flex flex-col p-6 text-sm font-mono">
                <div className="flex justify-start items-center gap-5 mb-5">
                    <Calendar28
                        selectedDate={selectedDate}
                        onChange={(value) => setSelectedDate(value)}
                    />
                </div>
                <div className="flex flex-col justify-center p-5 bg-white/60 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="font-semibold text-lg mb-5 text-[#308261]">Order Summary</div>
                        <div className="flex flex-row gap-4">
                            <Popover open={addOpen} onOpenChange={setAddOpen}>
                                <PopoverTrigger>
                                    <button className="bg-[#929870] text-white font-semibold p-2 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100">
                                        Add Order
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="flex flex-col gap-2">
                                        <Label>Restaurant</Label>
                                        <Select
                                            value={selectedRestaurantId ? String(selectedRestaurantId) : ""}
                                            onValueChange={(v) => setSelectedRestaurantId(Number(v))}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select Restaurant" /></SelectTrigger>
                                            <SelectContent>
                                                {restaurantNames.map((r) => (
                                                    <SelectItem key={r.restaurant_id} value={String(r.restaurant_id)}>
                                                        {r.restaurant_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <Label>Product</Label>
                                        <Select
                                            value={selectedProductId ? String(selectedProductId) : ""}
                                            onValueChange={(v) => setSelectedProductId(Number(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {productNames.map((p) => (
                                                    <SelectItem key={p.product_id} value={String(p.product_id)}>
                                                        {p.product_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <Label>Order Type</Label>
                                        <Select value={orderType} onValueChange={setOrderType}>
                                            <SelectTrigger><SelectValue placeholder="Select Order Type"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one-time">One-Time Order</SelectItem>
                                                <SelectItem value="weekly">Recurring Order</SelectItem>
                                                <SelectItem value="bi-weekly">Bi-Weekly Order</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2 mt-3">
                                        <Label>Order End Date</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 my-3">
                                        <Label>Delivery Date</Label>
                                        <Input
                                            type="date"
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                        />
                                    </div>

                                    <Button className="mt-2" onClick={handleAddOrder} size="sm" disabled={adding}>
                                        {adding ? "Adding..." : "Add Order"}
                                    </Button>
                                </PopoverContent>
                            </Popover>
                            <button className="bg-[#929870] text-white font-semibold p-2 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100 ">View Delivery</button>
                        </div>
                    </div>
                    {!orderData || Object.keys(orderData).length === 0 ? (
                        <div className="w-[100vh] font-bold text-red-600">No orders found for this date.</div>
                    ) : (
                        <Accordion type='single' collapsible>
                            {Object.entries(orderData).map(([restaurantName, items]) => (
                                <AccordionItem value={restaurantName}>
                                    <AccordionTrigger>{restaurantName} - {items.length} items</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-[1fr_2fr_2fr_1fr] auto-rows-min gap-4 mx-10">
                                            {items.map((item) => (
                                                <Actions 
                                                    key={`${item.order_id}-${item.product_id}`}
                                                    item={item}
                                                    onUpdate={handleUpdate}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </div>
    );
}
