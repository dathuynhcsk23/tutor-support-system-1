import type { SessionModality, SessionStatus } from "@/types/session";
import { isBefore, isAfter, addMinutes } from "date-fns";
import { studentRepository } from "./StudentRepository";
import { tutorRepository } from "./TutorRepository";

/**
 * Attendance status for a session (from tutor's perspective)
 */
export type Attendance = "pending" | "present" | "absent";

/**
 * Data required to construct a Session instance
 */
export interface SessionData {
  id: string;
  tutorId: string;
  /** Array of student IDs participating in this session */
  studentIds: string[];
  courseCode: string;
  courseName: string;
  modality: SessionModality;
  status: SessionStatus;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  feedbackSubmitted?: boolean;
  /** Attendance marked by tutor */
  attendance?: Attendance;
  /** Session notes written by tutor */
  tutorNotes?: string;
}

/**
 * Session class - represents a tutoring session in the system
 *
 * Domain model class that encapsulates session data and behavior
 * used for business logic operations.
 */
export class Session {
  readonly id: string;
  readonly tutorId: string;
  readonly studentIds: readonly string[];
  readonly courseCode: string;
  readonly courseName: string;
  readonly modality: SessionModality;
  private _status: SessionStatus;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly location?: string;
  readonly meetingUrl?: string;
  readonly notes?: string;
  private _feedbackSubmitted: boolean;
  private _attendance: Attendance;
  private _tutorNotes?: string;

  constructor(data: SessionData) {
    this.id = data.id;
    this.tutorId = data.tutorId;
    this.studentIds = Object.freeze([...data.studentIds]); // Immutable copy
    this.courseCode = data.courseCode;
    this.courseName = data.courseName;
    this.modality = data.modality;
    this._status = data.status;
    this.startTime = new Date(data.startTime);
    this.endTime = new Date(data.endTime);
    this.location = data.location;
    this.meetingUrl = data.meetingUrl;
    this.notes = data.notes;
    this._feedbackSubmitted = data.feedbackSubmitted ?? false;
    this._attendance = data.attendance ?? "pending";
    this._tutorNotes = data.tutorNotes;
  }

  // ============================================
  // Basic Getters
  // ============================================

  get status(): SessionStatus {
    return this._status;
  }

  get feedbackSubmitted(): boolean {
    return this._feedbackSubmitted;
  }

  get attendance(): Attendance {
    return this._attendance;
  }

  get tutorNotes(): string | undefined {
    return this._tutorNotes;
  }

  // ============================================
  // Participant Resolution (from Repositories)
  // ============================================

  /**
   * Get the tutor's name from repository
   */
  get tutorName(): string {
    const tutor = tutorRepository.findById(this.tutorId);
    return tutor?.name ?? "Unknown Tutor";
  }

  /**
   * Get all student names from repository
   */
  getStudentNames(): string[] {
    return this.studentIds.map((id) => {
      const student = studentRepository.findById(id);
      return student?.name ?? "Unknown Student";
    });
  }

  /**
   * Get the primary (first) student's name
   * Useful for display when you only need one name
   */
  getPrimaryStudentName(): string {
    if (this.studentIds.length === 0) return "No students";
    const student = studentRepository.findById(this.studentIds[0]);
    return student?.name ?? "Unknown Student";
  }

  /**
   * Get participant summary for display
   * e.g., "Nguyen Van A" or "Nguyen Van A and 2 others"
   */
  getStudentSummary(): string {
    const names = this.getStudentNames();
    if (names.length === 0) return "No students";
    if (names.length === 1) return names[0];
    return `${names[0]} and ${names.length - 1} other${
      names.length > 2 ? "s" : ""
    }`;
  }

  /**
   * Get the number of students in this session
   */
  getStudentCount(): number {
    return this.studentIds.length;
  }

  /**
   * Check if a specific student is in this session
   */
  hasStudent(studentId: string): boolean {
    return this.studentIds.includes(studentId);
  }

  // ============================================
  // Status Checks
  // ============================================

  /**
   * Check if session is upcoming (not started yet)
   */
  isUpcoming(): boolean {
    return this._status === "upcoming" && isAfter(this.startTime, new Date());
  }

  /**
   * Check if session is currently active
   */
  isActive(): boolean {
    const now = new Date();
    return (
      this._status === "active" ||
      (this._status === "upcoming" &&
        isAfter(now, this.startTime) &&
        isBefore(now, this.endTime))
    );
  }

  /**
   * Check if session is completed
   */
  isCompleted(): boolean {
    return this._status === "completed";
  }

  /**
   * Check if session was cancelled
   */
  isCancelled(): boolean {
    return this._status === "cancelled";
  }

  /**
   * Check if session needs feedback from student
   */
  needsFeedback(): boolean {
    return this.isCompleted() && !this._feedbackSubmitted;
  }

  /**
   * Check if session needs wrap-up from tutor (attendance + notes)
   * Only completed sessions that haven't been wrapped up
   */
  needsWrapUp(): boolean {
    return (
      this.isCompleted() &&
      (this._attendance === "pending" || !this._tutorNotes)
    );
  }

  /**
   * Check if session is online
   */
  isOnline(): boolean {
    return this.modality === "online";
  }

  /**
   * Check if session is in-person
   */
  isInPerson(): boolean {
    return this.modality === "in_person";
  }

  // ============================================
  // Time & Duration
  // ============================================

  /**
   * Get session duration in minutes
   */
  getDurationMinutes(): number {
    return Math.round(
      (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60)
    );
  }

  /**
   * Check if session can be cancelled (e.g., at least 24h before)
   */
  canCancel(hoursBeforeRequired: number = 24): boolean {
    if (this._status !== "upcoming") return false;
    const cancelDeadline = addMinutes(new Date(), hoursBeforeRequired * 60);
    return isAfter(this.startTime, cancelDeadline);
  }

  /**
   * Check if session can be joined (within 15 min of start time)
   */
  canJoin(minutesBefore: number = 15): boolean {
    if (this._status === "cancelled" || this._status === "no_show") {
      return false;
    }
    const now = new Date();
    const joinWindow = addMinutes(this.startTime, -minutesBefore);
    return isAfter(now, joinWindow) && isBefore(now, this.endTime);
  }

  // ============================================
  // Display Helpers
  // ============================================

  /**
   * Get meeting location based on modality
   */
  getMeetingLocation(): string {
    if (this.isOnline()) {
      return this.meetingUrl || "Online (link will be provided)";
    }
    return this.location || "TBD";
  }

  /**
   * Get modality display label
   */
  getModalityLabel(): string {
    return this.modality === "online" ? "Online" : "In-Person";
  }

  /**
   * Get status display label
   */
  getStatusLabel(): string {
    const labels: Record<SessionStatus, string> = {
      upcoming: "Upcoming",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
      no_show: "No Show",
    };
    return labels[this._status];
  }

  /**
   * Get badge variant for status
   */
  getStatusVariant(): "default" | "secondary" | "destructive" | "outline" {
    switch (this._status) {
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

  // ============================================
  // Serialization
  // ============================================

  /**
   * Convert to plain object (for serialization)
   */
  toJSON(): SessionData {
    return {
      id: this.id,
      tutorId: this.tutorId,
      studentIds: [...this.studentIds],
      courseCode: this.courseCode,
      courseName: this.courseName,
      modality: this.modality,
      status: this._status,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      meetingUrl: this.meetingUrl,
      notes: this.notes,
      feedbackSubmitted: this._feedbackSubmitted,
      attendance: this._attendance,
      tutorNotes: this._tutorNotes,
    };
  }
}
