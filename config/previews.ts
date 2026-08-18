import byteMe from "@/public/previews/byte-me.jpg";
import felmosengineering from "@/public/previews/felmosengineering.jpg";
import muuv from "@/public/previews/muuv.jpg";
import pradisedaypass from "@/public/previews/pradisedaypass.jpg";
import type { StaticImageData } from "next/image";

/**
 * Static imports (rather than string paths) so next/image gets intrinsic
 * dimensions and an auto-generated blurDataURL — the preview blurs up instead
 * of popping in. Keyed by the `previewImage` value in site-config.
 */
export const projectPreviews: Record<string, StaticImageData> = {
  "byte-me": byteMe,
  pradisedaypass,
  felmosengineering,
  muuv,
};
