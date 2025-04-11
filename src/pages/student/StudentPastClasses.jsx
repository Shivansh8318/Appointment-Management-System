import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentNavbar from "../../components/StudentNavbar";
import PastClassDetails from "../../components/PastClassDetails";

export default function StudentPastClasses() {
    const { user } = useAuthStore();
    const [pastClasses, setPastClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeTab, setActiveTab] = useState("past");
    const [studentNotes, setStudentNotes] = useState({});
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/student/signin");
        }
    }, [user, navigate]);

    const fetchTeacherUsername = async (teacherId) => {
        try {
            const usernameQuery = query(collection(db, "usernames"));
            const usernameSnapshot = await getDocs(usernameQuery);
            let teacherUsername = null;

            usernameSnapshot.forEach(doc => {
                if (doc.data().uid === teacherId) {
                    teacherUsername = doc.id;
                }
            });

            if (!teacherUsername) {
                console.warn(`No username found for teacherId: ${teacherId}`);
                return "unknown";
            }

            return teacherUsername;
        } catch (error) {
            console.error("Error fetching teacher username:", error);
            return "unknown";
        }
    };

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "appointments"),
            where("studentId", "==", user.uid),
            where("completed", "==", true)
        );
        
        const unsubscribeAppointments = onSnapshot(q, async (snapshot) => {
            let classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            classes = await Promise.all(classes.map(async (cls) => {
                const teacherUsername = await fetchTeacherUsername(cls.teacherId);
                console.log(`Fetched username for teacherId ${cls.teacherId}: ${teacherUsername}`);
                return { ...cls, teacherUsername };
            }));

            console.log("Past classes with updated usernames:", classes);

            setPastClasses(classes);

            const newNotes = { ...studentNotes };
            classes.forEach(cls => {
                const noteKey = `${cls.subject}_${cls.teacherName}_${cls.id}`;
                if (!studentNotes[noteKey] && cls.notes) {
                    newNotes[noteKey] = cls.notes;
                }
            });
            setStudentNotes(newNotes);
        }, (error) => {
            console.error("Error fetching past classes:", error);
        });

        const notesQuery = query(
            collection(db, "studentNotes"),
            where("studentId", "==", user.uid)
        );
        
        const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
            const notesData = {};
            snapshot.docs.forEach(doc => {
                const { appointmentId, subject, teacherName, content } = doc.data();
                const noteKey = `${subject}_${teacherName}_${appointmentId}`;
                notesData[noteKey] = content;
            });
            setStudentNotes(prevNotes => ({ ...prevNotes, ...notesData }));
        }, (error) => {
            console.error("Error fetching student notes:", error);
        });

        return () => {
            unsubscribeAppointments();
            unsubscribeNotes();
        };
    }, [user]);

    const saveNote = async (classId, note) => {
        if (saving || studentNotes[`${pastClasses.find(cls => cls.id === classId)?.subject}_${pastClasses.find(cls => cls.id === classId)?.teacherName}_${classId}`] === note) return;
        setSaving(true);
        try {
            const app = pastClasses.find(cls => cls.id === classId);
            if (!app) throw new Error("Appointment not found");
            const noteKey = `${app.subject}_${app.teacherName}_${classId}`;
            const notesQuery = query(
                collection(db, "studentNotes"),
                where("studentId", "==", user.uid),
                where("appointmentId", "==", classId),
                where("subject", "==", app.subject),
                where("teacherName", "==", app.teacherName)
            );
            
            const existingNotes = await getDocs(notesQuery);
            
            if (existingNotes.docs.length > 0) {
                const noteDocId = existingNotes.docs[0].id;
                await updateDoc(doc(db, "studentNotes", noteDocId), { 
                    content: note,
                    updatedAt: new Date().toISOString()
                });
            } else {
                await setDoc(doc(collection(db, "studentNotes")), {
                    studentId: user.uid,
                    appointmentId: classId,
                    subject: app.subject,
                    teacherName: app.teacherName,
                    content: note,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            setStudentNotes(prev => ({
                ...prev,
                [noteKey]: note
            }));
            alert("Note saved successfully!");
        } catch (error) {
            console.error("Error saving note:", error);
            alert("Failed to save note.");
        } finally {
            setSaving(false);
        }
    };

    const shareTeacher = (teacherUsername, teacherName) => {
        if (!teacherUsername || teacherUsername === "unknown") {
            console.error("Invalid teacherUsername:", teacherUsername);
            alert("Unable to share: Teacher username not found.");
            return;
        }
        const shareUrl = `${window.location.origin}/teacher/${teacherUsername}`;
        const shareText = `Check out ${teacherName}'s profile and book their classes here: ${shareUrl}`;
        console.log("Generated share URL:", shareUrl);
    
        if (navigator.share) {
            navigator.share({
                title: `Recommend ${teacherName}`,
                text: shareText,
                url: shareUrl,
            }).catch((error) => {
                console.error("Error sharing:", error);
                fallbackShare(shareUrl);
            });
        } else {
            fallbackShare(shareUrl);
        }
    };

    const fallbackShare = (shareUrl) => {
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                alert("Link copied to clipboard! Share it with your friends.");
            })
            .catch((error) => {
                console.error("Error copying to clipboard:", error);
                alert("Failed to copy link. Here it is: " + shareUrl);
            });
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-blue-50 text-gray-900 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 z-0 animate-parallax">
                <svg className="w-full h-full opacity-20" viewBox="0 0 1440 320">
                    <path fill="#a78bfa" fillOpacity="0.4" d="M0,96L60,112C120,128,240,160,360,165.3C480,171,600,149,720,133.3C840,117,960,107,1080,112C1200,117,1320,139,1380,149.3L1440,160L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
                </svg>
            </div>
            <Header />
            <StudentNavbar setActiveTab={setActiveTab} />
            <section className="flex-grow py-16 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-slide-in-up transform hover:scale-105 transition-all duration-500">
                        Past Classes
                    </h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {pastClasses.length > 0 ? (
                            pastClasses.map(app => {
                                const noteKey = `${app.subject}_${app.teacherName}_${app.id}`;
                                return (
                                    <li
                                        key={app.id}
                                        className="p-8 bg-white/90 rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-3 hover:rotate-1 transition-all duration-500 border border-gray-200 animate-orbit-in cursor-pointer transform perspective-1000"
                                        onClick={() => setSelectedClass(selectedClass?.id === app.id ? null : app)}
                                    >
                                        <p className="text-2xl font-semibold text-purple-600 mb-2 animate-fade-in-delay">{app.subject}</p>
                                        <p className="text-gray-600 animate-fade-in-delay" style={{ animationDelay: "0.1s" }}>Teacher: {app.teacherName}</p>
                                        <p className="text-gray-600 animate-fade-in-delay" style={{ animationDelay: "0.2s" }}>{app.date} at {app.time}</p>
                                        <p className="text-green-600 animate-fade-in-delay" style={{ animationDelay: "0.3s" }}>Completed</p>
                                        {app.homework && (
                                            <p className="text-gray-700 mt-2 animate-fade-in-delay" style={{ animationDelay: "0.4s" }}>
                                                Homework: {app.homework}
                                            </p>
                                        )}
                                        <textarea
                                            value={studentNotes[noteKey] || ""}
                                            onChange={(e) => setStudentNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                            onBlur={(e) => saveNote(app.id, e.target.value)}
                                            placeholder={studentNotes[noteKey] || "Add a note..."}
                                            className="w-full mt-4 p-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 animate-fade-in-delay resize-none"
                                            style={{ animationDelay: "0.5s" }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                shareTeacher(app.teacherUsername, app.teacherName);
                                            }}
                                            className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 animate-bounce-in"
                                        >
                                            Share Teacher
                                        </button>
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-gray-600 text-xl animate-fade-in-delay">No past classes yet.</p>
                        )}
                    </ul>
                    {selectedClass && <PastClassDetails appointment={selectedClass} studentId={user.uid} />}
                </div>
            </section>
            <Footer />
            <style jsx>{`
                .animate-orbit-in {
                    animation: orbitIn 1.2s ease-out;
                }
                .animate-slide-in-up {
                    animation: slideInUp 1s ease-out;
                }
                .animate-fade-in-delay {
                    animation: fadeIn 1s ease-in;
                }
                .animate-bounce-in {
                    animation: bounceIn 1.5s ease-in-out;
                }
                .animate-parallax {
                    animation: parallax 20s linear infinite;
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
                @keyframes bounceIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); }
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