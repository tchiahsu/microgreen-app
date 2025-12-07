import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { FiEdit, FiTrash2 } from "react-icons/fi";

import type { ClientRow } from "../../types/client";


export default function Client() {
    const [clientInfo, setClientInfo] = useState<Record<string, ClientRow[]>>({});
    const [search, setSearch] = useState("");
    
    // To add a new restaurant 
    const [restaurantName, setRestaurantName] = useState<string>("");
    const [streetNum, setStreetNum] = useState<number>();
    const [streetName, setStreetName] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);

    // To add new contact info of an excisting restaurant
    const [addContactOpen, setAddContactOpen] = useState(false);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [contactEmail, setContactEmail] = useState("");
    const [contactFirstName, setContactFirstName] = useState("");
    const [contactLastName, setContactLastName] = useState("");
    const [contactPhone, setContactPhone] = useState("");

    // To edit restaurant info
    const [editRestaurantOpen, setEditRestaurantOpen] = useState(false);
    const [editRestaurantId, setEditRestaurantId] = useState<number | null>(null);
    const [editRestaurantName, setEditRestaurantName] = useState<string>("");
    const [editStreetNum, setEditStreetNum] = useState<number>();
    const [editStreetName, setEditStreetName] = useState<string>("");
    const [editCity, setEditCity] = useState<string>("");
    const [editState, setEditState] = useState<string>("");
    const [editZipCode, setEditZipCode] = useState<string>("");
    const [editIsActive, setEditIsActive] = useState(false);

    // To edit contact info editContactInfoRestaurantId
    const [editContactInfoOpen, setEditContactInfoOpen] = useState(false);
    const [editContactId, setEditContactId] = useState<number | null>(null);
    const [editContactInfoRestaurantId, setEditContactInfoRestaurantId] = useState<number | null>(null);
    const [editEmail, setEditEmail] = useState<string>("");
    const [editFirstName, setEditFirstName] = useState<string>("");
    const [editLastName, setEditLastName] = useState<string>("");
    const [editPhone, setEditPhone] = useState<string>("");


    async function fetchData() {
        try {
            const response = await fetch(`http://127.0.0.1:8000/clients/restaurant_information`);

            if (!response.ok) {
                throw new Error("Failed to fetch client data");
            }

            const result: ClientRow[] = await response.json();

            const groupedByClient = result.reduce((acc, row) => {
                if (!acc[row.restaurant_name]){
                    acc[row.restaurant_name] = [];
                }
                acc[row.restaurant_name].push(row);
                return acc;
            }, {} as Record<string, ClientRow[]>);


            setClientInfo(groupedByClient);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleAddClient() {
        if (!restaurantName) {
            toast.error("Please add a restaurant name.");
            return;
        }
        if (!streetNum) {
            toast.error("Please add a street number.");
            return;
        }
        if (!streetName) {
            toast.error("Please add a street name.");
            return;
        }
        if (!city) {
            toast.error("Please add a city name.");
            return;
        }
        if (!state) {
            toast.error("Please add a state.");
            return;
        }
        if (state.length !== 2) {
            toast.error("Please enter state as a 2 letter abbreviation.");
            return;
        }
        if (!zipCode) {
            toast.error("Please add a zip code.");
            return;
        }
        if (zipCode.length !== 5) {
            toast.error("Zip code must be exactly 5 digits.");
            return;
        }
        if (!email) {
            toast.error("Please add an email.");
            return;
        }
        if (!firstName) {
            toast.error("Please add a first name.");
            return;
        }
        if (!lastName) {
            toast.error("Please add a last name.");
            return;
        }
        if (!phone) {
            toast.error("Please add a phone number.");
            return;
        }
        if (phone.length > 15) {
            toast.error("Phone number is too long.");
            return;
        }

        setAdding(true);

        try {
            const restaurantBody = {
                restaurant_name: restaurantName,
                street_num: streetNum,
                street_name: streetName,
                city: city,
                state: state,
                zip_code: zipCode,
            };

            const restaruantRes = await fetch("http://127.0.0.1:8000/clients/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(restaurantBody),
            });

            if (!restaruantRes.ok) {
                const err = await restaruantRes.json().catch(() => null);
                console.error("Failed to add client.", err);
                toast.error("Failed to add client.")
                console.log("Status:", restaruantRes.status);
                console.log("Error body:", err);
                return;
            }

            const restaurantResult = await restaruantRes.json();
            const newRestaurantId = restaurantResult.restaurant_id;

            const contactBody = {
                restaurant_id: newRestaurantId,
                email: email,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
            }

            const contactRes = await fetch("http://127.0.0.1:8000/clients/contact_info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactBody),
            });

            if (!contactRes.ok) {
                const err = await contactRes.json().catch(() => null);
                console.error("Failed to contact info.", err);
                toast.error("Failed to contact info.")
                return;
            }

            toast.success("Client added successfully!");
            await fetchData();
            setAddOpen(false);

            setRestaurantName("");
            setStreetNum(undefined);
            setStreetName("");
            setCity("");
            setState("");
            setZipCode("");
            setEmail("");
            setFirstName("");
            setLastName("");
            setPhone("");

        } catch (err) {
            console.error("Add client error:", err);
            toast.error("Error adding client.")
        } finally {
            setAdding(false);
        }
    }

    async function handleAddContact() {
        if (!selectedRestaurantId) {
            toast.error("Please select restaurant you want to add new contact info to.");
            return;
        }
        if (!contactEmail) {
            toast.error("Please add an email.");
            return;
        }
        if (!contactFirstName) {
            toast.error("Please add a first name.");
            return;
        }
        if (!contactLastName) {
            toast.error("Please add a last name.");
            return;
        }
        if (!contactPhone) {
            toast.error("Please add a phone number.");
            return;
        }

        try {
            const contactBody = {
                restaurant_id: selectedRestaurantId,
                email: contactEmail,
                first_name: contactFirstName,
                last_name: contactLastName,
                phone: contactPhone,
            }

            const contactRes = await fetch("http://127.0.0.1:8000/clients/contact_info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactBody),
            });

            if (!contactRes.ok) {
                const err = await contactRes.json().catch(() => null);
                console.error("Failed to contact info.", err);
                toast.error("Failed to contact info.")
                return;
            }

            toast.success("Client added successfully!");
            await fetchData();
            setAddContactOpen(false);

            setContactEmail("");
            setContactFirstName("");
            setContactLastName("");
            setContactPhone("");

        } catch (err) {
            console.error("Error adding new contact:", err);
            toast.error("Error addint new contact.")
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdateRestaurant(){
        if (!editRestaurantId){
            toast.error("The restaurant ID is missing.");
            return;
        }

        if (editZipCode && editZipCode.length !== 5){
            toast.error("Zip code must be exactly 5 digits long.");
            return;
        }

        if (editState && editState.length !== 2){
            toast.error("State must be a 2 letter abbreviation.");
            return;
        }

        if (editStreetNum !== undefined && editStreetNum <= 0){
            toast.error("Street number must be greater than 0.");
            return;
        }

        const restaurantBody = {
                restaurant_id: editRestaurantId,
                restaurant_name: editRestaurantName,
                street_num: editStreetNum,
                street_name: editStreetName,
                city: editCity,
                state: editState,
                zip_code: editZipCode,
                is_active: editIsActive
        };

        try{
            const res = await fetch("http://127.0.0.1:8000/clients/restaurant_info", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(restaurantBody),
            });

            if (!res.ok){
                const err = await res.json().catch(() => null);
                toast.error("Restaurant update failed.");
                console.error(err);
                return;
            }

            toast.success("Restaurant update was successful.");
            await fetchData();
            setEditRestaurantOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Restaurant update was unsuccessful.")
        }
    }

    async function handleUpdateContactInfo(){
        if (!editContactId){
            toast.error("The contact info ID is missing.");
            return;
        }

        if (!editContactInfoRestaurantId){
            toast.error("The restaurant ID is missing.");
            return;
        }

        if (editPhone.length > 15) {
            toast.error("Phone number is too long.");
            return;
        }

        try{
            const contactBody = {
                contact_id: editContactId,
                restaurant_id: editContactInfoRestaurantId,
                email: editEmail,
                first_name: editFirstName, 
                last_name: editLastName,
                phone: editPhone,
            };

            const res = await fetch("http://127.0.0.1:8000/clients/contact_info", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactBody),
            });

            if (!res.ok){
                const err = await res.json().catch(() => null);
                toast.error("Contact info update failed.");
                console.error(err);
                return;
            }

            toast.success("Contact info update was successful.");
            await fetchData();
            setEditContactInfoOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Contact info update was unsuccessful.")
        }
    }

    async function handleDeleteContactInfo(contact_id: number){
        const confirmDelete = window.confirm("Are you sure you want do delete this contact info?")
        if(!confirmDelete) return;

         try {
            const response = await fetch(`http://127.0.0.1:8000/clients/contact_info`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({contact_id}),
            });


            if (!response.ok) {
                const err = await response.json().catch(() => null);
                toast.error("Failed to delete contact info.");
                console.error(err);
                return;
            }

            toast.success("Contact info was successfully deleted!");
            await fetchData();
        } catch (e) {
            console.error(e);
            toast.error("Error deleting contact info.")
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

    const searchRestaurants = Object.keys(clientInfo)
        .sort((a, b) =>
            a.localeCompare(
                b, 
                undefined, 
                {numeric: true, sensitivity: "accent"}
            )
        )
        .filter(name =>
        generalize(name).includes(generalize(search))
    );

    function openAddNewContactModal(restaurantId: number){
        setSelectedRestaurantId(restaurantId);
        setAddContactOpen(true);
    }

    function openEditRestaurantModal(info: ClientRow){
        setEditRestaurantId(info.restaurant_id);
        setEditRestaurantName(info.restaurant_name);
        setEditStreetNum(info.street_num ?? undefined);
        setEditStreetName(info.street_name);
        setEditCity(info.city);
        setEditState(info.state);
        setEditZipCode(info.zip_code);
        setEditIsActive(info.is_active);
        setEditRestaurantOpen(true);
    }

    function openEditContactInfoModal(info: ClientRow){
        console.log("Editing contact:", info);
        setEditContactId(info.contact_id);
        setEditContactInfoRestaurantId(info.restaurant_id);
        setEditEmail(info.email);
        setEditFirstName(info.first_name);
        setEditLastName(info.last_name);
        setEditPhone(info.phone);
        setEditContactInfoOpen(true);
    }

    useEffect(() => {
        fetchData()
    }, [])
    
    return (
        <div className="text-sm font-mono px-4 pb-10 sm:px-6 lg:px-10">
            <div className="flex w-full justify-center">
                <div className="flex flex-col p-4 bg-white/60 rounded-lg w-full max-w-5xl mt-5 sm:p-5">
                    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-semibold text-lg text-[#308261]">Client Information</h2>
                        <Dialog open={addOpen} onOpenChange={setAddOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="mt-2 bg-[#308261] text-white font-semibold cursor-pointer" 
                                    size="sm"
                                >
                                    Add Client
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add New Client</DialogTitle>
                                    <DialogDescription>
                                        Fill out these fields to add a new client.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        <label className="font-semibold">Client Name</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold">Street Number</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="number"
                                            value={streetNum ?? ""}
                                            onChange={(e) => setStreetNum(e.target.value === "" ? undefined : Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold">Street Name</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={streetName}
                                            onChange={(e) => setStreetName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold">City</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        />
                                    </div>

                                     <div className="flex flex-col gap-3 sm:flex-row sm:gap-7">
                                        <div className="flex flex-col flex-1">
                                            <label className="font-semibold">State</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <label className="font-semibold">Zip Code</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                            />
                                        </div>
                                     </div>


                                    <div className="flex flex-col">
                                        <label className="font-semibold">Email</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-7">
                                        <div className="flex flex-col flex-1">
                                            <label className="font-semibold">First Name</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <label className="font-semibold">Last Name</label>
                                            <input
                                                className="p-2 border rounded h-10"
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>                             

                                    <div className="flex flex-col">
                                        <label className="font-semibold">Phone Number</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="mt-2 bg-[#308261] text-white cursor-pointer"
                                        onClick={handleAddClient}
                                        disabled={adding}
                                    >
                                        {adding ? "Adding..." : "Add Crop"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>                            
                    <input
                        type="text"
                        placeholder="Search clients"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-4 p-2 border border-[#308261] rounded-lg w-full text-xs sm:text-sm"
                    />
                    <div className="flex-1 overflow-y-auto max-h-[60vh]">
                        <Accordion type='single' collapsible className="w-full">
                            {searchRestaurants.map((restaurant) => (
                                <AccordionItem className="w-full" key={restaurant} value={restaurant}>
                                    <AccordionTrigger className="w-full">{restaurant} - {clientInfo[restaurant][0].contact_address}</AccordionTrigger>
                                    <AccordionContent className="w-full">
                                        <div className="p-4 bg-white rounded-lg shadow w-full">                                    
                                            <div className="space-y-4 mb-4">
                                                {clientInfo[restaurant].map((info, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between items-start border-b pb-3 last:border-none last:pb-0"
                                                    >
                                                        <div className="flex flex-col gap-2 justify-start">
                                                            <div><span className="font-semibold">Contact Name:</span> {info.contact_name}</div>
                                                            <div><span className="font-semibold">Email:</span> {info.email}</div>
                                                            <div><span className="font-semibold">Phone:</span> {info.phone}</div>
                                                        </div>
                                                        <div className="flex flex-row justify-start text-xs pr-2 gap-2 sm:pr-4 sm:gap-4 sm:text-md">
                                                            <FiEdit
                                                                size={18}
                                                                className="cursor-pointer hover:text-blue-600"
                                                                onClick={() => openEditContactInfoModal(info)}                                                    
                                                            />
                                                            <FiTrash2
                                                                size={18}
                                                                className="cursor-pointer hover:text-blue-600"
                                                                onClick={() => handleDeleteContactInfo(info.contact_id)}                                                    
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <hr className="border-t border-gray-300 my-3" />
                                            <div className="flex flex-col gap-2 mt-5 sm:flex-row">
                                                <Button
                                                    size="sm"
                                                    className="bg-[#308261] text-white sm:mr-2 cursor-pointer"
                                                    onClick={() => openAddNewContactModal(clientInfo[restaurant][0].restaurant_id)}                                                    
                                                >
                                                    Add Contact
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-[#308261] text-white sm:mr-2 cursor-pointer"
                                                    onClick={() => openEditRestaurantModal(clientInfo[restaurant][0])}                                                    
                                                >
                                                    Edit Restaurant
                                                </Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                    <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Add Contact Information</DialogTitle>
                                <DialogDescription>Add a new contact info for this restaurant.</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <label className="font-semibold">Email</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:gap-7">
                                    <div className="flex flex-col">
                                        <label className="font-semibold">First Name</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={contactFirstName}
                                            onChange={(e) => setContactFirstName(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="font-semibold">Last Name</label>
                                        <input
                                            className="p-2 border rounded h-10"
                                            type="text"
                                            value={contactLastName}
                                            onChange={(e) => setContactLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col">
                                    <label className="font-semibold">Phone Number</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                className="mt-2 bg-[#308261] text-white cursor-pointer"
                                onClick={handleAddContact}
                            >
                                Add Contact
                            </Button>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={editRestaurantOpen} onOpenChange={setEditRestaurantOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit Restaurant Information</DialogTitle>
                                <DialogDescription>Edit this restaruant's info.</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <label className="font-semibold">Restaurant Name</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editRestaurantName}
                                        onChange={(e) => setEditRestaurantName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex flex-col">
                                    <label className="font-semibold">Street Number</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="number"
                                        value={editStreetNum ?? ""}
                                        onChange={(e) => setEditStreetNum(e.target.value === "" ? undefined : Number(e.target.value))}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold">Street Name</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editStreetName}
                                        onChange={(e) => setEditStreetName(e.target.value)}
                                    />
                                </div>
                              
                                
                                <div className="flex flex-col">
                                    <label className="font-semibold">City</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editCity}
                                        onChange={(e) => setEditCity(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold">State</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editState}
                                        onChange={(e) => setEditState(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold">Zip Code</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editZipCode}
                                        onChange={(e) => setEditZipCode(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold">Is Active?</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <label className="flex flex-row gap-2 items-center">
                                            <input
                                                type="checkbox"
                                                checked={editIsActive === true}
                                                onChange={() => setEditIsActive(true)}
                                            />
                                            <span>Yes</span>
                                        </label>

                                        <label className="flex flex-row gap-2 items-center">
                                            <input
                                                type="checkbox"
                                                checked={editIsActive === false}
                                                onChange={() => setEditIsActive(false)}
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>             
                                </div>
                            </div>
                            <Button
                                className="mt-2 bg-[#308261] text-white cursor-pointer"
                                onClick={handleUpdateRestaurant}
                            >
                                Save Changes
                            </Button>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={editContactInfoOpen} onOpenChange={setEditContactInfoOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit Contact Information</DialogTitle>
                                <DialogDescription>Edit this restaruant's contact info.</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col">
                                    <label className="font-semibold">Email</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                    />
                                </div>  

                                <div className="flex flex-col">
                                    <label className="font-semibold">First Name</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editFirstName}
                                        onChange={(e) => setEditFirstName(e.target.value)}
                                    />
                                </div>
                                 
                                <div className="flex flex-col">
                                    <label className="font-semibold">Last Name</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editLastName}
                                        onChange={(e) => setEditLastName(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="font-semibold">Phone</label>
                                    <input
                                        className="p-2 border rounded h-10"
                                        type="text"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                className="mt-2 bg-[#308261] text-white cursor-pointer"
                                onClick={handleUpdateContactInfo}
                            >
                                Save Changes
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div> 
            </div>
        </div>
    )
}