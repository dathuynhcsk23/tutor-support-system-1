import { useRoutes, Navigate } from "react-router-dom";

// Layouts
import { AppLayout, ProtectedRoute } from "@/layouts";

// Pages
import LandingPage from "@/pages/LandingPage";
import RoleSelection from "@/pages/auth/RoleSelection";
import StudentDashboard from "@/pages/student/StudentDashboard";
import FindTutor from "@/pages/student/FindTutor";
import ScheduleSession from "@/pages/student/ScheduleSession";
import MySchedule from "@/pages/student/MySchedule";
import AutoMatch from "@/pages/student/AutoMatch";
import Library from "@/pages/student/Library";
import Profile from "@/pages/student/Profile";
import TutorDashboard from "@/pages/tutor/TutorDashboard";
import TutorSchedule from "@/pages/tutor/TutorSchedule";

export default function AppRoutes() {
  return useRoutes([
    // Public routes
    { path: "/", element: <LandingPage /> },

    // Protected routes (require authentication)
    {
      element: <ProtectedRoute />,
      children: [
        // Role selection (no app layout yet)
        { path: "/role", element: <RoleSelection /> },

        // App routes with header/navigation
        {
          element: <AppLayout />,
          children: [
            // Student routes
            {
              path: "/student",
              element: <StudentDashboard />,
            },
            {
              path: "/student/find",
              element: <FindTutor />,
            },
            {
              path: "/student/schedule/new",
              element: <ScheduleSession />,
            },
            {
              path: "/student/auto-match",
              element: <AutoMatch />,
            },
            {
              path: "/student/schedule",
              element: <MySchedule />,
            },
            {
              path: "/student/library",
              element: <Library />,
            },
            {
              path: "/student/profile",
              element: <Profile />,
            },

            // Tutor routes
            {
              path: "/tutor",
              element: <TutorDashboard />,
            },
            {
              path: "/tutor/schedule",
              element: <TutorSchedule />,
            },
            {
              path: "/tutor/availability",
              element: (
                <div className="mx-auto max-w-5xl">
                  Availability (coming soon)
                </div>
              ),
            },
            {
              path: "/tutor/library",
              element: (
                <div className="mx-auto max-w-5xl">Library (coming soon)</div>
              ),
            },
            {
              path: "/tutor/profile",
              element: (
                <div className="mx-auto max-w-5xl">Profile (coming soon)</div>
              ),
            },
          ],
        },
      ],
    },

    // Catch-all redirect
    { path: "*", element: <Navigate to="/" replace /> },
  ]);
}
