import { Session, type SessionData } from "./Session";

/**
 * SessionRepository - Repository pattern for managing session data
 *
 * This class provides a centralized data access layer for sessions.
 * Uses singleton pattern to ensure consistent state across the app.
 */
export class SessionRepository {
  private static instance: SessionRepository;
  private sessions: Map<string, Session> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): SessionRepository {
    if (!SessionRepository.instance) {
      SessionRepository.instance = new SessionRepository();
    }
    return SessionRepository.instance;
  }

  /**
   * Initialize repository with session data
   */
  initialize(sessionsData: SessionData[]): void {
    this.sessions.clear();
    sessionsData.forEach((data) => {
      const session = new Session(data);
      this.sessions.set(session.id, session);
    });
  }

  /**
   * Get all sessions
   */
  findAll(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Find a session by ID
   */
  findById(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get sessions for a specific student
   */
  findByStudentId(studentId: string): Session[] {
    return this.findAll().filter((session) => session.studentId === studentId);
  }

  /**
   * Get sessions for a specific tutor
   */
  findByTutorId(tutorId: string): Session[] {
    return this.findAll().filter((session) => session.tutorId === tutorId);
  }

  /**
   * Get upcoming sessions for a student
   */
  getUpcomingForStudent(studentId: string): Session[] {
    return this.findByStudentId(studentId)
      .filter((session) => session.isUpcoming())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Get upcoming sessions for a tutor
   */
  getUpcomingForTutor(tutorId: string): Session[] {
    return this.findByTutorId(tutorId)
      .filter((session) => session.isUpcoming())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Get the next upcoming session for a student
   */
  getNextSessionForStudent(studentId: string): Session | undefined {
    const upcoming = this.getUpcomingForStudent(studentId);
    return upcoming.length > 0 ? upcoming[0] : undefined;
  }

  /**
   * Get sessions needing feedback from a student
   */
  getSessionsNeedingFeedback(studentId: string): Session[] {
    return this.findByStudentId(studentId).filter((session) =>
      session.needsFeedback()
    );
  }

  /**
   * Get completed sessions for a student
   */
  getCompletedForStudent(studentId: string): Session[] {
    return this.findByStudentId(studentId)
      .filter((session) => session.isCompleted())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Get sessions that can be joined right now
   */
  getJoinableSessions(userId: string, role: "student" | "tutor"): Session[] {
    const sessions =
      role === "student"
        ? this.findByStudentId(userId)
        : this.findByTutorId(userId);

    return sessions.filter((session) => session.canJoin());
  }

  /**
   * Get the next upcoming session for a tutor (soonest upcoming session)
   */
  getNextSessionForTutor(tutorId: string): Session | null {
    const upcoming = this.getUpcomingForTutor(tutorId);
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  /**
   * Get sessions that need wrap-up from tutor (attendance + notes)
   * Only completed sessions that haven't been fully wrapped up
   */
  getSessionsNeedingWrapUp(tutorId: string): Session[] {
    return this.findByTutorId(tutorId)
      .filter((session) => session.needsWrapUp())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Get total count of sessions
   */
  count(): number {
    return this.sessions.size;
  }

  /**
   * Add a new session
   */
  add(sessionData: SessionData): Session {
    const session = new Session(sessionData);
    this.sessions.set(session.id, session);
    return session;
  }
}

// Export singleton instance for convenience
export const sessionRepository = SessionRepository.getInstance();
