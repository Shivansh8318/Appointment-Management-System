import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, addDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PublicTeacherProfile() {
    const { teacherUsername } = useParams(); // URL uses teacherUsername
    const { user, loading: authLoading } = useAuthStore();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                // Step 1: Get teacherId from usernames collection using teacherUsername
                const usernameRef = doc(db, "usernames", teacherUsername);
                const usernameSnap = await getDoc(usernameRef);
                if (!usernameSnap.exists()) {
                    console.log(`No username found for ${teacherUsername}`);
                    setTeacher(null);
                    setLoading(false);
                    return;
                }
                const teacherId = usernameSnap.data().uid;

                // Step 2: Fetch teacher data using teacherId
                const teacherRef = doc(db, "teachers", teacherId);
                const teacherSnap = await getDoc(teacherRef);
                if (teacherSnap.exists()) {
                    const teacherData = { id: teacherId, ...teacherSnap.data() };
                    setTeacher(teacherData);

                    // Step 3: Fetch available slots for this teacher
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col">
                <Header />
                <section className="flex-grow py-16 px-6 text-center">
                    <h2 className="text-4xl font-bold text-gray-400">Teacher not found</h2>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#60a5fa" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-slide-in-up">
                        {teacher.name}'s Profile
                    </h2>
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700/30 mb-12">
                        <p className="text-lg text-gray-200 mb-2">Username: {teacherUsername}</p>
                        <p className="text-lg text-gray-200 mb-2">Qualification: {teacher.qualification}</p>
                        <p className="text-lg text-gray-200 mb-2">Experience: {teacher.experience} years</p>
                        <p className="text-lg text-gray-200 mb-2">Subjects: {teacher.subjects?.join(", ")}</p>
                        <p className="text-lg text-gray-200">Bio: {teacher.bio}</p>
                    </div>

                    {/* Dashboard Button for Logged-In Students */}
                    {user && user.role === "student" && (
                        <button
                            onClick={goToDashboard}
                            className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                            Go to Dashboard
                        </button>
                    )}

                    <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Available Classes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableSlots.length > 0 ? (
                            availableSlots.map(slot => (
                                <div
                                    key={slot.id}
                                    className="p-6 bg-gradient-to-br from-indigo-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-300 border border-indigo-500/30 animate-fade-in"
                                >
                                    <h4 className="text-xl font-semibold text-blue-300 mb-2">{slot.subject}</h4>
                                    <p className="text-gray-200">Date: {slot.date}</p>
                                    <p className="text-gray-200">Time: {slot.time}</p>
                                    <button
                                        onClick={() => bookSlot(slot.id, slot)}
                                        className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl hover:scale-105"
                                        disabled={authLoading}
                                    >
                                        Book This Slot
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-xl">No available classes at the moment.</p>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 1s ease-in;
                }
                .animate-parallax {
                    animation: parallax 20s linear infinite;
                }
                .animate-slide-in-up {
                    animation: slideInUp 1s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(60px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
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