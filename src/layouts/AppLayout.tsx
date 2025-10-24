import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";

/**
 * Main app layout with header and content area.
 * Used for all authenticated pages.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 bg-background px-4 py-6 md:px-6">
        <Outlet />
      </main>
    </div>
  );
}
