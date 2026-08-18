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
    <div
      className="flex items-center justify-between gap-4"
      onPointerEnter={showFloating ? handleEnter : undefined}
      onPointerLeave={showFloating ? () => setActive(false) : undefined}
    >
      {item.icon && <Icon type={item.icon} color={item.color} />}
      <div className="w-full min-w-0">
        <div className="@lg:text-lg font-semibold">{item.title}</div>
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

      {/* Touch devices get no hover, so the preview shows inline instead.
          Hidden via CSS rather than JS: a media query can't be evaluated
          during SSR, so gating this on `hasHover` would render thumbnails on
          the server and then rip them out at hydration — a flash and layout
          shift on every desktop load. The query must stay identical to the
          one in useHasHover, or a device could match neither branch and get
          no preview at all. */}
      {preview && (
        <div className="relative w-20 shrink-0 overflow-hidden rounded-lg border aspect-video border-neutral-200 dark:border-neutral-700 [@media(hover:hover)_and_(pointer:fine)]:hidden">
          <Image
            src={preview}
            alt={`${item.title} preview`}
            fill
            sizes="80px"
            placeholder="blur"
            className="object-cover object-top"
          />
        </div>
      )}

      {Boolean(item.stars && item.stars > 0) && (
        <div className="flex items-center gap-1 shrink-0 text-xs text-neutral-500">
          <div className="mt-[1px]">{item.stars}</div>
          <Star fill="currentColor" size={16} />
        </div>
      )}

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
