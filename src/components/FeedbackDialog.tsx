import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Session } from "@/models";

// ============================================
// Types
// ============================================

interface FeedbackDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (feedback: FeedbackData) => void;
}

export interface FeedbackData {
  sessionId: string;
  rating: number;
  comment: string;
  reportIssue: boolean;
}

// ============================================
// Star Rating Component
// ============================================

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverValue || value);
        return (
          <button
            key={star}
            type="button"
            className="rounded-md p-1 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function FeedbackDialog({
  session,
  open,
  onOpenChange,
  onSubmit,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reportIssue, setReportIssue] = useState(false);

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setRating(0);
      setComment("");
      setReportIssue(false);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = () => {
    if (!session || rating === 0) return;

    const feedback: FeedbackData = {
      sessionId: session.id,
      rating,
      comment: comment.trim(),
      reportIssue,
    };

    onSubmit?.(feedback);
    handleOpenChange(false);
  };

  const getRatingText = () => {
    if (rating === 0) return "Select a rating from 1 to 5 stars";
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    return `You selected ${rating} star${rating > 1 ? "s" : ""} – ${
      labels[rating]
    }`;
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
          <DialogDescription>
            {session.courseCode} · {session.courseName} with {session.tutorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              How was the session?
            </Label>
            <div className="flex justify-center">
              <StarRating value={rating} onChange={setRating} />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {getRatingText()}
            </p>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="feedback-comment">Comments (optional)</Label>
            <Textarea
              id="feedback-comment"
              placeholder="Share highlights or suggestions for future sessions"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Report Issue Checkbox */}
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="report-issue"
              checked={reportIssue}
              onCheckedChange={(checked) => setReportIssue(checked === true)}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="report-issue"
                className="text-sm font-medium cursor-pointer"
              >
                Report an issue to the coordinator
              </Label>
              <p className="text-xs text-muted-foreground">
                Check this if something needs attention. A coordinator will
                follow up.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
