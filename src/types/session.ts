/**
 * Session modality - online or in-person
 */
export type SessionModality = "online" | "in_person";

/**
 * Session status
 */
export type SessionStatus =
  | "upcoming"
  | "active"
  | "completed"
  | "cancelled"
  | "no_show";

/**
 * Session model - represents a tutoring session
 */
export interface Session {
  id: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  modality: SessionModality;
  status: SessionStatus;
  startTime: Date;
  endTime: Date;
  location?: string; // For in-person
  meetingUrl?: string; // For online
  notes?: string;
  feedbackSubmitted?: boolean;
}

/**
 * Helper to get display label for modality
 */
export function getModalityLabel(modality: SessionModality): string {
  return modality === "online" ? "Online" : "In-Person";
}

/**
 * Helper to get display label for status
 */
export function getStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    upcoming: "Upcoming",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };
  return labels[status];
}

/**
 * Helper to get badge variant for status
 */
export function getStatusVariant(
  status: SessionStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "upcoming":
      return "secondary";
    case "completed":
      return "outline";
    case "cancelled":
    case "no_show":
      return "destructive";
    default:
      return "outline";
  }
}
