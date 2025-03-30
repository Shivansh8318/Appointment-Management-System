import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import StudentSignin from "./pages/StudentSignin";  // ✅ Import
import TeacherSignin from "./pages/TeacherSignin";  // ✅ Import
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/student/signup" element={<StudentSignup />} />
                <Route path="/teacher/signup" element={<TeacherSignup />} />
                <Route path="/student/signin" element={<StudentSignin />} />  {/* ✅ Add Sign-In Route */}
                <Route path="/teacher/signin" element={<TeacherSignin />} />  {/* ✅ Add Sign-In Route */}

                {/* Protected Routes */}
                <Route path="/student/dashboard" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/teacher/dashboard" element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
