import { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function TeacherSignin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => console.log("reCAPTCHA Verified"),
            });
        }
    };

    const sendOTP = async () => {
        if (!window.recaptchaVerifier) setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        try {
            const result = await signInWithPhoneNumber(auth, phone, appVerifier);
            setConfirmationResult(result);
            alert("OTP Sent!");
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    const verifyOTP = async () => {
        if (!confirmationResult) return alert("No OTP sent!");
        try {
            const userCredential = await confirmationResult.confirm(otp);
            setUser({ ...userCredential.user, role: "teacher" });
            navigate("/teacher/dashboard");
        } catch (error) {
            console.error("Error verifying OTP:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h2 className="text-xl font-bold">Teacher Sign In</h2>
            <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 my-2 bg-gray-800"
            />
            <button className="bg-blue-500 text-white px-4 py-2" onClick={sendOTP}>
                Send OTP
            </button>
            <div id="recaptcha-container"></div>

            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 my-2 bg-gray-800"
            />
            <button className="bg-green-500 text-white px-4 py-2" onClick={verifyOTP}>
                Verify OTP
            </button>
        </div>
    );
}
