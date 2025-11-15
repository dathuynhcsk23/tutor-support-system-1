import { format } from "date-fns";
import type { SlotModality } from "./WeeklyPattern";

export interface TimeSlotData {
  id: string;
  tutorId: string;
  patternId?: string;
  start: Date;
  end: Date;
  modality: SlotModality;
  capacity: number;
  booked: number;
  isActive: boolean;
}

/**
 * TimeSlot represents an individual bookable time slot for a tutor.
 * Slots can be generated from WeeklyPatterns or created individually.
 */
export class TimeSlot {
  readonly id: string;
  readonly tutorId: string;
  readonly patternId?: string;
  readonly start: Date;
  readonly end: Date;
  private _modality: SlotModality;
  private _capacity: number;
  private _booked: number;
  private _isActive: boolean;

  constructor(data: TimeSlotData) {
    this.id = data.id;
    this.tutorId = data.tutorId;
    this.patternId = data.patternId;
    this.start = new Date(data.start);
    this.end = new Date(data.end);
    this._modality = data.modality;
    this._capacity = data.capacity;
    this._booked = data.booked;
    this._isActive = data.isActive;
  }

  // Getters
  get modality(): SlotModality {
    return this._modality;
  }
  get capacity(): number {
    return this._capacity;
  }
  get booked(): number {
    return this._booked;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Get remaining available seats
   */
  get availableSeats(): number {
    return Math.max(0, this._capacity - this._booked);
  }

  /**
   * Check if the slot is fully booked
   */
  get isFullyBooked(): boolean {
    return this._booked >= this._capacity;
  }

  /**
   * Check if the slot can be booked (active and has availability)
   */
  get isBookable(): boolean {
    return this._isActive && !this.isFullyBooked;
  }

  /**
   * Get the date portion of the slot
   */
  get date(): Date {
    return new Date(
      this.start.getFullYear(),
      this.start.getMonth(),
      this.start.getDate()
    );
  }

  /**
   * Get formatted date key for grouping (YYYY-MM-DD)
   */
  get dateKey(): string {
    return format(this.start, "yyyy-MM-dd");
  }

  /**
   * Get formatted time range string
   */
  get timeRange(): string {
    return `${format(this.start, "p")} – ${format(this.end, "p")}`;
  }

  /**
   * Get formatted start time
   */
  get startTime(): string {
    return format(this.start, "p");
  }

  /**
   * Get formatted end time
   */
  get endTime(): string {
    return format(this.end, "p");
  }

  /**
   * Get booking status string
   */
  get bookingStatus(): string {
    return `${this._booked}/${this._capacity} booked`;
  }

  /**
   * Toggle the active status
   */
  toggleActive(): TimeSlot {
    return new TimeSlot({
      ...this.toData(),
      isActive: !this._isActive,
    });
  }

  /**
   * Update the capacity (must be >= booked)
   */
  updateCapacity(newCapacity: number): TimeSlot {
    const validCapacity = Math.max(newCapacity, this._booked);
    return new TimeSlot({
      ...this.toData(),
      capacity: validCapacity,
    });
  }

  /**
   * Add a booking to this slot
   */
  addBooking(): TimeSlot {
    if (this.isFullyBooked) {
      throw new Error("Slot is fully booked");
    }
    return new TimeSlot({
      ...this.toData(),
      booked: this._booked + 1,
    });
  }

  /**
   * Remove a booking from this slot
   */
  removeBooking(): TimeSlot {
    if (this._booked <= 0) {
      throw new Error("No bookings to remove");
    }
    return new TimeSlot({
      ...this.toData(),
      booked: this._booked - 1,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toData(): TimeSlotData {
    return {
      id: this.id,
      tutorId: this.tutorId,
      patternId: this.patternId,
      start: this.start,
      end: this.end,
      modality: this._modality,
      capacity: this._capacity,
      booked: this._booked,
      isActive: this._isActive,
    };
  }

  /**
   * Create a unique key for this slot
   */
  getKey(): string {
    return `${this.tutorId}__${this.start.toISOString()}`;
  }

  /**
   * Create a slot from a pattern's generated time
   */
  static fromPattern(
    tutorId: string,
    patternId: string,
    start: Date,
    end: Date,
    modality: SlotModality,
    capacity: number,
    booked: number = 0,
    isActive: boolean = true
  ): TimeSlot {
    return new TimeSlot({
      id: `slot-${start.toISOString()}-${patternId}`,
      tutorId,
      patternId,
      start,
      end,
      modality,
      capacity,
      booked,
      isActive,
    });
  }
}
