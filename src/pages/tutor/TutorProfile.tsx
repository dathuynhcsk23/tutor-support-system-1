import { useState, useMemo, useCallback } from "react";
import {
  Bell,
  Plus,
  RefreshCcw,
  Save,
  Undo2,
  User,
  Briefcase,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/context/AuthContext";
import { TutorRepository } from "@/models/TutorRepository";

// ============================================
// Types
// ============================================

type Digest = "immediate" | "daily" | "weekly";

interface TutorIdentity {
  name: string;
  email: string;
  tutorId: string;
  department: string;
}

interface NotificationSettings {
  bookingConfirmations: boolean;
  scheduleChanges: boolean;
  reminders24h: boolean;
  reminders1h: boolean;
  digest: Digest;
}

interface TutorProfileFormState {
  // Intro
  headline: string;
  bio: string;
  virtualMeetingLink: string;
  // Teaching focus
  modalities: {
    online: boolean;
    in_person: boolean;
  };
  subjects: string[];
  // Session logistics
  officeLocation: string;
  officeHours: string;
  allowInstantBooking: boolean;
  enableWaitlist: boolean;
  followUpNotes: string;
  // Notifications
  notifications: NotificationSettings;
}

// ============================================
// Constants
// ============================================

const MAX_SUBJECTS = 12;

const DEFAULT_SUBJECTS = [
  "Data Structures and Algorithms",
  "Database Systems",
  "Software Engineering",
  "Computer Networks",
  "Operating Systems",
  "Web Programming",
  "Machine Learning",
  "Calculus",
  "Linear Algebra",
  "Probability and Statistics",
];

const DEFAULT_FORM_STATE: TutorProfileFormState = {
  headline: "Computer Science tutor focused on practical problem solving",
  bio: "I help students understand core CS concepts through hands-on examples and guided practice. My sessions focus on building intuition rather than memorization.",
  virtualMeetingLink: "https://meet.hcmut.edu.vn/tutors/nguyen-van-a",
  modalities: {
    online: true,
    in_person: true,
  },
  subjects: [
    "Data Structures and Algorithms",
    "Database Systems",
    "Software Engineering",
  ],
  officeLocation: "Innovation Hub · Room 402",
  officeHours: "Tue & Thu · 2:00 – 4:00 PM",
  allowInstantBooking: true,
  enableWaitlist: false,
  followUpNotes: "Send recap email with practice problems within 24 hours.",
  notifications: {
    bookingConfirmations: true,
    scheduleChanges: true,
    reminders24h: true,
    reminders1h: false,
    digest: "immediate",
  },
};

// ============================================
// Main Component
// ============================================

export default function TutorProfile() {
  const { user } = useAuth();
  const tutorId = user?.tutorId ?? "tutor-1";

  // Get tutor from repository
  const tutor = TutorRepository.getInstance().findById(tutorId);

  // Form state
  const [formState, setFormState] =
    useState<TutorProfileFormState>(DEFAULT_FORM_STATE);
  const [savedState, setSavedState] =
    useState<TutorProfileFormState>(DEFAULT_FORM_STATE);

  // Subject selector state
  const [subjectInput, setSubjectInput] = useState("");
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(savedState);
  }, [formState, savedState]);

  // Identity from tutor or mock
  const identity: TutorIdentity = useMemo(() => {
    if (tutor) {
      return {
        name: tutor.name,
        email: `${tutor.name.toLowerCase().replace(/\s+/g, ".")}@hcmut.edu.vn`,
        tutorId: tutor.id,
        department: tutor.department,
      };
    }
    return {
      name: "Nguyen Van A",
      email: "nguyen.van.a@hcmut.edu.vn",
      tutorId: "tutor-1",
      department: "Faculty of Computer Science & Engineering",
    };
  }, [tutor]);

  // Get initials
  const initials = useMemo(() => {
    return identity.name
      .split(" ")
      .map((part) => part[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("");
  }, [identity.name]);

  // Subject options (combine defaults + tutor subjects + current)
  const subjectOptions = useMemo(() => {
    const base = tutor?.subjects ?? [];
    return Array.from(
      new Set([...DEFAULT_SUBJECTS, ...base, ...formState.subjects])
    ).sort((a, b) => a.localeCompare(b));
  }, [tutor, formState.subjects]);

  // Filtered subject options (exclude already selected)
  const availableSubjects = useMemo(() => {
    const selected = new Set(formState.subjects.map((s) => s.toLowerCase()));
    return subjectOptions.filter((s) => !selected.has(s.toLowerCase()));
  }, [subjectOptions, formState.subjects]);

  // Update a field in form state
  const updateField = useCallback(
    <K extends keyof TutorProfileFormState>(
      field: K,
      value: TutorProfileFormState[K]
    ) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Update a notification setting
  const updateNotification = useCallback(
    <K extends keyof NotificationSettings>(
      field: K,
      value: NotificationSettings[K]
    ) => {
      setFormState((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [field]: value },
      }));
    },
    []
  );

  // Subject management
  const addSubject = useCallback(
    (subject: string) => {
      const trimmed = subject.trim();
      if (!trimmed || formState.subjects.length >= MAX_SUBJECTS) return;

      const isDuplicate = formState.subjects.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) return;

      setFormState((prev) => ({
        ...prev,
        subjects: [...prev.subjects, trimmed],
      }));
      setSubjectInput("");
    },
    [formState.subjects]
  );

  const removeSubject = useCallback((subject: string) => {
    setFormState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    setSavedState(formState);
    alert("Tutor profile saved successfully!");
  }, [formState]);

  // Handle reset
  const handleReset = useCallback(() => {
    setFormState(savedState);
  }, [savedState]);

  // Handle restore defaults
  const handleRestoreDefaults = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tutor Profile
          </h1>
          <p className="text-muted-foreground">
            Tune the details students and coordinators see before and after your
            sessions.
          </p>
        </div>
        {isDirty && <Badge variant="secondary">Unsaved changes</Badge>}
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Intro Message Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Intro Message
              </CardTitle>
              <CardDescription>
                Update how you introduce yourself to students booking your
                sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  placeholder="Computer Science mentor focused on practical problem solving"
                  value={formState.headline}
                  onChange={(e) => updateField("headline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share how you approach sessions, the courses you cover, and what students can expect."
                  className="min-h-[150px]"
                  value={formState.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtualMeetingLink">Virtual meeting link</Label>
                <Input
                  id="virtualMeetingLink"
                  type="url"
                  placeholder="https://meet.hcmut.edu.vn/tutors/your-link"
                  value={formState.virtualMeetingLink}
                  onChange={(e) =>
                    updateField("virtualMeetingLink", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Teaching Focus Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Teaching Focus
              </CardTitle>
              <CardDescription>
                Highlight how you work with students and which topics you
                actively support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modalities */}
              <div className="space-y-3">
                <Label className="text-base">Modalities offered</Label>
                <p className="text-sm text-muted-foreground">
                  Choose at least one way students can meet with you.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Online</p>
                      <p className="text-xs text-muted-foreground">
                        Meet virtually using your preferred video tool.
                      </p>
                    </div>
                    <Switch
                      checked={formState.modalities.online}
                      onCheckedChange={(checked) =>
                        updateField("modalities", {
                          ...formState.modalities,
                          online: checked,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">In-person</p>
                      <p className="text-xs text-muted-foreground">
                        Meet students at your designated campus location.
                      </p>
                    </div>
                    <Switch
                      checked={formState.modalities.in_person}
                      onCheckedChange={(checked) =>
                        updateField("modalities", {
                          ...formState.modalities,
                          in_person: checked,
                        })
                      }
                    />
                  </label>
                </div>
                {!formState.modalities.online &&
                  !formState.modalities.in_person && (
                    <Alert variant="destructive">
                      <AlertTitle>No modality selected</AlertTitle>
                      <AlertDescription>
                        Please select at least one modality so students know how
                        to meet with you.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <Label className="text-base">Subjects you support</Label>
                <p className="text-sm text-muted-foreground">
                  Add classes, courses, or focus areas students can book you
                  for.
                </p>

                {/* Selected subjects */}
                <div className="flex flex-wrap gap-2">
                  {formState.subjects.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No subjects selected yet.
                    </span>
                  ) : (
                    formState.subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {subject}
                        <button
                          type="button"
                          aria-label={`Remove ${subject}`}
                          className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                          onClick={() => removeSubject(subject)}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                {/* Add subject */}
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubject(subjectInput);
                      }
                    }}
                    placeholder="Add a subject"
                    className="w-full sm:w-64"
                    disabled={formState.subjects.length >= MAX_SUBJECTS}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addSubject(subjectInput)}
                    disabled={
                      formState.subjects.length >= MAX_SUBJECTS ||
                      subjectInput.trim().length === 0
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add
                  </Button>
                  {availableSubjects.length > 0 && (
                    <Popover
                      open={subjectPopoverOpen}
                      onOpenChange={setSubjectPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={formState.subjects.length >= MAX_SUBJECTS}
                        >
                          Browse suggestions
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" sideOffset={8}>
                        <Command>
                          <CommandInput placeholder="Search subjects" />
                          <CommandList>
                            <CommandEmpty>No subjects found.</CommandEmpty>
                            <CommandGroup heading="Suggested">
                              {availableSubjects.map((option) => (
                                <CommandItem
                                  key={option}
                                  value={option}
                                  onSelect={() => {
                                    addSubject(option);
                                    setSubjectPopoverOpen(false);
                                  }}
                                >
                                  {option}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to add custom subjects. You can list up to{" "}
                  {MAX_SUBJECTS}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Logistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Logistics</CardTitle>
              <CardDescription>
                Tell coordinators how to route bookings and when you are ready
                for drop-ins.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="officeLocation">Primary location</Label>
                <Input
                  id="officeLocation"
                  placeholder="Innovation Hub · Room 402"
                  value={formState.officeLocation}
                  onChange={(e) =>
                    updateField("officeLocation", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeHours">Office hours</Label>
                <Input
                  id="officeHours"
                  placeholder="Tue & Thu · 2:00 – 4:00 PM"
                  value={formState.officeHours}
                  onChange={(e) => updateField("officeHours", e.target.value)}
                />
              </div>

              {/* Toggles */}
              <div className="col-span-full flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-base">Allow instant booking</Label>
                  <p className="text-sm text-muted-foreground">
                    Students can grab available slots without coordinator
                    approval.
                  </p>
                </div>
                <Switch
                  checked={formState.allowInstantBooking}
                  onCheckedChange={(v) => updateField("allowInstantBooking", v)}
                />
              </div>
              <div className="col-span-full flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="text-base">Enable waitlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect student interest when a block is fully booked.
                  </p>
                </div>
                <Switch
                  checked={formState.enableWaitlist}
                  onCheckedChange={(v) => updateField("enableWaitlist", v)}
                />
              </div>

              <div className="col-span-full space-y-2">
                <Label htmlFor="followUpNotes">Follow-up guidance</Label>
                <Textarea
                  id="followUpNotes"
                  placeholder="Share reminders for coordinators, e.g. 'Send recap email with linked drills within 24 hours.'"
                  className="min-h-[120px]"
                  value={formState.followUpNotes}
                  onChange={(e) => updateField("followUpNotes", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRestoreDefaults}
              >
                <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Restore defaults
              </Button>
            </CardFooter>
          </Card>

          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose when we should notify you about sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                id="bookingConfirmations"
                label="Booking confirmations"
                description="Confirm new sessions as soon as they're booked."
                checked={formState.notifications.bookingConfirmations}
                onCheckedChange={(v) =>
                  updateNotification("bookingConfirmations", v)
                }
              />
              <NotificationToggle
                id="scheduleChanges"
                label="Schedule changes"
                description="Alerts for reschedules or cancellations."
                checked={formState.notifications.scheduleChanges}
                onCheckedChange={(v) =>
                  updateNotification("scheduleChanges", v)
                }
              />
              <NotificationToggle
                id="reminders24h"
                label="Reminder (24 hours)"
                description="Reminder a day before each session."
                checked={formState.notifications.reminders24h}
                onCheckedChange={(v) => updateNotification("reminders24h", v)}
              />
              <NotificationToggle
                id="reminders1h"
                label="Reminder (1 hour)"
                description="Quick reminder 60 minutes before session starts."
                checked={formState.notifications.reminders1h}
                onCheckedChange={(v) => updateNotification("reminders1h", v)}
              />

              <Separator />

              {/* Email Digest */}
              <div className="space-y-3">
                <div>
                  <Label className="text-base">Email digest cadence</Label>
                  <p className="text-sm text-muted-foreground">
                    How often non-urgent updates are bundled.
                  </p>
                </div>
                <RadioGroup
                  value={formState.notifications.digest}
                  onValueChange={(v: Digest) => updateNotification("digest", v)}
                  className="space-y-2"
                >
                  <DigestOption
                    value="immediate"
                    label="Immediate"
                    description="Send notifications as they happen."
                  />
                  <DigestOption
                    value="daily"
                    label="Daily"
                    description="Summary at the end of each day."
                  />
                  <DigestOption
                    value="weekly"
                    label="Weekly"
                    description="Bundle into a weekly recap."
                  />
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!isDirty}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Reset changes
            </Button>
            <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="h-4 w-4" />
              Save profile
            </Button>
          </div>
        </div>

        {/* Right Column - Preview & Tips */}
        <div className="space-y-4">
          {/* Profile Preview Card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-1 items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {identity.name}
                  </CardTitle>
                  <CardDescription>{identity.department}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {/* Modalities */}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Modalities
                </p>
                <div className="flex flex-wrap gap-2">
                  {formState.modalities.online && (
                    <Badge variant="default">Online</Badge>
                  )}
                  {formState.modalities.in_person && (
                    <Badge variant="secondary">In-person</Badge>
                  )}
                  {!formState.modalities.online &&
                    !formState.modalities.in_person && (
                      <span className="text-xs text-muted-foreground">
                        No modalities selected
                      </span>
                    )}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Subjects
                </p>
                {formState.subjects.length > 0 ? (
                  <ScrollArea className="mt-2 max-h-32 rounded border">
                    <ul className="divide-y text-sm">
                      {formState.subjects.map((subject) => (
                        <li key={subject} className="px-3 py-2">
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Add subjects to highlight your focus areas.
                  </p>
                )}
              </div>

              {/* Quick Info */}
              {formState.officeLocation && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1">{formState.officeLocation}</p>
                </div>
              )}
              {formState.officeHours && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Office Hours
                  </p>
                  <p className="mt-1">{formState.officeHours}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility Tips</CardTitle>
              <CardDescription>
                A polished profile makes it easier for students to choose you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                <li>
                  Keep your headline action-oriented and mention your focus
                  area.
                </li>
                <li>
                  Use the follow-up guidance to remind staff of hand-offs.
                </li>
                <li>Add multiple subjects to appear in more search results.</li>
                <li>Enable instant booking to reduce friction for students.</li>
              </ul>
            </CardContent>
          </Card>

          {/* University Account Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">University Account</CardTitle>
                <CardDescription className="text-xs">
                  Synced from HCMUT
                </CardDescription>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{identity.name}</p>
                </li>
                <li>
                  <span className="text-muted-foreground">Email</span>
                  <p>
                    <a
                      href={`mailto:${identity.email}`}
                      className="text-primary hover:underline underline-offset-2"
                    >
                      {identity.email}
                    </a>
                  </p>
                </li>
                <li>
                  <span className="text-muted-foreground">Tutor ID</span>
                  <p className="font-medium">{identity.tutorId}</p>
                </li>
                <li>
                  <span className="text-muted-foreground">Department</span>
                  <p className="font-medium">{identity.department}</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => alert("Refreshed from university data!")}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh from University
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Helper Components
// ============================================

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function NotificationToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base cursor-pointer">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

interface DigestOptionProps {
  value: Digest;
  label: string;
  description: string;
}

function DigestOption({ value, label, description }: DigestOptionProps) {
  return (
    <label
      htmlFor={`digest-${value}`}
      className="flex items-center justify-between gap-4 rounded-md border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div>
        <span className="font-medium">{label}</span>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <RadioGroupItem value={value} id={`digest-${value}`} />
    </label>
  );
}
