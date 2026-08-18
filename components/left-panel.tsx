"use client";
import BackendEasterEgg from "@/components/backend-easter-egg";
import { siteConfig } from "@/config/site-config";
import { FileText, Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import Footer from "./footer";

const LeftPanel = () => {
  const [clickCount, setClickCount] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAvatarClick = () => {
    const next = clickCount + 1;
    setClickCount(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClickCount(0), 2000);

    if (next >= 5) {
      setTrigger((t) => t + 1);
      setClickCount(0);
    }
  };

  return (
    <div
      key="left-panel"
      className="flex flex-col justify-between py-6 xl:max-w-sm xl:py-10 xl:h-screen xl:sticky xl:top-0 shrink-0"
    >
      <BackendEasterEgg trigger={trigger} />
      {/* Top Container */}
      <div>
        <button
          type="button"
          onClick={handleAvatarClick}
          aria-label={`Portrait of ${siteConfig.creator}. Activate five times for a surprise.`}
          className="cursor-pointer select-none w-fit rounded-full overflow-hidden block ring-offset-4 ring-offset-white dark:ring-offset-neutral-950 transition-shadow hover:shadow-grid-hover"
          title={clickCount >= 2 ? `${5 - clickCount} more...` : undefined}
        >
          <Image
            priority
            loading="eager"
            alt=""
            placeholder="blur"
            src="/Leonard.jpeg"
            width={120}
            height={120}
            blurDataURL="/Leonard.jpeg"
            /* h-/w-[120px] match the width/height props: Tailwind preflight
               sets `img { height: auto }`, which otherwise trips next/image's
               "width or height modified, but not the other" warning. */
            className={`h-[120px] w-[120px] rounded-full transition-transform duration-150 ease-out ${
              clickCount > 0 ? "scale-95" : "scale-100 hover:scale-[1.03]"
            }`}
          />
        </button>

        {/* Text Container */}
        <div className="mt-6">
          <div className="text-xl font-medium text-primary">
            {siteConfig.title}
          </div>
          <h1 className="mt-2 text-[clamp(1.15rem,5.5vw,2.25rem)] font-bold whitespace-nowrap tracking-tight">
            {siteConfig.creator}
          </h1>
          <p className="text-2xl font-light text-neutral-500">
            {siteConfig.bio}
          </p>
        </div>
        {/* Buttons Container */}
        <div className="mt-6 flex flex-col gap-2.5">
          <a
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 rounded-lg shadow-sm transition-all duration-200 ease-out"
          >
            <FileText
              size="16"
              className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
            />
            Download CV
          </a>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`${siteConfig.locationLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <MapPin size="13" />
              {siteConfig.location}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <Mail size="13" />
              Mail
            </a>
            <a
              href="https://wa.me/2349036538954"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 dark:hover:bg-neutral-800 dark:hover:border-neutral-600 transition-all duration-200 ease-out"
            >
              <MessageCircle size="13" />
              WhatsApp
            </a>
          </div>
        </div>
        {/* Footer */}
        <div className="hidden mt-6 xl:flex">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
