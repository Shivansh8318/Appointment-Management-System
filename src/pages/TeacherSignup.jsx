import { useState } from "react";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function TeacherSignup() {
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "male",
        phone: "",
        subjects: "",
        experience: "",
        qualification: "",
        bio: "",
    });
    const [otp, setOTP] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const sendOTP = async () => {
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
            const confirmationResult = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            alert("OTP sent!");
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Try again.");
        }
    };

    const verifyOTP = async () => {
        if (!window.confirmationResult) return alert("No OTP sent!");
        try {
            const userCredential = await window.confirmationResult.confirm(otp);
            const user = userCredential.user;

            await setDoc(doc(db, "teachers", user.uid), {
                uid: user.uid,
                ...formData,
                subjects: formData.subjects.split(",").map(s => s.trim()),
                createdAt: serverTimestamp(),
            });

            setUser({ ...user, role: "teacher" });
            navigate("/teacher/dashboard");
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Error during signup. Try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col">
            <Header />
            <div className="flex flex-col items-center justify-center flex-grow p-6">
                <h2 className="text-3xl font-bold mb-6">Teacher Signup</h2>
                <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-700">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="subjects"
                        placeholder="Subjects (comma-separated)"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="experience"
                        placeholder="Years of Experience"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="qualification"
                        placeholder="Qualification"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        name="bio"
                        placeholder="Short Bio"
                        onChange={handleChange}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {otpSent && (
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOTP(e.target.value)}
                            className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg"
                        onClick={otpSent ? verifyOTP : sendOTP}
                    >
                        {otpSent ? "Verify OTP" : "Send OTP"}
                    </button>
                    <div id="recaptcha-container" className="mt-4"></div>
                    <p className="mt-4 text-center text-gray-300">
                        Already a teacher?{" "}
                        <button
                            className="text-blue-400 underline hover:text-blue-300 transition-colors"
                            onClick={() => navigate("/teacher/signin")}
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}