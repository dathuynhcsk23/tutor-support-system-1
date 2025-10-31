import { format } from "date-fns";
import {
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  MessageSquare,
  Users,
  Video,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatTimeRange } from "@/lib/date";
import { studentRepository, tutorRepository, type Session } from "@/models";

// ============================================
// Types
// ============================================

interface SessionDetailsDrawerProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
  /** Current user's student ID for highlighting "You" in participant list */
  currentStudentId?: string;
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

function ParticipantRow({
  name,
  subtitle,
  isYou,
  variant = "default",
}: {
  name: string;
  subtitle?: string;
  isYou?: boolean;
  variant?: "default" | "tutor";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="h-9 w-9">
        <AvatarFallback
          className={
            variant === "tutor" ? "bg-primary/10 text-primary" : "bg-muted"
          }
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {name}
          {isYou && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (You)
            </span>
          )}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function SessionDetailsDrawer({
  session,
  open,
  onOpenChange,
  onReschedule,
  onCancel,
  currentStudentId,
}: SessionDetailsDrawerProps) {
  if (!session) return null;

  const canJoin = session.canJoin();
  const canCancel = session.canCancel();
  const canReschedule = session.isUpcoming();
  const showFeedback = session.needsFeedback();

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
              <Badge variant={session.getStatusVariant()}>
                {session.getStatusLabel()}
              </Badge>
            </div>

            {/* Join Button - Prominent placement for active/upcoming sessions */}
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

              {/* Tutor */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Tutor
                </h3>
                <div className="rounded-lg border p-3">
                  <ParticipantRow
                    name={session.tutorName}
                    subtitle={
                      tutorRepository.findById(session.tutorId)?.department
                    }
                    variant="tutor"
                  />
                </div>
              </section>

              <Separator />

              {/* Students */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {session.getStudentCount() > 1
                    ? `Students (${session.getStudentCount()})`
                    : "Student"}
                </h3>
                <div className="rounded-lg border divide-y">
                  {session.studentIds.map((studentId) => {
                    const student = studentRepository.findById(studentId);
                    if (!student) return null;
                    return (
                      <div key={studentId} className="px-3">
                        <ParticipantRow
                          name={student.name}
                          subtitle={student.program}
                          isYou={studentId === currentStudentId}
                        />
                      </div>
                    );
                  })}
                </div>
                {session.getStudentCount() > 1 && (
                  <p className="text-xs text-muted-foreground">
                    This is a group session with {session.getStudentCount()}{" "}
                    students.
                  </p>
                )}
              </section>

              {/* Notes (if any) */}
              {session.notes && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Session Notes
                    </h3>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">
                        {session.notes}
                      </p>
                    </div>
                  </section>
                </>
              )}

              {/* Feedback Prompt */}
              {showFeedback && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Feedback
                    </h3>
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            How was your session?
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your feedback helps tutors improve and helps other
                            students find great tutors.
                          </p>
                          <Button size="sm" variant="outline" className="mt-2">
                            Give Feedback
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {canReschedule && onReschedule && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onReschedule(session);
                    onOpenChange(false);
                  }}
                >
                  Reschedule
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
      </SheetContent>
    </Sheet>
  );
}
