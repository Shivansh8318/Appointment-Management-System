import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherSlots() {
    const { user } = useAuthStore();
    const [slots, setSlots] = useState([]);

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-12">
                        Manage Available Slots
                    </h2>

                    <div className="bg-white/90 p-8 rounded-3xl shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Your Available Slots</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {slots.length > 0 ? (
                                slots.map(slot => (
                                    <div
                                        key={slot.id}
                                        className="p-6 bg-teal-100 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 border border-teal-200"
                                    >
                                        <p className="text-lg font-semibold text-teal-500">{slot.subject}</p>
                                        <p className="text-gray-700">Date: {slot.date}</p>
                                        <p className="text-gray-700">Time: {slot.time} ({slot.duration} min)</p>
                                        <button
                                            onClick={() => deleteSlot(slot.id)}
                                            className="mt-4 w-full py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 text-lg">No available slots yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}