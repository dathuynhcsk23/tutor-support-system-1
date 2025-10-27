import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Video,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tutorRepository, sessionRepository, type Tutor } from "@/models";
import type { SessionData } from "@/models/Session";
import { cn } from "@/lib/utils";
// Ensure mock data is loaded
import "@/data/mockTutors";

/**
 * Available time slots for scheduling
 * In a real app, these would come from tutor availability
 */
const TIME_SLOTS = [
  { start: "09:00", end: "10:00", label: "9:00 AM - 10:00 AM" },
  { start: "10:00", end: "11:00", label: "10:00 AM - 11:00 AM" },
  { start: "11:00", end: "12:00", label: "11:00 AM - 12:00 PM" },
  { start: "14:00", end: "15:00", label: "2:00 PM - 3:00 PM" },
  { start: "15:00", end: "16:00", label: "3:00 PM - 4:00 PM" },
  { start: "16:00", end: "17:00", label: "4:00 PM - 5:00 PM" },
];

/**
 * Derive a course code from subject name
 * E.g., "Data Structures & Algorithms" -> "CO2003"
 */
function deriveCourseCode(subject: string): string {
  const codes: Record<string, string> = {
    "Data Structures & Algorithms": "CO2003",
    "Software Engineering": "CO3001",
    "Database Systems": "CO3005",
    "Computer Networks": "CO3093",
    Calculus: "MT1003",
    "Linear Algebra": "MT1007",
    "Physics 1": "PH1003",
    "Physics 2": "PH1007",
    "Digital Systems": "EE2003",
    "Signals & Systems": "EE2007",
  };
  return codes[subject] || "XX0000";
}

export default function ScheduleSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get tutor from URL params
  const tutorId = searchParams.get("tutorId") ?? "";

  // Form state
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [selectedModality, setSelectedModality] = useState<
    "online" | "in_person" | null
  >(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tutor on mount
  useEffect(() => {
    if (!tutorId) {
      navigate("/student/find", { replace: true });
      return;
    }

    const foundTutor = tutorRepository.findById(tutorId);
    if (!foundTutor) {
      // Tutor not found, redirect
      navigate("/student/find", { replace: true });
      return;
    }

    setTutor(foundTutor);
    // Set initial modality
    if (foundTutor.modalities.length > 0) {
      setSelectedModality(foundTutor.modalities[0]);
    }
    // Set initial subject
    if (foundTutor.subjects.length > 0) {
      setSelectedSubject(foundTutor.subjects[0]);
    }
  }, [tutorId, navigate]);

  // Course options derived from tutor's subjects
  const courseOptions = useMemo(() => {
    if (!tutor) return [];
    return tutor.subjects.map((subject) => ({
      code: deriveCourseCode(subject),
      name: subject,
    }));
  }, [tutor]);

  // Check if form is complete
  const canSubmit =
    tutor &&
    selectedModality &&
    selectedSubject &&
    selectedDate &&
    selectedTimeSlot &&
    !isSubmitting;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Parse the selected time slot
    const timeSlot = TIME_SLOTS.find((slot) => slot.start === selectedTimeSlot);
    if (!timeSlot || !selectedDate) {
      setIsSubmitting(false);
      return;
    }

    // Create start and end times
    const [startHour, startMin] = timeSlot.start.split(":").map(Number);
    const [endHour, endMin] = timeSlot.end.split(":").map(Number);

    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, endMin, 0, 0);

    // Create session data
    const sessionData: SessionData = {
      id: `session-${Date.now()}`, // Generate unique ID
      tutorId: tutor.id,
      tutorName: tutor.name,
      studentId: "student-1", // Current user (hardcoded for now)
      studentName: "Current Student",
      courseCode: deriveCourseCode(selectedSubject),
      courseName: selectedSubject,
      modality: selectedModality,
      status: "upcoming",
      startTime,
      endTime,
      location: selectedModality === "in_person" ? "Room B4-201" : undefined,
      meetingUrl:
        selectedModality === "online"
          ? "https://meet.google.com/abc-defg-hij"
          : undefined,
    };

    // Add session to repository
    sessionRepository.add(sessionData);

    // Navigate to schedule page
    navigate("/student/schedule");
  };

  // Disable past dates and weekends
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return date < today || day === 0 || day === 6;
  };

  if (!tutor) {
    return (
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Alert variant="destructive">
          <AlertTitle>Tutor not found</AlertTitle>
          <AlertDescription>
            The tutor you're looking for doesn't exist.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link to="/student/find">Back to Find a Tutor</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/student/find"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Find a Tutor
        </Link>
        <span>/</span>
        <span className="text-foreground">Schedule Session</span>
      </nav>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <CalendarClock className="h-6 w-6 text-primary" />
            Schedule with {tutor.name}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {tutor.getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{tutor.department}</Badge>
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {tutor.getFormattedRating()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {tutor.subjects.join(" · ")}
                </p>
              </div>
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modality Selection */}
            <div className="space-y-3">
              <Label>Session Type</Label>
              <RadioGroup
                value={selectedModality ?? ""}
                onValueChange={(value) =>
                  setSelectedModality(value as "online" | "in_person")
                }
                className="flex flex-wrap gap-3"
              >
                {[
                  {
                    value: "online" as const,
                    label: "Online",
                    icon: Video,
                    description: "Video call via Google Meet",
                  },
                  {
                    value: "in_person" as const,
                    label: "In-Person",
                    icon: MapPin,
                    description: "Meet at campus",
                  },
                ].map((option) => {
                  const isAvailable = tutor.hasModality(option.value);
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "flex flex-1 min-w-[140px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition",
                        !isAvailable && "cursor-not-allowed opacity-50",
                        selectedModality === option.value &&
                          "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        disabled={!isAvailable}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Subject Selection */}
            <div className="space-y-3">
              <Label>Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {courseOptions.map((course) => (
                    <SelectItem key={course.code} value={course.name}>
                      {course.code} · {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time Selection */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Date Picker */}
              <div className="space-y-3">
                <Label>Date</Label>
                <div className="rounded-lg border p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={disabledDays}
                    className="mx-auto"
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Time Slots
                </Label>
                {selectedDate ? (
                  <div className="grid gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <label
                        key={slot.start}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:border-primary/50",
                          selectedTimeSlot === slot.start &&
                            "border-primary bg-primary/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot.start}
                          checked={selectedTimeSlot === slot.start}
                          onChange={(e) => setSelectedTimeSlot(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full border-2",
                            selectedTimeSlot === slot.start
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}
                        />
                        <span className="text-sm">{slot.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      Select a date to see available times
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary & Submit */}
            {canSubmit && (
              <Alert className="bg-primary/5 border-primary/20">
                <CalendarClock className="h-4 w-4" />
                <AlertTitle>Session Summary</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>
                    <strong>Subject:</strong>{" "}
                    {deriveCourseCode(selectedSubject)} · {selectedSubject}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {selectedDate?.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {
                      TIME_SLOTS.find((s) => s.start === selectedTimeSlot)
                        ?.label
                    }
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {selectedModality === "online" ? "Online" : "In-Person"}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/student/find")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit} className="flex-1">
                {isSubmitting ? "Scheduling..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
