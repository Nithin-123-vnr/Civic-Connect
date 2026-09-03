import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Screens
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';

// Citizen Screens
import { CitizenHomeScreen } from './screens/citizen/CitizenHomeScreen';
import { ReportComplaintWizard } from './screens/citizen/ReportComplaintWizard';
import { SubmissionSuccessScreen } from './screens/citizen/SubmissionSuccessScreen';
import { MyComplaintsScreen } from './screens/citizen/MyComplaintsScreen';
import { ComplaintDetailScreen } from './screens/citizen/ComplaintDetailScreen';
import { CitizenNotificationsScreen } from './screens/citizen/CitizenNotificationsScreen';
import { CitizenProfileScreen } from './screens/citizen/CitizenProfileScreen';
import { CitizenMapViewScreen } from './screens/citizen/CitizenMapViewScreen';

// Mandal Officer Screens
import { MandalDashboardScreen } from './screens/mandal/MandalDashboardScreen';
import { MandalComplaintsScreen } from './screens/mandal/MandalComplaintsScreen';
import { MandalAnalyticsScreen } from './screens/mandal/MandalAnalyticsScreen';
import { MandalMapViewScreen } from './screens/mandal/MandalMapViewScreen';

// District Officer Screens
import { DistrictDashboardScreen } from './screens/district/DistrictDashboardScreen';
import { DistrictComplaintsScreen } from './screens/district/DistrictComplaintsScreen';
import { DistrictEscalationsScreen } from './screens/district/DistrictEscalationsScreen';
import { DistrictAnalyticsScreen } from './screens/district/DistrictAnalyticsScreen';
import { DistrictMapViewScreen } from './screens/district/DistrictMapViewScreen';

// State Admin Screens
import { StateAdminDashboardScreen } from './screens/state/StateAdminDashboardScreen';
import { StateComplaintsScreen } from './screens/state/StateComplaintsScreen';
import { StateEscalationsScreen } from './screens/state/StateEscalationsScreen';
import { StateUserManagementScreen } from './screens/state/StateUserManagementScreen';
import { StateAnalyticsScreen } from './screens/state/StateAnalyticsScreen';
import { StateMapViewScreen } from './screens/state/StateMapViewScreen';

// Role-Aware Officer Screens
import { OfficerProfileScreen } from './screens/officer/OfficerProfileScreen';
import { OfficerAlertsScreen } from './screens/officer/OfficerAlertsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<LoginScreen />} />
            <Route path="/auth/register" element={<RegisterScreen />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordScreen />} />

            {/* Citizen Routes */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenHomeScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/report"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <ReportComplaintWizard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/submission-success"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <SubmissionSuccessScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/my-complaints"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <MyComplaintsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <MyComplaintsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaint/:id"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <ComplaintDetailScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints/:id"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <ComplaintDetailScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/notifications"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenNotificationsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/profile"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenProfileScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/map"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenMapViewScreen />
                </ProtectedRoute>
              }
            />

            {/* Mandal Officer Routes */}
            <Route
              path="/mandal"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <MandalDashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandal/complaints"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <MandalComplaintsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandal/analytics"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <MandalAnalyticsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandal/map"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <MandalMapViewScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandal/notifications"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <OfficerAlertsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandal/profile"
              element={
                <ProtectedRoute requiredRole="mandal_officer">
                  <OfficerProfileScreen />
                </ProtectedRoute>
              }
            />

            {/* District Officer Routes */}
            <Route
              path="/district"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <DistrictDashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/complaints"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <DistrictComplaintsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/escalations"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <DistrictEscalationsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/analytics"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <DistrictAnalyticsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/map"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <DistrictMapViewScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/notifications"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <OfficerAlertsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/district/profile"
              element={
                <ProtectedRoute requiredRole="district_officer">
                  <OfficerProfileScreen />
                </ProtectedRoute>
              }
            />

            {/* State Admin Routes */}
            <Route
              path="/state"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateAdminDashboardScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/complaints"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateComplaintsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/escalations"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateEscalationsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/users"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateUserManagementScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/map"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateMapViewScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/analytics"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <StateAnalyticsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/notifications"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <OfficerAlertsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/state/profile"
              element={
                <ProtectedRoute requiredRole="state_admin">
                  <OfficerProfileScreen />
                </ProtectedRoute>
              }
            />

            {/* Fallback Redirects */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
