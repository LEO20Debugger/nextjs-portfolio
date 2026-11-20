"use client";
import { siteConfig } from "@/config/site-config";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import Link from "next/link";
import GridItem, { gridItemMotion, gridItemViewport } from "./grid-item";
import Project from "./grid-items/project";
import Social from "./grid-items/social";
import TechStack from "./grid-items/tech-stack";

const RightPanel = () => {
  return (
    <div className="flex-1 w-full xl:py-10 py-6">
      {/* Plain container: each card owns its own viewport trigger, so the
          grid must not propagate variants and override them. */}
      {/* Twelve columns rather than four: the same cards still land on the
          same halves and quarters, but projects can take a third at 2xl. */}
      <div className="grid w-full grid-cols-12 xl:gap-10 gap-6 auto-rows-[76px]">
        {siteConfig.items.map((item, index) => {
          return (
            <GridItem
              key={item.title + item.type + index}
              size={item.layout}
              index={index}
              // A flock lives on the roof of the Twitter card.
              birds={item.title === "Twitter" ? 5 : 0}
            >
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
        {/* View more projects — takes a project-sized slot rather than a full
            row of its own, so it flows into the gap an odd project count
            leaves behind instead of sitting on a row below the fold. */}
        <motion.div
          variants={gridItemMotion}
          custom={siteConfig.items.length}
          initial="hidden"
          whileInView="show"
          viewport={gridItemViewport}
          className="md:col-span-6 col-span-full 2xl:col-span-4 row-span-1 md:row-span-3"
        >
          <Link
            href="https://github.com/LEO20Debugger"
            target="_blank"
            className="group flex h-full w-full items-center justify-center gap-2 px-5 py-2.5 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:border-solid hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white hover:-translate-y-0.5 hover:shadow-grid-hover active:translate-y-0 transition-all duration-200"
          >
            <Github
              size={15}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            View more projects
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RightPanel;
