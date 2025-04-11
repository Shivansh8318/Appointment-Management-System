import { useState, useEffect } from "react";
import { db, doc, getDoc } from "../../config/firebase";
import { collection, addDoc } from "firebase/firestore";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import TeacherNavbar from "../../components/TeacherNavbar";

export default function TeacherAddSlots() {
    const { user } = useAuthStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [subject, setSubject] = useState("");
    const [teacherSubjects, setTeacherSubjects] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    useEffect(() => {
        if (user) {
            const fetchTeacherDetails = async () => {
                const teacherRef = doc(db, "teachers", user.uid);
                const teacherSnap = await getDoc(teacherRef);
                if (teacherSnap.exists()) {
                    const data = teacherSnap.data();
                    setTeacherSubjects(data.subjects || []);
                }
            };
            fetchTeacherDetails();
        }
    }, [user]);

    const generateTimeSlots = (date) => {
        const slots = [];
        let currentTime = new Date(date);
        currentTime.setHours(9, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setHours(21, 0, 0, 0);

        while (currentTime < endTime) {
            slots.push({
                time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        return slots;
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const selectTimeSlot = (time) => {
        if (!startTime) {
            setStartTime(time);
            setEndTime(null);
        } else if (!endTime && time > startTime) {
            setEndTime(time);
        } else {
            setStartTime(time);
            setEndTime(null);
        }
    };

    const getSelectedSlots = () => {
        if (!startTime || !endTime) return [];
        const startIndex = slots.findIndex(slot => slot.time === startTime);
        const endIndex = slots.findIndex(slot => slot.time === endTime);
        return slots.slice(startIndex, endIndex + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject) {
            alert("Please select a subject!");
            return;
        }
        if (!startTime || !endTime) {
            alert("Please select a start and end time for your slots!");
            return;
        }

        try {
            const selectedSlots = getSelectedSlots();
            for (const slot of selectedSlots) {
                await addDoc(collection(db, "slots"), {
                    teacherId: user.uid,
                    teacherName: user.name,
                    subject,
                    date: selectedDate.toISOString().split("T")[0],
                    time: slot.time,
                    booked: false,
                });
            }
            alert("Slots added successfully!");
            setSlots(generateTimeSlots(selectedDate));
            setStartTime(null);
            setEndTime(null);
            setSubject("");
        } catch (error) {
            console.error("Error adding slots:", error);
            alert("Failed to add slots.");
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
            setSlots(generateTimeSlots(date));
            setStartTime(null);
            setEndTime(null);
        }
    };

    useEffect(() => {
        setSlots(generateTimeSlots(selectedDate));
    }, [selectedDate]);

    const daysInMonth = getDaysInMonth(currentMonth);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <TeacherNavbar />
            <section className="flex-grow py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl font-extrabold text-gray-800 mb-12">
                        Add Available Slots
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-3 bg-gray-100 rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select Subject</option>
                            {teacherSubjects.map((subj) => (
                                <option key={subj} value={subj}>{subj}</option>
                            ))}
                        </select>

                        <div className="bg-white/90 p-4 rounded-lg border border-gray-200">
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
                                {daysInMonth.map((day, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => selectDate(day)}
                                        className={`p-2 rounded-full ${
                                            day
                                                ? selectedDate && day.toDateString() === selectedDate.toDateString()
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                : 'bg-transparent'
                                        }`}
                                        disabled={!day}
                                    >
                                        {day ? day.getDate() : ''}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-xl mb-4 text-gray-800">
                                Selected: {daysOfWeek[selectedDate.getDay()]} {formatDate(selectedDate)}
                            </p>
                            <p className="text-base font-semibold mb-2 bg-blue-100 p-2 rounded-lg text-blue-800">
                                Click to select start time, then end time. Selected range: {startTime || "Not set"} - {endTime || "Not set"}
                            </p>
                            <div className="grid grid-cols-4 gap-3">
                                {slots.map((slot, index) => {
                                    const isInRange = startTime && endTime && 
                                        slot.time >= startTime && slot.time <= endTime;
                                    const isStart = slot.time === startTime;
                                    const isEnd = slot.time === endTime;
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => selectTimeSlot(slot.time)}
                                            className={`p-2 rounded-lg text-sm ${
                                                isStart ? 'bg-green-500 text-white' : 
                                                isEnd ? 'bg-red-500 text-white' : 
                                                isInRange ? 'bg-blue-500 text-white' : 
                                                'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        >
                                            {slot.time}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
                        >
                            Submit Slots
                        </button>
                    </form>
                </div>
            </section>
            <Footer />
        </div>
    );
}