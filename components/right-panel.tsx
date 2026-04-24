"use client";
import { siteConfig } from "@/config/site-config";
import { stagger, useAnimate } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import GridItem from "./grid-item";
import Project from "./grid-items/project";
import Social from "./grid-items/social";
import TechStack from "./grid-items/tech-stack";

const RightPanel = () => {
  const [scope, animate] = useAnimate();
  const staggerGridItems = stagger(0.02, {
    startDelay: 0.5,
  });

  // ANIMATION
  useEffect(() => {
    if (scope.current) {
      animate(
        "div",
        {
          scale: 1,
          y: 0,
          opacity: 1,
        },
        {
          type: "spring",
          stiffness: 330,
          damping: 35,
          delay: staggerGridItems,
        }
      );
    }
  }, [scope]);

  return (
    <div
      ref={scope}
      className="grid w-full grid-cols-4 xl:gap-10 gap-6 xl:py-10 py-6 xl:px-1 xl:overflow-y-auto auto-rows-[76px]"
    >
      {siteConfig.items.map((item, index) => {
        return (
          <GridItem key={item.title + item.type + index} size={item.layout}>
            {item.type === "social" ? (
              <Social item={item} />
            ) : item.type === "project" ? (
              <Project item={item} />
            ) : item.type === "techstack" ? (
              <TechStack />
            ) : (
              <div>Need to create new component type.</div>
            )}
          </GridItem>
        );
      })}
      {/* View more projects button — spans full width, sits below project cards */}
      <div className="col-span-full flex justify-center">
        <Link
          href="https://github.com/LEO20Debugger"
          target="_blank"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-grid"
        >
          <Github size={15} />
          View more projects
        </Link>
      </div>
    </div>
  );
};

export default RightPanel;
