import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherAppointments() {
    const { user } = useAuthStore();
    const [appointments, setAppointments] = useState([]);
    const [homeworkInputs, setHomeworkInputs] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "appointments"), where("teacherId", "==", user.uid), where("completed", "==", false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleHomeworkChange = (id, value) => {
        setHomeworkInputs(prev => ({ ...prev, [id]: value }));
    };

    const saveHomework = async (id) => {
        const homework = homeworkInputs[id] || "";
        try {
            await updateDoc(doc(db, "appointments", id), { homework });
            alert("Homework saved successfully!");
        } catch (error) {
            console.error("Error saving homework:", error);
            alert("Failed to save homework.");
        }
    };

    const markAsCompleted = async (id) => {
        try {
            await updateDoc(doc(db, "appointments", id), { completed: true });
            alert("Appointment marked as completed!");
        } catch (error) {
            console.error("Error marking appointment:", error);
            alert("Failed to mark as completed.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#60a5fa" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-slide-in-up">
                        Booked Appointments
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {appointments.length > 0 ? (
                            appointments.map(app => (
                                <li
                                    key={app.id}
                                    className="p-8 bg-gradient-to-br from-indigo-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 border border-indigo-500/30 animate-orbit-in"
                                >
                                    <p className="text-2xl font-semibold text-blue-300 mb-2">{app.subject}</p>
                                    <p className="text-gray-200">Student: {app.studentName}</p>
                                    <p className="text-gray-200">{app.date} at {app.time}</p>
                                    <textarea
                                        value={homeworkInputs[app.id] || app.homework || ""}
                                        onChange={(e) => handleHomeworkChange(app.id, e.target.value)}
                                        placeholder="Assign homework..."
                                        className="w-full mt-4 p-3 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => saveHomework(app.id)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg transition-all duration-300"
                                    >
                                        Save Homework
                                    </button>
                                    <button
                                        onClick={() => navigate("/student/dummy-class")}
                                        className="mt-4 mx-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-300"
                                    >
                                        Start Class
                                    </button>
                                    <button
                                        onClick={() => markAsCompleted(app.id)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all duration-300"
                                    >
                                        Mark as Completed
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xl animate-fade-in-delay">No booked appointments yet.</p>
                        )}
                    </ul>
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-orbit-in { animation: orbitIn 1.2s ease-out; }
                .animate-slide-in-up { animation: slideInUp 1s ease-out; }
                .animate-fade-in-delay { animation: fadeIn 1s ease-in; }
                .animate-parallax { animation: parallax 20s linear infinite; }
                @keyframes orbitIn { 0% { transform: scale(0.9) rotate(-5deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                @keyframes slideInUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes parallax { 0% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } 100% { transform: translateY(0) translateX(0); } }
            `}</style>
        </div>
    );
}