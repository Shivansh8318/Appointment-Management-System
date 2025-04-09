import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherHome() {
    const { user, loading, logout } = useAuthStore();
    const [teacher, setTeacher] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: "", experience: "", subjects: [], phone: "" });
    const [profilePic, setProfilePic] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [quote, setQuote] = useState("");
    const navigate = useNavigate();

    // Fetch teacher details, slots, appointments, and quote only if authenticated
    useEffect(() => {
        if (loading || !user || user.role !== "teacher") return; // Wait for loading or skip if not a teacher

        const fetchTeacherDetails = async () => {
            const teacherRef = doc(db, "teachers", user.uid);
            const teacherSnap = await getDoc(teacherRef);
            if (teacherSnap.exists()) {
                const data = teacherSnap.data();
                setTeacher(data);
                setFormData({
                    name: data.name || "",
                    experience: data.experience || "",
                    subjects: data.subjects || [],
                    phone: data.phone || "",
                });
                const savedProfilePic = localStorage.getItem(`profilePic_${user.uid}`);
                setProfilePic(savedProfilePic || "https://via.placeholder.com/150");
            } else {
                setTeacher(null);
                alert("Teacher data not found. Please sign up again.");
                logout();
                navigate("/teacher/signin", { replace: true });
            }
        };
        fetchTeacherDetails();

        const slotsQuery = query(collection(db, "slots"), where("teacherId", "==", user.uid), where("booked", "==", false));
        const unsubscribeSlots = onSnapshot(slotsQuery, (snapshot) => {
            setAvailableSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3));
        });

        const appointmentsQuery = query(
            collection(db, "appointments"),
            where("teacherId", "==", user.uid),
            where("completed", "==", false)
        );
        const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            setBookedAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3));
        });

        const quotes = [
            "The best way to predict the future is to create it. – Peter Drucker",
            "Teaching is the greatest act of optimism. – Colleen Wilcox",
            "The art of teaching is the art of assisting discovery. – Mark Van Doren",
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        return () => {
            unsubscribeSlots();
            unsubscribeAppointments();
        };
    }, [user, loading, logout, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                localStorage.setItem(`profilePic_${user.uid}`, base64String);
                setProfilePic(base64String);
                await updateDoc(doc(db, "teachers", user.uid), { hasProfilePic: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const teacherRef = doc(db, "teachers", user.uid);
            await updateDoc(teacherRef, {
                name: formData.name,
                experience: formData.experience,
                subjects: formData.subjects,
                phone: formData.phone,
            });
            setTeacher({ ...teacher, ...formData });
            setEditMode(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    if (loading) return <div>Loading...</div>;

    // If not authenticated or not a teacher, show a minimal UI without redirecting
    if (!user || user.role !== "teacher") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col items-center justify-center">
                <p className="text-2xl">Please sign in as a teacher to access this page.</p>
                <button
                    onClick={() => navigate("/teacher/signin")}
                    className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white font-medium"
                >
                    Go to Sign In
                </button>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col items-center justify-center">
                <p className="text-2xl">Loading teacher data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-float-slow">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#a5b4fc" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6 relative z-10 flex">
                <div className="w-1/4 pr-6">
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-slide-in-left sticky top-20">
                        <div className="relative group mb-6">
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg animate-pulse-slow"
                            />
                            <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full cursor-pointer">
                                <span className="text-white font-medium">Change</span>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                        {editMode ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full p-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Experience"
                                />
                                <input
                                    type="text"
                                    value={formData.subjects.join(", ")}
                                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(", ").map(s => s.trim()) })}
                                    className="w-full p-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Subjects (comma-separated)"
                                />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Phone"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleEditSubmit}
                                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                    {teacher?.name}
                                </h2>
                                <p className="text-gray-200 mb-2">Experience: {teacher?.experience} years</p>
                                <p className="text-gray-200 mb-2">Subjects: {teacher?.subjects?.join(", ")}</p>
                                <p className="text-gray-200 mb-4">Phone: {teacher?.phone}</p>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="w-full py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="mt-6 w-full py-2 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div className="w-3/4 pl-6 space-y-12">
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Quick Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-indigo-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-indigo-300">{availableSlots.length}</p>
                                <p className="text-gray-200">Available Slots</p>
                            </div>
                            <div className="p-4 bg-teal-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-teal-300">{bookedAppointments.length}</p>
                                <p className="text-gray-200">Booked Appointments</p>
                            </div>
                            <div className="p-4 bg-purple-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-purple-300">5</p>
                                <p className="text-gray-200">Completed Classes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Available Slots
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <div
                                        key={slot.id}
                                        className="p-4 bg-indigo-900/50 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-blue-300">{slot.subject}</p>
                                        <p className="text-gray-200">{slot.date} at {slot.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No available slots right now.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/teacher/slots")}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            View All Slots
                        </button>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Booked Appointments
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bookedAppointments.length > 0 ? (
                                bookedAppointments.map(app => (
                                    <div
                                        key={app.id}
                                        className="p-4 bg-teal-900/50 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-teal-300">{app.subject}</p>
                                        <p className="text-gray-200">Student: {app.studentName}</p>
                                        <p className="text-gray-200">{app.date} at {app.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No booked appointments yet.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/teacher/appointments")}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            View All Appointments
                        </button>
                    </div>
                    <div className="bg-gradient-to-br from-purple-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in text-center">
                        <p className="text-xl italic text-gray-200">"{quote}"</p>
                    </div>
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-slide-in-left { animation: slideInLeft 1s ease-out; }
                .animate-fade-in { animation: fadeIn 1s ease-in; }
                .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
                .animate-float-slow { animation: floatSlow 10s ease-in-out infinite; }
                @keyframes slideInLeft { 0% { transform: translateX(-100px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulseSlow { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }
                @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
            `}</style>
        </div>
    );
}