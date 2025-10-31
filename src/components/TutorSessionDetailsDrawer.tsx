import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  Pencil,
  Save,
  Users,
  Video,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { formatTimeRange } from "@/lib/date";
import { studentRepository, tutorRepository, type Session } from "@/models";

// ============================================
// Types
// ============================================

/**
 * Per-student attendance status options
 */
export type StudentAttendance = "not_recorded" | "present" | "late" | "no_show";

const ATTENDANCE_OPTIONS: { value: StudentAttendance; label: string }[] = [
  { value: "not_recorded", label: "Not recorded" },
  { value: "present", label: "Present on time" },
  { value: "late", label: "Arrived late" },
  { value: "no_show", label: "No-show" },
];

function getAttendanceBadgeVariant(
  attendance: StudentAttendance
): "default" | "secondary" | "destructive" | "outline" {
  switch (attendance) {
    case "present":
      return "default";
    case "late":
      return "secondary";
    case "no_show":
      return "destructive";
    default:
      return "outline";
  }
}

interface TutorSessionDetailsDrawerProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: (session: Session) => void;
  /** Callback when attendance/notes are saved */
  onSaveWrapUp?: (
    session: Session,
    data: {
      attendance: Record<string, StudentAttendance>;
      tutorNotes: string;
    }
  ) => void;
}

// ============================================
// Helper Components
// ============================================

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

interface StudentRowWithAttendanceProps {
  studentId: string;
  attendance: StudentAttendance;
  onAttendanceChange: (
    studentId: string,
    attendance: StudentAttendance
  ) => void;
  disabled?: boolean;
}

function StudentRowWithAttendance({
  studentId,
  attendance,
  onAttendanceChange,
  disabled,
}: StudentRowWithAttendanceProps) {
  const student = studentRepository.findById(studentId);
  if (!student) return null;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 py-2 px-3">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-muted">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{student.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {student.program}
        </p>
      </div>
      {disabled ? (
        <Badge variant={getAttendanceBadgeVariant(attendance)}>
          {ATTENDANCE_OPTIONS.find((o) => o.value === attendance)?.label}
        </Badge>
      ) : (
        <Select
          value={attendance}
          onValueChange={(value) =>
            onAttendanceChange(studentId, value as StudentAttendance)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ATTENDANCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function TutorSessionDetailsDrawer({
  session,
  open,
  onOpenChange,
  onCancel,
  onSaveWrapUp,
}: TutorSessionDetailsDrawerProps) {
  // Local state for attendance and notes
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, StudentAttendance>
  >({});
  const [tutorNotes, setTutorNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset state when session changes
  useEffect(() => {
    if (session) {
      // Initialize attendance for each student
      const initialAttendance: Record<string, StudentAttendance> = {};
      session.studentIds.forEach((studentId) => {
        initialAttendance[studentId] = "not_recorded";
      });
      setAttendanceMap(initialAttendance);
      setTutorNotes(session.tutorNotes ?? "");
      setHasChanges(false);
    }
  }, [session]);

  if (!session) return null;

  const canJoin = session.canJoin();
  const canCancel = session.canCancel();
  const isCompleted = session.isCompleted();
  const needsWrapUp = session.needsWrapUp();

  const handleAttendanceChange = (
    studentId: string,
    attendance: StudentAttendance
  ) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: attendance }));
    setHasChanges(true);
  };

  const handleNotesChange = (value: string) => {
    setTutorNotes(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSaveWrapUp) return;

    setIsSaving(true);

    onSaveWrapUp(session, {
      attendance: attendanceMap,
      tutorNotes,
    });

    setIsSaving(false);
    setHasChanges(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto h-[85vh] max-h-[90vh] max-w-2xl rounded-t-xl p-0"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="space-y-3 border-b px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <SheetTitle className="text-xl">
                  {session.courseCode} · {session.courseName}
                </SheetTitle>
                <SheetDescription>
                  {format(session.startTime, "EEEE, MMMM d, yyyy")}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                {needsWrapUp && (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-500"
                  >
                    Wrap-up needed
                  </Badge>
                )}
                <Badge variant={session.getStatusVariant()}>
                  {session.getStatusLabel()}
                </Badge>
              </div>
            </div>

            {/* Join Button */}
            {canJoin && (
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => {
                  if (session.meetingUrl) {
                    window.open(session.meetingUrl, "_blank");
                  }
                }}
              >
                <Video className="h-4 w-4" />
                Join Session
              </Button>
            )}
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* Session Details */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Session Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoRow
                    icon={Clock}
                    label="Time"
                    value={formatTimeRange(session.startTime, session.endTime)}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Duration"
                    value={`${session.getDurationMinutes()} minutes`}
                  />
                  <InfoRow
                    icon={session.isOnline() ? Globe : MapPin}
                    label="Location"
                    value={session.getMeetingLocation()}
                    href={session.isOnline() ? session.meetingUrl : undefined}
                  />
                  <InfoRow
                    icon={Video}
                    label="Format"
                    value={session.getModalityLabel()}
                  />
                </div>
              </section>

              <Separator />

              {/* Tutor (You) */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Tutor
                </h3>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.tutorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {session.tutorName}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (You)
                        </span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {tutorRepository.findById(session.tutorId)?.department}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Students with Attendance */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {session.getStudentCount() > 1
                    ? `Students (${session.getStudentCount()})`
                    : "Student"}
                  {isCompleted && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      — Mark attendance
                    </span>
                  )}
                </h3>
                <div className="rounded-lg border divide-y">
                  {session.studentIds.map((studentId) => (
                    <StudentRowWithAttendance
                      key={studentId}
                      studentId={studentId}
                      attendance={attendanceMap[studentId] ?? "not_recorded"}
                      onAttendanceChange={handleAttendanceChange}
                      disabled={!isCompleted}
                    />
                  ))}
                </div>
                {session.getStudentCount() > 1 && (
                  <p className="text-xs text-muted-foreground">
                    This is a group session with {session.getStudentCount()}{" "}
                    students.
                  </p>
                )}
              </section>

              {/* Tutor Notes Section (for completed sessions) */}
              {isCompleted && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      Session Notes
                    </h3>
                    <Textarea
                      placeholder="Add notes about this session... What topics were covered? How did students perform? Any follow-up needed?"
                      value={tutorNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      These notes are private and help you track student
                      progress.
                    </p>
                  </section>
                </>
              )}

              {/* Existing Notes (read-only for upcoming sessions) */}
              {!isCompleted && session.tutorNotes && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Previous Notes
                    </h3>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        {session.tutorNotes}
                      </p>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {hasChanges && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Unsaved changes
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isCompleted && onSaveWrapUp && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="gap-2"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Wrap-up
                      </>
                    )}
                  </Button>
                )}
                {canCancel && onCancel && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onCancel(session);
                      onOpenChange(false);
                    }}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel Session
                  </Button>
                )}
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
