import { sessionRepository, type SessionData } from "@/models";

/**
 * Helper to create dates relative to now
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function setTime(date: Date, hours: number, minutes: number = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

/**
 * Raw session data - used to initialize the SessionRepository
 */
const SESSIONS_DATA: SessionData[] = [
  // Upcoming session - tomorrow at 10am
  {
    id: "session-1",
    tutorId: "tutor-1",
    tutorName: "Tran Minh Khoa",
    studentId: "student-1",
    studentName: "Nguyen Van A",
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "upcoming",
    startTime: setTime(addDays(today, 1), 10, 0),
    endTime: setTime(addDays(today, 1), 11, 0),
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  },
  // Upcoming session - in 3 days
  {
    id: "session-2",
    tutorId: "tutor-2",
    tutorName: "Le Thi Bich",
    studentId: "student-1",
    studentName: "Nguyen Van A",
    courseCode: "CO3001",
    courseName: "Software Engineering",
    modality: "in_person",
    status: "upcoming",
    startTime: setTime(addDays(today, 3), 14, 0),
    endTime: setTime(addDays(today, 3), 15, 30),
    location: "Room A5-301",
  },
  // Completed session - yesterday (needs feedback)
  {
    id: "session-3",
    tutorId: "tutor-1",
    tutorName: "Tran Minh Khoa",
    studentId: "student-1",
    studentName: "Nguyen Van A",
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "completed",
    startTime: setTime(addDays(today, -1), 9, 0),
    endTime: setTime(addDays(today, -1), 10, 0),
    meetingUrl: "https://meet.google.com/xyz-uvwx-yz",
    feedbackSubmitted: false,
  },
  // Completed session - 3 days ago (feedback submitted)
  {
    id: "session-4",
    tutorId: "tutor-3",
    tutorName: "Pham Hoang Nam",
    studentId: "student-1",
    studentName: "Nguyen Van A",
    courseCode: "MT1003",
    courseName: "Calculus 1",
    modality: "in_person",
    status: "completed",
    startTime: setTime(addDays(today, -3), 15, 0),
    endTime: setTime(addDays(today, -3), 16, 30),
    location: "Room B4-201",
    feedbackSubmitted: true,
  },
  // Cancelled session
  {
    id: "session-5",
    tutorId: "tutor-2",
    tutorName: "Le Thi Bich",
    studentId: "student-1",
    studentName: "Nguyen Van A",
    courseCode: "CO3001",
    courseName: "Software Engineering",
    modality: "online",
    status: "cancelled",
    startTime: setTime(addDays(today, -5), 10, 0),
    endTime: setTime(addDays(today, -5), 11, 0),
  },
];

/**
 * Initialize the session repository with mock data
 * Call this at app startup
 */
export function initializeSessionData(): void {
  sessionRepository.initialize(SESSIONS_DATA);
}

// Initialize immediately when this module is imported
initializeSessionData();

// Re-export repository for convenience
export { sessionRepository };

/**
 * Get upcoming sessions
 */
export function getUpcomingSessions() {
  return sessionRepository.getUpcomingForStudent("student-1");
}

/**
 * Get next upcoming session
 */
export function getNextSession() {
  return sessionRepository.getNextSessionForStudent("student-1");
}

/**
 * Get sessions needing feedback
 */
export function getSessionsNeedingFeedback() {
  return sessionRepository.getSessionsNeedingFeedback("student-1");
}
