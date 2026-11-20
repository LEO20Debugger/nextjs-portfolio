"use client";
import { projectPreviews } from "@/config/previews";
import { GridItemInterface } from "@/config/site-config";
import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Icon from "../icon";

/**
 * A media card: the screenshot carries the card and the text sits under it.
 *
 * This used to be two layouts — a stacked one on touch and a compact text row
 * on pointer devices, where a preview followed the cursor instead. The work
 * ended up the smallest thing on the page on exactly the devices with the most
 * room for it, so there is now one layout everywhere and the floating preview
 * is gone with it.
 */
const Project = ({ item }: { item: GridItemInterface }) => {
  const preview = item.previewImage
    ? projectPreviews[item.previewImage]
    : undefined;

  return (
    <div className="flex h-full flex-col gap-2">
      {preview && (
        /* A fixed 16:9 frame rather than one that stretches to fill the
           card: the previews are all 960x540, and letting the frame take the
           leftover height cropped ~23% off the sides of every screenshot. */
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
          <Image
            src={preview}
            alt={`${item.title} preview`}
            fill
            sizes="(min-width: 1536px) 25vw, (min-width: 768px) 50vw, 100vw"
            placeholder="blur"
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
      )}

      {/* Takes the height the frame leaves over, and centres itself in it. */}
      <div className="flex min-h-0 flex-1 items-center gap-3">
        {item.icon && <Icon type={item.icon} color={item.color} />}
        <div className="w-full min-w-0">
          <div className="@lg:text-lg font-semibold truncate">{item.title}</div>
          {item.description && (
            <div className="text-xs text-neutral-500 line-clamp-1">
              {item.description}
            </div>
          )}
          {(item.websiteLink || item.buttonLink) && (
            <div className="flex items-center gap-3 mt-1">
              {item.buttonLink && (
                <Link
                  href={item.buttonLink}
                  target="_blank"
                  className="relative text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100"
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
                  className="relative text-xs font-semibold text-primary flex items-center gap-1 transition-all after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out after:content-[''] hover:after:scale-x-100"
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
    </div>
  );
};

export default Project;
