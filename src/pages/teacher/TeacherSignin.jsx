import { useState, useEffect } from "react";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber, getDoc, doc } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function TeacherSignin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const navigate = useNavigate();
    const { user, loading, setUser } = useAuthStore();

    
    useEffect(() => {
        if (!loading && user && user.role === "teacher") {
            navigate("/teacher/home", { replace: true });
        }
    }, [user, loading, navigate]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => console.log("reCAPTCHA Verified"),
            });
        }
    };

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

    const verifyOTP = async () => {
        if (!confirmationResult) return alert("No OTP sent!");
        try {
            const userCredential = await confirmationResult.confirm(otp);
            const user = userCredential.user;
            const userDocRef = doc(db, "teachers", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setUser({ ...user, ...userData, role: "teacher" });
                navigate("/teacher/home", { replace: true });
            } else {
                alert("Teacher not found! Please sign up first.");
                auth.signOut();
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP. Try again.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white flex flex-col">
            <Header />
            <div className="flex flex-col items-center justify-center flex-grow p-6">
                <h2 className="text-3xl font-bold mb-6">Teacher Sign In</h2>
                <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-xl w-full max-w-md shadow-2xl border border-gray-700">
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg"
                        onClick={sendOTP}
                    >
                        Send OTP
                    </button>
                    <div id="recaptcha-container" className="mt-4"></div>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full p-3 mt-4 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg transition-all hover:from-green-600 hover:to-teal-600 hover:shadow-lg"
                        onClick={verifyOTP}
                    >
                        Verify OTP
                    </button>
                    <p className="mt-4 text-center text-gray-300">
                        Not a teacher yet?{" "}
                        <button
                            className="text-blue-400 underline hover:text-blue-300 transition-colors"
                            onClick={() => navigate("/teacher/signup")}
                        >
                            Sign Up
                        </button>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}