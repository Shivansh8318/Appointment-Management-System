import { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentNavbar from "../../components/StudentNavbar";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const [student, setStudent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: "", subjects: [], phone: "" });
    const [profilePic, setProfilePic] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [pendingHomework, setPendingHomework] = useState([]);
    const [quote, setQuote] = useState("");

    // Fetch student details and profile picture
    useEffect(() => {
        if (user) {
            const fetchStudentDetails = async () => {
                const studentRef = doc(db, "students", user.uid);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    setStudent(data);
                    setFormData({ name: data.name, subjects: data.subjects || [], phone: data.phone });
                    const savedProfilePic = localStorage.getItem(`profilePic_${user.uid}`);
                    setProfilePic(savedProfilePic || "https://via.placeholder.com/150");
                }
            };
            fetchStudentDetails();

            // Fetch available classes
            const slotsQuery = query(collection(db, "slots"), where("booked", "==", false));
            const unsubscribeSlots = onSnapshot(slotsQuery, (snapshot) => {
                setAvailableClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3));
            });

            // Fetch pending homework
            const homeworkQuery = query(
                collection(db, "appointments"),
                where("studentId", "==", user.uid),
                where("homework", "!=", ""),
                where("homeworkCompleted", "==", false)
            );
            const unsubscribeHomework = onSnapshot(homeworkQuery, (snapshot) => {
                setPendingHomework(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3));
            });

            // Fetch a random motivational quote (mocked here)
            const quotes = [
                "The only way to do great work is to love what you do. – Steve Jobs",
                "Education is the most powerful weapon you can use to change the world. – Nelson Mandela",
                "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
            ];
            setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

            return () => {
                unsubscribeSlots();
                unsubscribeHomework();
            };
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                localStorage.setItem(`profilePic_${user.uid}`, base64String);
                setProfilePic(base64String);
                await updateDoc(doc(db, "students", user.uid), { hasProfilePic: true });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const studentRef = doc(db, "students", user.uid);
            await updateDoc(studentRef, {
                name: formData.name,
                subjects: formData.subjects,
                phone: formData.phone,
            });
            setStudent({ ...student, ...formData });
            setEditMode(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-float-slow">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#a5b4fc" fillOpacity="0.3" d="M0,224L60,208C120,192,240,160,360,149.3C480,139,600,149,720,165.3C840,181,960,203,1080,197.3C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={() => {}} />
            <section className="flex-grow py-16 px-6 relative z-10 flex">
                {/* Sidebar */}
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
                                    {student?.name}
                                </h2>
                                <p className="text-gray-200 mb-2">Subjects: {student?.subjects?.join(", ")}</p>
                                <p className="text-gray-200 mb-4">Phone: {student?.phone}</p>
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

                {/* Main Content */}
                <div className="w-3/4 pl-6 space-y-12">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Quick Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-indigo-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-indigo-300">{pendingHomework.length}</p>
                                <p className="text-gray-200">Pending Homework</p>
                            </div>
                            <div className="p-4 bg-teal-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-teal-300">{availableClasses.length}</p>
                                <p className="text-gray-200">Available Classes</p>
                            </div>
                            <div className="p-4 bg-purple-900/50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-purple-300">5</p> {/* Placeholder */}
                                <p className="text-gray-200">Completed Classes</p>
                            </div>
                        </div>
                    </div>

                    {/* Available Classes */}
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Available Classes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableClasses.length > 0 ? (
                                availableClasses.map(slot => (
                                    <div
                                        key={slot.id}
                                        className="p-4 bg-indigo-900/50 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-blue-300">{slot.subject}</p>
                                        <p className="text-gray-200">Teacher: {slot.teacherName}</p>
                                        <p className="text-gray-200">{slot.date} at {slot.time}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No available classes right now.</p>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.href = "/student/available-classes"}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            View All Classes
                        </button>
                    </div>

                    {/* Pending Homework */}
                    <div className="bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700/30 animate-fade-in">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                            Pending Homework
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pendingHomework.length > 0 ? (
                                pendingHomework.map(hw => (
                                    <div
                                        key={hw.id}
                                        className="p-4 bg-teal-900/50 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                                    >
                                        <p className="text-lg font-semibold text-teal-300">{hw.subject}</p>
                                        <p className="text-gray-200">Teacher: {hw.teacherName}</p>
                                        <p className="text-gray-200">Due: {hw.date}</p>
                                        <p className="text-gray-300 mt-2">{hw.homework}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400">No pending homework. Great job!</p>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.href = "/student/homework"}
                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 shadow-lg text-white font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            View All Homework
                        </button>
                    </div>

                    {/* Motivational Quote */}
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