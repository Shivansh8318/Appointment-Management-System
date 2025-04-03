import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

export default function PastClassDetails({ appointment, studentId }) {
    const [notes, setNotes] = useState(appointment.notes || "");
    const [pastClasses, setPastClasses] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, "appointments"),
            where("studentId", "==", studentId),
            where("teacherId", "==", appointment.teacherId),
            where("completed", "==", true)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPastClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [studentId, appointment.teacherId]);

    const saveNote = async () => {
        await updateDoc(doc(db, "appointments", appointment.id), { notes });
        alert("Note saved!");
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 text-white">
            <h3 className="text-xl font-bold mb-4">Class Details with {appointment.teacherName}</h3>
            <p><strong>Subject:</strong> {appointment.subject}</p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>
            {appointment.homework && <p><strong>Homework:</strong> {appointment.homework}</p>}

            <h4 className="text-lg font-semibold mt-4">All Past Classes with {appointment.teacherName}</h4>
            <ul className="mt-2">
                {pastClasses.map(cls => (
                    <li key={cls.id} className="bg-gray-700 p-2 mt-2 rounded">
                        {cls.subject} on {cls.date} at {cls.time}
                        {cls.homework && <p className="text-gray-300">Homework: {cls.homework}</p>}
                    </li>
                ))}
            </ul>

            <h4 className="text-lg font-semibold mt-4">Notes</h4>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 mt-2 bg-gray-700 rounded text-white"
                placeholder="Add your notes here..."
            />
            <button
                onClick={saveNote}
                className="mt-2 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition"
            >
                Save Note
            </button>
        </div>
    );
}