import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Calendar28 } from "../../components/date";
import { Actions } from "../../components/actions";
import type { Restaurant } from "../../types/order";
import { toast } from "sonner";


export default function Order() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [orderData, setOrderData] = useState<Restaurant | null>(null);
    const [endDate, setEndDate] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<string>("");
    const [orderType, setOrderType] = useState<string>("");
    const [quantity, setQuantity] = useState<number>();


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
            const res = await fetch(`http://127.0.0.1:8000/orders/${date}`);
        } catch (e) {
            console.error(e)
            setProducts(null);
        }
    }

    async function fetchRestaurants() {
        try {

        } catch (e) {
            console.error(e)
            setRestaurants(null);
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
    }, [selectedDate]);

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
                            <Popover>
                                <PopoverTrigger>
                                    <button className="bg-[#929870] text-white font-semibold p-2 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100">
                                        Add Order
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="flex flex-col gap-2">
                                        <Label>Restaurant ID</Label>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Product ID</Label>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
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

                                    <div className="flex flex-col gap-2">
                                        <Label>Order End Date</Label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Delivery Date</Label>
                                        <Input
                                            type="date"
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                        />
                                    </div>
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
                                                    key={item.order_id}
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
