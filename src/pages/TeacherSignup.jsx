import { useState } from "react";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import useAuthStore from "../store/authStore";

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
        }
    };

    const verifyOTP = async () => {
        if (!window.confirmationResult) return alert("No OTP sent!");
        try {
            const userCredential = await window.confirmationResult.confirm(otp);
            const user = userCredential.user;

            // Save teacher details to Firestore
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
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h2 className="text-2xl font-bold mb-4">Teacher Signup</h2>
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <input type="number" name="age" placeholder="Age" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <input type="text" name="subjects" placeholder="Subjects (comma-separated)" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <input type="number" name="experience" placeholder="Years of Experience" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <input type="text" name="qualification" placeholder="Qualification" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                <textarea name="bio" placeholder="Short Bio" onChange={handleChange} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>
                {otpSent && <input type="text" placeholder="Enter OTP" onChange={(e) => setOTP(e.target.value)} className="w-full p-2 my-2 bg-gray-700 text-white border rounded"/>}
                <button className="w-full bg-blue-500 text-white px-4 py-2 mt-2 rounded" onClick={otpSent ? verifyOTP : sendOTP}>{otpSent ? "Verify OTP" : "Send OTP"}</button>
                <div id="recaptcha-container"></div>
            </div>
        </div>
    );
}
