import { WeeklyPattern, type WeeklyPatternData } from "@/models/WeeklyPattern";

/**
 * Mock weekly patterns for tutor-1 (Nguyen Van A)
 */
const mockPatternData: WeeklyPatternData[] = [
  {
    id: "pattern-1",
    tutorId: "tutor-1",
    label: "Morning online slots",
    days: [1, 2, 3, 4, 5], // Mon-Fri
    startHour: 9,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    durationMinutes: 60,
    modality: "online",
    capacity: 3,
    isActive: true,
  },
  {
    id: "pattern-2",
    tutorId: "tutor-1",
    label: "Afternoon in-person sessions",
    days: [2, 4], // Tue, Thu
    startHour: 14,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    durationMinutes: 90,
    modality: "in_person",
    capacity: 5,
    isActive: true,
  },
  {
    id: "pattern-3",
    tutorId: "tutor-1",
    label: "Weekend review sessions",
    days: [6], // Sat
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    durationMinutes: 60,
    modality: "online",
    capacity: 4,
    isActive: false, // Inactive for demonstration
  },
];

/**
 * Get initial patterns as WeeklyPattern instances
 */
export function getInitialPatterns(): WeeklyPattern[] {
  return mockPatternData.map((data) => new WeeklyPattern(data));
}

/**
 * Mock slot overrides - slots that have been individually modified
 * Key: slot ID, Value: { capacity, booked, isActive }
 */
export const mockSlotOverrides: Record<
  string,
  { capacity?: number; booked?: number; isActive?: boolean }
> = {
  // Some slots have bookings
  // These will be applied when generating slots
};
