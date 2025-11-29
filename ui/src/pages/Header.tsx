import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { FaUser } from "react-icons/fa6";
import { HiX, HiOutlineMenu } from "react-icons/hi";

import type { UserProfile } from "../types/profile";

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
    
    const navigate = useNavigate();

    async function loadProfile() {
        setProfileOpen(true);
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Not logged in.");
            }

            const res = await fetch("http://127.0.0.1:8000/profile", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (!res.ok) {
                throw new Error("Unable to load profile.");
            }

            const data: UserProfile = await res.json();
            setProfile(data);

            setNewFirstName(data.first_name ?? "");
            setNewLastName(data.last_name ?? "");
            setNewEmail(data.email ?? "");
        } catch {
            setError("Not logged in or session expired");
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setProfile(null);
        setProfileOpen(false);
        navigate("/");
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
                                <DialogDescription>Employee ID:</DialogDescription>
                            </DialogHeader>

                            {loading && (
                                <p className="text-center text-gray-500 py-2">Loading profile...</p>
                            )}

                            {error && (
                                <p className="text-center text-red-600 py-2">{error}</p>
                            )}

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
                                <Button className="flex flex-1 bg-green-800 cursor-pointer" disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>

                            <Button
                                className="cursor-pointer"
                                onClick={handleLogout}
                            >
                                Log Out
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
