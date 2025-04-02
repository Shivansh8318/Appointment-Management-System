import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, onSnapshot, updateDoc, doc, addDoc, where, getDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const [slots, setSlots] = useState([]);
    const [studentDetails, setStudentDetails] = useState(null);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [pastClasses, setPastClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Student Details
    useEffect(() => {
        if (!user) return;

        const fetchStudentDetails = async () => {
            const studentDoc = await getDoc(doc(db, "students", user.uid));
            if (studentDoc.exists()) {
                setStudentDetails(studentDoc.data());
            }
            setLoading(false);
        };

        fetchStudentDetails();
    }, [user]);

    // Fetch Available Slots
    useEffect(() => {
        const slotsQuery = query(collection(db, "slots"), where("booked", "==", false));

        const unsubscribe = onSnapshot(slotsQuery, (snapshot) => {
            setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, []);

    // Fetch Upcoming and Past Classes
    useEffect(() => {
        if (!user) return;

        const appointmentsQuery = query(collection(db, "appointments"), where("studentId", "==", user.uid));

        const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
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
            setUpcomingClasses(upcoming);
            setPastClasses(past);
        });

        return () => unsubscribe();
    }, [user]);

    // Book a Slot
    const bookSlot = async (slot) => {
        await updateDoc(doc(db, "slots", slot.id), { booked: true });
        await addDoc(collection(db, "appointments"), {
            studentId: user.uid,
            studentName: studentDetails.name,
            teacherId: slot.teacherId,
            teacherName: slot.teacherName,
            subject: slot.subject,
            date: slot.date,
            time: slot.time,
            completed: false
        });

        alert("Class booked successfully!");
    };

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
            <h2 className="text-3xl font-bold">Welcome, {studentDetails?.name || "Student"}!</h2>
            <button onClick={logout} className="bg-red-500 px-4 py-2 rounded mt-4">Logout</button>

            {/* Student Information */}
            <div className="bg-gray-800 p-6 rounded-lg w-96 mt-6">
                <h3 className="text-xl font-bold mb-4">Your Information</h3>
                <p><strong>Name:</strong> {studentDetails?.name}</p>
                <p><strong>Phone:</strong> {studentDetails?.phone}</p>
                <p><strong>Age:</strong> {studentDetails?.age}</p>
                <p><strong>Gender:</strong> {studentDetails?.gender}</p>
                <p><strong>Subjects:</strong> {studentDetails?.subjects?.join(", ") || "N/A"}</p>
                <p><strong>Experience:</strong> {studentDetails?.experience} years</p>
                <p><strong>Qualification:</strong> {studentDetails?.qualification}</p>
                <p><strong>Bio:</strong> {studentDetails?.bio}</p>
            </div>

            {/* Available Slots */}
            <h3 className="text-xl font-bold mt-6">Available Classes</h3>
            <ul className="mt-2 w-96">
                {slots.length > 0 ? (
                    slots.map(slot => (
                        <li key={slot.id} className="bg-gray-700 p-2 mt-2 rounded flex justify-between items-center">
                            <div>
                                <p><strong>{slot.subject}</strong> with {slot.teacherName}</p>
                                <p>Date: {slot.date} | Time: {slot.time}</p>
                            </div>
                            <button onClick={() => bookSlot(slot)} className="bg-green-500 px-4 py-1 rounded">
                                Book
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-400">No available slots at the moment.</p>
                )}
            </ul>

            {/* Upcoming Classes */}
            <h3 className="text-xl font-bold mt-6">Upcoming Classes</h3>
            <ul className="mt-2 w-96">
                {upcomingClasses.length > 0 ? upcomingClasses.map(app => (
                    <li key={app.id} className="bg-gray-700 p-2 mt-2 rounded">
                        {app.subject} with {app.teacherName} on {app.date} at {app.time}
                    </li>
                )) : <p className="text-gray-400">No upcoming classes.</p>}
            </ul>

            {/* Past Classes */}
            <h3 className="text-xl font-bold mt-6">Past Classes</h3>
            <ul className="mt-2 w-96">
                {pastClasses.length > 0 ? pastClasses.map(app => (
                    <li key={app.id} className="bg-gray-700 p-2 mt-2 rounded text-gray-400">
                        {app.subject} with {app.teacherName} on {app.date} at {app.time} - <span className="text-green-400">Completed</span>
                    </li>
                )) : <p className="text-gray-400">No past classes.</p>}
            </ul>
        </div>
    );
}
