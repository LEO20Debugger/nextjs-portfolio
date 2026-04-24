import Footer from "@/components/footer";
import LeftPanel from "@/components/left-panel";
import RightPanel from "@/components/right-panel";
import ShootingStars from "@/components/shooting-stars";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center flex-1 w-full h-full">
      {/* Shooting stars (dark mode only) */}
      <ShootingStars />
      {/* Pattern */}
      <div className="absolute inset-0 z-0 bg-light-pattern dark:bg-dark-pattern bg-verySmall" />
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/80 via-white/70 to-white/80 dark:from-neutral-950/80 dark:via-neutral-950/70 dark:to-neutral-950/80" />
      <div className="container relative z-20 flex flex-col w-full h-full px-6 gap-6 xl:gap-10 xl:flex-row">
        {/* Left Panel */}
        <LeftPanel />
        {/* Right Panel */}
        <RightPanel />
        {/* Footer for Mobile */}
        <div className="flex pb-6 xl:hidden">
          <Footer />
        </div>
      </div>
    </main>
  );
}
