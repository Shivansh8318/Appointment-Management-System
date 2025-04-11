import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherNavbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { name: "Home", path: "/teacher/home" },
        { name: "Add Available Slot", path: "/teacher/add-slots" },
        { name: "Your Available Slots", path: "/teacher/slots" },
        { name: "Booked Appointments", path: "/teacher/appointments" },
        { name: "Past Appointments", path: "/teacher/past" },
    ];

    const handleTabClick = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-white to-blue-50 p-4 shadow-md border-b border-gray-200 sticky top-0 z-20">
            <div className="hidden md:flex justify-center space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md text-white font-medium"
                        onClick={() => handleTabClick(tab.path)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div className="md:hidden flex justify-between items-center">
                <button
                    className="text-gray-800 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </div>
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white/90 p-4 flex flex-col items-center space-y-4 shadow-lg border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.path}
                            className="w-full px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md text-white font-medium"
                            onClick={() => handleTabClick(tab.path)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
}