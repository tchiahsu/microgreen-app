import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { da } from "date-fns/locale";
import { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { HiX, HiOutlineMenu } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/app", label: "Home" },
    { href: "/app/crop", label: "Crop" },
    { href: "/app/harvest", label: "Harvest" },
    { href: "/app/order", label: "Order" },
    { href: "/app/product", label: "Product" },
    { href: "/app/client", label: "Client" },
    { href: "/app/employee", label: "Employee"}
];


export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    async function loadProfile(){
        setProfileOpen(true);
        setLoading(true);
        setError(null);

        try{
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:8000/profile", {
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                throw new Error("Unable to load profile.");
            }

            const data = await response.json();
            setProfile(data);
        } catch {
            setError("Not logged in or session expired");
            setProfile(null);
        }finally{
            setLoading(false);
        }    
    }


    return (
        <header className="sticky top-0 z-50 h-[10vh] min-h-16">
            <div className="flex w-full h-full mx-auto max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <NavLink to="/app" className="flex items-center">
                    <img src="/public/logo.png" alt="Logo" className="h-18 w-auto sm:h-20" />
                </NavLink>

                <nav className="hidden md:block">
                    <ul className="flex flex-row gap-8 lg:gap-12 text-md lg:text-lg font-semibold text-[#163039]">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    className={({ isActive }) =>
                                        ["cursor-pointer transition_colors hover:text-[#2b5766]",
                                         isActive ? "text-[#2b5766] underline underline-offset-4 decoration-2"
                                                  : "text-[#163039]"
                                        ].join(" ")}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center text-[#0b2f33]">
                    <button 
                        onClick={loadProfile}
                        className="p-2 rounded-md hover:scale-105 hover:bg-gray-200 active:scale-95 cursor-pointer"
                    >
                        <FaUser size={22} />
                    </button>

                    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>User Profile</DialogTitle>
                                <DialogDescription>Employee ID: [add employee id]</DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-2">
                                <Label>First Name</Label>
                                <Input
                                    type="text"
                                    value={newFirstName}
                                    onChange={(i) => setNewFirstName(i.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Last Name</Label>
                                <Input
                                    type="text"
                                    value={newLastName}
                                    onChange={(i) => setNewLastName(i.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="text"
                                    value={newEmail}
                                    onChange={(i) => setNewEmail(i.target.value)}
                                />
                            </div>
                            <div className="flex flex-row w-full gap-2 border-b space-y-3 border-[#afafaf53]">
                                <Button className="flex flex-1 bg-green-800 cursor-pointer">
                                    Save Changes
                                </Button>
                                <Button className="flex flex-1 bg-red-600 cursor-pointer">
                                    Exit
                                </Button>
                            </div>

                            <Button className="cursor-pointer">
                                Log Out / Sign In
                            </Button>
                        </DialogContent>
                    </Dialog>

                    <button
                        className="ml-1 inline-flex items-center justify-cetner rounded-md p-2 md:hidden hover:bg-gray-200"
                        onClick={() => setIsOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                    >
                        {isOpen ? <HiX size={26} /> : <HiOutlineMenu size={26} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <nav className="md:hidden bg-[#ebeae1]/95">
                    <ul className="flex flex-col gap-4 px-4 py-3 text-base font-semibold text-[#163039]">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        ["cursor-pointer transition_colors hover:text-[#2b5766]",
                                         isActive ? "text-[#2b5766] underline underline-offset-4 decoration-2"
                                                  : "text-[#163039]"
                                        ].join(" ")}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </header>
    );
}
