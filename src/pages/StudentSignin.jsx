import { useState } from "react";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber, getDoc, doc } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function StudentSignin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    // Setup Recaptcha
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => console.log("reCAPTCHA Verified"),
            });
        }
    };

    // Send OTP
    const sendOTP = async () => {
        if (!phone) return alert("Enter a valid phone number!");

        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        try {
            const result = await signInWithPhoneNumber(auth, phone, appVerifier);
            setConfirmationResult(result);
            alert("OTP Sent!");
        } catch (error) {
            console.error("Error sending OTP:", error);
            alert("Failed to send OTP. Try again.");
        }
    };

    // Verify OTP & Fetch Student Details
    const verifyOTP = async () => {
        if (!confirmationResult) return alert("No OTP sent!");
        try {
            const userCredential = await confirmationResult.confirm(otp);
            const user = userCredential.user;

            // Retrieve user details from Firestore
            const userDocRef = doc(db, "students", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setUser({ ...userData, role: "student" });
                navigate("/student/dashboard");
            } else {
                alert("User not found! Please sign up first.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP. Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h2 className="text-xl font-bold mb-4">Student Sign In</h2>

            <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 my-2 bg-gray-800 w-64 text-white rounded"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded w-64" onClick={sendOTP}>
                Send OTP
            </button>
            <div id="recaptcha-container"></div>

            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 my-2 bg-gray-800 w-64 text-white rounded"
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded w-64" onClick={verifyOTP}>
                Verify OTP
            </button>
        </div>
    );
}
