import { CgMenuRightAlt } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa";


const navItems = [
    { href: "/crop", label: "Crop" },
    { href: "/harvest", label: "Harvest" },
    { href: "/order", label: "Order" },
    { href: "/product", label: "Product" },
    { href: "/client", label: "Client" },
];

export default function Header() {
    return (
        <header className="sticky top-0 z-50 h-[10vh] min-h-20">
            <div className="flex w-full items-center justify-between h-full">
                {/* Green Track Logo */}
                <a href="/" className="flex items-center">
                    <img src="/public/logo.png" alt="Logo" className="h-25 w-25" />
                </a>

                {/* Navigation Bar */}
                <nav>
                    <ul className="flex flex-row gap-14 text-lg font-semibold text-[#163039]">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <a href={item.href} className="cursor-pointer hover:text-[#2b5766] hover:underline underline-offset-4 decoration-2 transition_colors">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                {/* Top Right Side Buttons */}
                <div className="flex justify-end items-center gap-8 bg-[#0b2f33] text-white rounded-bl-2xl h-full pr-6 pl-9">
                    <button className="p-2 rounded-full hover:bg-[#308261] hover:scale-105 active:scale-95 cursor-pointer"><FaUserCircle size={38} /></button>
                    <button className="p-2 rounded-full hover:bg-[#308261] active:scale-95 cursor-pointer"><CgMenuRightAlt size={40} /></button>
                </div>

            </div>
        </header>
    );
}
