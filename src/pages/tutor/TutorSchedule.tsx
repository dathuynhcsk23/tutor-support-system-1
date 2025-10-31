import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  addDays,
  startOfMonth,
  startOfWeek,
  format,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardCheck,
  Grid3X3,
  List,
  MapPin,
  Settings,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sessionRepository, type Session } from "@/models";
import { formatDate, formatTimeRange, formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
// Ensure mock data is loaded
import "@/data/mockSessions";

// ============================================
// Filter Options
// ============================================

type ViewMode = "list" | "calendar";
type StatusFilter = "upcoming" | "past";
type ScopeFilter = "all" | "3d" | "7d" | "14d";
type ModalityFilter = "all" | "online" | "in_person";
type SortOption = "date" | "course" | "student";

const SCOPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "3d", label: "Next 3 days" },
  { value: "7d", label: "Next 7 days" },
  { value: "14d", label: "Next 14 days" },
] as const;

const MODALITY_OPTIONS = [
  { value: "all", label: "All modalities" },
  { value: "online", label: "Online" },
  { value: "in_person", label: "In-person" },
] as const;

const SORT_OPTIONS = [
  { value: "date", label: "By date" },
  { value: "course", label: "By course" },
  { value: "student", label: "By student" },
] as const;

export default function TutorSchedule() {
  const { user } = useAuth();

  // Get tutor ID from authenticated user
  const tutorId = user?.tutorId ?? "tutor-1";

  // View mode: list or calendar
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date");

  // Calendar month navigation
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // Session details drawer state - will be implemented later
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Handlers
  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    // TODO: Open tutor-specific session details drawer
    console.log("Selected session:", session.id);
  };

  // Get all sessions from repository for authenticated tutor
  const allSessions = sessionRepository.findByTutorId(tutorId);

  // Apply filters
  const filteredSessions = useMemo(() => {
    let sessions = [...allSessions];

    // Status filter (upcoming vs past)
    if (statusFilter === "upcoming") {
      sessions = sessions.filter(
        (s) => s.isUpcoming() || s.status === "active"
      );
    } else {
      sessions = sessions.filter((s) => s.isCompleted() || s.isCancelled());
    }

    // Scope filter (time window)
    if (statusFilter === "upcoming" && scopeFilter !== "all") {
      const now = new Date();
      const daysMap = { "3d": 3, "7d": 7, "14d": 14 };
      const endDate = addDays(now, daysMap[scopeFilter]);
      sessions = sessions.filter((s) => s.startTime <= endDate);
    }

    // Modality filter
    if (modalityFilter !== "all") {
      sessions = sessions.filter((s) => s.modality === modalityFilter);
    }

    // Sort
    if (sortOption === "date") {
      sessions.sort((a, b) =>
        statusFilter === "upcoming"
          ? a.startTime.getTime() - b.startTime.getTime()
          : b.startTime.getTime() - a.startTime.getTime()
      );
    } else if (sortOption === "course") {
      sessions.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
    } else {
      sessions.sort((a, b) =>
        a.getPrimaryStudentName().localeCompare(b.getPrimaryStudentName())
      );
    }

    return sessions;
  }, [allSessions, statusFilter, scopeFilter, modalityFilter, sortOption]);

  // Stats
  const upcomingCount = allSessions.filter(
    (s) => s.isUpcoming() || s.status === "active"
  ).length;
  const completedCount = allSessions.filter((s) => s.isCompleted()).length;
  const needsWrapUpCount = allSessions.filter((s) => s.needsWrapUp()).length;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View and manage all your tutoring sessions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/tutor/availability">
            <Settings className="mr-2 h-4 w-4" />
            Manage Availability
          </Link>
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
            <CardTitle className="text-2xl">{upcomingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">{completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={needsWrapUpCount > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Need Wrap-up
            </CardDescription>
            <CardTitle
              className={cn(
                "text-2xl",
                needsWrapUpCount > 0 && "text-amber-600"
              )}
            >
              {needsWrapUpCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Sessions</CardDescription>
            <CardTitle className="text-2xl">{allSessions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* View Mode & Status Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Grid3X3 className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Status Toggle */}
            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Scope Filter (only for upcoming) */}
            {statusFilter === "upcoming" && (
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Scope</Label>
                <Select
                  value={scopeFilter}
                  onValueChange={(v) => setScopeFilter(v as ScopeFilter)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Modality Filter */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Type</Label>
              <Select
                value={modalityFilter}
                onValueChange={(v) => setModalityFilter(v as ModalityFilter)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODALITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Option */}
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Sort</Label>
              <Select
                value={sortOption}
                onValueChange={(v) => setSortOption(v as SortOption)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {viewMode === "list" ? (
        filteredSessions.length > 0 ? (
          <SessionTable
            sessions={filteredSessions}
            onSessionClick={handleSessionClick}
          />
        ) : (
          <EmptyState type={statusFilter} />
        )
      ) : (
        <SessionCalendar
          sessions={filteredSessions}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          onSessionClick={handleSessionClick}
        />
      )}
    </section>
  );
}

// ============================================
// SessionTable Component
// ============================================

interface SessionTableProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

function SessionTable({ sessions, onSessionClick }: SessionTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onClick={() => onSessionClick(session)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================
// SessionRow Component
// ============================================

interface SessionRowProps {
  session: Session;
  onClick: () => void;
}

function SessionRow({ session, onClick }: SessionRowProps) {
  const showWrapUpBadge = session.needsWrapUp();

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <TableCell>
        <div>
          <p className="font-medium">{session.courseCode}</p>
          <p className="text-sm text-muted-foreground">{session.courseName}</p>
        </div>
      </TableCell>
      <TableCell>{session.getStudentSummary()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm">{formatDate(session.startTime)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {session.isOnline() ? (
            <>
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Online</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">In-Person</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          <Badge variant={session.getStatusVariant()}>
            {session.getStatusLabel()}
          </Badge>
          {showWrapUpBadge && (
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-500/50"
            >
              Wrap-up
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ============================================
// SessionCalendar Component
// ============================================

interface SessionCalendarProps {
  sessions: Session[];
  month: Date;
  onMonthChange: (month: Date) => void;
  onSessionClick: (session: Session) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GRID_CELLS = 35; // 5 rows × 7 columns

function SessionCalendar({
  sessions,
  month,
  onMonthChange,
  onSessionClick,
}: SessionCalendarProps) {
  // Generate calendar grid starting from Monday
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const days = Array.from({ length: GRID_CELLS }, (_, i) => addDays(start, i));

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const key = format(session.startTime, "yyyy-MM-dd");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    });
    return grouped;
  }, [sessions]);

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {format(month, "MMMM yyyy")}
          </h2>
          <p className="text-sm text-muted-foreground">
            Click on a session to view details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addDays(month, -30))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addDays(month, 30))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, month);
            const isTodayDate = isToday(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[100px] border-b border-r p-2",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isTodayDate && "bg-primary/5 ring-2 ring-inset ring-primary"
                )}
              >
                <div className="mb-1 text-sm font-medium">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className={cn(
                        "w-full rounded px-1.5 py-0.5 text-left text-xs transition hover:opacity-80",
                        session.isOnline()
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                        session.needsWrapUp() && "ring-1 ring-amber-500"
                      )}
                    >
                      <div className="truncate font-medium">
                        {session.courseCode}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {formatTime(session.startTime)} ·{" "}
                        {session.getPrimaryStudentName().split(" ")[0]}
                      </div>
                    </button>
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EmptyState Component
// ============================================

interface EmptyStateProps {
  type: "upcoming" | "past";
}

function EmptyState({ type }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
      <CardHeader>
        <CardTitle className="text-lg">
          {type === "upcoming"
            ? "No upcoming sessions"
            : "No past sessions yet"}
        </CardTitle>
        <CardDescription>
          {type === "upcoming"
            ? "Students will book sessions based on your availability."
            : "Your completed sessions will appear here."}
        </CardDescription>
      </CardHeader>
      {type === "upcoming" && (
        <Button asChild variant="outline">
          <Link to="/tutor/availability">Manage Availability</Link>
        </Button>
      )}
    </Card>
  );
}
