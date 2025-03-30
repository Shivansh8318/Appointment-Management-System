import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [role, setRole] = useState(null); 
    const [isSignUp, setIsSignUp] = useState(true); 
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
           
            <header className="bg-black text-white py-4 text-center text-2xl font-bold shadow-md">
                Appointment Booking System
            </header>

            
            <div className="flex flex-col items-center justify-center flex-grow">
                <h1 className="text-3xl font-bold mb-6">Choose Your Role</h1>

                {/* Role Selection */}
                <div className="flex space-x-4">
                    <button
                        className={`px-6 py-2 rounded transition ${
                            role === "student" ? "bg-blue-500" : "bg-gray-700 hover:bg-blue-600"
                        }`}
                        onClick={() => setRole("student")}
                    >
                        Student
                    </button>
                    <button
                        className={`px-6 py-2 rounded transition ${
                            role === "teacher" ? "bg-green-500" : "bg-gray-700 hover:bg-green-600"
                        }`}
                        onClick={() => setRole("teacher")}
                    >
                        Teacher
                    </button>
                </div>

                {/* Sign In / Sign Up Options */}
                {role && (
                    <div className="mt-6 bg-gray-800 p-6 rounded-lg w-96 shadow-lg">
                        <div className="flex justify-between">
                            <h2 className="text-xl font-semibold">{isSignUp ? "Sign Up" : "Sign In"}</h2>
                            <button
                                className="text-blue-400 underline"
                                onClick={() => setIsSignUp(!isSignUp)}
                            >
                                {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
                            </button>
                        </div>

                        <button
                            className="w-full bg-blue-500 text-white px-4 py-2 mt-4 rounded transition hover:bg-blue-600"
                            onClick={() => navigate(`/${role}/${isSignUp ? "signup" : "signin"}`)}
                        >
                            {isSignUp ? "Sign Up" : "Sign In"} as {role === "student" ? "Student" : "Teacher"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
