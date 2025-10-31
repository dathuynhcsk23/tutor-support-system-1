import { studentRepository, type StudentData } from "@/models";

/**
 * Raw student data - used to initialize the StudentRepository
 */
const STUDENTS_DATA: StudentData[] = [
  {
    id: "student-1",
    name: "Nguyen Van A",
    email: "a.nguyen@hcmut.edu.vn",
    studentId: "2312345",
    program: "Computer Science",
    year: 3,
  },
  {
    id: "student-2",
    name: "Le Van B",
    email: "b.le@hcmut.edu.vn",
    studentId: "2323456",
    program: "Computer Science",
    year: 2,
  },
  {
    id: "student-3",
    name: "Phan Thi C",
    email: "c.phan@hcmut.edu.vn",
    studentId: "2456789",
    program: "Computer Engineering",
    year: 3,
  },
  {
    id: "student-4",
    name: "Tran Minh D",
    email: "d.tran@hcmut.edu.vn",
    studentId: "2412321",
    program: "Electrical Engineering",
    year: 4,
  },
  {
    id: "student-5",
    name: "Vo Thanh E",
    email: "e.vo@hcmut.edu.vn",
    studentId: "2598765",
    program: "Computer Science",
    year: 2,
  },
];

/**
 * Initialize the student repository with mock data
 */
export function initializeStudentData(): void {
  studentRepository.initialize(STUDENTS_DATA);
}

// Initialize immediately when this module is imported
initializeStudentData();

// Re-export for convenience
export { studentRepository };
