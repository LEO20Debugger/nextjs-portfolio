import { GridItemInterface } from "@/config/site-config";
import { ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import Icon from "../icon";

const Project = ({ item }: { item: GridItemInterface }) => {
  return (
    <div className="flex items-center justify-between gap-4">
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
      {Boolean(item.stars && item.stars > 0) && (
        <div className="flex items-center gap-1 shrink-0 text-xs text-neutral-500">
          <div className="mt-[1px]">{item.stars}</div>
          <Star fill="currentColor" size={16} />
        </div>
      )}
    </div>
  );
};

export default Project;
