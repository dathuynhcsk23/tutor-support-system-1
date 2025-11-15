import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { getInitialPatterns } from "@/data/mockPatterns";
import { TimeSlot } from "@/models/TimeSlot";
import {
  WeeklyPattern,
  type SlotModality,
  type WeeklyPatternInput,
} from "@/models/WeeklyPattern";

// ============================================================================
// Constants
// ============================================================================

const MODALITY_TABS = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "in_person", label: "In-person" },
] as const;

type ModalityTab = (typeof MODALITY_TABS)[number]["value"];

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mon", longLabel: "Monday" },
  { value: 2, label: "Tue", longLabel: "Tuesday" },
  { value: 3, label: "Wed", longLabel: "Wednesday" },
  { value: 4, label: "Thu", longLabel: "Thursday" },
  { value: 5, label: "Fri", longLabel: "Friday" },
  { value: 6, label: "Sat", longLabel: "Saturday" },
  { value: 0, label: "Sun", longLabel: "Sunday" },
] as const;

const MODALITY_OPTIONS: Array<{ value: SlotModality; label: string }> = [
  { value: "online", label: "Online" },
  { value: "in_person", label: "In-person" },
];

// ============================================================================
// Main Component
// ============================================================================

export function TutorAvailability() {
  const { user } = useAuth();
  const tutorId = user?.tutorId ?? "tutor-1";

  // State
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [view, setView] = useState<"slots" | "patterns">("slots");
  const [modality, setModality] = useState<ModalityTab>("all");
  const [patterns, setPatterns] = useState<WeeklyPattern[]>(() =>
    getInitialPatterns()
  );
  const [slotOverrides, setSlotOverrides] = useState<
    Map<string, { capacity?: number; isActive?: boolean }>
  >(new Map());
  const [draftCapacity, setDraftCapacity] = useState<Record<string, string>>(
    {}
  );

  // Pattern form state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formTarget, setFormTarget] = useState<WeeklyPattern | null>(null);

  // Generate slots from patterns for the current week
  const slots = useMemo(() => {
    const generatedSlots: TimeSlot[] = [];

    for (const pattern of patterns) {
      if (!pattern.isActive) continue;

      const patternSlots = pattern.generateSlotsForWeek(weekStart);
      for (const { start, end } of patternSlots) {
        const slot = TimeSlot.fromPattern(
          tutorId,
          pattern.id,
          start,
          end,
          pattern.modality,
          pattern.capacity,
          Math.floor(Math.random() * 2), // Random 0-1 booked for demo
          true
        );

        // Apply any overrides
        const override = slotOverrides.get(slot.id);
        if (override) {
          let updatedSlot = slot;
          if (override.capacity !== undefined) {
            updatedSlot = updatedSlot.updateCapacity(override.capacity);
          }
          if (override.isActive !== undefined) {
            updatedSlot = override.isActive
              ? updatedSlot
              : updatedSlot.toggleActive();
            if (!override.isActive && updatedSlot.isActive) {
              updatedSlot = updatedSlot.toggleActive();
            }
          }
          generatedSlots.push(updatedSlot);
        } else {
          generatedSlots.push(slot);
        }
      }
    }

    // Filter by modality if needed
    if (modality !== "all") {
      return generatedSlots.filter((slot) => slot.modality === modality);
    }

    return generatedSlots;
  }, [patterns, weekStart, modality, tutorId, slotOverrides]);

  // Group slots by day
  const groupedSlots = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    for (const slot of slots) {
      const existing = map.get(slot.dateKey) ?? [];
      existing.push(slot);
      map.set(slot.dateKey, existing);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, daySlots]) => ({
        dateKey,
        slots: daySlots.sort((a, b) => a.start.getTime() - b.start.getTime()),
      }));
  }, [slots]);

  // Initialize draft capacity when slots change
  useEffect(() => {
    const newDraft: Record<string, string> = {};
    for (const slot of slots) {
      newDraft[slot.id] = slot.capacity.toString();
    }
    setDraftCapacity(newDraft);
  }, [slots]);

  // Summary metrics
  const totalSlots = slots.length;
  const activeSlots = slots.filter((slot) => slot.isActive).length;
  const openSeats = slots.reduce((sum, slot) => sum + slot.availableSeats, 0);

  // Week label
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(
    weekEnd,
    "MMM d"
  )}`;

  // Handlers
  const handleToggleSlot = useCallback((slot: TimeSlot) => {
    setSlotOverrides((prev) => {
      const next = new Map(prev);
      const existing = next.get(slot.id) ?? {};
      next.set(slot.id, { ...existing, isActive: !slot.isActive });
      return next;
    });
  }, []);

  const handleDraftCapacity = useCallback((slotId: string, value: string) => {
    setDraftCapacity((prev) => ({ ...prev, [slotId]: value }));
  }, []);

  const handleCapacityCommit = useCallback(
    (slot: TimeSlot) => {
      const rawValue = draftCapacity[slot.id];
      const parsed = parseInt(rawValue ?? `${slot.capacity}`, 10);
      const target = isNaN(parsed)
        ? slot.capacity
        : Math.max(parsed, slot.booked);

      if (target === slot.capacity) {
        setDraftCapacity((prev) => ({
          ...prev,
          [slot.id]: slot.capacity.toString(),
        }));
        return;
      }

      setSlotOverrides((prev) => {
        const next = new Map(prev);
        const existing = next.get(slot.id) ?? {};
        next.set(slot.id, { ...existing, capacity: target });
        return next;
      });
    },
    [draftCapacity]
  );

  const handleTogglePattern = useCallback((pattern: WeeklyPattern) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === pattern.id ? p.toggleActive() : p))
    );
  }, []);

  const handleDeletePattern = useCallback((pattern: WeeklyPattern) => {
    const confirmed = window.confirm(
      `Delete the pattern "${pattern.label || pattern.getSummary()}"?`
    );
    if (confirmed) {
      setPatterns((prev) => prev.filter((p) => p.id !== pattern.id));
    }
  }, []);

  const handlePatternSubmit = useCallback(
    (values: WeeklyPatternInput) => {
      if (formMode === "create") {
        const newPattern = WeeklyPattern.create(tutorId, values);
        setPatterns((prev) => [...prev, newPattern]);
      } else if (formTarget) {
        setPatterns((prev) =>
          prev.map((p) => (p.id === formTarget.id ? p.update(values) : p))
        );
      }
      setFormOpen(false);
      setFormTarget(null);
    },
    [formMode, formTarget, tutorId]
  );

  const openCreateForm = useCallback(() => {
    setFormMode("create");
    setFormTarget(null);
    setFormOpen(true);
  }, []);

  const openEditForm = useCallback((pattern: WeeklyPattern) => {
    setFormMode("edit");
    setFormTarget(pattern);
    setFormOpen(true);
  }, []);

  // Sort patterns by day and time
  const sortedPatterns = useMemo(() => {
    return [...patterns].sort((a, b) => {
      const dayA = Math.min(...a.days, 7);
      const dayB = Math.min(...b.days, 7);
      if (dayA !== dayB) return dayA - dayB;
      if (a.startHour !== b.startHour) return a.startHour - b.startHour;
      return a.startMinute - b.startMinute;
    });
  }, [patterns]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Availability & Capacity
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Control which slots students can book and adjust capacity for each
          session.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total slots"
          value={totalSlots}
          hint="Across the selected week"
        />
        <SummaryCard
          title="Open slots"
          value={activeSlots}
          hint="Currently bookable"
        />
        <SummaryCard
          title="Open seats"
          value={openSeats}
          hint="Remaining across all slots"
        />
      </div>

      {/* Week Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekStart((prev) => subWeeks(prev, 1))}
        >
          Previous week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
          }
        >
          Current week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekStart((prev) => addWeeks(prev, 1))}
        >
          Next week
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as "slots" | "patterns")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="slots">Week view</TabsTrigger>
          <TabsTrigger value="patterns">Recurring patterns</TabsTrigger>
        </TabsList>

        {/* Week View Tab */}
        <TabsContent value="slots" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Week of {weekLabel}</h2>
              <p className="text-sm text-muted-foreground">
                Toggle slots or adjust capacity as needed.
              </p>
            </div>
            <Tabs
              value={modality}
              onValueChange={(value) => setModality(value as ModalityTab)}
            >
              <TabsList>
                {MODALITY_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {groupedSlots.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                No slots configured for this week. Add recurring patterns or
                switch modalities to see options.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {groupedSlots.map(({ dateKey, slots: daySlots }) => (
                <Card key={dateKey}>
                  <CardHeader>
                    <CardTitle>
                      {format(new Date(dateKey), "EEEE, MMM d")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {daySlots.map((slot) => {
                      const capacityValue =
                        draftCapacity[slot.id] ?? slot.capacity.toString();

                      return (
                        <div
                          key={slot.id}
                          className="grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-4"
                        >
                          <div className="space-y-1">
                            <div className="text-sm font-semibold">
                              {slot.timeRange}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {slot.bookingStatus}
                            </p>
                          </div>
                          <Badge
                            variant={
                              slot.modality === "online"
                                ? "default"
                                : "secondary"
                            }
                            className="md:justify-self-start"
                          >
                            {slot.modality === "online"
                              ? "Online"
                              : "In-person"}
                          </Badge>
                          <div className="flex items-center gap-2 md:justify-self-start">
                            <Switch
                              checked={slot.isActive}
                              onCheckedChange={() => handleToggleSlot(slot)}
                            />
                            <span className="text-xs text-muted-foreground">
                              {slot.isActive ? "Open" : "Blocked"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:justify-self-end">
                            <Input
                              type="number"
                              min={slot.booked}
                              value={capacityValue}
                              onChange={(e) =>
                                handleDraftCapacity(slot.id, e.target.value)
                              }
                              onBlur={() => handleCapacityCommit(slot)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="w-20"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recurring Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Recurring weekly patterns
              </h2>
              <p className="text-sm text-muted-foreground">
                Define templates that auto-generate weekly slots.
              </p>
            </div>
            <Button size="sm" onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add pattern
            </Button>
          </div>

          {sortedPatterns.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No recurring patterns yet</CardTitle>
                <CardDescription>
                  Add at least one pattern so students can see your
                  availability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={openCreateForm}>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create pattern
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedPatterns.map((pattern) => (
                <Card key={pattern.id}>
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">
                          {pattern.label ?? pattern.getSummary()}
                        </h3>
                        <Badge variant="outline">
                          {pattern.durationMinutes} min blocks
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pattern.getDescription()}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                          {pattern.modality === "online"
                            ? "Online"
                            : "In-person"}
                        </Badge>
                        <span>{pattern.capacity} seat(s) per slot</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pattern.isActive}
                          onCheckedChange={() => handleTogglePattern(pattern)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {pattern.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(pattern)}
                        >
                          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePattern(pattern)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pattern Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? "Add recurring pattern"
                : "Edit recurring pattern"}
            </DialogTitle>
            <DialogDescription>
              Choose the days, times, and modality that should repeat each week.
            </DialogDescription>
          </DialogHeader>
          <WeeklyPatternForm
            initial={formTarget ?? undefined}
            mode={formMode}
            onCancel={() => {
              setFormOpen(false);
              setFormTarget(null);
            }}
            onSubmit={handlePatternSubmit}
          />
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

interface WeeklyPatternFormProps {
  initial?: WeeklyPattern;
  mode: "create" | "edit";
  onCancel: () => void;
  onSubmit: (values: WeeklyPatternInput) => void;
}

function WeeklyPatternForm({
  initial,
  mode,
  onCancel,
  onSubmit,
}: WeeklyPatternFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(initial?.days ?? [])
  );
  const [startTime, setStartTime] = useState(
    initial
      ? `${String(initial.startHour).padStart(2, "0")}:${String(
          initial.startMinute
        ).padStart(2, "0")}`
      : "09:00"
  );
  const [endTime, setEndTime] = useState(
    initial
      ? `${String(initial.endHour).padStart(2, "0")}:${String(
          initial.endMinute
        ).padStart(2, "0")}`
      : "12:00"
  );
  const [duration, setDuration] = useState(
    initial ? String(initial.durationMinutes) : "60"
  );
  const [modalityValue, setModalityValue] = useState<SlotModality>(
    initial?.modality ?? "online"
  );
  const [capacity, setCapacity] = useState(
    initial ? String(initial.capacity) : "3"
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!initial) return;
    setLabel(initial.label ?? "");
    setSelectedDays(new Set(initial.days));
    setStartTime(
      `${String(initial.startHour).padStart(2, "0")}:${String(
        initial.startMinute
      ).padStart(2, "0")}`
    );
    setEndTime(
      `${String(initial.endHour).padStart(2, "0")}:${String(
        initial.endMinute
      ).padStart(2, "0")}`
    );
    setDuration(String(initial.durationMinutes));
    setModalityValue(initial.modality);
    setCapacity(String(initial.capacity));
    setIsActive(initial.isActive);
  }, [initial]);

  const handleToggleDay = useCallback((day: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const days = Array.from(selectedDays).sort((a, b) => a - b);

    const startParts = startTime.split(":").map((p) => parseInt(p, 10));
    const endParts = endTime.split(":").map((p) => parseInt(p, 10));

    if (startParts.length !== 2 || endParts.length !== 2) {
      setFormError("Times must be in HH:MM format.");
      return;
    }

    const [startHour, startMinute] = startParts;
    const [endHour, endMinute] = endParts;
    const durationMinutes = parseInt(duration, 10);
    const capacityValue = parseInt(capacity, 10);

    const input: WeeklyPatternInput = {
      label: label.trim() || undefined,
      days,
      startHour,
      startMinute,
      endHour,
      endMinute,
      durationMinutes,
      modality: modalityValue,
      capacity: capacityValue,
      isActive,
    };

    const validationError = WeeklyPattern.validate(input);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    onSubmit(input);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="pattern-label">Label (optional)</Label>
          <Input
            id="pattern-label"
            value={label}
            placeholder="e.g. Morning online slots"
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Switch
              id="pattern-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="pattern-active" className="cursor-pointer">
              {isActive ? "Active" : "Inactive"}
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Weekdays</Label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_OPTIONS.map((option) => {
            const selected = selectedDays.has(option.value);
            return (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                onClick={() => handleToggleDay(option.value)}
                aria-pressed={selected}
              >
                <span className="sr-only">{option.longLabel}</span>
                <span aria-hidden="true">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="pattern-start">Start time</Label>
          <Input
            id="pattern-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pattern-end">End time</Label>
          <Input
            id="pattern-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="pattern-duration">Session length (min)</Label>
          <Input
            id="pattern-duration"
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="pattern-modality">Modality</Label>
          <Select
            value={modalityValue}
            onValueChange={(value) => setModalityValue(value as SlotModality)}
          >
            <SelectTrigger id="pattern-modality">
              <SelectValue placeholder="Select modality" />
            </SelectTrigger>
            <SelectContent>
              {MODALITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="pattern-capacity">Capacity per slot</Label>
          <Input
            id="pattern-capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to save</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {mode === "create" ? "Add pattern" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
