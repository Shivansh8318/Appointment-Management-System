import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentHomework() {
    const { user } = useAuthStore();
    const [homeworkList, setHomeworkList] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "appointments"), where("studentId", "==", user.uid), where("homework", "!=", ""));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHomeworkList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const toggleCompleted = async (appointmentId, currentStatus) => {
        try {
            await updateDoc(doc(db, "appointments", appointmentId), { homeworkCompleted: !currentStatus });
            alert("Homework status updated!");
        } catch (error) {
            console.error("Error updating homework status:", error);
            alert("Failed to update homework status.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-blue-50 text-gray-900 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-20" viewBox="0 0 1440 320">
                    <path fill="#60a5fa" fillOpacity="0.4" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={() => {}} />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent animate-slide-in-up">
                        Your Homework
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {homeworkList.length > 0 ? (
                            homeworkList.map(hw => (
                                <li
                                    key={hw.id}
                                    className="p-8 bg-white/90 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-orbit-in"
                                >
                                    <p className="text-2xl font-semibold text-blue-600 mb-2">{hw.subject}</p>
                                    <p className="text-gray-600">Teacher: {hw.teacherName}</p>
                                    <p className="text-gray-600">{hw.date} at {hw.time}</p>
                                    <p className="text-gray-700 mt-2">Homework: {hw.homework}</p>
                                    <button
                                        onClick={() => toggleCompleted(hw.id, hw.homeworkCompleted)}
                                        className={`mt-4 px-6 py-2 rounded-full shadow-md transition-all duration-300 text-white ${
                                            hw.homeworkCompleted
                                                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                                                : "bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                                        }`}
                                    >
                                        {hw.homeworkCompleted ? "Mark as Incomplete" : "Mark as Completed"}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600 text-xl animate-fade-in-delay">No homework assigned yet.</p>
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