import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore"; 
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";

export default function StudentSignup() {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: (response) => console.log("reCAPTCHA Verified:", response),
            });
        }
    };

    const sendOTP = async () => {
        if (!phone) {
            alert("Please enter your phone number");
            return;
        }

        if (!window.recaptchaVerifier) {
            setupRecaptcha();
        }

        try {
            const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
            setConfirmationResult(result);
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    const verifyOTP = async () => {
        if (!confirmationResult) {
            alert("No OTP sent!");
            return;
        }

        try {
            const userCredential = await confirmationResult.confirm(otp);
            setUser({
                uid: userCredential.user.uid,
                name,
                age,
                gender,
                phone,
                role: "student",
            });

            navigate("/student/dashboard");
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
            <h2 className="text-3xl font-bold mb-6">Student Signup</h2>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <label className="block mb-2">Full Name</label>
                <input
                    type="text"
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="block mb-2">Age</label>
                <input
                    type="number"
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />

                <label className="block mb-2">Gender</label>
                <select
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>

                <label className="block mb-2">Phone Number</label>
                <input
                    type="text"
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <button
                    onClick={sendOTP}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    Send OTP
                </button>

                <div id="recaptcha-container"></div>

                <label className="block mt-4 mb-2">Enter OTP</label>
                <input
                    type="text"
                    className="w-full p-2 mb-4 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <button
                    onClick={verifyOTP}
                    className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                >
                    Verify OTP
                </button>
            </div>
        </div>
    );
}
