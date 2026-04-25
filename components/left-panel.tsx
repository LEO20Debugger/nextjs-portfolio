"use client";
import BackendEasterEgg from "@/components/backend-easter-egg";
import { siteConfig } from "@/config/site-config";
import { Mail, MapPin, MessageCircle } from "lucide-react";
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
      className="flex flex-col justify-between py-6 xl:max-w-sm xl:py-10 xl:h-full"
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
          <h1 className="mt-2 text-4xl font-bold">{siteConfig.creator}</h1>
          <p className="text-2xl font-light text-neutral-500">
            {siteConfig.bio}
          </p>
        </div>
        {/* Buttons Container */}
        <div className="flex items-center gap-3 mt-6">
          <a
            href={`${siteConfig.locationLink}`}
            className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium border rounded-md border-neutral-100 dark:border-neutral-800"
          >
            <MapPin size="14" />
            {siteConfig.location}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium border rounded-md border-neutral-100 dark:border-neutral-800"
          >
            <Mail size="14" />
            Mail
          </a>
          <a
            href="https://wa.me/2349036538954"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full gap-2 px-4 py-2 text-sm font-medium border rounded-md border-neutral-100 dark:border-neutral-800"
          >
            <MessageCircle size="14" />
            WhatsApp
          </a>
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
