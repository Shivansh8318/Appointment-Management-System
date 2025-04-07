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
        setIsMenuOpen(false); // Close menu on selection
    };

    return (
        <nav className="bg-gradient-to-r from-gray-800/80 to-indigo-900/80 backdrop-blur-lg p-4 shadow-2xl border-b border-gray-700/50 sticky top-0 z-20">
            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-center space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.tab}
                        className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white font-medium"
                        onClick={() => handleTabClick(tab.tab, tab.path)}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-between items-center">
                <button
                    className="text-white focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-gradient-to-r from-gray-800/90 to-indigo-900/90 backdrop-blur-lg p-4 flex flex-col items-center space-y-4 shadow-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.tab}
                            className="w-full px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white font-medium"
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