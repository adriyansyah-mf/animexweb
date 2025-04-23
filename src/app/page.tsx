// app/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

// Define a more complete metadata type
interface SiteSettings {
  site_name: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  meta_title: string;
  meta_description: string;
  meta_robots: string;
  favicon_url: string | null;
  logo_url: string | null;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
}

// Enhanced metadata generation with more SEO properties
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch site settings');
    }
    
    const data: SiteSettings = await res.json();
    
    // Get current URL for canonical link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    
    return {
      title: {
        template: `%s | ${data.site_name}`,
        default: data.meta_title || `${data.site_name} - Watch Anime Online`,
      },
      description: data.meta_description,
      keywords: data.site_keywords,
      authors: [{ name: data.site_author, url: baseUrl }],
      creator: data.site_author,
      publisher: data.site_name,
      robots: data.meta_robots || 'index, follow',
      alternates: {
        canonical: baseUrl,
        languages: {
          'en-US': `${baseUrl}/en-US`,
          'ja-JP': `${baseUrl}/ja-JP`,
        },
      },
      openGraph: {
        type: 'website',
        title: data.meta_title,
        description: data.meta_description,
        siteName: data.site_name,
        url: baseUrl,
        locale: 'en_US',
        images: [
          {
            url: data.logo_url || `${baseUrl}/images/default-og.jpg`,
            width: 1200,
            height: 630,
            alt: data.site_name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: data.meta_title,
        description: data.meta_description,
        creator: '@yoursitehandle',
        images: [data.logo_url || `${baseUrl}/images/default-twitter.jpg`],
      },
      viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
      },
      metadataBase: new URL(baseUrl),
      other: {
        'theme-color': '#111827',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'format-detection': 'telephone=no',
      },
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // Fallback metadata
    return {
      title: 'Anime Streaming Website',
      description: 'Watch free anime online with English subtitles',
    };
  }
}

// JSON-LD structured data for better search engine understanding
function generateJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Anime Streaming Site',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    'sameAs': [
      'https://twitter.com/youranimesite',
      'https://facebook.com/youranimesite',
      'https://instagram.com/youranimesite'
    ]
  };
}

// Featured content component with improved SEO structure
function FeaturedContent() {
  return (
    <section aria-labelledby="featured-heading" className="w-full mb-10">
      <h2 id="featured-heading" className="text-2xl font-bold mb-6">Featured Anime</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Placeholder content - Replace with actual data */}
        {[1, 2, 3, 4].map((item) => (
          <article key={item} className="rounded-lg overflow-hidden bg-gray-800 hover:shadow-lg transition-shadow">
            <Link href={`/anime/featured-anime-${item}`} className="block">
              <div className="relative h-48 w-full">
                <Image 
                  src={`/api/placeholder/300/200`} 
                  alt={`Featured anime ${item}`} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  priority={item <= 2} // Load first two images with priority
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">Featured Anime Title {item}</h3>
                <div className="flex items-center text-sm text-gray-400 mt-2">
                  <span>2023</span>
                  <span className="mx-2">•</span>
                  <span>TV Series</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

// Recent updates component
function RecentUpdates() {
  return (
    <section aria-labelledby="recent-heading" className="w-full">
      <h2 id="recent-heading" className="text-2xl font-bold mb-6">Recently Updated</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Placeholder content - Replace with actual data */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <article key={item} className="rounded-lg overflow-hidden bg-gray-800 hover:shadow-lg transition-shadow">
            <Link href={`/anime/recent-anime-${item}`} className="block">
              <div className="relative h-36 w-full">
                <Image 
                  src={`/api/placeholder/240/160`} 
                  alt={`Recent anime ${item}`} 
                  fill 
                  className="object-cover" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium">Recent Anime Title {item}</h3>
                <p className="text-xs text-gray-400 mt-1">Episode {Math.floor(Math.random() * 10) + 1}</p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

// Loading component for Suspense fallback
function Loading() {
  return (
    <div className="w-full flex items-center justify-center py-20">
      <div className="animate-pulse text-center">
        <div className="h-8 w-48 bg-gray-700 rounded mb-6 mx-auto"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-lg overflow-hidden bg-gray-800">
              <div className="h-48 w-full bg-gray-700"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-20 gap-8 sm:p-8 lg:p-12 font-[family-name:var(--font-geist-sans)]">
        {/* Hero Banner */}
        <header className="w-full max-w-7xl">
          <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden mb-10">
            <Image 
              src="/api/placeholder/1200/400" 
              alt="Welcome to Anime Streaming Site" 
              fill 
              priority
              className="object-cover" 
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                Watch the Latest Anime Episodes
              </h1>
            </div>
          </div>
        </header>
      
        <main className="flex flex-col gap-12 w-full max-w-7xl">
          <Suspense fallback={<Loading />}>
            <FeaturedContent />
            <RecentUpdates />
          </Suspense>
          
          {/* Popular Categories Section */}
          <section aria-labelledby="categories-heading" className="w-full">
            <h2 id="categories-heading" className="text-2xl font-bold mb-6">Popular Categories</h2>
            <div className="flex flex-wrap gap-3">
              {['Action', 'Romance', 'Comedy', 'Fantasy', 'Adventure', 'Sci-Fi', 'Isekai', 'Drama'].map((genre) => (
                <Link 
                  key={genre} 
                  href={`/genre/${genre.toLowerCase()}`}
                  className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </section>
          
          {/* CTA Section */}
          <section aria-labelledby="cta-heading" className="w-full bg-gray-800 rounded-lg p-8 text-center">
            <h2 id="cta-heading" className="text-2xl font-bold mb-4">Start Watching Now</h2>
            <p className="mb-6 max-w-2xl mx-auto">Access thousands of anime episodes with HD quality and fast streaming. Create an account to track your watch history and get personalized recommendations.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Sign Up - It's Free
              </Link>
              <Link 
                href="/browse" 
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Browse Anime
              </Link>
            </div>
          </section>
        </main>
        
        {/* Page Footer */}
        <footer className="w-full max-w-7xl text-center text-sm text-gray-400 pt-12">
          <p>© {new Date().getFullYear()} Anime Streaming Site. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-3">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </>
  );
}