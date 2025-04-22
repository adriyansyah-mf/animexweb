// lib/services/settings.ts

import { SiteSettings } from "@/types/settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await fetch('http://127.0.0.1:8000/admin/settings', {
      headers: {
        'accept': 'application/json'
      },
      // Add cache control if needed
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching site settings:", error);
    // Return default settings as fallback
    return {
      site_name: "Default Site Name",
      site_description: "Default site description",
      site_keywords: "nextjs, react",
      site_author: "Default Author",
      meta_title: "Default Title",
      meta_description: "Default meta description",
      meta_robots: "index, follow",
      favicon_url: "/favicon.ico",
      logo_url: "/logo.png",
      google_analytics_id: "",
      facebook_pixel_id: ""
    };
  }
}