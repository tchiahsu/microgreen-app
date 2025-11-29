import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { FiEdit } from "react-icons/fi";
import { toast } from "sonner";

import type { EmployeeItem } from "../../types/employee";


export default function Employee() {
    const [employeeData, setEmployeeData] = useState<EmployeeItem[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);

    const [ssn, setSSN] = useState("")
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [title, setTitle] = useState("");
    const [isActive, setIsActive] = useState<boolean>(true);

    const [addOpen, setAddOpen] = useState(false);
    const [newSSN, setNewSSN] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newTitle, setNewTitle] = useState("");

    const [addRegistration, setAddRegistration] = useState(false);
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);


    async function fetchEmployees() {
        try {
            const res = await fetch(`http://127.0.0.1:8000/employees/`);
            if (!res.ok) {
                throw new Error("Failed to fetch employee data");
            }

            setEmployeeData(await res.json())
        } catch (e) {
            console.error("Error getting employee information", e);
            toast.error("Error getting employee information");
        }
    }

    async function handleUpdate(employee_id: number) {
        try {
            const data: EmployeeItem = {
                employee_id,
                ssn,
                first_name: firstName,
                last_name: lastName,
                email,
                title,
                is_active: isActive,                
            }

            const res = await fetch(`http://127.0.0.1:8000/employees/update_employee/${data.employee_id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ssn: data.ssn,
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        title: data.title,
                        is_active: data.is_active,
                    }),
                }
            );

            if (!res.ok) {
                console.error("Failed to update employee information");
                toast.error("Failed to update employee information.");
                return;
            }
            
            toast.success("Employee has been update successfully.");
            setEditingId(null);
            await fetchEmployees();
        } catch (e) {
            console.error("Update error:", e)
            toast.error("Unexpected error updating employee.")
            return;
        }
    }

    function openEditor(employee: EmployeeItem) {
        setEditingId(employee.employee_id);
        setSSN(employee.ssn);
        setFirstName(employee.first_name);
        setLastName(employee.last_name);
        setEmail(employee.email);
        setTitle(employee.title);
        setIsActive(employee.is_active);
    }

    async function handleAddEmployee() {
        try {
            const body = {
                ssn: newSSN,
                first_name: newFirstName,
                last_name: newLastName,
                email: newEmail,
                title: newTitle
            };

            const res = await fetch("http://127.0.0.1:8000/employees/add_employee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Failed to add employee.");
                toast.error("Failed to add new employee.");
                return;
            }

            toast.success("New Employee added successfully.");

            setNewSSN("");
            setNewFirstName("");
            setNewLastName("");
            setNewEmail("");
            setNewTitle("");

            setAddOpen(false);
            await fetchEmployees();
        } catch {
            console.error("Error adding employee.");
            toast.error("Unexpected error adding employee.");
        }
    }

    async function handleRegisterEmployee() {
        if (!selectedEmployee) {
            toast.error("Please select an employee to register them.")
            return;
        }

        if (!registerPassword) {
            toast.error("A password if required to register an employee.")
            return;
        }

        try {
            const body = {
                email: registerEmail,
                password: registerPassword
            };

            const res = await fetch("http://127.0.0.1:8000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                console.error("Failed to register employee.");
                toast.error("Failed to register new employee.");
                return;
            }

            toast.success("Employee registered successfully.");

            setRegisterEmail("");
            setRegisterPassword("");

            setAddRegistration(false);
            await fetchEmployees();
        } catch {
            console.error("Error registering employee.");
            toast.error("Unexpected error registering employee.");
        }
    }

    useEffect(() => {
        fetchEmployees()
    }, [])

    const activeEmployees = employeeData.filter(e => e.is_active);

    return (
        <div className="flex justify-center items-center text-sm font-mono mt-5">
            <div className="p-5 bg-white/60 rounded-lg h-170 w-[80%] flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="font-semibold text-lg text-[#308261] mt-2">Employee Information</h2>
                    <div className="flex gap-3">
                        <Dialog open={addRegistration} onOpenChange={setAddRegistration}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-[#308261] text-white font-semibold"
                                    size="sm"
                                >
                                    + Register User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Register Employee User</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col gap-3 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <Label>Select Employee Email</Label>
                                        <Select
                                            value={selectedEmployee?.employee_id?.toString() || ""}
                                            onValueChange={(value) => {
                                                const emp = employeeData.find(e => e.employee_id === Number(value)) || null;
                                                setSelectedEmployee(emp);
                                                setRegisterEmail(emp?.email || "");
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pick an email"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeEmployees.map(emp => (
                                                    <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                                        {emp.first_name} {emp.last_name} - {emp.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <Label>Password</Label>
                                        <Input
                                            type="text"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleRegisterEmployee}
                                        className="w-full"
                                    >
                                        Create Registration
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={addOpen} onOpenChange={setAddOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="bg-[#308261] text-white font-semibold"
                                    size="sm"
                                >
                                    + Add Employee
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Employee</DialogTitle>
                                    <DialogDescription>
                                        Provide the employee details and save to add them to the system.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex flex-col gap-3 mt-2">
                                    <div className="flex flex-col gap-1">
                                        <Label>SSN</Label>
                                        <Input
                                            type="text"
                                            value={newSSN}
                                            onChange={(e) => setNewSSN(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>First Name</Label>
                                        <Input
                                            type="text"
                                            value={newFirstName}
                                            onChange={(e) => setNewFirstName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Last Name</Label>
                                        <Input
                                            type="text"
                                            value={newLastName}
                                            onChange={(e) => setNewLastName(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Email</Label>
                                        <Input
                                            type="text"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label>Title</Label>
                                        <Input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        onClick={handleAddEmployee}
                                        className="w-full mt-3"
                                    >
                                        Save Employee
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="flex justify-center overflow-y-auto">
                    <table>
                        <thead>
                            <tr>
                                <th className="px-4 py-3 font-semibold text-left">Employee ID</th>
                                <th className="px-4 py-3 font-semibold text-left">SSN</th>
                                <th className="px-4 py-3 font-semibold text-left">First Name</th>
                                <th className="px-4 py-3 font-semibold text-left">Last Name</th>
                                <th className="px-4 py-3 font-semibold text-left">Email</th>
                                <th className="px-4 py-3 font-semibold text-left">Title</th>
                                <th className="px-4 py-3 font-semibold text-left">Status</th>
                                <th className="px-4 py-3 font-semibold text-left"></th>
                            </tr>
                        </thead>

                        <tbody>
                            {employeeData.map((e) => (
                                <tr key={e.employee_id}>
                                    <td className="px-4 py-3 align-top border-b-[0.9px] border-[#f6b8669c] text-center">
                                        {e.employee_id}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.ssn}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.first_name}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.last_name}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.email}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.title}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        {e.is_active ? "Active" : "Inactive"}
                                    </td>
                                    <td className="px-4 pt-3 align-top border-b-[0.9px] border-[#f6b8669c]">
                                        <Dialog
                                            open={editingId === e.employee_id}
                                            onOpenChange={(open) => {
                                                if (open) {
                                                    openEditor(e);
                                                } else {
                                                    setEditingId(null);
                                                }
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <button className="hover:text-blue-600">
                                                    <FiEdit size={16} />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Employeee</DialogTitle>
                                                    <DialogDescription>
                                                        Update employee information and save your changes.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="flex flex-col gap-3 mt-2">
                                                    <div className="flex flex-col gap-1">
                                                        <Label>SSN</Label>
                                                        <Input
                                                            type="text"
                                                            value={ssn}
                                                            onChange={(e) => setSSN(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Label>First Name</Label>
                                                        <Input
                                                            type="text"
                                                            value={firstName}
                                                            onChange={(e) => setFirstName(e.target.value)}
                                                        />
                                                    </div>   
                                                    <div className="flex flex-col gap-1">
                                                        <Label>Last Name</Label>
                                                        <Input
                                                            type="text"
                                                            value={lastName}
                                                            onChange={(e) => setLastName(e.target.value)}
                                                        />
                                                    </div> 
                                                    <div className="flex flex-col gap-1">
                                                        <Label>Email</Label>
                                                        <Input
                                                            type="text"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>   
                                                    <div className="flex flex-col gap-1">
                                                        <Label>Title</Label>
                                                        <Input
                                                            type="text"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                        />
                                                    </div>   
                                                    <div className="flex flex-col gap-1">
                                                        <Label>Status</Label>
                                                        <select 
                                                            className="border rounded px-2 py-2"
                                                            value={isActive ? "active" : "inactive"}
                                                            onChange={(e) => setIsActive(e.target.value === "active")}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleUpdate(e.employee_id)}
                                                        className="w-full mt-3"
                                                    >
                                                        Save Changes
                                                    </Button>                                                                                
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}

                            {employeeData.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-6 text-center text-gray-500"
                                        colSpan={8}
                                    >
                                        No employees found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
