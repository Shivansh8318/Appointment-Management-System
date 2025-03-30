import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h2 className="text-3xl font-bold">Welcome, {user?.name || "Teacher"}!</h2>
            <div className="bg-gray-800 p-6 rounded-lg mt-4 w-96">
                <p><strong>Phone:</strong> {user?.phone}</p>
                <p><strong>Gender:</strong> {user?.gender}</p>
                <p><strong>Subjects:</strong> {user?.subjects?.join(", ")}</p>
                <p><strong>Experience:</strong> {user?.experience} years</p>
                <p><strong>Qualification:</strong> {user?.qualification}</p>
                <p><strong>Bio:</strong> {user?.bio}</p>
            </div>
            <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => { logout(); navigate("/"); }}
            >
                Logout
            </button>
        </div>
    );
}
