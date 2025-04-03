import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StudentNavbar from "../components/StudentNavbar";

export default function StudentHomework() {
    const { user } = useAuthStore();
    const [homeworkAssignments, setHomeworkAssignments] = useState([]);
    const [activeTab, setActiveTab] = useState("homework");

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "appointments"), where("studentId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const assignments = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(app => app.homework && app.homework.trim() !== "");
            setHomeworkAssignments(assignments);
        }, (error) => {
            console.error("Error fetching homework:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const markAsCompleted = async (id, currentStatus) => {
        try {
            await updateDoc(doc(db, "appointments", id), { completed: !currentStatus });
            alert(`Homework marked as ${!currentStatus ? "completed" : "pending"}!`);
        } catch (error) {
            console.error("Error updating homework status:", error);
            alert("Failed to update homework status.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#f9a8d4" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent animate-slide-in-up transform hover:scale-105 transition-all duration-500">
                        Your Homework
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {homeworkAssignments.length > 0 ? (
                            homeworkAssignments.map(app => (
                                <li
                                    key={app.id}
                                    className="p-8 bg-gradient-to-br from-pink-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border border-pink-500/30 animate-orbit-in transform perspective-1000"
                                >
                                    <p className="text-2xl font-semibold text-pink-300 mb-2 animate-fade-in-delay">{app.subject}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.1s" }}>Teacher: {app.teacherName}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>Date: {app.date} at {app.time}</p>
                                    <p className="text-gray-300 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>Homework: {app.homework}</p>
                                    <p className="text-sm text-gray-400 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.4s" }}>
                                        Status: {app.completed ? "Completed" : "Pending"}
                                    </p>
                                    <button
                                        onClick={() => markAsCompleted(app.id, app.completed)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                    >
                                        {app.completed ? "Mark as Pending" : "Mark as Completed"}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xl animate-fade-in-delay">No homework assigned yet.</p>
                        )}
                    </ul>
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
                @keyframes parallax {
                    0% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                    100% { transform: translateY(0) translateX(0); }
                }
            `}</style>
        </div>
    );
}