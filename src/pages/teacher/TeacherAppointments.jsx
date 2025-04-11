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
            const fetchedAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(fetchedAppointments);
        }, (error) => {
            console.error("Error fetching appointments:", error);
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
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-12">
                        Booked Appointments
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {appointments.length > 0 ? (
                            appointments.map(app => (
                                <li
                                    key={app.id}
                                    className="p-8 bg-white/90 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-500 border border-gray-200"
                                >
                                    <p className="text-2xl font-semibold text-blue-500 mb-2">{app.subject}</p>
                                    <p className="text-gray-700">Student: {app.studentName}</p>
                                    <p className="text-gray-700">{app.date} at {app.time}</p>
                                    <textarea
                                        value={homeworkInputs[app.id] || app.homework || ""}
                                        onChange={(e) => handleHomeworkChange(app.id, e.target.value)}
                                        placeholder="Assign homework..."
                                        className="w-full mt-4 p-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <button
                                        onClick={() => saveHomework(app.id)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md transition-all duration-300"
                                    >
                                        Save Homework
                                    </button>
                                    <button
                                        onClick={() => navigate("/student/dummy-class")}
                                        className="mt-4 mx-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-300"
                                    >
                                        Start Class
                                    </button>
                                    <button
                                        onClick={() => markAsCompleted(app.id)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md transition-all duration-300"
                                    >
                                        Mark as Completed
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600 text-xl">No booked appointments yet.</p>
                        )}
                    </ul>
                </div>
            </section>
            <Footer />
        </div>
    );
}