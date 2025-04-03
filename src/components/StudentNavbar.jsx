import { useNavigate } from "react-router-dom";

export default function StudentNavbar({ setActiveTab }) {
    const navigate = useNavigate();
    const tabs = [
        { name: "Dashboard", tab: "home", path: "/student/dashboard" },
        { name: "Available Classes", tab: "available", path: "/student/available-classes" },
        { name: "Upcoming Classes", tab: "upcoming", path: "/student/upcoming-classes" },
        { name: "Past Classes", tab: "past", path: "/student/past-classes" },
        { name: "Homework", tab: "homework", path: "/student/homework" },
    ];

    return (
        <nav className="bg-gradient-to-r from-gray-800/80 to-indigo-900/80 backdrop-blur-lg p-4 flex justify-center space-x-8 shadow-2xl border-b border-gray-700/50 sticky top-0 z-20">
            {tabs.map((tab) => (
                <button
                    key={tab.tab}
                    className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg text-white font-medium"
                    onClick={() => {
                        setActiveTab(tab.tab);
                        navigate(tab.path);
                    }}
                >
                    {tab.name}
                </button>
            ))}
        </nav>
    );
}