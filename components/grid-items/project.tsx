"use client";
import { projectPreviews } from "@/config/previews";
import { GridItemInterface } from "@/config/site-config";
import { useHasHover } from "@/hooks/use-media-query";
import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import Icon from "../icon";
import ProjectPreview from "../project-preview";

const Project = ({ item }: { item: GridItemInterface }) => {
  const preview = item.previewImage ? projectPreviews[item.previewImage] : undefined;
  const hasHover = useHasHover();
  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);

  const handleEnter = useCallback((e: React.PointerEvent) => {
    setOrigin({ x: e.clientX, y: e.clientY });
    setActive(true);
  }, []);

  const showFloating = Boolean(preview) && hasHover;

  return (
    /* Touch: stacked media card — full-width preview above the text, so the
       image gets the whole card width instead of competing with the title for
       it. Pointer devices keep the original compact row (no inline thumbnail
       there at all, since the preview follows the cursor instead). */
    <div
      className="flex h-full flex-col gap-3 [@media(hover:hover)_and_(pointer:fine)]:h-auto [@media(hover:hover)_and_(pointer:fine)]:flex-row [@media(hover:hover)_and_(pointer:fine)]:items-center [@media(hover:hover)_and_(pointer:fine)]:justify-between [@media(hover:hover)_and_(pointer:fine)]:gap-4"
      onPointerEnter={showFloating ? handleEnter : undefined}
      onPointerLeave={showFloating ? () => setActive(false) : undefined}
    >
      {preview && (
        <div className="relative w-full min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 [@media(hover:hover)_and_(pointer:fine)]:hidden">
          <Image
            src={preview}
            alt={`${item.title} preview`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            placeholder="blur"
            className="object-cover object-top"
          />
        </div>
      )}

      <div className="flex items-center gap-4 [@media(hover:hover)_and_(pointer:fine)]:w-full [@media(hover:hover)_and_(pointer:fine)]:justify-between">
      {item.icon && <Icon type={item.icon} color={item.color} />}
      <div className="w-full min-w-0">
        <div className="@lg:text-lg font-semibold truncate">{item.title}</div>
        {item.description && (
          <div className="text-xs text-neutral-500 line-clamp-1">{item.description}</div>
        )}
        {(item.websiteLink || item.buttonLink) && (
          <div className="flex items-center gap-3 mt-1.5">
            {item.buttonLink && (
              <Link
                href={item.buttonLink}
                target="_blank"
                className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} />
                Repo
              </Link>
            )}
            {item.websiteLink && (
              <Link
                href={item.websiteLink}
                target="_blank"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={12} />
                Live site
              </Link>
            )}
          </div>
        )}
      </div>

      {Boolean(item.stars && item.stars > 0) && (
        <div className="flex items-center gap-1 shrink-0 text-xs text-neutral-500">
          <div className="mt-[1px]">{item.stars}</div>
          <Star fill="currentColor" size={16} />
        </div>
      )}
      </div>

      {showFloating && preview && (
        <ProjectPreview
          image={preview}
          title={item.title}
          active={active}
          origin={origin}
        />
      )}
    </div>
  );
};

export default Project;
