import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where } from "firebase/firestore";
import useAuthStore from "../store/authStore";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        const slotsQuery = query(collection(db, "slots"), where("booked", "==", false));

        const unsubscribe = onSnapshot(slotsQuery, (snapshot) => {
            setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    const bookSlot = async (slot) => {
        await updateDoc(doc(db, "slots", slot.id), { booked: true });
        await addDoc(collection(db, "appointments"), {
            studentId: user.uid,
            studentName: user.name,
            teacherId: slot.teacherId,
            teacherName: slot.teacherName,
            subject: slot.subject,
            date: slot.date,
            time: slot.time
        });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h2 className="text-3xl font-bold">Welcome, {user?.name || "Student"}!</h2>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded mt-4">Logout</button>

            {/* Available Slots */}
            <h3 className="text-xl font-bold mt-6">Available Classes</h3>
            <ul className="mt-2">
                {slots.map(slot => (
                    <li key={slot.id} className="bg-gray-700 p-2 mt-2 rounded">
                        {slot.subject} with {slot.teacherName} on {slot.date} at {slot.time}
                        <button onClick={() => bookSlot(slot)} className="bg-green-500 px-4 py-1 ml-2 rounded">Book</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
