import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherSlots() {
    const { user } = useAuthStore();
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedTime, setSelectedTime] = useState("");
    const [subject, setSubject] = useState("");
    const [duration, setDuration] = useState(30); // Default 30 minutes

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "slots"), where("teacherId", "==", user.uid), where("booked", "==", false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Error fetching slots:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const addSlot = async () => {
        if (!selectedDate || !selectedTime || !subject) {
            alert("Please fill all fields!");
            return;
        }
        try {
            const slotRef = doc(collection(db, "slots"));
            await setDoc(slotRef, {
                teacherId: user.uid,
                teacherName: user.name,
                teacherUsername: user.username, // Add teacherUsername from user object
                subject,
                date: selectedDate,
                time: selectedTime,
                duration,
                booked: false,
            });
            setSubject("");
            setSelectedTime("");
            alert("Slot added successfully!");
        } catch (error) {
            console.error("Error adding slot:", error);
            alert("Failed to add slot.");
        }
    };

    const deleteSlot = async (slotId) => {
        if (window.confirm("Are you sure you want to delete this slot?")) {
            try {
                await deleteDoc(doc(db, "slots", slotId));
                alert("Slot deleted successfully!");
            } catch (error) {
                console.error("Error deleting slot:", error);
                alert("Failed to delete slot.");
            }
        }
    };

    // Generate time slots (every 30 minutes from 8:00 AM to 8:00 PM)
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8;
        const minute = i % 2 === 0 ? "00" : "30";
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        return time < "20:00" ? time : null;
    }).filter(t => t);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-float-slow">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#5eead4" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent mb-12">
                        Manage Available Slots
                    </h2>

                    {/* Slot Creation Form */}
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 mb-10">
                        <h3 className="text-2xl font-semibold text-teal-300 mb-6">Add New Slot</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-200 mb-2">Select Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-200 mb-2">Select Time</label>
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select a time</option>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-gray-200 mb-2">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter subject"
                                className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="mt-6">
                            <label className="block text-gray-200 mb-2">Duration (minutes)</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value={30}>30</option>
                                <option value={60}>60</option>
                            </select>
                        </div>
                        <button
                            onClick={addSlot}
                            className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            Add Slot
                        </button>
                    </div>

                    {/* Existing Slots */}
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30">
                        <h3 className="text-2xl font-semibold text-teal-300 mb-6">Your Available Slots</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {slots.length > 0 ? (
                                slots.map(slot => (
                                    <div
                                        key={slot.id}
                                        className="p-6 bg-teal-900/50 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-teal-500/30"
                                    >
                                        <p className="text-lg font-semibold text-teal-300">{slot.subject}</p>
                                        <p className="text-gray-200">Date: {slot.date}</p>
                                        <p className="text-gray-200">Time: {slot.time} ({slot.duration} min)</p>
                                        <button
                                            onClick={() => deleteSlot(slot.id)}
                                            className="mt-4 w-full py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-lg">No available slots yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-float-slow { animation: floatSlow 10s ease-in-out infinite; }
                @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
            `}</style>
        </div>
    );
}