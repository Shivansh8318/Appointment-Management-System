import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber, getDoc, doc } from "../../config/firebase";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAuthStore from "../../store/authStore";

export default function StudentSignin() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, setUser } = useAuthStore();

    useEffect(() => {
        if (!loading && user) {
            const redirectTo = location.state?.from || "/student/dashboard";
            console.log("User already logged in, redirecting to:", redirectTo);
            navigate(redirectTo);
        }
    }, [user, loading, navigate, location.state]);

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
            const userDocRef = doc(db, "students", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setUser({ ...userData, role: "student" });
                const redirectTo = location.state?.from || "/student/dashboard";
                console.log("Login successful, redirecting to:", redirectTo);
                navigate(redirectTo);
            } else {
                alert("User not found! Please sign up first.");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert("Invalid OTP. Try again.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-900 flex flex-col">
            <Header />
            <div className="flex flex-col items-center justify-center flex-grow p-6">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Student Sign In</h2>
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl w-full max-w-md shadow-lg border border-gray-200">
                    <input
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-lg transition-all hover:from-blue-600 hover:to-indigo-600 hover:shadow-md"
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
                        className="w-full p-3 mt-4 mb-4 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-lg transition-all hover:from-green-600 hover:to-teal-600 hover:shadow-md"
                        onClick={verifyOTP}
                    >
                        Verify OTP
                    </button>
                    <p className="mt-4 text-center text-gray-600">
                        Not a student yet?{" "}
                        <button
                            className="text-blue-500 underline hover:text-blue-600 transition-colors"
                            onClick={() => navigate("/student/signup")}
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