import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from 'sonner';


type ActionsProp = {
    item: {
        order_id: number;
        product_id: number;
        product_name: string;
        package_type: string;
        quantity: number;
        delivery_date: string;
        order_status: string;
        employee_id: number | null;
    };
    onUpdate: (orderId: number, productId: number, body: unknown) => Promise<void>;
    onDelete: (orderId: number, productId: number) => Promise<void>;
}

function isBeforeToday(date: string) {
    const input = new Date(date);
    const today = new Date();

    input.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return input < today;
}

export function Actions({ item, onUpdate, onDelete }: ActionsProp) {
    const [quantity, setQuantity] = useState(item.quantity);
    const [deliveryDate, setDeliveryDate] = useState(item.delivery_date);
    const [applyToFuture, setApplyToFuture] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<string>(item.order_status);
    const [open, setOpen] = useState(false);

    async function handleConfirm() {
        const dateChanged = deliveryDate !== item.delivery_date;

        if (quantity <= 0) {
            toast.error("Quantity must be at least 1", {
                description: "If you wish to remove the item, use the delete button."
            });
            return;
        }

        if (isBeforeToday(deliveryDate)) {
            toast.error("Delivery date cannot be before today.")
            return;
        }

        setSubmitting(true);
        
        await onUpdate(item.order_id, item.product_id, {
            quantity,
            delivery_date: deliveryDate,
            apply_to_future: applyToFuture,
            order_status: status,
        });

        setSubmitting(false);
        if (dateChanged) {
            toast.info("Order updated!", {
                description: `New delivery date: ${deliveryDate}`
            });
            setOpen(false);
        } else {
            toast.success("Order updated!");
        }

        setOpen(false);
    }

    return (
        <div className="flex flex-col justify-between gap-2 p-3 rounded-lg border bg-white/80 shadow-sm text-xs sm:text-sm">
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-600">OrderId: {item.order_id}</span>
                    <span className="font-semibold">{item.product_name}</span>
                    <span className="text-xs font-semibold text-gray-600">{item.package_type} x{item.quantity}</span>
                    <span className="text-xs text-gray-600 capitalize">Status: {status}</span>

                    <div className="flex flex-row items-end gap-2 mt-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button className="hover:text-blue-600">
                                    <FiEdit size={16} />
                                </button>
                            </PopoverTrigger>

                            <PopoverContent className="w-72 space-y-3">
                                <div className="flex flex-col gap-2">
                                    <Label>Update Quantity</Label>
                                    <Input 
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>New Delivery Date</Label>
                                    <Input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={(e) => setDeliveryDate(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label>Order Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger><SelectValue placeholder="Select Status"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={applyToFuture}
                                        onChange={(e) => setApplyToFuture(e.target.checked)}
                                    />
                                    <Label className="text-xs">Apply to all future orders</Label>
                                </div>

                                <Button onClick={handleConfirm} size="sm" disabled={submitting}>
                                    {submitting ? "Saving..." : "Confirm"}
                                </Button>
                            </PopoverContent>
                        </Popover>

                        <button className="hover:text-red-500" onClick={() => onDelete(item.order_id, item.product_id)}>
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

