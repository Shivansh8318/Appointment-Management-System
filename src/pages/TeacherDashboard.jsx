import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, query, onSnapshot, where, doc, getDoc, updateDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function TeacherDashboard() {
    const { user, logout } = useAuthStore();
    const [teacher, setTeacher] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [newSlot, setNewSlot] = useState({ dateTime: null, subject: "" });

    useEffect(() => {
        if (user) {
            const fetchTeacherDetails = async () => {
                const teacherRef = doc(db, "teachers", user.uid);
                const teacherSnap = await getDoc(teacherRef);

                if (teacherSnap.exists()) {
                    setTeacher(teacherSnap.data());
                } else {
                    console.error("Teacher profile not found.");
                }
            };

            fetchTeacherDetails();

            const slotsQuery = query(collection(db, "slots"), where("teacherId", "==", user.uid));
            const appointmentsQuery = query(collection(db, "appointments"), where("teacherId", "==", user.uid));

            const unsubSlots = onSnapshot(slotsQuery, (snapshot) => {
                setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });

            const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
                const upcoming = [];
                const past = [];
                snapshot.docs.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    if (data.completed) {
                        past.push(data);
                    } else {
                        upcoming.push(data);
                    }
                });
                setAppointments(upcoming);
                setPastAppointments(past);
            });

            return () => {
                unsubSlots();
                unsubAppointments();
            };
        }
    }, [user]);

    const addSlot = async () => {
        if (!newSlot.dateTime || !newSlot.subject) return alert("All fields are required.");
        
        await addDoc(collection(db, "slots"), {
            teacherId: user.uid,
            teacherName: teacher?.name || "Unknown",
            date: newSlot.dateTime.toISOString().split("T")[0],
            time: newSlot.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            subject: newSlot.subject,
            booked: false
        });
        
        setNewSlot({ dateTime: null, subject: "" });
    };

    const markAsCompleted = async (appointmentId) => {
        await updateDoc(doc(db, "appointments", appointmentId), { completed: true });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
            {teacher ? (
                <div className="w-full max-w-2xl">
                    <h2 className="text-3xl font-bold text-center">Welcome, {teacher.name}!</h2>
                    <p className="text-gray-300 mt-2 text-center">{teacher.qualification} | {teacher.experience} years of experience</p>
                    <p className="text-gray-300 text-center">Subjects: {teacher.subjects?.join(", ")}</p>
                    <p className="text-gray-300 text-center">Phone: {teacher.phone}</p>
                    <div className="text-center mt-4">
                        <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
                    </div>

                    {/* Add Available Slot */}
                    <div className="mt-6 bg-gray-800 p-6 rounded text-center">
                        <h3 className="text-xl font-bold">Add Available Slot</h3>
                        <div className="flex justify-center mt-2">
                            <DatePicker 
                                selected={newSlot.dateTime} 
                                onChange={(date) => setNewSlot({ ...newSlot, dateTime: date })}
                                showTimeSelect
                                dateFormat="Pp"
                                className="p-2 bg-gray-700 rounded text-white text-center"
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Subject" 
                            value={newSlot.subject} 
                            onChange={e => setNewSlot({ ...newSlot, subject: e.target.value })} 
                            className="p-2 bg-gray-700 rounded w-full mt-2 text-center"
                        />
                        <button onClick={addSlot} className="bg-blue-500 px-4 py-2 mt-2 rounded">Add Slot</button>
                    </div>

                    {/* List of Available Slots */}
                    <h3 className="text-xl font-bold mt-6 text-center">Your Available Slots</h3>
                    <ul className="mt-2">
                        {slots.length > 0 ? slots.map(slot => (
                            <li key={slot.id} className="bg-gray-700 p-2 mt-2 rounded text-center">
                                {slot.subject} on {slot.date} at {slot.time} - {slot.booked ? "Booked" : "Available"}
                            </li>
                        )) : <p className="text-gray-400 text-center">No available slots.</p>}
                    </ul>

                    {/* Booked Appointments */}
                    <h3 className="text-xl font-bold mt-6 text-center">Booked Appointments</h3>
                    <ul className="mt-2">
                        {appointments.length > 0 ? appointments.map(app => (
                            <li key={app.id} className="bg-gray-700 p-2 mt-2 rounded flex justify-between items-center">
                                <div>
                                    {app.studentName} booked {app.subject} on {app.date} at {app.time}
                                </div>
                                <button onClick={() => markAsCompleted(app.id)} className="bg-green-500 px-4 py-1 rounded">
                                    Mark as Completed
                                </button>
                            </li>
                        )) : <p className="text-gray-400 text-center">No booked appointments.</p>}
                    </ul>

                    {/* Past Appointments */}
                    <h3 className="text-xl font-bold mt-6 text-center">Past Appointments</h3>
                    <ul className="mt-2">
                        {pastAppointments.length > 0 ? pastAppointments.map(app => (
                            <li key={app.id} className="bg-gray-700 p-2 mt-2 rounded text-center text-gray-400">
                                {app.studentName} attended {app.subject} on {app.date} at {app.time} - <span className="text-green-400">Completed</span>
                            </li>
                        )) : <p className="text-gray-400 text-center">No past appointments.</p>}
                    </ul>
                </div>
            ) : (
                <p className="text-gray-400 text-center">Loading teacher details...</p>
            )}
        </div>
    );
}
