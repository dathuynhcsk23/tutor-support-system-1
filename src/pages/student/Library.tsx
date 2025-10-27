import { useState, useMemo } from "react";
import {
  Book,
  ExternalLink,
  FileText,
  Film,
  Link2,
  ListChecks,
  Presentation,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================
// Types
// ============================================

type ResourceType =
  | "article"
  | "video"
  | "book"
  | "problem_set"
  | "slides"
  | "other";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  courseTags: string[];
  url: string;
}

// ============================================
// Mock Data
// ============================================

const MOCK_RESOURCES: Resource[] = [
  {
    id: "res-1",
    title: "Data Structures and Algorithms - Lecture Notes",
    description:
      "A comprehensive guide to fundamental data structures including arrays, linked lists, trees, and graphs with algorithm analysis.",
    type: "article",
    courseTags: ["CO2003", "Data Structures and Algorithms"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-2",
    title: "Algorithm Design and Analysis Video Series",
    description:
      "Video lecture series covering divide and conquer, dynamic programming, greedy algorithms, and complexity analysis.",
    type: "video",
    courseTags: ["CO3031", "Algorithms-Design and Analysis"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-3",
    title: "Database Systems: The Complete Book",
    description:
      "Classic textbook on database systems by Garcia-Molina, Ullman, and Widom covering relational model, SQL, and transaction management.",
    type: "book",
    courseTags: ["CO2013", "Database Systems"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-4",
    title: "Database Management Systems - SQL Practice",
    description:
      "A collection of 50 SQL problems ranging from basic queries to advanced stored procedures and optimization.",
    type: "problem_set",
    courseTags: ["CO3021", "Database Management Systems"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-5",
    title: "Software Engineering Principles",
    description:
      "Lecture slides covering SOLID principles, design patterns, clean code practices, and agile methodologies.",
    type: "slides",
    courseTags: ["CO3001", "Software Engineering"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-6",
    title: "Computer Networks Study Guide",
    description:
      "Comprehensive notes on OSI model, TCP/IP, routing protocols, and network security fundamentals.",
    type: "article",
    courseTags: ["CO3093", "Computer Networks"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-7",
    title: "Calculus 1 Video Tutorials",
    description:
      "Step-by-step video solutions for limits, derivatives, integrals, and series with practice problems.",
    type: "video",
    courseTags: ["MT1003", "Calculus 1"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-8",
    title: "Linear Algebra Workbook",
    description:
      "Practice problems with solutions for matrices, vector spaces, eigenvalues, and linear transformations.",
    type: "problem_set",
    courseTags: ["MT1007", "Linear Algebra"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-9",
    title: "General Physics Labs Manual",
    description:
      "Laboratory procedures and experiment guides for General Physics 1 (PH1003) and General Physics Labs (PH1007).",
    type: "other",
    courseTags: [
      "PH1003",
      "PH1007",
      "General Physics 1",
      "General Physics Labs",
    ],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-10",
    title: "Programming Languages - Design Patterns",
    description:
      "Illustrated guide to Gang of Four design patterns with examples in multiple programming languages.",
    type: "book",
    courseTags: ["CO3005", "Principles of Programming Languages"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-11",
    title: "Introduction to Artificial Intelligence",
    description:
      "Comprehensive textbook covering search algorithms, knowledge representation, machine learning basics, and AI applications.",
    type: "book",
    courseTags: ["CO3061", "Introduction to Artificial Intelligence"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-12",
    title: "Machine Learning Lecture Slides",
    description:
      "Complete slide deck covering supervised learning, unsupervised learning, neural networks, and model evaluation.",
    type: "slides",
    courseTags: ["CO3117", "Machine Learning"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-13",
    title: "Operating Systems Concepts",
    description:
      "Study materials on process management, memory management, file systems, and synchronization.",
    type: "article",
    courseTags: ["CO2017", "Operating Systems"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-14",
    title: "Web Programming Tutorial Series",
    description:
      "Video tutorials covering HTML, CSS, JavaScript, React, and backend development with Node.js.",
    type: "video",
    courseTags: ["CO3049", "Web Programming"],
    url: "https://lib.hcmut.edu.vn/",
  },
  {
    id: "res-15",
    title: "Probability and Statistics Problem Set",
    description:
      "Practice problems covering probability distributions, hypothesis testing, and statistical inference.",
    type: "problem_set",
    courseTags: ["MT2013", "Probability and Statistics"],
    url: "https://lib.hcmut.edu.vn/",
  },
];

// ============================================
// Constants
// ============================================

const TYPE_OPTIONS: { value: ResourceType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "book", label: "Book" },
  { value: "problem_set", label: "Problem set" },
  { value: "slides", label: "Slides" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS: Record<ResourceType, string> = {
  article: "Article",
  video: "Video",
  book: "Book",
  problem_set: "Problem set",
  slides: "Slides",
  other: "Other",
};

const TYPE_ICONS: Record<ResourceType, React.ElementType> = {
  article: FileText,
  video: Film,
  book: Book,
  problem_set: ListChecks,
  slides: Presentation,
  other: FileText,
};

// ============================================
// Main Component
// ============================================

export default function Library() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");

  // Filter resources
  const filteredResources = useMemo(() => {
    return MOCK_RESOURCES.filter((resource) => {
      // Type filter
      if (typeFilter !== "all" && resource.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(query);
        const matchesDescription = resource.description
          .toLowerCase()
          .includes(query);
        const matchesTags = resource.courseTags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, typeFilter]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || typeFilter !== "all";

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Library Resources
        </h1>
        <p className="text-muted-foreground">
          Search the HCMUT library for study materials, articles, videos, and
          more. Attach resources to your tutoring sessions for easy reference.
        </p>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Search Input */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search resources</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, description, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(v) => setTypeFilter(v as ResourceType | "all")}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {filteredResources.length} resource
        {filteredResources.length !== 1 ? "s" : ""} found
      </div>

      {/* Resource List */}
      <div className="flex flex-col gap-4">
        {filteredResources.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">No resources found</h2>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        )}
      </div>
    </section>
  );
}

// ============================================
// ResourceCard Component
// ============================================

interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const TypeIcon = TYPE_ICONS[resource.type];

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Title & Type */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">{resource.title}</h3>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition"
                    aria-label="Open resource link"
                  >
                    <Link2 className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
              <Badge variant="secondary">{TYPE_LABELS[resource.type]}</Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {resource.courseTags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row gap-2 md:flex-col md:items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Mock: show toast or alert
                alert("This feature will attach the resource to your session.");
              }}
            >
              Attach to Session
            </Button>
            <Button asChild variant="secondary" size="sm">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
