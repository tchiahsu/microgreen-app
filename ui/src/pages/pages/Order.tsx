import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Calendar28 } from "../../components/date";
import { Actions } from "../../components/actions";
import type { Restaurant } from "../../types/order";


export default function Order() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [orderData, setOrderData] = useState<Restaurant | null>(null)

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
        } catch (err) {
            console.error("Delete error:", err)
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
                    <div className="flex justify-center font-semibold text-lg mb-5 text-[#308261]">Order Summary</div>
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
