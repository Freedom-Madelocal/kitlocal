import { Instagram, Facebook, Music2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformKey } from "@/lib/social-inbox-data";

const icons: Record<PlatformKey, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
};

export function platformIcon(platform: PlatformKey): LucideIcon {
  return icons[platform];
}

export function PlatformIcon({
  platform,
  className,
}: {
  platform: PlatformKey;
  className?: string;
}) {
  const Icon = icons[platform];
  return <Icon className={cn("h-4 w-4", className)} aria-hidden />;
}
