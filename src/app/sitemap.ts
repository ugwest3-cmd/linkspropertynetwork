import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.linkspropertynetwork.com";

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/about",
    "/verify",
    "/find-property",
    "/privacy",
    "/terms",
    "/billing",
    "/candidate-privacy",
    "/cookies",
    "/copyright",
    "/documentation",
    "/agent/login",
    "/agent/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();

    // 2. Fetch Listings
    const { data: listings } = await supabase
      .from("listings")
      .select("id, createdAt")
      .eq("verified", true);

    if (listings) {
      listings.forEach((listing) => {
        dynamicRoutes.push({
          url: `${baseUrl}/listings/${listing.id}`,
          lastModified: listing.createdAt ? new Date(listing.createdAt).toISOString() : new Date().toISOString(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        });
      });
    }

    // 3. Fetch Agents
    const { data: agents } = await supabase
      .from("agents")
      .select("slug")
      .eq("status", "approved");

    if (agents) {
      agents.forEach((agent) => {
        if (agent.slug) {
          dynamicRoutes.push({
            url: `${baseUrl}/agents/${agent.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "weekly" as const,
            priority: 0.5,
          });
        }
      });
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap routes:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
