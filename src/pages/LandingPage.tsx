import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import { ArrowRight, Clock, GraduationCap, LogIn, Menu, Target } from "lucide-react";
import bannerImage from "@/assets/banner_image_light.jpg";

const FEATURES = [
  {
    title: "Get help fast",
    description:
      "Connect with experienced tutors and find open sessions quickly.",
    icon: Clock,
  },
  {
    title: "Expert tutors",
    description: "All tutors are vetted and have proven course mastery.",
    icon: GraduationCap,
  },
  {
    title: "Track progress",
    description:
      "Session notes keep you aligned on goals every step of the way.",
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

const NAV_LINKS = [
  { href: "#program", label: "Program Info" },
  { href: "#how", label: "How It Works" },
  { href: "#contact", label: "Contact" },
];

export default function LandingPage() {
  const { signIn, loading } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Glassmorphism Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          className="border-b backdrop-blur-lg"
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Logo />

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Sign In */}
            <div className="hidden md:block">
              <Button size="sm" onClick={() => signIn()} disabled={loading}>
                <LogIn className="mr-2 h-4 w-4" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 flex flex-col gap-4">
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ))}
                    <Button onClick={() => signIn()} disabled={loading} className="mt-4">
                      <LogIn className="mr-2 h-4 w-4" />
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Banner Image */}
      <section className="relative px-6 pt-32 pb-24 text-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 -z-10 bg-black/40" />

        <div className="mx-auto max-w-3xl space-y-6">
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            HCMUT Tutor Support System
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-lg">
            Elevate learning with guided tutoring
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Seamless scheduling, expert support, and transparent outcomes for
            students and tutors at HCMUT.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => signIn()} disabled={loading}>
              {loading ? "Signing in..." : "Get Started"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <a href="#program" className="hover:text-white underline-offset-4 hover:underline">
                Program Info
              </a>
              <span className="text-white/40">|</span>
              <a href="#how" className="hover:text-white underline-offset-4 hover:underline">
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="program" className="px-6 py-16 scroll-mt-20">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Program Benefits</h2>
            <p className="text-muted-foreground">
              Built for flexibility, accountability, and an excellent student
              experience.
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
      <section id="how" className="bg-muted/50 px-6 py-16 scroll-mt-20">
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
      <section id="contact" className="px-6 py-16 scroll-mt-20">
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
                <a
                  href="mailto:support@hcmut.edu.vn"
                  className="text-primary underline"
                >
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
