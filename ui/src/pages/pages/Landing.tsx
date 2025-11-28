import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Login() {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");

    async function login(email: string, password: string){
        const response = await fetch("http://localhost:8000/login", {
            method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        localStorage.setItem("token", data.access_token);
    }

    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-col w-[30%] gap-6 bg-white px-6 py-8 rounded-lg">
                <div>
                    <div className="text-xl font-semibold">Mishell es hermosa</div>
                    <div className="text-sm text-gray-500">Enter your email below to login</div>                           
                </div>
                <div className="flex flex-col gap-2">
                <Input
                    type="text"
                    placeholder="name@example.com"
                    value={userEmail}
                    onChange={(v) => setUserEmail(v.target.value)}
                />
                <Input
                    type="text"
                    placeholder="Enter password"
                    value={userPassword}
                    onChange={(v) => setUserEmail(v.target.value)}
                />
                <Button className="mt-2">
                    Log In
                </Button>
                </div>
                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-3 text-gray-300">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <Button>
                    Sign Up
                </Button>
            </div>
        </div>
    )
}
