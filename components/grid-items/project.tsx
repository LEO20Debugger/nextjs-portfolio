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
        {item.websiteLink && (
          <div className="flex items-center gap-3 mt-1">
            <Link
              href={item.buttonLink ?? ""}
              target="_blank"
              className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              Repo
            </Link>
            <Link
              href={item.websiteLink}
              target="_blank"
              className="text-[10px] text-primary hover:opacity-70 flex items-center gap-1 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              Live site
            </Link>
          </div>
        )}
      </div>
      {!item.websiteLink && (
        <Link href={item.buttonLink ?? ""} target="_blank" className="flex items-center gap-1 shrink-0">
          <div className="mt-[1px]">{item.stars}</div>
          <Star fill="currentColor" size={16} />
        </Link>
      )}
      {item.websiteLink && (
        <div className="flex items-center gap-1 shrink-0">
          <div className="mt-[1px]">{item.stars}</div>
          <Star fill="currentColor" size={16} />
        </div>
      )}
    </div>
  );
};

export default Project;
