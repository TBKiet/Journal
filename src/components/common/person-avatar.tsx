"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Author } from "@/lib/data";

const AVATAR_SRC: Record<Author, string> = {
  BK: "/bk-avatar.png",
  Bi: "/bi-avatar.png",
};

export function PersonAvatar({
  person,
  size = "sm",
  className,
  fallbackClassName,
}: {
  person: Author;
  size?: "default" | "sm" | "lg";
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarImage src={AVATAR_SRC[person]} alt={person} />
      <AvatarFallback className={fallbackClassName}>{person}</AvatarFallback>
    </Avatar>
  );
}
