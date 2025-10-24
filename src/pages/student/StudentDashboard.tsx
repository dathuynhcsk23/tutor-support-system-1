import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, MessageCircle, Search, Sparkles } from "lucide-react";

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
import { getNextSession, getSessionsNeedingFeedback } from "@/data/mockSessions";
import { formatDateTimeRelative, formatTimeRange } from "@/lib/date";
import { getModalityLabel, getStatusLabel, getStatusVariant } from "@/types/session";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const nextSession = getNextSession();
  const feedbackSessions = getSessionsNeedingFeedback().slice(0, 3);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Review your next session, find tutors, and keep feedback flowing.
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
                  <Badge variant={getStatusVariant(nextSession.status)}>
                    {getStatusLabel(nextSession.status)}
                  </Badge>
                  <Badge variant="outline">
                    {getModalityLabel(nextSession.modality)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTimeRelative(nextSession.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeRange(nextSession.startTime, nextSession.endTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  with {nextSession.tutorName}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" asChild>
                    <Link to="/student/schedule">View Details</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  You don't have any sessions booked yet.
                </p>
                <Button size="sm" onClick={() => navigate("/student/find")}>
                  Find a Tutor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Everything you need to stay on track.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate("/student/find")} className="justify-start">
              <Search className="mr-2 h-4 w-4" />
              Find a Tutor
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/student/auto-match")}
              className="justify-start"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try Auto-match
            </Button>
            <Button
              variant="ghost"
              className="justify-between"
              onClick={() => navigate("/student/schedule")}
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                View Schedule
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Feedback & Reminders
          </CardTitle>
          <CardDescription>
            Share quick feedback to help improve the program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackSessions.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {feedbackSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.courseCode} · {session.courseName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTimeRelative(session.startTime)} with {session.tutorName}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/student/feedback/${session.id}`)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Give Feedback
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No feedback tasks right now. We'll nudge you when something needs attention.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
