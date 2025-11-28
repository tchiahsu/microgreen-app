import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { da } from "date-fns/locale";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/crop", label: "Crop" },
    { href: "/harvest", label: "Harvest" },
    { href: "/order", label: "Order" },
    { href: "/product", label: "Product" },
    { href: "/client", label: "Client" },
    { href: "/employee", label: "Employee"}
];


export default function Header() {
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
        <header className="sticky top-0 z-50 h-[10vh] min-h-20">
            <div className="flex w-full items-center justify-between h-full">

                {/* Green Track Logo */}
                <NavLink to="/" className="flex items-center">
                    <img src="/public/logo.png" alt="Logo" className="h-25 w-25" />
                </NavLink>

                {/* Navigation Bar */}
                <nav>
                    <ul className="flex flex-row gap-14 text-lg font-semibold text-[#163039]">
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

                {/* Top Right Side Buttons */}
                <button 
                    onClick={loadProfile}
                    className="p-2 rounded-full hover:scale-105 hover:text-[#9a6b2c9c] active:scale-95 cursor-pointer"
                >
                    <CgProfile size={40} />
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
                            <Button className="flex flex-1 bg-green-800">
                                Save Changes
                            </Button>
                            <Button className="flex flex-1 bg-red-600">
                                Exit
                            </Button>
                        </div>

                        <Button>
                            Log Out / Sign In
                        </Button>
                        {/* <div className="flex flex-col gap-3">
                            {!loading && <p>Loading...</p>}
                            {error && <p className="text-red-600">{error}</p>}
                            {loading && profile && (
                                <>
                                    <p><strong>Email:</strong>{profile.email}</p>
                                    <p><strong>First Name:</strong>{profile.first_name}</p>
                                    <p><strong>Last Name:</strong>{profile.last_name}</p>
                                </>
                            )}
                        </div> */}
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    );
}
