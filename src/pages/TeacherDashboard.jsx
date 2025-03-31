import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, query, onSnapshot, where } from "firebase/firestore";
import useAuthStore from "../store/authStore";

export default function TeacherDashboard() {
    const { user, logout } = useAuthStore();
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: "", time: "", subject: "" });

    useEffect(() => {
        if (user) {
            const slotsQuery = query(collection(db, "slots"), where("teacherId", "==", user.uid));
            const appointmentsQuery = query(collection(db, "appointments"), where("teacherId", "==", user.uid));

            const unsubSlots = onSnapshot(slotsQuery, (snapshot) => {
                setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });

            const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
                setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });

            return () => {
                unsubSlots();
                unsubAppointments();
            };
        }
    }, [user]);

    const addSlot = async () => {
        if (!newSlot.date || !newSlot.time || !newSlot.subject) return alert("All fields are required.");
        
        await addDoc(collection(db, "slots"), {
            teacherId: user.uid,
            teacherName: user.name,
            date: newSlot.date,
            time: newSlot.time,
            subject: newSlot.subject,
            booked: false
        });
        
        setNewSlot({ date: "", time: "", subject: "" });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h2 className="text-3xl font-bold">Welcome, {user?.name || "Teacher"}!</h2>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded mt-4">Logout</button>

            {/* Add Slot Form */}
            <div className="mt-6 bg-gray-800 p-4 rounded">
                <h3 className="text-xl font-bold">Add Available Slot</h3>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })} className="p-2 bg-gray-700 rounded w-full mt-2"/>
                <input type="time" value={newSlot.time} onChange={e => setNewSlot({ ...newSlot, time: e.target.value })} className="p-2 bg-gray-700 rounded w-full mt-2"/>
                <input type="text" placeholder="Subject" value={newSlot.subject} onChange={e => setNewSlot({ ...newSlot, subject: e.target.value })} className="p-2 bg-gray-700 rounded w-full mt-2"/>
                <button onClick={addSlot} className="bg-blue-500 px-4 py-2 mt-2 rounded">Add Slot</button>
            </div>

            {/* Booked Appointments */}
            <h3 className="text-xl font-bold mt-6">Your Appointments</h3>
            <ul className="mt-2">
                {appointments.map(app => (
                    <li key={app.id} className="bg-gray-700 p-2 mt-2 rounded">
                        {app.studentName} booked {app.subject} on {app.date} at {app.time}
                    </li>
                ))}
            </ul>
        </div>
    );
}
