import { addDays, setHours, setMinutes } from "date-fns";

export type SlotModality = "online" | "in_person";

export interface WeeklyPatternData {
  id: string;
  tutorId: string;
  label?: string;
  days: number[]; // 0 (Sun) - 6 (Sat)
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  durationMinutes: number;
  modality: SlotModality;
  capacity: number;
  isActive: boolean;
}

export type WeeklyPatternInput = Omit<WeeklyPatternData, "id" | "tutorId">;

/**
 * WeeklyPattern represents a recurring availability pattern for a tutor.
 * It defines the days, times, and capacity for slots that repeat weekly.
 */
export class WeeklyPattern {
  readonly id: string;
  readonly tutorId: string;
  private _label?: string;
  private _days: number[];
  private _startHour: number;
  private _startMinute: number;
  private _endHour: number;
  private _endMinute: number;
  private _durationMinutes: number;
  private _modality: SlotModality;
  private _capacity: number;
  private _isActive: boolean;

  constructor(data: WeeklyPatternData) {
    this.id = data.id;
    this.tutorId = data.tutorId;
    this._label = data.label;
    this._days = [...data.days].sort((a, b) => a - b);
    this._startHour = data.startHour;
    this._startMinute = data.startMinute;
    this._endHour = data.endHour;
    this._endMinute = data.endMinute;
    this._durationMinutes = data.durationMinutes;
    this._modality = data.modality;
    this._capacity = data.capacity;
    this._isActive = data.isActive;
  }

  // Getters
  get label(): string | undefined {
    return this._label;
  }
  get days(): number[] {
    return [...this._days];
  }
  get startHour(): number {
    return this._startHour;
  }
  get startMinute(): number {
    return this._startMinute;
  }
  get endHour(): number {
    return this._endHour;
  }
  get endMinute(): number {
    return this._endMinute;
  }
  get durationMinutes(): number {
    return this._durationMinutes;
  }
  get modality(): SlotModality {
    return this._modality;
  }
  get capacity(): number {
    return this._capacity;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Get start time in minutes from midnight
   */
  get startTimeMinutes(): number {
    return this._startHour * 60 + this._startMinute;
  }

  /**
   * Get end time in minutes from midnight
   */
  get endTimeMinutes(): number {
    return this._endHour * 60 + this._endMinute;
  }

  /**
   * Get the total duration of the time range in minutes
   */
  get totalRangeMinutes(): number {
    return this.endTimeMinutes - this.startTimeMinutes;
  }

  /**
   * Calculate how many slots this pattern generates per day
   */
  get slotsPerDay(): number {
    return Math.floor(this.totalRangeMinutes / this._durationMinutes);
  }

  /**
   * Generate time slots for a specific week
   * @param weekStart The start of the week (Monday)
   * @returns Array of slot start/end times for that week
   */
  generateSlotsForWeek(weekStart: Date): Array<{ start: Date; end: Date }> {
    if (!this._isActive) return [];

    const slots: Array<{ start: Date; end: Date }> = [];

    for (const dayOfWeek of this._days) {
      // Calculate the date for this day of the week
      // weekStart is Monday (1), so we need to adjust
      const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
      const date = addDays(weekStart, dayOffset);

      // Generate slots for this day
      let currentMinutes = this.startTimeMinutes;
      while (currentMinutes + this._durationMinutes <= this.endTimeMinutes) {
        const startHour = Math.floor(currentMinutes / 60);
        const startMin = currentMinutes % 60;
        const endMinutes = currentMinutes + this._durationMinutes;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        const start = setMinutes(setHours(date, startHour), startMin);
        const end = setMinutes(setHours(date, endHour), endMin);

        slots.push({ start, end });
        currentMinutes += this._durationMinutes;
      }
    }

    return slots;
  }

  /**
   * Create an updated copy of this pattern
   */
  update(changes: Partial<WeeklyPatternInput>): WeeklyPattern {
    return new WeeklyPattern({
      id: this.id,
      tutorId: this.tutorId,
      label: changes.label !== undefined ? changes.label : this._label,
      days: changes.days ?? this._days,
      startHour: changes.startHour ?? this._startHour,
      startMinute: changes.startMinute ?? this._startMinute,
      endHour: changes.endHour ?? this._endHour,
      endMinute: changes.endMinute ?? this._endMinute,
      durationMinutes: changes.durationMinutes ?? this._durationMinutes,
      modality: changes.modality ?? this._modality,
      capacity: changes.capacity ?? this._capacity,
      isActive: changes.isActive ?? this._isActive,
    });
  }

  /**
   * Toggle the active status
   */
  toggleActive(): WeeklyPattern {
    return this.update({ isActive: !this._isActive });
  }

  /**
   * Get a summary string for display
   */
  getSummary(): string {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysStr = this._days.map((d) => dayLabels[d]).join(", ");
    const timeStr = `${this.formatTime(
      this._startHour,
      this._startMinute
    )} – ${this.formatTime(this._endHour, this._endMinute)}`;
    return `${daysStr} • ${timeStr}`;
  }

  /**
   * Get detailed description
   */
  getDescription(): string {
    const dayLabels = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daysStr = this._days.map((d) => dayLabels[d]).join(", ");
    const timeStr = `${this.formatTime(
      this._startHour,
      this._startMinute
    )} – ${this.formatTime(this._endHour, this._endMinute)}`;
    return `${daysStr} • ${timeStr}`;
  }

  private formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toData(): WeeklyPatternData {
    return {
      id: this.id,
      tutorId: this.tutorId,
      label: this._label,
      days: this._days,
      startHour: this._startHour,
      startMinute: this._startMinute,
      endHour: this._endHour,
      endMinute: this._endMinute,
      durationMinutes: this._durationMinutes,
      modality: this._modality,
      capacity: this._capacity,
      isActive: this._isActive,
    };
  }

  /**
   * Validate pattern input
   */
  static validate(input: WeeklyPatternInput): string | null {
    if (input.days.length === 0) {
      return "Select at least one weekday.";
    }

    const startTotal = input.startHour * 60 + input.startMinute;
    const endTotal = input.endHour * 60 + input.endMinute;

    if (endTotal <= startTotal) {
      return "End time must be after start time.";
    }

    if (input.durationMinutes < 15) {
      return "Duration must be at least 15 minutes.";
    }

    if (input.durationMinutes > endTotal - startTotal) {
      return "Duration must fit within the time range.";
    }

    if (input.capacity < 1) {
      return "Capacity must be at least 1.";
    }

    return null;
  }

  /**
   * Create a new pattern with a generated ID
   */
  static create(tutorId: string, input: WeeklyPatternInput): WeeklyPattern {
    return new WeeklyPattern({
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tutorId,
      ...input,
    });
  }
}
