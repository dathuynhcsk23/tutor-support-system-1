import { useRoutes, Navigate } from "react-router-dom";

// Pages (we'll create these next)
import LandingPage from "@/pages/LandingPage";
import RoleSelection from "@/pages/auth/RoleSelection";

export default function AppRoutes() {
  return useRoutes([
    // Public routes
    { path: "/", element: <LandingPage /> },
    { path: "/role", element: <RoleSelection /> },

    // Student routes (placeholder for now)
    { path: "/student", element: <div>Student Dashboard (coming soon)</div> },
    { path: "/student/*", element: <div>Student Page (coming soon)</div> },

    // Tutor routes (placeholder for now)
    { path: "/tutor", element: <div>Tutor Dashboard (coming soon)</div> },
    { path: "/tutor/*", element: <div>Tutor Page (coming soon)</div> },

    // Catch-all redirect
    { path: "*", element: <Navigate to="/" replace /> },
  ]);
}
