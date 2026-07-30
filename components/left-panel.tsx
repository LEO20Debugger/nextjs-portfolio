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
        <div
          onClick={handleAvatarClick}
          className="cursor-pointer select-none w-fit rounded-full overflow-hidden"
          title={clickCount >= 2 ? `${5 - clickCount} more...` : undefined}
        >
          <Image
            priority
            loading="eager"
            alt="avatar"
            placeholder="blur"
            src="/Leonard.jpeg"
            width={120}
            height={120}
            blurDataURL="/Leonard.jpeg"
            className={`rounded-full transition-transform duration-100 ${
              clickCount > 0 ? "scale-95" : "scale-100"
            }`}
          />
        </div>

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
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:opacity-90 rounded-lg shadow-sm transition-all"
          >
            <FileText size="16" />
            Download CV
          </a>
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`${siteConfig.locationLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <MapPin size="13" />
              {siteConfig.location}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Mail size="13" />
              Mail
            </a>
            <a
              href="https://wa.me/2349036538954"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
