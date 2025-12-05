import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Calendar28 } from "../../components/date";
import { Actions } from "../../components/actions";
import { Button } from "../../components/ui/button";
import { Table } from "../../components/table";
import { toast } from "sonner";

import type { Restaurant, RestaurantOption } from "../../types/order";
import type { ProductName, PackageType } from "../../types/product";
import type { DeliveryItem } from "../../types/delivery"
import type { Columns } from "../../components/table";
import type { EmployeeItem } from "../../types/employee";


export default function Order() {
    const [selectedDate, setSelectedDate] = useState(() => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    });

    const [orderData, setOrderData] = useState<Restaurant | null>(null);
    const [restaurantNames, setRestaurantNames] = useState<RestaurantOption[]>([]);
    const [productData, setProductData] = useState<ProductName[]>([]);
    const [packageData, setPackageData] = useState<PackageType[]>([]);
    const [deliveryData, setDeliveryData] = useState<DeliveryItem[]>([]);

    const [endDate, setEndDate] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<string>(selectedDate);
    const [orderType, setOrderType] = useState<string>("");
    const [quantity, setQuantity] = useState<number | undefined>();
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [selectedProductName, setSelectedProductName] = useState<string>("");
    const [selectedPackage, setSelectedPackage] = useState<string>("");

    const [newDeliveryDate, setNewDeliveryDate] = useState<string>("");
    const [newDeliveryStatus, setNewDeliveryStatus] = useState<string>("");
    const [replacedDeliveryDate, setReplacedDeliveryDate] = useState<string>("");

    const [adding, setAdding] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [deliveryOpen, setDeliveryOpen] = useState(false);
    const [addDeliveryOpen, setAddDeliveryOpen] = useState(false)
    const [updateDeliveryOpen, setUpdateDeliveryOpen] = useState(false)

    const [assignDriverOpen, setAssignDriverOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<string>("");
    const [employees, setEmployees] = useState<EmployeeItem[]>([]);

    const deliveryColumns: Columns[] = [
        {key: "delivery_date", header_name: "Delivery Date", align: "center"},
        {key: "delivery_status", header_name: "Delivery Status", align: "center"},
        {key: "assigned_driver", header_name: "Assigned Driver", align: "center"}
    ];


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

    async function fetchEmployees() {
        const response = await fetch('http://127.0.0.1:8000/employees/');
        setEmployees(await response.json());
    }

    async function fetchProducts() {
        try {
            const res = await fetch('http://127.0.0.1:8000/product/product_information');
            if (!res.ok) {
                throw new Error("Failed to fetch product data");
            }

            const data = await res.json()
            setProductData(data)

        } catch (e) {
            console.error(e)
            setProductData([]);
        }
    }

    async function fetchPackaging(product_name: string) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/product/${product_name}/packaging_options`);
            if (!res.ok) {
                throw new Error("Failed to fetch packaging data")
            }
            setPackageData(await res.json())
        } catch (e) {
            console.error(e)
            setPackageData([]);
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

    async function fetchDelivery() {
        try {
            const res = await fetch("http://127.0.0.1:8000/deliveries/");

            if (!res.ok) {
                console.error("Failed to fetch delivery information");
                toast.error("Failed to fetch delivery information")
            }
            setDeliveryData(await res.json());
        } catch (e) {
            console.error(e)
        }
    }

    async function handleAddOrder() {
        if (!selectedRestaurantId) {
            toast.error("Please select a restaurant.");
            return;
        }
        if (!selectedProductName) {
            toast.error("Please select a product.");
            return;
        }
        if (!selectedPackage) {
            toast.error("Please select a package.");
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
        if (orderType !== "one-time" && !endDate) {
            toast.error("Please select an end date for recurring orders.");
            return;
        }

        const restaurant = restaurantNames.find(
            (r) => r.restaurant_id === selectedRestaurantId
        );
        if (!restaurant) {
            toast.error("Selected restaurant is invalid");
            return;
        }

        setAdding(true);

        try {
            const token = localStorage.getItem("token")
            const effectiveEndDate = orderType === "one-time" ? deliveryDate : endDate;
            const body = {
                restaurant_name: restaurant.restaurant_name,
                product_name: selectedProductName,
                package_type: selectedPackage,
                product_quantity: quantity,
                order_type: orderType,
                end_date: effectiveEndDate,
                delivery_date: deliveryDate,
                order_status: "scheduled",
            };

            const res = await fetch("http://127.0.0.1:8000/orders/", {
                method: "POST",
                headers: { "Content-Type": "application/json",
                           Authorization: token ? `Bearer ${token}` : "",
                         },
                body: JSON.stringify(body),
            });

            if (!res.ok) {                
                console.error("Failed to add order");
                toast.error("Failed to add order.");
                return;
            }

            toast.success("Order added successfully!");
            await fetchOrders(selectedDate);

            setAddOpen(false);
            setQuantity(undefined);
            setOrderType("");
            setEndDate("");
            setSelectedProductName("");
            setSelectedPackage("");
            setSelectedRestaurantId(null);
        } catch (err) {
            console.error("Add order error:", err);
            toast.error("Error adding order.")
        } finally {
            setAdding(false);
        }
    }

    async function handleAddDelivery() {
        if (!newDeliveryDate) {
            toast.error("Please add a new delivery date");
            return;
        }
        
        setAdding(true);

        try {
            const res = await fetch(`http://127.0.0.1:8000/deliveries/${newDeliveryDate}`,
                { method: "POST", }
            );

            if (!res.ok) {
                console.error("Failed to add delivery information");
                toast.error("Failed to add delivery information");
                return;
            }

            toast.success("New Delivery added successfully!");
            await fetchDelivery();
            setAddDeliveryOpen(false);
            setNewDeliveryDate("");
        } catch (e) {
            console.error(e);
            toast.error("There was an error adding the delivery.");
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdateDelivery() {
        if (!newDeliveryStatus) {
            toast.error("Please select a new delivery status");
            return;
        }

        if (!replacedDeliveryDate) {
            toast.error("Please select a delivery date to update");
            return;
        }

        setAdding(true);

        try {
            const res = await fetch("http://127.0.0.1:8000/deliveries/", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    delivery_date: replacedDeliveryDate,
                    delivery_status: newDeliveryStatus
                })
            });

            if (!res.ok) {
                console.error("Failed to update delivery.");
                toast.error("Failed to update delivery.");
                return;
            }
            
            toast.success("Delivery updated successfully")
            await fetchDelivery();
            setUpdateDeliveryOpen(false);
            setReplacedDeliveryDate("");
            setNewDeliveryStatus("");
        } catch (e) {
            console.error(e)
            toast.error("There was an error updating the delivery.")
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdate(orderId: number, productId: number, body: unknown) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}/update_product/${productId}`, {
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

    async function handleAssignEmployee() {
        if (!selectedDriver || !selectedDeliveryDate) {
            toast.error("Select a delivery date and driver");
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/employees/assign_delivery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    employee_id: selectedDriver,
                    delivery_date: selectedDeliveryDate
                })
            });

            if (!res.ok) {
                console.error("Failed to assign driver.");
                toast.error("Cannot assign a driver to a cancelled or completed delivery.");
                return;
            }
            
            toast.success("Driver was successfully assigned.")
            await fetchDelivery();
            setAssignDriverOpen(false);
            setSelectedDriver(null);
            setSelectedDeliveryDate("");
        } catch (e) {
            console.error(e)
            toast.error("There was an error assigning driver to delivery.")
        } 
    }
    
    useEffect(() => {
        if (orderType === "one-time") {
            setEndDate(deliveryDate);
        }
    }, [deliveryDate, orderType]);

    useEffect(() => {
        fetchOrders(selectedDate);
        setDeliveryDate(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        fetchRestaurants();
        fetchProducts();
    }, [])

    useEffect(() => {
        fetchEmployees();
    }, []);

    const driverData = deliveryData.map(d => ({
        ...d,
        assigned_driver: d.first_name && d.last_name
            ? `${d.first_name} ${d.last_name}` 
            : "Not Assigned"
    }));

    return (
        <div className="flex justify-center text-sm font-mono px-3 sm:px-4 lg:px-10 pb-1">
            <div className="flex flex-col w-full max-w-4xl">
                <div className="flex items-start justify-start gap-3 mb-5 sm:gap-5">
                    <Calendar28
                        selectedDate={selectedDate}
                        onChange={(value) => setSelectedDate(value)}
                    />
                </div>
                <div className="flex flex-col p-4 bg-white/60 rounded-lg sm:p-5">
                    <div className="flex flex-col justify-between items-start gap-3 mb-4 sm:flex-row sm:items-center sm:gap-4">
                        <div className="font-semibold text-lg text-[#308261]">Order Summary</div>
                        <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto sm:gap-4">
                            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-[#308261] text-white font-semibold px-4 py-2 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100 sm:gap-4"
                                        variant="outline"
                                    >
                                        Add Order
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Order</DialogTitle>
                                        <DialogDescription>
                                            Please add all the information requested below to add a new order.
                                        </DialogDescription>
                                    </DialogHeader>
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

                                    <div className="flex flex-col gap-2">
                                        <Label>Product</Label>
                                        <Select
                                            value={selectedProductName}
                                            onValueChange={(v) => {
                                                setSelectedProductName(v);
                                                setSelectedPackage("");
                                                fetchPackaging(v);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from(new Set(productData.map((p) => p.product_name))).map((name) => (
                                                    <SelectItem key={name} value={name}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Package Size</Label>
                                        <Select
                                            value={selectedPackage}
                                            onValueChange={setSelectedPackage}
                                            disabled={!selectedProductName}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={selectedProductName ? "Select Product Size" : "Select a product first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {packageData.map((p) => (
                                                    <SelectItem key={p.size_type} value={p.size_type}>
                                                        {p.size_type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity ?? ""}
                                            onChange={(e) => setQuantity(e.target.value === "" ? undefined : Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Order Type</Label>
                                        <Select
                                            value={orderType}
                                            onValueChange={(value) => {
                                                setOrderType(value);
                                                if (value === "one-time") {
                                                    setEndDate(deliveryDate);
                                                } else {
                                                    setEndDate("");
                                                }
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Select Order Type"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="one-time">One-Time Order</SelectItem>
                                                <SelectItem value="weekly">Weekly Order</SelectItem>
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
                                            disabled={orderType === "one-time" || !orderType}
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

                                    <Button className="mt-2" onClick={handleAddOrder} size="sm" disabled={adding}>
                                        {adding ? "Adding..." : "Add Order"}
                                    </Button>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-[#308261] text-white font-semibold p-4 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100"
                                        variant="outline"
                                        onClick={fetchDelivery}
                                    >
                                        View Delivery
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delivery Information</DialogTitle>
                                        <DialogDescription>
                                            You can find all the scheduled deliveries below. Feel free to add any new deliveries.
                                        </DialogDescription>
                                    </DialogHeader>


                                    <div className="flex flex-1 max-h-[50vh] overflow-y-auto px-auto mx-auto">
                                        <Table columns={deliveryColumns} data={driverData} underlines={true} color={"green"} />
                                    </div>
                                    
                                    <div className="flex flex-row w-full gap-2 justify-center items-stretch mt-3 sm:flex-row">
                                        <Popover
                                            open={addDeliveryOpen}
                                            onOpenChange={(open) => {
                                                setAddDeliveryOpen(open);
                                                if (!open) {
                                                    setNewDeliveryDate("");
                                                }
                                            }}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    onClick={() => {
                                                        setAddDeliveryOpen(true);
                                                    }}
                                                    className="bg-[#308261] text-white font-semibold p-4 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100"
                                                >
                                                    Add Delivery
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-72 space-y-3">
                                                <div className="flex flex-col gap-2">
                                                    <Label>New Delivery Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={newDeliveryDate}
                                                        onChange={(e) => setNewDeliveryDate(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full"
                                                    size="sm"
                                                    onClick={handleAddDelivery}
                                                    disabled={adding}
                                                >
                                                    {adding ? "Adding..." : "Add Delivery"}
                                                </Button>
                                            </PopoverContent>
                                        </Popover>

                                        <Popover
                                            open={updateDeliveryOpen}
                                            onOpenChange={(open) => {
                                                setUpdateDeliveryOpen(open);
                                                if (!open) {
                                                    setReplacedDeliveryDate("");
                                                    setNewDeliveryStatus("");
                                                }}}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    onClick={() => {
                                                        setUpdateDeliveryOpen(true);
                                                    }}
                                                    className="bg-[#308261] text-white font-semibold p-4 rounded-lg hover:opacity-85 hover:scale-105 active:scale-100"
                                                >
                                                    Edit Delivery Status
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 space-y-3">
                                                <div className="flex flex-col gap-2 mb-3">
                                                    <Label>Delivery Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={replacedDeliveryDate}
                                                        onChange={(e) => setReplacedDeliveryDate(e.target.value)}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <Label>New Status</Label>
                                                    <Select
                                                        value={newDeliveryStatus}
                                                        onValueChange={setNewDeliveryStatus}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Button
                                                    className="w-full"
                                                    size="sm"
                                                    onClick={handleUpdateDelivery}
                                                    disabled={adding}
                                                >
                                                    {adding ? "Updating..." : "Update Delivery"}
                                                </Button>
                                            </PopoverContent>
                                        </Popover>
                                        <Popover
                                            open={assignDriverOpen}
                                            onOpenChange={setAssignDriverOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button className="bg-[#308261] text-white font-semibold p-4 rounded-lg">
                                                    Assign Driver
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 space-y-4">
                                                <div>
                                                    <Label>Delivery Date</Label>
                                                    <Select
                                                        value={selectedDeliveryDate}
                                                        onValueChange={setSelectedDeliveryDate}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select delivery date"/>
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {deliveryData.map((d) => (
                                                                <SelectItem
                                                                    key={d.delivery_date}
                                                                    value={d.delivery_date}
                                                                >
                                                                    {d.delivery_date}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Driver</Label>
                                                    <Select
                                                        value={selectedDriver?.toString() ?? ""}
                                                        onValueChange={(v) => setSelectedDriver(Number(v))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select driver"/>
                                                        </SelectTrigger>

                                                        <SelectContent>
                                                            {employees
                                                                .filter(emp => emp.is_active)
                                                                .map(emp => (
                                                                    <SelectItem
                                                                        key={emp.employee_id}
                                                                        value={emp.employee_id.toString()}
                                                                    >
                                                                        {emp.first_name} {emp.last_name} - {emp.title}
                                                                    </SelectItem>
                                                                ))                                                            
                                                            }
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    className="w-full"
                                                    onClick={handleAssignEmployee}
                                                >
                                                    Assign Driver
                                                </Button>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[60vh] mt-2">
                        {!orderData || Object.keys(orderData).length === 0 ? (
                            <div className="w-full flex justify-center items-center py-10">
                                <div className="p-6 bg-white/80 rounded-lg shadow-md w-full max-w-md text-center font-bold text-red-600">
                                    No orders found for this date.
                                </div>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center items-center">
                                <Accordion type="single" collapsible>
                                    {Object.entries(orderData).map(([restaurantName, items]) => (
                                        <AccordionItem key={restaurantName} value={restaurantName}>
                                            <AccordionTrigger>{restaurantName} - {items.length} items</AccordionTrigger>
                                            <AccordionContent>
                                                <div className="grid gap-4 mx-1 grid-cols-1 sm:mx-4 lg:grid-cols-4">
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
