import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentNavbar({ setActiveTab }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const tabs = [
        { name: "Dashboard", tab: "home", path: "/student/dashboard" },
        { name: "Available Classes", tab: "available", path: "/student/available-classes" },
        { name: "Upcoming Classes", tab: "upcoming", path: "/student/upcoming-classes" },
        { name: "Past Classes", tab: "past", path: "/student/past-classes" },
        { name: "Homework", tab: "homework", path: "/student/homework" },
    ];

    const handleTabClick = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-gradient-to-r from-white/90 to-blue-100/90 backdrop-blur-lg p-4 shadow-lg border-b border-gray-200 sticky top-0 z-20">
            <div className="hidden md:flex justify-center space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.tab}
                        className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md text-white font-medium"
                        onClick={() => handleTabClick(tab.tab, tab.path)}
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
                <div className="md:hidden absolute top-16 left-0 w-full bg-gradient-to-r from-white/90 to-blue-100/90 backdrop-blur-lg p-4 flex flex-col items-center space-y-4 shadow-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.tab}
                            className="w-full px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md text-white font-medium"
                            onClick={() => handleTabClick(tab.tab, tab.path)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            )}
        </nav>
    );
}