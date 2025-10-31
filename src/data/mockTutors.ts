import { tutorRepository, type TutorData } from "@/models";

/**
 * Raw tutor data - Vietnamese student tutors at HCMUT
 *
 * This data is used to initialize the TutorRepository.
 * The actual Tutor class instances are created by the repository.
 *
 * Note: tutor-1 is Nguyen Van A, who is also student-1.
 * When logged in as a student, he should not see himself as a tutor.
 * When logged in as a tutor, he should not see himself as a student.
 */
const TUTORS_DATA: TutorData[] = [
  {
    id: "tutor-1",
    name: "Nguyen Van A",
    email: "a.nguyen@hcmut.edu.vn",
    department: "Computer Science",
    subjects: ["Data Structures & Algorithms", "Operating Systems"],
    rating: 4.7,
    totalSessions: 32,
    bio: "Year 3 CS student who loves helping others understand complex algorithms. I believe in learning by doing!",
    modalities: ["online", "in_person"],
  },
  {
    id: "tutor-2",
    name: "Tran Minh Khoa",
    email: "khoa.tran@hcmut.edu.vn",
    department: "Computer Science",
    subjects: ["Data Structures & Algorithms", "Software Engineering"],
    rating: 4.8,
    totalSessions: 45,
    bio: "Senior CS student passionate about algorithms and clean code. I love breaking down complex problems into simple steps.",
    modalities: ["online", "in_person"],
  },
  {
    id: "tutor-3",
    name: "Le Thi Bich",
    email: "bich.le@hcmut.edu.vn",
    department: "Computer Science",
    subjects: ["Software Engineering", "Database Systems"],
    rating: 4.9,
    totalSessions: 62,
    bio: "Final year student with industry internship experience. I focus on practical, real-world applications.",
    modalities: ["online", "in_person"],
  },
  {
    id: "tutor-4",
    name: "Pham Hoang Nam",
    email: "nam.pham@hcmut.edu.vn",
    department: "Mathematics",
    subjects: ["Calculus", "Linear Algebra"],
    rating: 4.7,
    totalSessions: 38,
    bio: "Math enthusiast who believes anyone can master calculus with the right approach. Patient and thorough.",
    modalities: ["online"],
  },
  {
    id: "tutor-5",
    name: "Nguyen Thi Mai",
    email: "mai.nguyen@hcmut.edu.vn",
    department: "Computer Science",
    subjects: ["Computer Networks", "Database Systems"],
    rating: 4.6,
    totalSessions: 29,
    bio: "Networking specialist with CCNA certification. I make complex networking concepts easy to understand.",
    modalities: ["in_person"],
  },
  {
    id: "tutor-6",
    name: "Vo Thanh Dat",
    email: "dat.vo@hcmut.edu.vn",
    department: "Electronics",
    subjects: ["Digital Systems", "Signals & Systems"],
    rating: 4.5,
    totalSessions: 24,
    bio: "Electronics student with hands-on lab experience. I help students understand both theory and practice.",
    modalities: ["online", "in_person"],
  },
  {
    id: "tutor-7",
    name: "Hoang Van Duc",
    email: "duc.hoang@hcmut.edu.vn",
    department: "Physics",
    subjects: ["Physics 1", "Physics 2"],
    rating: 4.8,
    totalSessions: 51,
    bio: "Physics tutor who uses real-world examples and visualizations. Let's make physics fun!",
    modalities: ["online"],
  },
];

/**
 * Initialize the tutor repository with mock data
 * Call this at app startup
 */
export function initializeTutorData(): void {
  tutorRepository.initialize(TUTORS_DATA);
}

// Initialize immediately when this module is imported
initializeTutorData();

// Re-export repository and types for convenience
export { tutorRepository };
export type { TutorFilterCriteria } from "@/models";

/**
 * Get unique departments from tutors
 */
export function getDepartments(): string[] {
  return tutorRepository.getDepartments();
}

/**
 * Get unique subjects from tutors
 */
export function getSubjects(): string[] {
  return tutorRepository.getSubjects();
}
