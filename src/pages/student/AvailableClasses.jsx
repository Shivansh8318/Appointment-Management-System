import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../../config/firebase";
import { collection, query, where, onSnapshot, doc, setDoc, getDocs } from "firebase/firestore";
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
            console.log("Fetched slots:", slots);
            const grouped = slots.reduce((acc, slot) => {
                if (!acc[slot.teacherName]) acc[slot.teacherName] = {};
                if (!acc[slot.teacherName][slot.date]) acc[slot.teacherName][slot.date] = [];
                acc[slot.teacherName][slot.date].push(slot);
                return acc;
            }, {});
            console.log("Grouped slots by teacher:", grouped);
            setSlotsByTeacher(grouped);
        }, (error) => {
            console.error("Error fetching slots:", error);
        });
        return () => unsubscribe();
    }, [teacherId]);

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

    const formatDateForDisplay = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForStorage = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const bookSlot = async (slot) => {
        if (!slotTime) {
            alert("Please select a time!");
            return;
        }
        try {
            const teacherUsername = await fetchTeacherUsername(slot.teacherId);
            const formattedSelectedDate = formatDateForStorage(selectedDate);

            console.log("Booking slot with date:", formattedSelectedDate);

            await setDoc(doc(db, "appointments", `${slot.teacherId}_${formattedSelectedDate}_${slotTime}`), {
                teacherId: slot.teacherId,
                teacherName: slot.teacherName,
                teacherUsername: teacherUsername,
                studentId: user.uid,
                studentName: user.name,
                subject: slot.subject,
                date: formattedSelectedDate,
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
            console.log("Selected date:", formatDateForStorage(date));
        }
    };

    const availableDates = selectedTeacher ? Object.keys(slotsByTeacher[selectedTeacher] || {}).sort() : [];
    console.log("Available dates for selected teacher:", availableDates);
    const daysInMonth = getDaysInMonth(currentMonth);
    const formattedSelectedDate = formatDateForStorage(selectedDate);
    console.log("Formatted selected date:", formattedSelectedDate);
    const availableSlotsForDate = selectedTeacher && slotsByTeacher[selectedTeacher][formattedSelectedDate] || [];
    console.log("Available slots for date:", availableSlotsForDate);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <StudentNavbar setActiveTab={() => {}} />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-12">
                        Available Classes
                    </h2>

                    {!selectedTeacher && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.keys(slotsByTeacher).length > 0 ? (
                                Object.keys(slotsByTeacher).map(teacherName => (
                                    <button
                                        key={teacherName}
                                        onClick={() => setSelectedTeacher(teacherName)}
                                        className="py-3 rounded-xl bg-blue-100/70 hover:bg-blue-200/70 text-gray-800"
                                    >
                                        {teacherName}
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-600">No teachers available right now.</p>
                            )}
                        </div>
                    )}

                    {selectedTeacher && (
                        <div className="bg-white/90 p-8 rounded-3xl border border-gray-200">
                            <button onClick={() => setSelectedTeacher(null)} className="mb-4 text-blue-500">← Back</button>
                            <h3 className="text-2xl font-semibold text-blue-600 mb-6">{selectedTeacher}</h3>

                            <div className="bg-gray-100/70 p-4 rounded-lg mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(-1)}
                                        className="p-2 bg-blue-500 text-white rounded-full"
                                    >
                                        ←
                                    </button>
                                    <p className="text-xl text-gray-800">
                                        {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => changeMonth(1)}
                                        className="p-2 bg-blue-500 text-white rounded-full"
                                    >
                                        →
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-2 text-center">
                                    {daysOfWeek.map((day) => (
                                        <div key={day} className="text-sm font-semibold text-blue-500">
                                            {day}
                                        </div>
                                    ))}
                                    {daysInMonth.map((day, index) => {
                                        const dateStr = day ? formatDateForStorage(day) : null;
                                        const isAvailable = dateStr && availableDates.includes(dateStr);
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectDate(day)}
                                                className={`p-2 rounded-full ${
                                                    day
                                                        ? selectedDate && day.toDateString() === selectedDate.toDateString()
                                                            ? 'bg-blue-500 text-white'
                                                            : isAvailable
                                                                ? 'bg-green-200/70 hover:bg-green-300'
                                                                : 'bg-gray-200/70 hover:bg-gray-300'
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
                                <p className="text-xl mb-4 text-gray-800">
                                    Selected: {daysOfWeek[selectedDate.getDay()]} {formatDateForDisplay(selectedDate)}
                                </p>
                                {availableSlotsForDate.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableSlotsForDate.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => setSlotTime(slot.time)}
                                                className={`p-2 rounded-lg ${
                                                    slotTime === slot.time ? 'bg-blue-500 text-white' : 'bg-gray-200/70 hover:bg-gray-300 text-gray-800'
                                                }`}
                                            >
                                                <span className="font-semibold">{slot.subject}</span> at {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-600">No slots available for this date.</p>
                                )}
                            </div>

                            <button
                                onClick={() => bookSlot(availableSlotsForDate.find(slot => slot.time === slotTime))}
                                disabled={!slotTime || availableSlotsForDate.length === 0}
                                className="mt-6 w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white disabled:opacity-50"
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