import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StudentNavbar from "../components/StudentNavbar";
import PastClassDetails from "../components/PastClassDetails";

export default function StudentPastClasses() {
    const { user } = useAuthStore();
    const [pastClasses, setPastClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeTab, setActiveTab] = useState("past");
    const [notes, setNotes] = useState({});
    const [saving, setSaving] = useState(false); // Control saving state

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "appointments"),
            where("studentId", "==", user.uid),
            where("completed", "==", true)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPastClasses(classes);
            const initialNotes = {};
            classes.forEach(cls => {
                if (cls.notes) initialNotes[cls.id] = cls.notes;
            });
            setNotes(initialNotes);
        }, (error) => {
            console.error("Error fetching past classes:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const saveNote = async (classId, note) => {
        if (saving || notes[classId] === note) return; // Prevent multiple saves
        setSaving(true);
        try {
            await updateDoc(doc(db, "appointments", classId), { notes: note });
            setNotes(prev => ({ ...prev, [classId]: note }));
            alert("Note saved successfully!");
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#c4b5fd" fillOpacity="0.3" d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,133.3C840,117,960,107,1080,112C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-in-up transform hover:scale-105 transition-all duration-500">
                        Past Classes
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {pastClasses.length > 0 ? (
                            pastClasses.map(app => (
                                <li
                                    key={app.id}
                                    className="p-8 bg-gradient-to-br from-purple-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border border-purple-500/30 animate-orbit-in cursor-pointer transform perspective-1000"
                                    onClick={() => setSelectedClass(selectedClass?.id === app.id ? null : app)}
                                >
                                    <p className="text-2xl font-semibold text-purple-300 mb-2 animate-fade-in-delay">{app.subject}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.1s" }}>Teacher: {app.teacherName}</p>
                                    <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>{app.date} at {app.time}</p>
                                    <p className="text-green-400 animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>Completed</p>
                                    {app.homework && (
                                        <p className="text-gray-300 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.4s" }}>
                                            Homework: {app.homework}
                                        </p>
                                    )}
                                    <textarea
                                        value={notes[app.id] || ""}
                                        onChange={(e) => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                                        onBlur={(e) => saveNote(app.id, e.target.value)}
                                        placeholder="Add a note..."
                                        className="w-full mt-4 p-3 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 animate-fade-in-delay resize-none"
                                        style={{ animationDelay: "0.5s" }}
                                    />
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xl animate-fade-in-delay">No past classes yet.</p>
                        )}
                    </ul>
                    {selectedClass && <PastClassDetails appointment={selectedClass} studentId={user.uid} />}
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