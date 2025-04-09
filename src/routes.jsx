import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import StudentSignup from "./pages/student/StudentSignup";
import StudentSignin from "./pages/student/StudentSignin";
import StudentDashboard from "./pages/student/StudentDashboard";
import AvailableClasses from "./pages/student/AvailableClasses";
import UpcomingClasses from "./pages/student/UpcomingClasses";
import StudentPastClasses from "./pages/student/StudentPastClasses";
import StudentHomework from "./pages/student/StudentHomework";
import TeacherSignup from "./pages/teacher/TeacherSignup";
import TeacherSignin from "./pages/teacher/TeacherSignin";
import TeacherHome from "./pages/teacher/TeacherHome";
import TeacherAddSlots from "./pages/teacher/TeacherAddSlots";
import TeacherSlots from "./pages/teacher/TeacherSlots";
import TeacherAppointments from "./pages/teacher/TeacherAppointments";
import TeacherPast from "./pages/teacher/TeacherPast.jsx";
import PublicTeacherProfile from "./pages/PublicTeacherProfile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/student/signup" element={<StudentSignup />} />
                <Route path="/student/signin" element={<StudentSignin />} />
                <Route path="/teacher/signup" element={<TeacherSignup />} />
                <Route path="/teacher/signin" element={<TeacherSignin />} />
                <Route path="/teacher/:teacherUsername" element={<PublicTeacherProfile />} /> {/* Updated to use teacherUsername */}

                <Route
                    path="/student/dashboard"
                    element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/student/available-classes"
                    element={<ProtectedRoute allowedRoles={["student"]}><AvailableClasses /></ProtectedRoute>}
                />
                <Route
                    path="/student/upcoming-classes"
                    element={<ProtectedRoute allowedRoles={["student"]}><UpcomingClasses /></ProtectedRoute>}
                />
                <Route
                    path="/student/past-classes"
                    element={<ProtectedRoute allowedRoles={["student"]}><StudentPastClasses /></ProtectedRoute>}
                />
                <Route
                    path="/student/homework"
                    element={<ProtectedRoute allowedRoles={["student"]}><StudentHomework /></ProtectedRoute>}
                />
                <Route
                    path="/student/dummy-class"
                    element={<ProtectedRoute allowedRoles={["student", "teacher"]}><div>Dummy Class Page</div></ProtectedRoute>}
                />

                <Route
                    path="/teacher/home"
                    element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherHome /></ProtectedRoute>}
                />
                <Route
                    path="/teacher/add-slots"
                    element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAddSlots /></ProtectedRoute>}
                />
                <Route
                    path="/teacher/slots"
                    element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherSlots /></ProtectedRoute>}
                />
                <Route
                    path="/teacher/appointments"
                    element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherAppointments /></ProtectedRoute>}
                />
                <Route
                    path="/teacher/past"
                    element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherPast /></ProtectedRoute>}
                />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}