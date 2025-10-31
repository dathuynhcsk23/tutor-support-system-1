import { sessionRepository, type SessionData } from "@/models";
// Import mock data modules to ensure repositories are populated first
import "@/data/mockStudents";
import "@/data/mockTutors";

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
 * studentIds is now an array to support group sessions
 *
 * Important: tutor-1 is Nguyen Van A (same as student-1).
 * Sessions should NOT have tutor-1 tutoring student-1 (self-tutoring).
 */
const SESSIONS_DATA: SessionData[] = [
  // =============================================
  // Sessions for student-1 (Nguyen Van A as STUDENT)
  // These are tutored by OTHER tutors (not tutor-1)
  // =============================================

  // Upcoming session - tomorrow at 10am (tutored by Tran Minh Khoa) - GROUP SESSION
  {
    id: "session-1",
    tutorId: "tutor-2", // Tran Minh Khoa
    studentIds: ["student-1", "student-2", "student-3"], // Group of 3
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "upcoming",
    startTime: setTime(addDays(today, 1), 10, 0),
    endTime: setTime(addDays(today, 1), 11, 0),
    meetingUrl: "https://meet.google.com/abc-defg-hij",
  },
  // Upcoming session - in 3 days (tutored by Le Thi Bich) - GROUP SESSION
  {
    id: "session-2",
    tutorId: "tutor-3", // Le Thi Bich
    studentIds: ["student-1", "student-4"], // Pair session
    courseCode: "CO3001",
    courseName: "Software Engineering",
    modality: "in_person",
    status: "upcoming",
    startTime: setTime(addDays(today, 3), 14, 0),
    endTime: setTime(addDays(today, 3), 15, 30),
    location: "Room A5-301",
  },
  // Completed session - yesterday (needs feedback, tutored by Tran Minh Khoa)
  {
    id: "session-3",
    tutorId: "tutor-2", // Tran Minh Khoa
    studentIds: ["student-1"],
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "completed",
    startTime: setTime(addDays(today, -1), 9, 0),
    endTime: setTime(addDays(today, -1), 10, 0),
    meetingUrl: "https://meet.google.com/xyz-uvwx-yz",
    feedbackSubmitted: false,
    attendance: "present",
    tutorNotes: "Reviewed tree traversal algorithms. Good progress!",
  },
  // Completed session - 3 days ago (tutored by Pham Hoang Nam) - GROUP SESSION
  {
    id: "session-4",
    tutorId: "tutor-4", // Pham Hoang Nam
    studentIds: ["student-1", "student-2", "student-4", "student-5"], // Group of 4
    courseCode: "MT1003",
    courseName: "Calculus 1",
    modality: "in_person",
    status: "completed",
    startTime: setTime(addDays(today, -3), 15, 0),
    endTime: setTime(addDays(today, -3), 16, 30),
    location: "Room B4-201",
    feedbackSubmitted: true,
    attendance: "present",
    tutorNotes:
      "Covered integration techniques. All students showed good progress.",
  },
  // Cancelled session (was with Le Thi Bich)
  {
    id: "session-5",
    tutorId: "tutor-3", // Le Thi Bich
    studentIds: ["student-1"],
    courseCode: "CO3001",
    courseName: "Software Engineering",
    modality: "online",
    status: "cancelled",
    startTime: setTime(addDays(today, -5), 10, 0),
    endTime: setTime(addDays(today, -5), 11, 0),
  },

  // =============================================
  // Sessions for tutor-1 (Nguyen Van A as TUTOR)
  // These have OTHER students (not student-1)
  // =============================================

  // Upcoming session - tomorrow at 2pm (tutoring Le Van B)
  {
    id: "session-10",
    tutorId: "tutor-1", // Nguyen Van A as tutor
    studentIds: ["student-2"], // Le Van B
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "upcoming",
    startTime: setTime(addDays(today, 1), 14, 0),
    endTime: setTime(addDays(today, 1), 15, 0),
    meetingUrl: "https://meet.google.com/tutor1-session",
  },
  // Upcoming session - in 4 days (tutoring Phan Thi C)
  {
    id: "session-11",
    tutorId: "tutor-1",
    studentIds: ["student-3"], // Phan Thi C
    courseCode: "CO2017",
    courseName: "Operating Systems",
    modality: "in_person",
    status: "upcoming",
    startTime: setTime(addDays(today, 4), 10, 0),
    endTime: setTime(addDays(today, 4), 11, 30),
    location: "Room A3-201",
  },
  // Completed session - 2 days ago (needs wrap-up - no notes)
  {
    id: "session-6",
    tutorId: "tutor-1",
    studentIds: ["student-2"], // Le Van B
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "in_person",
    status: "completed",
    startTime: setTime(addDays(today, -2), 14, 0),
    endTime: setTime(addDays(today, -2), 15, 0),
    location: "Room A4-501",
    feedbackSubmitted: false,
    attendance: "present", // Attendance marked but no notes
  },
  // Completed session - 4 days ago (wrapped up) - GROUP SESSION
  {
    id: "session-7",
    tutorId: "tutor-1",
    studentIds: ["student-3", "student-4", "student-5"], // Group of 3
    courseCode: "CO2017",
    courseName: "Operating Systems",
    modality: "online",
    status: "completed",
    startTime: setTime(addDays(today, -4), 10, 0),
    endTime: setTime(addDays(today, -4), 11, 30),
    meetingUrl: "https://meet.google.com/def-ghij-klm",
    feedbackSubmitted: true,
    attendance: "present",
    tutorNotes:
      "Discussed process scheduling algorithms. Good understanding shown.",
  },
  // Completed session - yesterday (needs wrap-up - pending attendance)
  {
    id: "session-12",
    tutorId: "tutor-1",
    studentIds: ["student-4"], // Tran Minh D
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "online",
    status: "completed",
    startTime: setTime(addDays(today, -1), 16, 0),
    endTime: setTime(addDays(today, -1), 17, 0),
    meetingUrl: "https://meet.google.com/tutor1-completed",
    feedbackSubmitted: false,
    attendance: "pending", // Hasn't marked attendance yet
  },

  // =============================================
  // Sessions for tutor-2 (Tran Minh Khoa)
  // =============================================

  // Upcoming session for tutor-2 - in 5 days
  {
    id: "session-8",
    tutorId: "tutor-2", // Tran Minh Khoa
    studentIds: ["student-2"], // Le Van B
    courseCode: "CO2017",
    courseName: "Operating Systems",
    modality: "online",
    status: "upcoming",
    startTime: setTime(addDays(today, 5), 9, 0),
    endTime: setTime(addDays(today, 5), 10, 30),
    meetingUrl: "https://meet.google.com/nop-qrst-uvw",
  },
  // Group session - upcoming, in 2 days
  {
    id: "session-9",
    tutorId: "tutor-2", // Tran Minh Khoa
    studentIds: ["student-2", "student-3"], // Le Van B & Phan Thi C (not student-1)
    courseCode: "CO2003",
    courseName: "Data Structures & Algorithms",
    modality: "in_person",
    status: "upcoming",
    startTime: setTime(addDays(today, 2), 15, 0),
    endTime: setTime(addDays(today, 2), 16, 30),
    location: "Room A4-302",
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
