import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentSignup from "./pages/StudentSignup";
import TeacherSignup from "./pages/TeacherSignup";
import StudentSignin from "./pages/StudentSignin";
import TeacherSignin from "./pages/TeacherSignin";
import StudentDashboard from "./pages/StudentDashboard";
import AvailableClasses from "./pages/AvailableClasses";
import UpcomingClasses from "./pages/UpcomingClasses";
import StudentPastClasses from "./pages/StudentPastClasses";
import TeacherDashboard from "./pages/TeacherDashboard";
import DummyClass from "./pages/DummyClass";
import StudentHomework from "./pages/StudentHomework";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/student/signup" element={<StudentSignup />} />
                <Route path="/teacher/signup" element={<TeacherSignup />} />
                <Route path="/student/signin" element={<StudentSignin />} />
                <Route path="/teacher/signin" element={<TeacherSignin />} />

                <Route path="/student/dashboard" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/student/available-classes" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <AvailableClasses />
                    </ProtectedRoute>
                } />
                <Route path="/student/upcoming-classes" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <UpcomingClasses />
                    </ProtectedRoute>
                } />
                <Route path="/student/past-classes" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentPastClasses />
                    </ProtectedRoute>
                } />
                <Route path="/student/homework" element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentHomework />
                    </ProtectedRoute>
                } />
                <Route path="/student/dummy-class" element={
                    <ProtectedRoute allowedRoles={["student", "teacher"]}>
                        <DummyClass />
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