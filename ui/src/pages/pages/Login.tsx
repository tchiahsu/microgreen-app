import { apiFetch, enterDemo } from "@/lib/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";


export default function Login() {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    function startDemo() {
        enterDemo();
        toast.success("Entered demo mode!");
        navigate("/app");
    }

    async function login(email: string, password: string){
        try {
            const res = await apiFetch("/login", {
                method: "POST", 
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await res.json();
            localStorage.setItem("token", data.access_token);

            toast.success("Logged In!");
            navigate("/app")
        } catch (e) {
            console.error("Login failed:", e)
            toast.error("Login failed. Check your credentials.");
        }
    }

    function handleSubmit(e: React.FormEvent) {
        if (!userEmail) {
            toast.error("Please user a valid email addresss.")
            return;
        }

        if (!userPassword) {
            toast.error("Please enter your password.")
            return;
        }

        e.preventDefault();
        login(userEmail, userPassword);
    }

    return (
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-0">
            <div className="flex flex-col w-full max-w-md gap-6 bg-white/90 px-6 py-8 rounded-lg shadow-md">
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-semibold text-[#163039]">Account Login</div>
                    <div className="text-sm text-gray-500">Enter credentials below to log into the system.</div>                           
                </div>

                <div className="flex flex-col gap-3">
                    <Input
                        type="text"
                        placeholder="name@example.com"
                        value={userEmail}
                        onChange={(v) => setUserEmail(v.target.value)}
                    />
                    <div className="flex flex-row">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={userPassword}
                            onChange={(v) => setUserPassword(v.target.value)}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-1 text-lg text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            {showPassword ? <IoEyeOffOutline/> : <IoEyeOutline/>}
                        </button>
                    </div>
                    <Button className="mt-2 cursor-pointer" type="submit" onClick={handleSubmit}>
                        Log In
                    </Button>

                    <div className="flex flex-row items-center">
                        <hr className="grow border-gray-300" />
                        <span className="px-3 text-xs text-gray-400">or</span>
                        <hr className="grow border-gray-300" />
                    </div>

                    <Button
                        className="cursor-pointer bg-[#308261] text-white hover:bg-[#266b4f]"
                        type="button"
                        onClick={startDemo}
                    >
                        Try the demo
                    </Button>
                    <p className="text-center text-xs text-gray-500">
                        Explore the app with sample data — no account needed.
                    </p>
                </div>
            </div>
        </div>
    )
}