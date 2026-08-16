import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChildProvider } from './context/ChildContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { ParentLayout } from './components/layout/ParentLayout';
import { TeacherLayout } from './components/layout/TeacherLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// Parent Pages
import { ParentDashboard } from './pages/parent/Dashboard';
import { ParentChildren } from './pages/parent/Children';
import { ParentActivities } from './pages/parent/Activities';
import { ParentClasses } from './pages/parent/Classes';
import { ParentHomework } from './pages/parent/Homework';
import { ParentPayments } from './pages/parent/Payments';
import { ParentNotifications } from './pages/parent/Notifications';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { TeacherCalendar } from './pages/teacher/Calendar';
import { TeacherStudents } from './pages/teacher/Students';
import { TeacherStudentDetail } from './pages/teacher/StudentDetail';
import { TeacherHomework } from './pages/teacher/Homework';
import { TeacherAttendance } from './pages/teacher/Attendance';
import { TeacherEarnings } from './pages/teacher/Earnings';
import { TeacherAvailability } from './pages/teacher/Availability';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsers } from './pages/admin/Users';
import { AdminClasses } from './pages/admin/Classes';
import { AdminActivities } from './pages/admin/Activities';
import { AdminPayments } from './pages/admin/Payments';
import { AdminTeachersPerformance } from './pages/admin/TeachersPerformance';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Parent Protected Routes */}
          <Route
            path="/parent/*"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildProvider>
                  <ParentLayout>
                    <Routes>
                      <Route path="dashboard" element={<ParentDashboard />} />
                      <Route path="children" element={<ParentChildren />} />
                      <Route path="activities" element={<ParentActivities />} />
                      <Route path="classes" element={<ParentClasses />} />
                      <Route path="homework" element={<ParentHomework />} />
                      <Route path="payments" element={<ParentPayments />} />
                      <Route path="notifications" element={<ParentNotifications />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ParentLayout>
                </ChildProvider>
              </ProtectedRoute>
            }
          />

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherLayout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="calendar" element={<TeacherCalendar />} />
                    <Route path="students" element={<TeacherStudents />} />
                    <Route path="students/:studentId" element={<TeacherStudentDetail />} />
                    <Route path="homework" element={<TeacherHomework />} />
                    <Route path="attendance" element={<TeacherAttendance />} />
                    <Route path="earnings" element={<TeacherEarnings />} />
                    <Route path="availability" element={<TeacherAvailability />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </TeacherLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="classes" element={<AdminClasses />} />
                    <Route path="activities" element={<AdminActivities />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="teachers/performance" element={<AdminTeachersPerformance />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
