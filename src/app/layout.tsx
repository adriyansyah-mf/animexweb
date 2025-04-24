"use client";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import "./globals.css";
import GlassmorphismNavbar from "@/components/ui/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import Head from "next/head";
import { usePathname } from "next/navigation";
import Banner from "@/components/ui/banner";
import HomeContent from "@/components/ui/homecontent";
import Footer from "@/components/ui/footer";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

const navItems = [
  { label: "List Anime", href: "/anime/lists" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [metadata, setMetadata] = useState({
    title: "Loading...",
    description: "Fetching metadata from API...",
    keywords: "",
    robots: "index, follow",
    siteName: "Animeku", // default
  });

  const [anime, setAnime] = useState<any>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/admin/settings`, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch site settings");

        const data = await response.json();
        setMetadata({
          title: data.meta_title || "Default Title",
          description: data.meta_description || "Default Description",
          keywords: data.site_keywords || "",
          robots: data.meta_robots || "index, follow",
          siteName: data.site_name || "Animeku", // masukin siteName dari API
        });
      } catch (error) {
        console.error("Error fetching site settings:", error);
        setMetadata({
          title: "Default Title",
          description: "Default Description",
          keywords: "",
          robots: "index, follow",
          siteName: "Animeku",
        });
      }
    };

    const fetchAnimeBannerData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // Fetch a larger list of ongoing anime to choose from randomly
        const listRes = await fetch(`${apiUrl}/user/list-anime?page=1&per_page=10&status=Ongoing`, {
          headers: { accept: "application/json" },
        });
        if (!listRes.ok) throw new Error("Failed to fetch anime list");
        const listData = await listRes.json();
        
        // Check if we have anime data
        if (!listData?.data || listData.data.length === 0) return;
        
        // Select a random anime from the list
        const randomIndex = Math.floor(Math.random() * listData.data.length);
        const animeId = listData.data[randomIndex].id;
        
        if (!animeId) return;
        
        // Fetch details for the randomly selected anime
        const detailRes = await fetch(`${apiUrl}/user/anime/${animeId}`, {
          headers: { accept: "application/json" },
        });
        if (!detailRes.ok) throw new Error("Failed to fetch anime detail");
        const animeDetail = await detailRes.json();
        setAnime(animeDetail);
      } catch (error) {
        console.error("Error fetching anime data:", error);
      }
    };

    fetchMetadata();
    fetchAnimeBannerData();

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="robots" content={metadata.robots} />
        <meta name="yandex-verification" content="dad1776e20795692" />
      </Head>
      <body className={inter.className}>
        <GoogleAnalytics gaId="G-JSC21PRNYD" />
        <div className="flex flex-col min-h-screen"> {/* Flex layout here */}
          <GlassmorphismNavbar
            navItems={navItems}
            onSearch={(query) => {
              console.log("Search query:", query);
            }}
          />

          <div className="flex-grow pb-20"> {/* Flex-grow ensures the content fills available space */}
            {pathname === "/" && anime && <Banner anime={anime} />}
            {pathname === "/" && hasScrolled && <HomeContent />}
            <ThemeProvider defaultTheme="dark" storageKey="dark">
              {children}
            </ThemeProvider>
          </div>

          {/* Fixed footer */}
          <div className="fixed bottom-0 left-0 w-full bg-black text-white py-4">
            <Footer siteName={metadata.siteName} />
          </div>
        </div>
      </body>
    </html>
  );
}
