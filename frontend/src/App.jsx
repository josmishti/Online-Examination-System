import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleSelection from './pages/RoleSelection';
import ApplicantLogin from './pages/applicant/ApplicantLogin';
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import ApplicantExams from './pages/applicant/ApplicantExams';
import ExamInstructions from './pages/applicant/ExamInstructions';
import ExamInterface from './pages/applicant/ExamInterface';
import ApplicantResults from './pages/applicant/ApplicantResults';
import ApplicantProfile from './pages/applicant/ApplicantProfile';
import ApplicantNotifications from './pages/applicant/ApplicantNotifications';
import FacultyLogin from './pages/faculty/FacultyLogin';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import QuestionBank from './pages/faculty/QuestionBank';
import AddQuestion from './pages/faculty/AddQuestion';
import FacultyProfile from './pages/faculty/FacultyProfile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminExams from './pages/admin/AdminExams';
import AdminResults from './pages/admin/AdminResults';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          
          {/* Applicant Routes */}
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/dashboard" element={<PrivateRoute><ApplicantDashboard /></PrivateRoute>} />
          <Route path="/applicant/exams" element={<PrivateRoute><ApplicantExams /></PrivateRoute>} />
          <Route path="/applicant/exams/:examId/instructions" element={<PrivateRoute><ExamInstructions /></PrivateRoute>} />
          <Route path="/applicant/exams/:examId/attempt/:attemptId" element={<PrivateRoute><ExamInterface /></PrivateRoute>} />
          <Route path="/applicant/results" element={<PrivateRoute><ApplicantResults /></PrivateRoute>} />
          <Route path="/applicant/profile" element={<PrivateRoute><ApplicantProfile /></PrivateRoute>} />
          <Route path="/applicant/notifications" element={<PrivateRoute><ApplicantNotifications /></PrivateRoute>} />
          
          {/* Faculty Routes */}
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/faculty/dashboard" element={<PrivateRoute><FacultyDashboard /></PrivateRoute>} />
          <Route path="/faculty/questions" element={<PrivateRoute><QuestionBank /></PrivateRoute>} />
          <Route path="/faculty/questions/add" element={<PrivateRoute><AddQuestion /></PrivateRoute>} />
          <Route path="/faculty/profile" element={<PrivateRoute><FacultyProfile /></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/departments" element={<PrivateRoute><AdminDepartments /></PrivateRoute>} />
          <Route path="/admin/subjects" element={<PrivateRoute><AdminSubjects /></PrivateRoute>} />
          <Route path="/admin/exams" element={<PrivateRoute><AdminExams /></PrivateRoute>} />
          <Route path="/admin/results" element={<PrivateRoute><AdminResults /></PrivateRoute>} />
          <Route path="/admin/notifications" element={<PrivateRoute><AdminNotifications /></PrivateRoute>} />
          <Route path="/admin/activity-logs" element={<PrivateRoute><AdminActivityLogs /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
