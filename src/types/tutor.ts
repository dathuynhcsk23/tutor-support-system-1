import type { SessionModality } from "./session";

/**
 * Tutor model - represents a tutor in the system
 */
export interface Tutor {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  rating: number;
  totalSessions: number;
  bio: string;
  modalities: SessionModality[];
}

/**
 * Available departments for filtering
 */
export const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Electronics",
  "Mechanical Engineering",
  "Chemical Engineering",
] as const;

/**
 * Available subjects for filtering
 */
export const SUBJECTS = [
  "Data Structures & Algorithms",
  "Software Engineering",
  "Database Systems",
  "Computer Networks",
  "Calculus",
  "Linear Algebra",
  "Physics 1",
  "Physics 2",
  "Digital Systems",
  "Signals & Systems",
] as const;
