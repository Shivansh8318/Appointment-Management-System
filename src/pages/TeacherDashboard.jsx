import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, query, onSnapshot, where, doc, getDoc, updateDoc } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TeacherNavbar from "../components/TeacherNavbar";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const { user, logout } = useAuthStore();
    const [teacher, setTeacher] = useState(null);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [newSlot, setNewSlot] = useState({ dateTime: null, subject: "" });
    const [editSlot, setEditSlot] = useState(null);
    const [activeTab, setActiveTab] = useState("home");
    const [selectedPastAppointment, setSelectedPastAppointment] = useState(null);
    const [homeworkInputs, setHomeworkInputs] = useState({});
    const [profilePic, setProfilePic] = useState(null);
    const [notes, setNotes] = useState({});
    const [saving, setSaving] = useState(false); // Control saving state
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const fetchTeacherDetails = async () => {
                const teacherRef = doc(db, "teachers", user.uid);
                const teacherSnap = await getDoc(teacherRef);
                if (teacherSnap.exists()) {
                    const data = teacherSnap.data();
                    setTeacher(data);
                    const savedProfilePic = localStorage.getItem(`profilePic_${user.uid}`);
                    setProfilePic(savedProfilePic || "https://via.placeholder.com/150");
                    if (data.subjects && data.subjects.length > 0) {
                        setNewSlot(prev => ({ ...prev, subject: data.subjects[0] }));
                    }
                }
            };

            fetchTeacherDetails();

            const slotsQuery = query(collection(db, "slots"), where("teacherId", "==", user.uid));
            const appointmentsQuery = query(collection(db, "appointments"), where("teacherId", "==", user.uid));

            const unsubSlots = onSnapshot(slotsQuery, (snapshot) => {
                setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(slot => !slot.booked));
            });

            const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
                const upcoming = [];
                const past = [];
                snapshot.docs.forEach(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    if (data.completed) {
                        past.push(data);
                        if (data.notes) setNotes(prev => ({ ...prev, [data.id]: data.notes }));
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                try {
                    localStorage.setItem(`profilePic_${user.uid}`, base64String);
                    setProfilePic(base64String);
                    setTeacher(prev => ({ ...prev, profilePic: base64String }));
                    await updateDoc(doc(db, "teachers", user.uid), { hasProfilePic: true });
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

    const addSlot = async () => {
        if (!newSlot.dateTime || !newSlot.subject) return alert("All fields are required.");
        await addDoc(collection(db, "slots"), {
            teacherId: user.uid,
            teacherName: teacher?.name || "Unknown",
            date: newSlot.dateTime.toISOString().split("T")[0],
            time: newSlot.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            subject: newSlot.subject,
            booked: false,
        });
        setNewSlot({ dateTime: null, subject: teacher?.subjects?.[0] || "" });
    };

    const editSlotHandler = (slot) => {
        setEditSlot(slot);
    };

    const saveEditedSlot = async (slotId) => {
        if (!editSlot.dateTime || !editSlot.subject) return alert("All fields are required.");
        const date = editSlot.dateTime.toISOString().split("T")[0];
        const time = editSlot.dateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        await updateDoc(doc(db, "slots", slotId), { date, time, subject: editSlot.subject });
        setEditSlot(null);
        alert("Slot updated!");
    };

    const markAsCompleted = async (appointmentId) => {
        await updateDoc(doc(db, "appointments", appointmentId), { completed: true });
    };

    const updateAppointment = async (appointmentId, newDateTime) => {
        const date = newDateTime.toISOString().split("T")[0];
        const time = newDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        await updateDoc(doc(db, "appointments", appointmentId), { date, time });
        alert("Appointment updated!");
    };

    const sendHomework = async (appointmentId) => {
        const homework = homeworkInputs[appointmentId]?.trim();
        if (!homework) return alert("Please enter homework before sending.");
        await updateDoc(doc(db, "appointments", appointmentId), { homework });
        alert("Homework sent!");
        setHomeworkInputs(prev => ({ ...prev, [appointmentId]: "" }));
    };

    const handleHomeworkChange = (appointmentId, value) => {
        setHomeworkInputs(prev => ({ ...prev, [appointmentId]: value }));
    };

    const startClass = () => {
        navigate("/student/dummy-class");
    };

    const saveNote = async (appointmentId, note) => {
        if (saving || notes[appointmentId] === note) return; // Prevent multiple saves
        setSaving(true);
        try {
            await updateDoc(doc(db, "appointments", appointmentId), { notes: note });
            setNotes(prev => ({ ...prev, [appointmentId]: note }));
            alert("Note saved successfully!");
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note.");
        } finally {
            setSaving(false);
        }
    };

    const viewPastAppointmentDetails = (appointment) => {
        setSelectedPastAppointment(appointment === selectedPastAppointment ? null : appointment);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-10" viewBox="0 0 1440 320">
                    <path fill="#c4b5fd" fillOpacity="0.3" d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,133.3C840,117,960,107,1080,112C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                </svg>
            </div>
            <Header />
            <TeacherNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 flex flex-col items-center relative z-10">
                {activeTab === "home" && teacher && (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-700/30 transform hover:scale-105 transition-all duration-700">
                        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                            <div className="relative group">
                                <img
                                    src={profilePic}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg transition-all duration-500 animate-pulse-slow"
                                />
                                <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-full cursor-pointer">
                                    <span className="text-white font-medium">Change</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="flex-1 text-center md:text-left animate-fade-in">
                                <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
                                    Welcome, {teacher.name}!
                                </h2>
                                <p className="text-lg text-gray-200 mb-2">Qualification: {teacher.qualification}</p>
                                <p className="text-lg text-gray-200 mb-2">Experience: {teacher.experience} years</p>
                                <p className="text-lg text-gray-200 mb-2">Subjects: {teacher.subjects?.join(", ")}</p>
                                <p className="text-lg text-gray-200 mb-6">Phone: {teacher.phone}</p>
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

                {activeTab === "addSlot" && (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-700/30">
                        <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Add Available Slot
                        </h3>
                        <DatePicker
                            selected={newSlot.dateTime}
                            onChange={(date) => setNewSlot({ ...newSlot, dateTime: date })}
                            showTimeSelect
                            dateFormat="Pp"
                            className="w-full p-3 mb-4 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                            value={newSlot.subject}
                            onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                            className="w-full p-3 mb-6 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {teacher?.subjects?.length > 0 ? (
                                teacher.subjects.map((subject, index) => (
                                    <option key={index} value={subject}>
                                        {subject}
                                    </option>
                                ))
                            ) : (
                                <option value="">No subjects available</option>
                            )}
                        </select>
                        <button
                            onClick={addSlot}
                            className="w-full py-3 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300 hover:shadow-xl"
                        >
                            Add Slot
                        </button>
                    </div>
                )}

                {activeTab === "slots" && (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-700/30">
                        <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Your Available Slots
                        </h3>
                        <ul>
                            {slots.length > 0 ? slots.map(slot => (
                                <li key={slot.id} className="bg-gray-700/50 p-4 mt-2 rounded-lg shadow-lg flex justify-between items-center">
                                    {editSlot?.id === slot.id ? (
                                        <>
                                            <DatePicker
                                                selected={editSlot.dateTime || new Date(`${slot.date} ${slot.time}`)}
                                                onChange={(date) => setEditSlot({ ...editSlot, dateTime: date })}
                                                showTimeSelect
                                                dateFormat="Pp"
                                                className="w-2/3 p-3 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <input
                                                type="text"
                                                value={editSlot.subject}
                                                onChange={(e) => setEditSlot({ ...editSlot, subject: e.target.value })}
                                                className="w-1/3 p-3 ml-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={() => saveEditedSlot(slot.id)}
                                                className="ml-2 py-2 px-4 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300"
                                            >
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-lg text-gray-200">{slot.subject} on {slot.date} at {slot.time}</span>
                                            <button
                                                onClick={() => editSlotHandler(slot)}
                                                className="py-2 px-4 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg font-medium transition-all duration-300"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </li>
                            )) : <p className="text-gray-400 text-center">No available slots.</p>}
                        </ul>
                    </div>
                )}

                {activeTab === "appointments" && (
                    <div className="w-full max-w-3xl bg-gradient-to-br from-gray-800/70 to-indigo-900/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-700/30">
                        <h3 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Booked Appointments
                        </h3>
                        <ul>
                            {appointments.length > 0 ? appointments.map(app => (
                                <li key={app.id} className="bg-gray-700/50 p-4 mt-2 rounded-lg shadow-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="text-lg text-gray-200">
                                            <p className="font-semibold">{app.studentName} - {app.subject}</p>
                                            <p>{app.date} at {app.time}</p>
                                            {app.homework && <p className="text-gray-300">Homework: {app.homework}</p>}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => markAsCompleted(app.id)}
                                                className="py-2 px-4 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg font-medium transition-all duration-300"
                                            >
                                                Mark Completed
                                            </button>
                                            <button
                                                onClick={startClass}
                                                className="py-2 px-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg font-medium transition-all duration-300"
                                            >
                                                Start Class
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <DatePicker
                                            selected={new Date(`${app.date} ${app.time}`)}
                                            onChange={(date) => updateAppointment(app.id, date)}
                                            showTimeSelect
                                            dateFormat="Pp"
                                            className="w-full p-3 mb-2 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder="Send Homework"
                                                value={homeworkInputs[app.id] || ""}
                                                onChange={(e) => handleHomeworkChange(app.id, e.target.value)}
                                                className="w-full p-3 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                onClick={() => sendHomework(app.id)}
                                                className="py-2 px-4 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg font-medium transition-all duration-300"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            )) : <p className="text-gray-400 text-center">No booked appointments.</p>}
                        </ul>
                    </div>
                )}

                {activeTab === "past" && (
                    <section className="flex-grow py-16 px-6 relative z-10">
                        <div className="max-w-6xl mx-auto text-center">
                            <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-slide-in-up transform hover:scale-105 transition-all duration-500">
                                Past Appointments
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {pastAppointments.length > 0 ? (
                                    pastAppointments.map(app => (
                                        <li
                                            key={app.id}
                                            className="p-8 bg-gradient-to-br from-purple-900/50 to-gray-800/50 rounded-3xl shadow-2xl hover:shadow-3xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border border-purple-500/30 animate-orbit-in cursor-pointer transform perspective-1000"
                                            onClick={() => setSelectedPastAppointment(selectedPastAppointment?.id === app.id ? null : app)}
                                        >
                                            <p className="text-2xl font-semibold text-purple-300 mb-2 animate-fade-in-delay">{app.subject}</p>
                                            <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.1s" }}>Student: {app.studentName}</p>
                                            <p className="text-gray-200 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>{app.date} at {app.time}</p>
                                            <p className="text-green-400 animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>Completed</p>
                                            {app.homework && (
                                                <p className="text-gray-300 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.4s" }}>
                                                    Homework: {app.homework}
                                                </p>
                                            )}
                                            <textarea
                                                value={notes[app.id] || ""}
                                                onChange={(e) => setNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                                                onBlur={(e) => saveNote(app.id, e.target.value)}
                                                placeholder="Add a note..."
                                                className="w-full mt-4 p-3 bg-gray-700/50 rounded-lg text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 animate-fade-in-delay resize-none"
                                                style={{ animationDelay: "0.5s" }}
                                            />
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-xl animate-fade-in-delay">No past appointments yet.</p>
                                )}
                            </ul>
                            {selectedPastAppointment && (
                                <div className="mt-10 max-w-3xl mx-auto p-8 bg-gradient-to-br from-purple-900/50 to-gray-800/50 rounded-3xl shadow-2xl border border-purple-500/30">
                                    <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        History with {selectedPastAppointment.studentName}
                                    </h4>
                                    {pastAppointments
                                        .filter(app => app.studentId === selectedPastAppointment.studentId)
                                        .map(app => (
                                            <div key={app.id} className="mb-4 text-lg text-gray-200">
                                                <p>{app.subject} on {app.date} at {app.time}</p>
                                                {app.homework && <p className="text-gray-300">Homework: {app.homework}</p>}
                                                {app.notes && <p className="text-gray-300">Notes: {app.notes}</p>}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </section>
            <Footer />
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 1s ease-in;
                }
                .animate-pulse-slow {
                    animation: pulseSlow 3s ease-in-out infinite;
                }
                .animate-parallax {
                    animation: parallax 20s linear infinite;
                }
                .animate-orbit-in {
                    animation: orbitIn 1.2s ease-out;
                }
                .animate-slide-in-up {
                    animation: slideInUp 1s ease-out;
                }
                .animate-fade-in-delay {
                    animation: fadeIn 1s ease-in;
                }
                @keyframes orbitIn {
                    0% { transform: scale(0.9) rotate(-5deg) translateZ(-50px); opacity: 0; }
                    100% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 1; }
                }
                @keyframes slideInUp {
                    from { transform: translateY(60px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
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
                @keyframes parallax {
                    0% { transform: translateY(0) translateX(0); }
                    50% { transform: translateY(-20px) translateX(10px); }
                    100% { transform: translateY(0) translateX(0); }
                }
            `}</style>
        </div>
    );
}