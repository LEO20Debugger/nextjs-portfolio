import { siteConfig } from "@/config/site-config";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Next 13.4's Sitemap type only carries url + lastModified;
    // changeFrequency/priority arrived in a later release.
    {
      url: siteConfig.url,
      lastModified: new Date(),
    },
  ];
}
