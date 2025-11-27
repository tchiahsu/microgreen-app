import { CgProfile } from "react-icons/cg";
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
                <div className="flex justify-end items-center text-[#0b2f33] pr-4">
                    <button className="p-2 rounded-full hover:scale-105 hover:text-[#9a6b2c9c] active:scale-95 cursor-pointer"><CgProfile size={40} /></button>
                </div>

            </div>
        </header>
    );
}
