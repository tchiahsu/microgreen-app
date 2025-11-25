import { useEffect, useState } from "react";
import { CropActions } from "../../components/cropActions";
import type { ClientName } from "../../types/client";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";



export default function Client() {
    const [clientInfo, setClientInfo] = useState<Record<string, any[]>>({});
    const [search, setSearch] = useState("");

    async function fetchData() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/clients/restaurant_information`);

            if (!response.ok) {
                throw new Error("Failed to fetch crop data");
            }

            const result = await response.json();

            const groupedByClient = result.reduce((acc, row) => {
                if (!acc[row.restaurant_name]){
                    acc[row.restaurant_name] = [];
                }
                acc[row.restaurant_name].push(row);
                return acc;
            }, {} as Record<string, any[]>);


            setClientInfo(groupedByClient);
        } catch (e) {
            console.error(e);
        }
    }

    function generalize (str: string) {
        return str
            .normalize("NFKC")
            .trim()
            .replace(/[^\w\s]+/g, "")
            .replace(/\s+/g, " ")
            .toLowerCase();
    };

    const searchRestaurants = Object.keys(clientInfo).filter(name =>
        generalize(name).includes(generalize(search))
    );

    useEffect(() => {
        fetchData()
    }, [])
    
    return (
        <div className="text-sm font-mono">
            <div className="flex w-full items-start justify-center">
                <div className="p-5 bg-white/60 rounded-lg h-170 flex flex-col w-[65%] mt-5 mx-auto">
                    <h2 className="font-semibold text-lg mb-5 text-[#308261]">Client Information</h2>
                    <input
                        type="text"
                        placeholder="Search clients"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 p-2 border border-[#308261] rounded-lg w-full"
                    />
                    <div className="flex-1 overflow-y-auto">
                        <Accordion type='single' collapsible className="w-full">
                            {searchRestaurants.map((restaurant) => (
                                <AccordionItem className="w-full" key={restaurant} value={restaurant}>
                                    <AccordionTrigger className="w-full">{restaurant}</AccordionTrigger>
                                    <AccordionContent className="w-full">
                                        <div className="space-y-4 p-4 bg-white rounded-lg shadow w-full">
                                            {clientInfo[restaurant].map((info, i) => (
                                                <div
                                                    key={i}
                                                    className="border-b pb-3 last:border-none last:pb-0"
                                                >
                                                    <div><span className="font-semibold">Contact Name:</span> {info.contact_name}</div>
                                                    <div><span className="font-semibold">Email:</span> {info.email}</div>
                                                    <div><span className="font-semibold">Phone:</span> {info.phone}</div>
                                                    <div><span className="font-semibold">Address:</span> {info.contact_address}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )
}