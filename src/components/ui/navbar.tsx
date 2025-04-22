// Navbar.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export type NavbarProps = {
  navItems: { label: string; href: string }[];
  onSearch: (query: string) => void;
};

interface SiteSettings {
  site_name: string;
}

const GlassmorphismNavbar = ({ navItems, onSearch }: NavbarProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: "Loading...",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiUrl}/admin/settings`, {
          headers: {
            accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch site settings");
        }

        const data = await response.json();
        setSiteSettings(data);
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full px-4 py-4 bg-transparent backdrop-blur-md z-50">
      <div className="container mx-auto">
        <div className="bg-white/10 dark:bg-black/20 rounded-lg px-6 py-3 shadow-lg border border-white/20 dark:border-white/10 backdrop-filter backdrop-blur-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-black dark:text-white text-2xl font-semibold hover:underline"
              >
                {siteSettings.site_name}
              </Link>

              <div className="flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div
              className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchFocused ? "w-64" : "w-40"
              }`}
              onMouseEnter={() => setIsSearchFocused(true)}
              onMouseLeave={() => setIsSearchFocused(false)}
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white/30 dark:bg-black/30 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch(searchQuery);
                  }
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlassmorphismNavbar;
