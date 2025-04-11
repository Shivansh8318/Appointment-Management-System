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

    useEffect(() => {
        if (loading || !user || user.role !== "teacher") return;

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

    if (!user || user.role !== "teacher") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col items-center justify-center">
                <p className="text-2xl text-gray-800">Please sign in as a teacher to access this page.</p>
                <button
                    onClick={() => navigate("/teacher/signin")}
                    className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
                >
                    Go to Sign In
                </button>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col items-center justify-center">
                <p className="text-2xl text-gray-800">Loading teacher data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6 flex">
                <div className="w-1/4 pr-6">
                    <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-gray-200 sticky top-20">
                        <div className="relative group mb-6">
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-24 h-24 mx-auto rounded-full object-cover shadow-md"
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
                                    className="w-full p-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full p-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Experience"
                                />
                                <input
                                    type="text"
                                    value={formData.subjects.join(", ")}
                                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(", ").map(s => s.trim()) })}
                                    className="w-full p-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Subjects (comma-separated)"
                                />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Phone"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleEditSubmit}
                                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md transition-all duration-300"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="flex-1 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
                                    {teacher?.name}
                                </h2>
                                <p className="text-gray-700 mb-2">Experience: {teacher?.experience} years</p>
                                <p className="text-gray-700 mb-2">Subjects: {teacher?.subjects?.join(", ")}</p>
                                <p className="text-gray-700 mb-4">Phone: {teacher?.phone}</p>
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="w-full py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md transition-all duration-300"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="mt-6 w-full py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
                <div className="w-3/4 pl-6 space-y-12">
                    <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Quick Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-100 rounded-xl text-center">
                                <p className="text-3xl font-bold text-blue-500">{availableSlots.length}</p>
                                <p className="text-gray-700">Available Slots</p>
                            </div>
                            <div className="p-4 bg-teal-100 rounded-xl text-center">
                                <p className="text-3xl font-bold text-teal-500">{bookedAppointments.length}</p>
                                <p className="text-gray-700">Booked Appointments</p>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-xl text-center">
                                <p className="text-3xl font-bold text-purple-500">5</p>
                                <p className="text-gray-700">Completed Classes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Available Slots
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableSlots.length > 0 ? (
                                availableSlots.map(slot => (
                                    <div
                                        key={slot.id}
                                        className="p-4 bg-blue-100 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-blue-500">{slot.subject}</p>
                                        <p className="text-gray-700">{slot.date} at {slot.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No available slots right now.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/teacher/slots")}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all duration-300"
                        >
                            View All Slots
                        </button>
                    </div>
                    <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Booked Appointments
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bookedAppointments.length > 0 ? (
                                bookedAppointments.map(app => (
                                    <div
                                        key={app.id}
                                        className="p-4 bg-teal-100 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-teal-500">{app.subject}</p>
                                        <p className="text-gray-700">Student: {app.studentName}</p>
                                        <p className="text-gray-700">{app.date} at {app.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600">No booked appointments yet.</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate("/teacher/appointments")}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white shadow-md transition-all duration-300"
                        >
                            View All Appointments
                        </button>
                    </div>
                    <div className="bg-white/90 p-6 rounded-3xl shadow-lg border border-gray-200 text-center">
                        <p className="text-xl italic text-gray-700">"{quote}"</p>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}