import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="p-6 min-h-screen bg-gray-900 text-white flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name || "Student"}!</h2>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
                <p className="mb-2"><strong>Name:</strong> {user?.name}</p>
                <p className="mb-2"><strong>Age:</strong> {user?.age}</p>
                <p className="mb-2"><strong>Gender:</strong> {user?.gender}</p>
                <p className="mb-4"><strong>Phone:</strong> {user?.phone}</p>

                <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
