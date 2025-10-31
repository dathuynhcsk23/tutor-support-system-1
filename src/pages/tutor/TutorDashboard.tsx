import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, ClipboardCheck, Users } from "lucide-react";

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
import { sessionRepository } from "@/models";
// Import to ensure mock data is loaded
import "@/data/mockSessions";
import { formatDateTimeRelative, formatTimeRange } from "@/lib/date";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use repository methods - for now using tutor-1 as mock user
  const nextSession = sessionRepository.getNextSessionForTutor("tutor-1");
  const wrapUpSessions = sessionRepository
    .getSessionsNeedingWrapUp("tutor-1")
    .slice(0, 5);
  const upcomingSessions = sessionRepository.getUpcomingForTutor("tutor-1");

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Review your next session, manage your availability, and wrap up past
          sessions.
        </p>
      </header>

      {/* Main Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Next Session Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Session
            </CardTitle>
            <CardDescription>
              Your upcoming tutoring slot at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextSession ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">
                    {nextSession.courseCode} · {nextSession.courseName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={nextSession.getStatusVariant()}>
                    {nextSession.getStatusLabel()}
                  </Badge>
                  <Badge variant="outline">
                    {nextSession.getModalityLabel()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTimeRelative(nextSession.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeRange(nextSession.startTime, nextSession.endTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  with{" "}
                  <span className="font-medium">{nextSession.studentName}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" asChild>
                    <Link to="/tutor/schedule">View Details</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No upcoming sessions scheduled.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/tutor/availability")}
                >
                  Manage Availability
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>Your tutoring activity summary.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{wrapUpSessions.length}</p>
                <p className="text-sm text-muted-foreground">Need Wrap-up</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="justify-between"
              onClick={() => navigate("/tutor/schedule")}
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wrap-up Needed Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Wrap-up Needed
          </CardTitle>
          <CardDescription>
            Sessions awaiting attendance confirmation or notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wrapUpSessions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {wrapUpSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.courseCode} · {session.courseName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTimeRelative(session.startTime)} with{" "}
                      {session.studentName}
                    </p>
                    <div className="flex gap-2">
                      {session.attendance === "pending" && (
                        <Badge variant="outline" className="text-amber-600">
                          Attendance pending
                        </Badge>
                      )}
                      {!session.tutorNotes && (
                        <Badge variant="outline" className="text-amber-600">
                          Notes missing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/tutor/wrap-up/${session.id}`)}
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Complete Wrap-up
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              All sessions are wrapped up. Great job staying on top of things!
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
