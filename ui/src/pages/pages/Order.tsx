import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import type { Restaurant } from "../../types/order";
import { FiEdit, FiTrash2 } from "react-icons/fi";


export default function Order() {
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [orderData, setOrderData] = useState<Restaurant | null>(null)
    
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`http://127.0.0.1:8000/orders/${selectedDate}`)

                if (!res.ok) {
                    throw new Error("Failed to fetch order data");
                }

                setOrderData(await res.json());
            } catch (e) {
                console.error(e);
                setOrderData(null)
            }
        }

        fetchData();
    }, [selectedDate]);

    return (
        <div className="flex flex-col items-center justify-center p-6 text-sm font-mono">
            <div className="flex items-center gap-5 mb-5 px-20">
                <input
                    id="date"
                    type="date"
                    className="border border-gray-400 rounded-lg px-3 py-2"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
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
                                        {items.map((item, i) => (
                                            <>
                                                <span key={`id-${i}`}>OrderId:{item.order_id}</span>
                                                <span key={`name-${i}`}>{item.product_name}</span>
                                                <span key={`q-${i}`}>Size: {item.package_type} x{item.quantity}</span>
                                                <span key={`btn-${i}`} className="flex flex-row gap-3 justify-end mr-5">
                                                    <button className="hover:text-blue-600 hover:scale-110 active:scale-95"><FiEdit size={16} /></button>
                                                    <button className="hover:text-red-500 hover:scale-110 active:scale-95"><FiTrash2 size={16} /></button>
                                                </span>
                                            </>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
