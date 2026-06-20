import { apiFetch, exitDemo } from "@/lib/api";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { FaUser } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { HiX, HiOutlineMenu } from "react-icons/hi";
import { toast } from "sonner";

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
    const [profile, setProfile] = useState<UserProfile | null>(null);
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

            const res = await apiFetch("/profile", {
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
        exitDemo();
        localStorage.removeItem("token");
        setProfile(null);
        setProfileOpen(false);
        navigate("/");
    }

    async function handleUpdate(profile: UserProfile) {
        if (!profile || profile.employee_id == null) {
            toast.error("No profile loaded.")
            return;
        }

        try {
            setLoading(true);

            const res = await apiFetch(`/employees/update_employee/${profile.employee_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ssn: null,
                        first_name: newFirstName,
                        last_name: newLastName,
                        email: newEmail,
                        title: null,
                        is_active: null,
                    }),
                }
            );

            if (!res.ok) {
                console.error("Failed to update information");
                toast.error("Failed to update information.");
                return;
            }

            toast.success("User information has been update successfully.");
            setProfileOpen(false);
            window.location.reload();
        } catch (e) {
            console.error("Update error:", e)
            toast.error("Unexpected error updating user information.")
            return;
        } finally {
            setLoading(false);
        }
    }

    return (
        <header className="sticky top-0 z-50 h-[10vh] min-h-16">
            <div className="flex w-full h-full mx-auto max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <NavLink to="/app" className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-18 w-auto sm:h-20" />
                </NavLink>

                <nav className="hidden md:block">
                    <ul className="flex flex-row gap-8 lg:gap-12 text-md lg:text-lg font-semibold text-[#163039]">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === "/app"}
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
                                <DialogDescription>
                                    <div>User ID: {profile?.user_id ?? "N/A"}</div>
                                    <div>Employee ID: {profile?.employee_id ?? "N/A"}</div>
                                </DialogDescription>
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
                            <div className="flex w-full border-b mt-3 border-[#afafaf53]">
                                <Button
                                    className="flex flex-1 bg-green-800 cursor-pointer"
                                    onClick={() => profile && handleUpdate(profile)}
                                    disabled={loading}>
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                            
                            <div className="flex flex-row items-center">
                                <hr className="grow border-gray-300"></hr>
                                <span className="px-4 text-gray-500"><BsThreeDots /></span>
                                <hr className="grow border-gray-300"></hr>
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
                                    end={item.href === "/app"}
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