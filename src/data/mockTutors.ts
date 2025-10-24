import type { Tutor } from "@/types/tutor";

/**
 * Mock tutors data - Vietnamese student tutors
 */
export const MOCK_TUTORS: Tutor[] = [
  {
    id: "tutor-1",
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
    id: "tutor-2",
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
    id: "tutor-3",
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
    id: "tutor-4",
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
    id: "tutor-5",
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
    id: "tutor-6",
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
 * Filter options for tutor search
 */
export interface TutorFilters {
  query: string;
  department: string;
  subject: string;
  modality: "all" | "online" | "in_person";
}

/**
 * Search tutors with filters
 */
export function searchTutors(filters: TutorFilters): Tutor[] {
  return MOCK_TUTORS.filter((tutor) => {
    // Filter by search query (name or subject)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchesName = tutor.name.toLowerCase().includes(q);
      const matchesSubject = tutor.subjects.some((s) =>
        s.toLowerCase().includes(q)
      );
      if (!matchesName && !matchesSubject) return false;
    }

    // Filter by department
    if (filters.department && tutor.department !== filters.department) {
      return false;
    }

    // Filter by subject
    if (filters.subject && !tutor.subjects.includes(filters.subject)) {
      return false;
    }

    // Filter by modality
    if (filters.modality !== "all" && !tutor.modalities.includes(filters.modality)) {
      return false;
    }

    return true;
  });
}

/**
 * Get a tutor by ID
 */
export function getTutorById(id: string): Tutor | undefined {
  return MOCK_TUTORS.find((t) => t.id === id);
}

/**
 * Get unique departments from tutors
 */
export function getDepartments(): string[] {
  return [...new Set(MOCK_TUTORS.map((t) => t.department))];
}

/**
 * Get unique subjects from tutors
 */
export function getSubjects(): string[] {
  return [...new Set(MOCK_TUTORS.flatMap((t) => t.subjects))];
}
