import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/auth";

/**
 * Role configuration with display info
 */
const ROLES: Record<
  Role,
  { title: string; description: string; icon: typeof GraduationCap }
> = {
  student: {
    title: "Student",
    description: "Find tutors, book sessions, and track your progress.",
    icon: GraduationCap,
  },
  tutor: {
    title: "Tutor",
    description: "Manage availability, sessions, and help students.",
    icon: Users,
  },
};

export default function RoleSelection() {
  const { user, activeRole, selectRole, loading } = useAuth();

  // Auto-select if only one role
  useEffect(() => {
    if (user && user.roles.length === 1) {
      selectRole(user.roles[0]);
    }
  }, [user, selectRole]);

  // If not logged in, redirect to landing
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  // If already has active role, redirect to that dashboard
  if (activeRole) {
    return <Navigate to={`/${activeRole}`} replace />;
  }

  // Show loading state
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-4 py-12">
      <header className="space-y-2 text-center">
        <Badge variant="secondary" className="uppercase tracking-wide">
          Multi-role account
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Choose your role
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user.name}! Select how you want to continue.
        </p>
      </header>

      <section className="grid w-full gap-4 md:grid-cols-2">
        {user.roles.map((role) => {
          const config = ROLES[role];
          const Icon = config.icon;

          return (
            <Card
              key={role}
              className="transition hover:shadow-md hover:border-primary"
            >
              <CardHeader>
                <Icon className="h-10 w-10 text-primary" />
                <CardTitle className="mt-4 text-2xl">{config.title}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => selectRole(role)}>
                  Continue as {config.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
