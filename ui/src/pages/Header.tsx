import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { HiX, HiOutlineMenu } from "react-icons/hi";
import { NavLink } from "react-router-dom";


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
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 h-[10vh] min-h-16">
            <div className="flex w-full h-full mx-auto max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                <NavLink to="/" className="flex items-center">
                    <img src="/public/logo.png" alt="Logo" className="h-22 w-auto sm:h-25" />
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

                <div className="flex items-center gap-2 text-[#0b2f33]">
                    <button className="p-1 sm:p-2 rounded-full hover:scale-105 hover:text-[#9a6b2c9c] active:scale-95 cursor-pointer">
                        <CgProfile size={40} className="sm:size-10" />
                    </button>

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
