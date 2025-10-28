import { useState, useMemo } from "react";
import { Bell, RefreshCcw, Save, Undo2, User } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

// ============================================
// Types
// ============================================

type Digest = "immediate" | "daily" | "weekly";

interface UniversityIdentity {
  name: string;
  email: string;
  studentId: string;
  department: string;
  program: string;
}

interface NotificationSettings {
  bookingConfirmations: boolean;
  scheduleChanges: boolean;
  reminders24h: boolean;
  reminders1h: boolean;
  digest: Digest;
}

interface ProfileFormState {
  preferredName: string;
  phone: string;
  major: string;
  yearOrTerm: string;
  notifications: NotificationSettings;
}

// ============================================
// Mock Data
// ============================================

const MOCK_IDENTITY: UniversityIdentity = {
  name: "Nguyen Van An",
  email: "an.nguyen@hcmut.edu.vn",
  studentId: "2152XXX",
  department: "Faculty of Computer Science & Engineering",
  program: "Bachelor of Engineering - Computer Science",
};

const DEFAULT_FORM_STATE: ProfileFormState = {
  preferredName: "An",
  phone: "+84 912 345 678",
  major: "Computer Science",
  yearOrTerm: "Year 3",
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

export default function Profile() {
  // Form state
  const [formState, setFormState] =
    useState<ProfileFormState>(DEFAULT_FORM_STATE);
  const [savedState, setSavedState] =
    useState<ProfileFormState>(DEFAULT_FORM_STATE);

  // Check if form has unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(savedState);
  }, [formState, savedState]);

  // Get initials from identity
  const initials = useMemo(() => {
    return MOCK_IDENTITY.name
      .split(" ")
      .map((part) => part[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("");
  }, []);

  // Update a field in form state
  const updateField = <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Update a notification setting
  const updateNotification = <K extends keyof NotificationSettings>(
    field: K,
    value: NotificationSettings[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  // Handle save
  const handleSave = () => {
    setSavedState(formState);
    alert("Profile saved successfully!");
  };

  // Handle reset
  const handleReset = () => {
    setFormState(savedState);
  };

  // Handle restore notification defaults
  const handleRestoreNotificationDefaults = () => {
    setFormState((prev) => ({
      ...prev,
      notifications: DEFAULT_FORM_STATE.notifications,
    }));
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Update your preferred contact details and notification preferences.
          </p>
        </div>
        {isDirty && <Badge variant="secondary">Unsaved changes</Badge>}
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal
              </CardTitle>
              <CardDescription>
                Tailor how coordinators address you and where we can reach you.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred name</Label>
                <Input
                  id="preferredName"
                  placeholder="Alex"
                  value={formState.preferredName}
                  onChange={(e) => updateField("preferredName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+84 912 345 678"
                  value={formState.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For urgent schedule changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Program Card */}
          <Card>
            <CardHeader>
              <CardTitle>Program</CardTitle>
              <CardDescription>
                Help tutors understand where you are in your academic journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="major">Major / Department</Label>
                <Input
                  id="major"
                  placeholder="Computer Science"
                  value={formState.major}
                  onChange={(e) => updateField("major", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOrTerm">Year or Term</Label>
                <Input
                  id="yearOrTerm"
                  placeholder="Year 2"
                  value={formState.yearOrTerm}
                  onChange={(e) => updateField("yearOrTerm", e.target.value)}
                />
              </div>
            </CardContent>
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
              {/* Toggle Options */}
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

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestoreNotificationDefaults}
                >
                  Restore defaults
                </Button>
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
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="h-4 w-4" />
              Save changes
            </Button>
          </div>
        </div>

        {/* Right Column - University Account */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">University Account</CardTitle>
                <CardDescription>Synced from HCMUT systems.</CardDescription>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <ul className="space-y-4 text-sm">
                <IdentityRow label="Name" value={MOCK_IDENTITY.name} />
                <IdentityRow
                  label="Email"
                  value={MOCK_IDENTITY.email}
                  href={`mailto:${MOCK_IDENTITY.email}`}
                />
                <IdentityRow
                  label="Student ID"
                  value={MOCK_IDENTITY.studentId}
                />
                <IdentityRow
                  label="Department"
                  value={MOCK_IDENTITY.department}
                />
                <IdentityRow label="Program" value={MOCK_IDENTITY.program} />
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

interface IdentityRowProps {
  label: string;
  value: string;
  href?: string;
}

function IdentityRow({ label, value, href }: IdentityRowProps) {
  return (
    <li>
      <span className="text-muted-foreground">{label}</span>
      {href ? (
        <p>
          <a
            href={href}
            className="text-primary hover:underline underline-offset-2"
          >
            {value}
          </a>
        </p>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </li>
  );
}
