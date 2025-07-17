// Navbar.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import SearchResults from "./SearchResults"; // Import the new SearchResults component
import { isAuthenticated, clearAuthTokens } from "@/lib/auth";

export type NavbarProps = {
  navItems: { label: string; href: string }[];
  onSearch?: (query: string) => void; // Make onSearch optional since we'll handle search internally
};

interface SiteSettings {
  site_name: string;
}

const GlassmorphismNavbar = ({ navItems, onSearch }: NavbarProps) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: "Otaku Stream",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

    // Check authentication status
    setIsLoggedIn(isAuthenticated());

    fetchSettings();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Call the onSearch prop if provided (for backward compatibility)
      if (onSearch) {
        onSearch(searchQuery);
      }
      
      // Close the search modal and show search results
      setIsSearchModalOpen(false);
      setShowSearchResults(true);
    }
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    clearAuthTokens();
    setIsLoggedIn(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  // Filter navigation items (just in case we have more than we want to show)
  const mainNavItems = navItems.slice(0, 3); // Limit to first 3 items for main nav

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-[#0F171E]/80 backdrop-blur-md border-b border-white/10 z-50">
        {/* Single row navbar like in the image */}
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center mr-8"
            onClick={(e) => {
              // If we're already on homepage, prevent default navigation and scroll to top
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <span className="text-white font-medium">
              <span className="text-[#00A8E1] font-bold">Otaku</span> Stream
            </span>
          </Link>

          {/* Main Nav Items - placed right next to the logo */}
          <div className="flex h-full">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-200 text-sm font-medium px-5 h-full flex items-center hover:bg-white/5 transition-colors"
                onClick={(e) => {
                  // If clicking HOME and already on homepage, scroll to top instead
                  if (item.href === '/' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Bookmark Navigation - only show if logged in */}
            {isLoggedIn && (
              <Link
                href="/bookmarks"
                className="text-gray-200 text-sm font-medium px-5 h-full flex items-center hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                BOOKMARKS
              </Link>
            )}
          </div>

          {/* Push remaining elements to the right */}
          <div className="flex-grow"></div>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-white p-2 hover:bg-white/5 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Search button (icon only) */}
            <button 
              className="text-white p-2 hover:bg-white/5 rounded-full transition-colors"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* App grid */}
            <button className="text-white p-2 hover:bg-white/5 rounded-full transition-colors">
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M4 4h4v4H4V4zm0 6h4v4H4v-4zm0 6h4v4H4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4zm6-12h4v4h-4V4zm0 6h4v4h-4v-4zm0 6h4v4h-4v-4z" />
              </svg>
            </button>

            {/* User Profile / Login */}
            <div className="flex items-center relative">
              {isLoggedIn ? (
                <button 
                  className="flex items-center text-white hover:bg-white/5 rounded-full overflow-hidden"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 bg-[#38BDFF]/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center text-white hover:bg-white/5 rounded-full px-3 py-2 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">LOGIN</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {showUserMenu && isLoggedIn && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#0F171E]/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    <Link
                      href="/bookmarks"
                      className="flex items-center px-4 py-2 text-gray-200 hover:bg-white/5 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      My Bookmarks
                    </Link>
                    <div className="border-t border-white/10 my-1"></div>
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-200 hover:bg-white/5 transition-colors"
                      onClick={handleLogout}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50">
          <div className="absolute top-0 left-0 w-full bg-[#0F171E]/90 backdrop-blur-md border-b border-white/10">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <input
                    type="search"
                    className="w-full h-12 pl-4 pr-12 text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-[#00A8E1] focus:ring-1 focus:ring-[#00A8E1]/20 backdrop-blur-sm"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    className="absolute right-0 top-0 h-12 w-12 text-white flex items-center justify-center hover:bg-white/5 rounded-r-md transition-colors"
                    onClick={handleSearchSubmit}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  className="ml-4 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsSearchModalOpen(false)}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu (conditionally rendered) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#0F171E]/90 backdrop-blur-md pt-16">
          <div className="p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-gray-200 text-base hover:text-white transition-colors border-b border-white/10"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  // If clicking HOME and already on homepage, scroll to top instead
                  if (item.href === '/' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Bookmark in mobile menu */}
            {isLoggedIn && (
              <Link
                href="/bookmarks"
                className="block py-3 text-gray-200 text-base hover:text-white transition-colors border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  BOOKMARKS
                </div>
              </Link>
            )}
            
            {/* Login/Logout in mobile menu */}
            {isLoggedIn ? (
              <button
                className="block w-full text-left py-3 text-gray-200 text-base hover:text-white transition-colors border-b border-white/10"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  LOGOUT
                </div>
              </button>
            ) : (
              <Link
                href="/login"
                className="block py-3 text-gray-200 text-base hover:text-white transition-colors border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  LOGIN
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search Results Component */}
      <SearchResults 
        searchQuery={searchQuery}
        isOpen={showSearchResults}
        onClose={handleCloseSearchResults}
      />
    </>
  );
};

export default GlassmorphismNavbar;