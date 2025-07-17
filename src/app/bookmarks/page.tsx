'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAccessToken, getAuthHeader, isAuthenticated } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

interface Bookmark {
  id: number;
  url: string;
  content_id: number;
  created_at: number;
  anime_title: string;
  anime_banner: string;
  anime_status: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingBookmarkId, setRemovingBookmarkId] = useState<number | null>(null);

  // Convert timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get anime slug from title and ID (matching your existing pattern)
  const getAnimeSlug = (title: string, id: number) => {
    return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${id}`;
  };

  const fetchBookmarks = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const authHeaders = getAuthHeader();

      const response = await fetch(`${apiUrl}/user/bookmarks`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch bookmarks: ${response.status}`);
      }

      const data: Bookmark[] = await response.json();
      setBookmarks(data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    // Find the bookmark to get content_id
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (!bookmark) {
      alert('Bookmark not found');
      return;
    }

    // Validate content ID
    if (!bookmark.content_id || bookmark.content_id <= 0) {
      alert('Invalid content ID');
      return;
    }

    // Check if user is still authenticated
    if (!isAuthenticated()) {
      alert('Please login again to remove bookmarks');
      window.location.href = '/login';
      return;
    }

    // Confirm deletion
    if (!confirm('Apakah Anda yakin ingin menghapus bookmark ini?')) {
      return;
    }

    setRemovingBookmarkId(bookmarkId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const authHeaders = getAuthHeader();

      console.log('Removing bookmark with content_id:', bookmark.content_id, 'bookmark_id:', bookmarkId, 'with headers:', authHeaders);
      console.log('API URL:', `${apiUrl}/user/bookmarks/${bookmark.content_id}`);

      const response = await fetch(`${apiUrl}/user/bookmarks/${bookmark.content_id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          ...authHeaders,
        },
      });

      console.log('Remove bookmark response:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to remove bookmark';
        
        if (response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          // Redirect to login
          window.location.href = '/login';
          return;
        } else if (response.status === 404) {
          errorMessage = 'Bookmark not found.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to remove this bookmark.';
        }

        // Try to get error message from response
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`;
        }

        throw new Error(errorMessage);
      }

      // Parse response to check for success message
      try {
        const result = await response.json();
        console.log('Remove bookmark result:', result);
      } catch (e) {
        // Response might be empty, which is fine for DELETE requests
      }

      // Remove from local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
      alert('Bookmark berhasil dihapus!');
    } catch (err) {
      console.error('Error removing bookmark:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove bookmark';
      alert(errorMessage);
    } finally {
      setRemovingBookmarkId(null);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    fetchBookmarks();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-12 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A8E1] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your bookmarks...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 py-12 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={fetchBookmarks} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Bookmarks</h1>
            <p className="text-gray-400">
              {bookmarks.length} saved anime{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Back to Home
          </Button>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No Bookmarks Yet</h3>
              <p className="text-gray-400 mb-6">Start bookmarking your favorite anime to see them here!</p>
              <Button onClick={() => window.location.href = '/anime/lists'}>
                Browse Anime
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Anime Banner */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={bookmark.anime_banner}
                    alt={bookmark.anime_title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bookmark.anime_status === 'Ongoing' 
                        ? 'bg-green-500/80 text-white' 
                        : bookmark.anime_status === 'Completed'
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-gray-500/80 text-white'
                    }`}>
                      {bookmark.anime_status}
                    </span>
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeBookmark(bookmark.id);
                    }}
                    disabled={removingBookmarkId === bookmark.id}
                    className={`absolute top-3 right-3 w-8 h-8 ${
                      removingBookmarkId === bookmark.id 
                        ? 'bg-gray-500/80 cursor-not-allowed' 
                        : 'bg-red-500/80 hover:bg-red-500'
                    } rounded-full flex items-center justify-center transition-colors ${
                      removingBookmarkId === bookmark.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={removingBookmarkId === bookmark.id ? "Removing..." : "Remove bookmark"}
                  >
                    {removingBookmarkId === bookmark.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Anime Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#00A8E1] transition-colors">
                    {bookmark.anime_title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Bookmarked on {formatDate(bookmark.created_at)}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/anime/${getAnimeSlug(bookmark.anime_title, bookmark.content_id)}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full bg-[#00A8E1] hover:bg-[#0084B3]">
                        Watch Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 