import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user } = useAuthStore(); // Get user from Zustand store

    if (!user) {
        return <Navigate to="/" replace />; // Redirect to Home if not logged in
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Redirect if role is unauthorized
    }

    return children; // Render the requested page
}
