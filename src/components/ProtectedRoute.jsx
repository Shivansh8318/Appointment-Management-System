import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user } = useAuthStore(); 

    if (!user) {
        return <Navigate to="/" replace />; 
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
