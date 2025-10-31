import { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, Sparkles, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TutorProfileDialog } from "@/components/TutorProfileDialog";
import { tutorRepository, type Tutor } from "@/models";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
// Ensure mock data is loaded
import "@/data/mockTutors";

// ============================================
// Types
// ============================================

type TimeWindow = "3d" | "7d";
type ModalityPreference = "all" | "online" | "in_person";

interface AutoMatchFormState {
  subject: string;
  timeWindow: TimeWindow;
  modality: ModalityPreference;
}

// ============================================
// Main Component
// ============================================

export default function AutoMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get filter options from repository
  const subjects = useMemo(() => tutorRepository.getSubjects(), []);

  // Form state
  const [formState, setFormState] = useState<AutoMatchFormState>({
    subject: subjects[0] ?? "",
    timeWindow: "3d",
    modality: "all",
  });

  // Match results
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommended, setRecommended] = useState<Tutor | null>(null);
  const [alternates, setAlternates] = useState<Tutor[]>([]);

  // Profile dialog state
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Run auto-match
  const handleAutoMatch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Use repository's autoMatch method
    // Exclude self if user is also a tutor
    const result = tutorRepository.autoMatch({
      subject: formState.subject,
      modality: formState.modality,
      excludeTutorId: user?.tutorId,
    });

    setRecommended(result.recommended);
    setAlternates(result.alternates);
    setLoading(false);
  }, [formState.subject, formState.modality]);

  // Handle tutor selection - open profile dialog
  const handleSelectTutor = useCallback((tutor: Tutor) => {
    setSelectedTutor(tutor);
    setDialogOpen(true);
  }, []);

  // Handle booking from profile dialog
  const handleBookSession = useCallback(
    (tutor: Tutor) => {
      const params = new URLSearchParams({ tutorId: tutor.id });
      if (formState.subject) {
        params.set("subject", formState.subject);
      }
      if (formState.modality !== "all") {
        params.set("modality", formState.modality);
      }
      navigate(`/student/schedule/new?${params.toString()}`);
    },
    [navigate, formState.subject, formState.modality]
  );

  const showResults = hasSearched && (recommended || alternates.length > 0);
  const showEmpty =
    hasSearched && !loading && !recommended && alternates.length === 0;

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">Auto-match</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Tell us what you need and we'll recommend the best-fit tutor based on
          subject expertise and ratings. You can refine preferences and try
          again anytime.
        </p>
      </header>

      {/* Preferences Form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
          <CardDescription>
            Select your requirements to find the perfect tutor match.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <SubjectCombobox
              subjects={subjects}
              value={formState.subject}
              onChange={(subject) =>
                setFormState((prev) => ({ ...prev, subject }))
              }
            />
          </div>

          {/* Time Window */}
          <div className="space-y-2">
            <Label>When do you need help?</Label>
            <Select
              value={formState.timeWindow}
              onValueChange={(value: TimeWindow) =>
                setFormState((prev) => ({ ...prev, timeWindow: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select time window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3d">Next 3 days</SelectItem>
                <SelectItem value="7d">Next 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modality Preference */}
          <div className="space-y-2">
            <Label>Preferred modality</Label>
            <RadioGroup
              className="flex flex-wrap gap-4"
              value={formState.modality}
              onValueChange={(value: ModalityPreference) =>
                setFormState((prev) => ({ ...prev, modality: value }))
              }
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="online" />
                <span>Online</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="in_person" />
                <span>In-person</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="all" />
                <span>Any</span>
              </label>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleAutoMatch}
              disabled={loading || !formState.subject}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Matching…" : "Auto-match me"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && <ResultsSkeleton />}

      {/* Empty State */}
      {showEmpty && <EmptyState />}

      {/* Results */}
      {!loading && showResults && (
        <div className="space-y-6">
          {/* Top Recommendation */}
          {recommended && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                Top Recommendation
              </h2>
              <TutorResultCard
                tutor={recommended}
                onSelect={handleSelectTutor}
                variant="highlight"
              />
            </section>
          )}

          {/* Alternatives */}
          {alternates.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Alternatives</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {alternates.map((tutor) => (
                  <TutorResultCard
                    key={tutor.id}
                    tutor={tutor}
                    onSelect={handleSelectTutor}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tutor Profile Dialog */}
      <TutorProfileDialog
        tutor={selectedTutor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onBookSession={handleBookSession}
      />
    </section>
  );
}

// ============================================
// SubjectCombobox Component
// ============================================

interface SubjectComboboxProps {
  subjects: string[];
  value: string;
  onChange: (value: string) => void;
}

function SubjectCombobox({ subjects, value, onChange }: SubjectComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full sm:w-[320px] justify-between",
            !value && "text-muted-foreground"
          )}
        >
          {value || "Select subject..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Search subjects..." />
          <CommandList>
            <CommandEmpty>No subjects found.</CommandEmpty>
            <CommandGroup>
              {subjects.map((subject) => (
                <CommandItem
                  key={subject}
                  value={subject}
                  onSelect={() => {
                    onChange(subject);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === subject ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {subject}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// TutorResultCard Component
// ============================================

interface TutorResultCardProps {
  tutor: Tutor;
  onSelect: (tutor: Tutor) => void;
  variant?: "default" | "highlight";
}

function TutorResultCard({
  tutor,
  onSelect,
  variant = "default",
}: TutorResultCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors hover:bg-muted/50",
        variant === "highlight" && "border-primary/50 bg-primary/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {tutor.getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="font-semibold truncate">{tutor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {tutor.department}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">
                {tutor.getFormattedRating()}
              </span>
              {tutor.totalSessions > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({tutor.totalSessions} sessions)
                </span>
              )}
            </div>

            {/* Modalities */}
            <div className="flex flex-wrap gap-1">
              {tutor.getModalityLabels().map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>

            {/* Subjects (truncated) */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {tutor.subjects.slice(0, 3).join(", ")}
              {tutor.subjects.length > 3 &&
                ` +${tutor.subjects.length - 3} more`}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4 flex justify-end">
          <Button
            variant={variant === "highlight" ? "default" : "outline"}
            onClick={() => onSelect(tutor)}
          >
            {variant === "highlight" ? "Choose this tutor" : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// ResultsSkeleton Component
// ============================================

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EmptyState Component
// ============================================

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No matches found</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Try adjusting your preferences or browse tutors manually to find the
            right fit.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/student/find">Browse all tutors</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
