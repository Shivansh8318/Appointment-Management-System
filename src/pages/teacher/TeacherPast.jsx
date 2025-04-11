import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherPast() {
    const { user } = useAuthStore();
    const [pastAppointments, setPastAppointments] = useState([]);
    const [teacherNotes, setTeacherNotes] = useState({});

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "appointments"), where("teacherId", "==", user.uid), where("completed", "==", true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPastAppointments(apps);
            const newNotes = { ...teacherNotes };
            apps.forEach(app => {
                if (app.notes) newNotes[app.id] = app.notes;
            });
            setTeacherNotes(newNotes);
        });
        return () => unsubscribe();
    }, [user]);

    const saveNote = async (appointmentId, note) => {
        try {
            await updateDoc(doc(db, "appointments", appointmentId), { notes: note });
            setTeacherNotes(prev => ({ ...prev, [appointmentId]: note }));
            alert("Note saved successfully!");
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-12">
                        Past Appointments
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {pastAppointments.length > 0 ? (
                            pastAppointments.map(app => (
                                <li
                                    key={app.id}
                                    className="p-8 bg-white/90 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-3 transition-all duration-500 border border-gray-200"
                                >
                                    <p className="text-2xl font-semibold text-blue-500 mb-2">{app.subject}</p>
                                    <p className="text-gray-700">Student: {app.studentName}</p>
                                    <p className="text-gray-700">{app.date} at {app.time}</p>
                                    <p className="text-green-500">Completed</p>
                                    {app.homework && (
                                        <p className="text-gray-600 mt-2">Homework: {app.homework}</p>
                                    )}
                                    <textarea
                                        value={teacherNotes[app.id] || ""}
                                        onChange={(e) => setTeacherNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        onBlur={(e) => saveNote(app.id, e.target.value)}
                                        placeholder="Add a note..."
                                        className="w-full mt-4 p-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-600 text-xl">No past appointments yet.</p>
                        )}
                    </ul>
                </div>
            </section>
            <Footer />
        </div>
    );
}