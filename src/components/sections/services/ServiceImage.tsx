import Image from "next/image";
import { cn } from "@/components/ui/cn";
import type { MediaView } from "@/server/queries/types";

export function ServiceImage({
  media,
  sizes,
  priority = false,
  className,
}: {
  media: MediaView;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (media.kind !== "image") return null;
  return (
    <div className="service-media" style={{ aspectRatio: media.width && media.height ? media.width / media.height : 16 / 10 }}>
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes={sizes}
        preload={priority}
        placeholder={media.blurDataUrl ? "blur" : "empty"}
        blurDataURL={media.blurDataUrl ?? undefined}
        className={cn("object-cover", className)}
      />
    </div>
  );
}
