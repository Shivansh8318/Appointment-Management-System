import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentNavbar from "../../components/StudentNavbar";
import { useNavigate } from "react-router-dom";

export default function UpcomingClasses() {
    const { user } = useAuthStore();
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [activeTab, setActiveTab] = useState("upcoming");
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "appointments"),
            where("studentId", "==", user.uid),
            where("completed", "==", false)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUpcomingClasses(classes);
        }, (error) => {
            console.error("Error fetching upcoming classes:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const startClass = () => {
        navigate("/student/dummy-class");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#5eead4" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent animate-slide-in-up transform hover:scale-105 transition-all duration-500">
                        Upcoming Classes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {upcomingClasses.length > 0 ? (
                            upcomingClasses.map(cls => (
                                <div
                                    key={cls.id}
                                    className="p-8 bg-gradient-to-br from-teal-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border border-teal-500/30 animate-orbit-in transform perspective-1000"
                                >
                                    <h3 className="text-2xl font-semibold text-teal-300 mb-2 animate-fade-in-delay">{cls.subject}</h3>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.1s" }}>Teacher: {cls.teacherName}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>Date: {cls.date}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>Time: {cls.time}</p>
                                    {cls.homework && (
                                        <p className="text-gray-300 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.4s" }}>
                                            Homework: {cls.homework}
                                        </p>
                                    )}
                                    <button
                                        onClick={startClass}
                                        className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl hover:scale-105 animate-bounce-in"
                                    >
                                        Start Class
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xl animate-fade-in-delay">No upcoming classes scheduled.</p>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-orbit-in {
                    animation: orbitIn 1.2s ease-out;
                }
                .animate-slide-in-up {
                    animation: slideInUp 1s ease-out;
                }
                .animate-fade-in-delay {
                    animation: fadeIn 1s ease-in;
                }
                .animate-bounce-in {
                    animation: bounceIn 1.5s ease-in-out;
                }
                .animate-parallax {
                    animation: parallax 20s linear infinite;
                }
                @keyframes orbitIn {
                    0% { transform: scale(0.9) rotate(-5deg) translateZ(-50px); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(60px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes parallax {
                    0% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                    100% { transform: translateY(0) translateX(0); }
                }
            `}</style>
        </div>
    );
}