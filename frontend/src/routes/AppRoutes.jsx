import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import StudentLayout from '../layouts/StudentLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageSubjects from '../pages/admin/ManageSubjects';
import ManageExams from '../pages/admin/ManageExams';
import ManageQuestions from '../pages/admin/ManageQuestions';
import AdminResults from '../pages/admin/Results';
import Reports from '../pages/admin/Reports';
import AdminLeaderboard from '../pages/admin/Leaderboard';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import AvailableExams from '../pages/student/AvailableExams';
import TakeExam from '../pages/student/TakeExam';
import ExamResult from '../pages/student/ExamResult';
import ExamHistory from '../pages/student/ExamHistory';
import Profile from '../pages/student/Profile';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  return isAdmin ? children : <Navigate to="/login" />;
};

const StudentRoute = ({ children }) => {
  const { isStudent, loading } = useAuth();
  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  return isStudent ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="subjects" element={<ManageSubjects />} />
          <Route path="exams" element={<ManageExams />} />
          <Route path="questions/:examId" element={<ManageQuestions />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="leaderboard" element={<AdminLeaderboard />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student" element={<StudentRoute><StudentLayout /></StudentRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<AvailableExams />} />
          <Route path="history" element={<ExamHistory />} />
          <Route path="result/:attemptId" element={<ExamResult />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Exam Taking — full screen, no sidebar */}
        <Route path="/student/exam/:examId" element={
          <StudentRoute><TakeExam /></StudentRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
