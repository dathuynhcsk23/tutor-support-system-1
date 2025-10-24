import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Filter } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  searchTutors,
  getDepartments,
  getSubjects,
  type TutorFilters,
} from "@/data/mockTutors";
import type { Tutor } from "@/types/tutor";

const initialFilters: TutorFilters = {
  query: "",
  department: "",
  subject: "",
  modality: "all",
};

export default function FindTutor() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TutorFilters>(initialFilters);

  // Get filter options
  const departments = useMemo(() => getDepartments(), []);
  const subjects = useMemo(() => getSubjects(), []);

  // Filter tutors based on current filters
  const tutors = useMemo(() => searchTutors(filters), [filters]);

  const handleSelectTutor = (tutor: Tutor) => {
    // Navigate to schedule page with tutor pre-selected
    navigate(`/student/schedule/new?tutorId=${tutor.id}`);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters =
    filters.query ||
    filters.department ||
    filters.subject ||
    filters.modality !== "all";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Find a Tutor</h1>
        <p className="text-muted-foreground">
          Browse tutors across departments, filter by subject or modality, and
          find the perfect match for your learning needs.
        </p>
      </header>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name or subject..."
                  className="pl-9"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, query: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  setFilters((f) => ({ ...f, department: value === "all" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={filters.subject}
                onValueChange={(value) =>
                  setFilters((f) => ({ ...f, subject: value === "all" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modality */}
            <div className="space-y-2">
              <Label>Modality</Label>
              <Select
                value={filters.modality}
                onValueChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    modality: value as TutorFilters["modality"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modalities</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {tutors.length} tutor{tutors.length !== 1 ? "s" : ""} found
              </p>
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {tutors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onSelect={handleSelectTutor}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No tutors found matching your criteria.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
        </Card>
      )}
    </section>
  );
}

// ============================================
// TutorCard Component
// ============================================

interface TutorCardProps {
  tutor: Tutor;
  onSelect: (tutor: Tutor) => void;
}

function TutorCard({ tutor, onSelect }: TutorCardProps) {
  const initials = tutor.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="flex h-full flex-col transition hover:border-primary/60">
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-lg">{tutor.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{tutor.department}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            {tutor.rating.toFixed(1)} · {tutor.totalSessions} sessions
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1">
          {tutor.subjects.map((subject) => (
            <Badge key={subject} variant="secondary" className="text-xs">
              {subject}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
        <div className="flex gap-1">
          {tutor.modalities.includes("online") && (
            <Badge variant="outline" className="text-xs">
              Online
            </Badge>
          )}
          {tutor.modalities.includes("in_person") && (
            <Badge variant="outline" className="text-xs">
              In-Person
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={() => onSelect(tutor)}>
          Select Tutor
        </Button>
      </CardFooter>
    </Card>
  );
}
