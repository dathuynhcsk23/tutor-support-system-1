import { Star, Mail, BookOpen, Video, MapPin } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Tutor } from "@/models";

interface TutorProfileDialogProps {
  tutor: Tutor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookSession: (tutor: Tutor) => void;
}

/**
 * TutorProfileDialog - Shows detailed tutor profile with booking option
 *
 * This dialog displays tutor information including:
 * - Name, department, bio
 * - Subjects taught
 * - Modalities available
 * - Rating and total sessions
 * - Book session action
 */
export function TutorProfileDialog({
  tutor,
  open,
  onOpenChange,
  onBookSession,
}: TutorProfileDialogProps) {
  if (!tutor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tutor Profile</DialogTitle>
          <DialogDescription>
            Review tutor information before booking a session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tutor Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {tutor.getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{tutor.name}</h3>
              <p className="text-sm text-muted-foreground">
                {tutor.department}
              </p>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {tutor.getFormattedRating()}
                </span>
                <span className="text-muted-foreground">
                  {tutor.totalSessions} sessions
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">About</h4>
            <p className="text-sm text-muted-foreground">{tutor.bio}</p>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Subjects
            </h4>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>

          {/* Modalities */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Available Modalities</h4>
            <div className="flex gap-3">
              {tutor.hasModality("online") && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Video className="h-4 w-4" />
                  Online
                </div>
              )}
              {tutor.hasModality("in_person") && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  In-Person
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {tutor.email}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onBookSession(tutor)}>Book Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
