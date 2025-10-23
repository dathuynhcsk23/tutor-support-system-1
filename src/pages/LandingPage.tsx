import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Clock, GraduationCap, Target } from "lucide-react";

const FEATURES = [
  {
    title: "Get help fast",
    description: "Connect with experienced tutors and find open sessions quickly.",
    icon: Clock,
  },
  {
    title: "Expert tutors",
    description: "All tutors are vetted and have proven course mastery.",
    icon: GraduationCap,
  },
  {
    title: "Track progress",
    description: "Session notes keep you aligned on goals every step of the way.",
    icon: Target,
  },
];

const STEPS = [
  "Sign in with your HCMUT account",
  "Find or auto-match with a tutor",
  "Schedule your sessions",
  "Attend and learn",
  "Give feedback",
];

export default function LandingPage() {
  const { signIn, loading } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            HCMUT Tutor Support System
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Elevate learning with guided tutoring
          </h1>
          <p className="text-lg text-muted-foreground">
            Seamless scheduling, expert support, and transparent outcomes for
            students and tutors at HCMUT.
          </p>
          <Button size="lg" onClick={signIn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Program Benefits</h2>
            <p className="text-muted-foreground">
              Built for flexibility, accountability, and an excellent student experience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">How It Works</h2>
            <p className="text-muted-foreground">
              Five simple steps from sign-in to feedback.
            </p>
          </div>
          <ol className="grid gap-4 md:grid-cols-5">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex flex-col items-center gap-3 rounded-lg bg-background p-6 text-center shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Contact the tutoring program desk for assistance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Email:{" "}
                <a href="mailto:support@hcmut.edu.vn" className="text-primary underline">
                  support@hcmut.edu.vn
                </a>
              </p>
              <p>Office hours: Monday–Friday, 8:00–17:00</p>
              <p>Location: Campus 1, Building A, Room 123</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
