import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db, doc, setDoc } from "../../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentNavbar from "../../components/StudentNavbar";

export default function AvailableClasses() {
    const { user } = useAuthStore();
    const [searchParams] = useSearchParams();
    const teacherId = searchParams.get("teacherId");
    const [slotsByTeacher, setSlotsByTeacher] = useState({});
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slotTime, setSlotTime] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    useEffect(() => {
        const q = query(collection(db, "slots"), where("booked", "==", false), ...(teacherId ? [where("teacherId", "==", teacherId)] : []));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const grouped = slots.reduce((acc, slot) => {
                if (!acc[slot.teacherName]) acc[slot.teacherName] = {};
                if (!acc[slot.teacherName][slot.date]) acc[slot.teacherName][slot.date] = [];
                acc[slot.teacherName][slot.date].push(slot);
                return acc;
            }, {});
            setSlotsByTeacher(grouped);
        });
        return () => unsubscribe();
    }, [teacherId]);

    const bookSlot = async (slot) => {
        if (!slotTime) {
            alert("Please select a time!");
            return;
        }
        try {
            await setDoc(doc(db, "appointments", `${slot.teacherId}_${slot.date}_${slotTime}`), {
                teacherId: slot.teacherId,
                teacherName: slot.teacherName,
                studentId: user.uid,
                studentName: user.name,
                subject: slot.subject,
                date: slot.date,
                time: slotTime,
                completed: false,
            });
            await setDoc(doc(db, "slots", slot.id), { booked: true }, { merge: true });
            alert("Slot booked successfully!");
            setSelectedTeacher(null);
            setSlotTime("");
        } catch (error) {
            console.error("Error booking slot:", error);
            alert("Failed to book slot.");
        }
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const changeMonth = (offset) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + offset);
        setCurrentMonth(newMonth);
    };

    const selectDate = (date) => {
        if (date) {
            setSelectedDate(date);
            setSlotTime("");
        }
    };

    const availableDates = selectedTeacher ? Object.keys(slotsByTeacher[selectedTeacher] || {}).sort() : [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const availableSlotsForDate = selectedTeacher && slotsByTeacher[selectedTeacher][selectedDate.toISOString().split("T")[0]] || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white flex flex-col">
            <Header />
            <StudentNavbar setActiveTab={() => {}} />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-12">
                        Available Classes
                    </h2>

                    {!selectedTeacher && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.keys(slotsByTeacher).length > 0 ? (
                                Object.keys(slotsByTeacher).map(teacherName => (
                                    <button
                                        key={teacherName}
                                        onClick={() => setSelectedTeacher(teacherName)}
                                        className="py-3 rounded-xl bg-indigo-900/50 hover:bg-indigo-900/70"
                                    >
                                        {teacherName}
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-400">No teachers available right now.</p>
                            )}
                        </div>
                    )}

                    {selectedTeacher && (
                        <div className="bg-gray-800/70 p-8 rounded-3xl">
                            <button onClick={() => setSelectedTeacher(null)} className="mb-4 text-indigo-300">← Back</button>
                            <h3 className="text-2xl font-semibold text-indigo-300 mb-6">{selectedTeacher}</h3>

                            <div className="bg-gray-700/50 p-4 rounded-lg mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(-1)}
                                        className="p-2 bg-indigo-600 rounded-full"
                                    >
                                        ←
                                    </button>
                                    <p className="text-xl">
                                        {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(1)}
                                        className="p-2 bg-indigo-600 rounded-full"
                                    >
                                        →
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-2 text-center">
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="text-sm font-semibold text-indigo-300">
                                            {day}
                                        </div>
                                    ))}
                                    {daysInMonth.map((day, index) => {
                                        const dateStr = day ? day.toISOString().split("T")[0] : null;
                                        const isAvailable = dateStr && availableDates.includes(dateStr);
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectDate(day)}
                                                className={`p-2 rounded-full ${
                                                    day
                                                        ? selectedDate && day.toDateString() === selectedDate.toDateString()
                                                            ? 'bg-indigo-600'
                                                            : isAvailable
                                                                ? 'bg-green-600/50 hover:bg-green-600'
                                                                : 'bg-gray-700/50 hover:bg-gray-600'
                                                        : 'bg-transparent'
                                                }`}
                                                disabled={!day || !isAvailable}
                                            >
                                                {day ? day.getDate() : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xl mb-4">
                                    Selected: {daysOfWeek[selectedDate.getDay()]} {formatDate(selectedDate)}
                                </p>
                                {availableSlotsForDate.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableSlotsForDate.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => setSlotTime(slot.time)}
                                                className={`p-2 rounded-lg ${
                                                    slotTime === slot.time ? 'bg-indigo-600' : 'bg-gray-700/50 hover:bg-gray-600'
                                                }`}
                                            >
                                                <span className="font-semibold">{slot.subject}</span> at {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No slots available for this date.</p>
                                )}
                            </div>

                            <button
                                onClick={() => bookSlot(availableSlotsForDate.find(slot => slot.time === slotTime))}
                                disabled={!slotTime || availableSlotsForDate.length === 0}
                                className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50"
                            >
                                Book Now
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </div>
    );
}