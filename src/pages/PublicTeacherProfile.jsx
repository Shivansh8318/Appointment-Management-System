import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, addDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicTeacherProfile() {
    const { teacherUsername } = useParams();
    const { user, loading: authLoading } = useAuthStore();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const usernameRef = doc(db, "usernames", teacherUsername);
                const usernameSnap = await getDoc(usernameRef);
                if (!usernameSnap.exists()) {
                    console.log(`No username found for ${teacherUsername}`);
                    setTeacher(null);
                    setLoading(false);
                    return;
                }
                const teacherId = usernameSnap.data().uid;

                const teacherRef = doc(db, "teachers", teacherId);
                const teacherSnap = await getDoc(teacherRef);
                if (teacherSnap.exists()) {
                    const teacherData = { id: teacherId, ...teacherSnap.data() };
                    setTeacher(teacherData);

                    const slotsQuery = query(
                        collection(db, "slots"),
                        where("teacherId", "==", teacherId),
                        where("booked", "==", false)
                    );
                    const unsubscribe = onSnapshot(slotsQuery, (snapshot) => {
                        const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setAvailableSlots(slots.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)));
                    }, (error) => {
                        console.error("Error fetching slots:", error);
                    });

                    setLoading(false);
                    return () => unsubscribe();
                } else {
                    console.log(`No teacher found for teacherId: ${teacherId}`);
                    setTeacher(null);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching teacher data:", error);
                setTeacher(null);
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, [teacherUsername]);

    const bookSlot = async (slotId, slot) => {
        if (authLoading) return;

        if (!user || user.role !== "student") {
            console.log("Redirecting to signin from:", `/teacher/${teacherUsername}`);
            navigate("/student/signin", { state: { from: `/teacher/${teacherUsername}` } });
            return;
        }

        try {
            await updateDoc(doc(db, "slots", slotId), { booked: true });
            await addDoc(collection(db, "appointments"), {
                studentId: user.uid,
                studentName: user.name || "Student",
                teacherId: slot.teacherId,
                teacherUsername: teacherUsername,
                teacherName: slot.teacherName,
                date: slot.date,
                time: slot.time,
                subject: slot.subject,
                completed: false,
            });
            alert("Slot booked successfully!");
        } catch (error) {
            console.error("Error booking slot:", error);
            alert("Failed to book slot.");
        }
    };

    const goToDashboard = () => {
        navigate("/student/dashboard");
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex items-center justify-center">
                <p className="text-xl text-gray-800">Loading...</p>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
                <Header />
                <section className="flex-grow py-16 px-6 text-center">
                    <h2 className="text-4xl font-bold text-gray-600">Teacher not found</h2>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-8 text-gray-800">
                        {teacher.name}'s Profile
                    </h2>
                    <div className="bg-white/90 p-8 rounded-3xl shadow-lg border border-gray-200 mb-12">
                        <p className="text-lg text-gray-700 mb-2">Username: {teacherUsername}</p>
                        <p className="text-lg text-gray-700 mb-2">Qualification: {teacher.qualification}</p>
                        <p className="text-lg text-gray-700 mb-2">Experience: {teacher.experience} years</p>
                        <p className="text-lg text-gray-700 mb-2">Subjects: {teacher.subjects?.join(", ")}</p>
                        <p className="text-lg text-gray-700">Bio: {teacher.bio}</p>
                    </div>

                    {user && user.role === "student" && (
                        <button
                            onClick={goToDashboard}
                            className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-md text-white font-medium transition-all duration-300 hover:scale-105"
                        >
                            Go to Dashboard
                        </button>
                    )}

                    <h3 className="text-3xl font-bold mb-6 text-gray-800">
                        Available Classes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableSlots.length > 0 ? (
                            availableSlots.map(slot => (
                                <div
                                    key={slot.id}
                                    className="p-6 bg-white/90 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-200"
                                >
                                    <h4 className="text-xl font-semibold text-blue-500 mb-2">{slot.subject}</h4>
                                    <p className="text-gray-700">Date: {slot.date}</p>
                                    <p className="text-gray-700">Time: {slot.time}</p>
                                    <button
                                        onClick={() => bookSlot(slot.id, slot)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md text-white font-medium transition-all duration-300 hover:scale-105"
                                        disabled={authLoading}
                                    >
                                        Book This Slot
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-xl">No available classes at the moment.</p>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}