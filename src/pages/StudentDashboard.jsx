import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StudentNavbar from "../components/StudentNavbar";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const [student, setStudent] = useState(null);
    const [activeTab, setActiveTab] = useState("home");
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: "", experience: "", subjects: [], phone: "" });
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        if (user) {
            const fetchStudentDetails = async () => {
                const studentRef = doc(db, "students", user.uid);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) {
                    const data = studentSnap.data();
                    setStudent(data);
                    setFormData({ name: data.name, experience: data.experience, subjects: data.subjects || [], phone: data.phone });
                    const savedProfilePic = localStorage.getItem(`profilePic_${user.uid}`);
                    setProfilePic(savedProfilePic || "https://via.placeholder.com/150");
                }
            };
            fetchStudentDetails();
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                try {
                    localStorage.setItem(`profilePic_${user.uid}`, base64String);
                    setProfilePic(base64String);
                    setStudent(prev => ({ ...prev, profilePic: base64String }));
                    await updateDoc(doc(db, "students", user.uid), { hasProfilePic: true });
                } catch (error) {
                    console.error("Error saving profile pic to localStorage:", error);
                    alert("Failed to save profile picture.");
                }
            };
            reader.onerror = () => {
                console.error("Error reading file");
                alert("Failed to process the image.");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const studentRef = doc(db, "students", user.uid);
            await updateDoc(studentRef, {
                name: formData.name,
                experience: formData.experience,
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
            <StudentNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 flex flex-col items-center relative z-10">
                {student && (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-700/30 animate-orbit-in transform hover:scale-105 transition-all duration-700">
                        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                            <div className="relative group">
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg transform group-hover:rotate-6 transition-all duration-500 animate-pulse-slow"
                                />
                                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full cursor-pointer">
                                    <span className="text-white font-medium">Change</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 text-center md:text-left animate-fade-in">
                                {editMode ? (
                                    <>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 mb-4 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Name"
                                        />
                                        <input
                                            type="text"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            className="w-full p-3 mb-4 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Year"
                                        />
                                        <input
                                            type="text"
                                            value={formData.subjects.join(", ")}
                                            onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(", ") })}
                                            className="w-full p-3 mb-4 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Subjects (comma-separated)"
                                        />
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full p-3 mb-6 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Phone"
                                        />
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={handleEditSubmit}
                                                className="flex-1 py-3 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="flex-1 py-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                            Welcome, {student.name}!
                                        </h2>
                                        <p className="text-lg text-gray-200 mb-2">Year: {student.experience}</p>
                                        <p className="text-lg text-gray-200 mb-2">Subjects: {student.subjects?.join(", ")}</p>
                                        <p className="text-lg text-gray-200 mb-6">Phone: {student.phone}</p>
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                                        >
                                            Edit Profile
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </section>
            <Footer />
            <style jsx>{`
                .animate-orbit-in {
                    animation: orbitIn 1.5s ease-out;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-in;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 3s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: floatSlow 10s ease-in-out infinite;
                }
                @keyframes orbitIn {
                    0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulseSlow {
                    0% { opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { opacity: 0.8; }
                }
                @keyframes floatSlow {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }
            `}</style>
        </div>
    );
}