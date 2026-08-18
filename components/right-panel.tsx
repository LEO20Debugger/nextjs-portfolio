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
      <div className="grid w-full grid-cols-4 xl:gap-10 gap-6 auto-rows-[76px]">
        {siteConfig.items.map((item, index) => {
          return (
            <GridItem
              key={item.title + item.type + index}
              size={item.layout}
              index={index}
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
        {/* View more projects button — spans full width, sits below project cards */}
        <motion.div
          variants={gridItemMotion}
          initial="hidden"
          whileInView="show"
          viewport={gridItemViewport}
          className="col-span-full flex justify-center"
        >
          <Link
            href="https://github.com/LEO20Debugger"
            target="_blank"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white hover:-translate-y-0.5 hover:shadow-grid-hover active:translate-y-0 transition-all duration-200 shadow-grid"
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
