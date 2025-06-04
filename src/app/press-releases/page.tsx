'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressRelease } from '@/types';
import { getPressReleases } from '@/lib/firestore';
import { Calendar, Clock, Download, ExternalLink, FileText, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PressReleasesPage() {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPressReleases() {
      try {
        // Fetch only published press releases for public view
        const releases = await getPressReleases(true);
        setPressReleases(releases);
      } catch (err) {
        setError('Failed to load press releases');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPressReleases();
  }, []);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#222222] mb-4">Something went wrong</h2>
          <p className="text-[#3E5E17] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#DD8D00] text-white rounded-lg hover:bg-[#DD8D00]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4F1]">
      <Header />
      
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Eyebrow Text */}
          <div className="text-sm font-medium text-[#74A78E] uppercase tracking-wider mb-4">
            Latest News
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#222222] mb-6 leading-tight">
            Press{' '}
            <span className="relative">
              Releases
              <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#74A78E]/30 -z-10 rounded-full"></div>
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#3E5E17] max-w-4xl mx-auto leading-relaxed">
            Stay updated with the latest news, announcements, and insights from Brilliant Perspectives.
          </p>
        </div>

        {/* Press Releases Grid */}
        {pressReleases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-[#E3DDC9] rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#74A78E]" />
            </div>
            <h3 className="text-2xl font-bold text-[#222222] mb-4">No Press Releases Yet</h3>
            <p className="text-[#3E5E17] mb-8 max-w-md mx-auto">
              Press releases will appear here once they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pressReleases.map((release) => (
              <article
                key={release.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Featured Image */}
                {release.featuredImageUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={release.featuredImageUrl}
                      alt={release.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-4">
                    {release.category && (
                      <span className="inline-flex items-center px-3 py-1 bg-[#74A78E]/10 text-[#74A78E] text-sm font-medium rounded-full">
                        <Tag className="w-3 h-3 mr-1" />
                        {release.category}
                      </span>
                    )}
                    <div className="flex items-center text-sm text-[#3E5E17]">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(release.publishDate)}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-[#222222] mb-3 group-hover:text-[#DD8D00] transition-colors">
                    <Link href={`/press-releases/${release.id}`}>
                      {release.title}
                    </Link>
                  </h2>

                  {/* Subtitle */}
                  {release.subtitle && (
                    <h3 className="text-lg font-medium text-[#3E5E17] mb-4">
                      {release.subtitle}
                    </h3>
                  )}

                  {/* Excerpt */}
                  <p className="text-[#3E5E17] mb-6 line-clamp-3">
                    {release.excerpt}
                  </p>

                  {/* Tags */}
                  {release.tags && release.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {release.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#E3DDC9] text-[#3E5E17] text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E3DDC9]">
                    {release.author && (
                      <span className="text-sm text-[#3E5E17]">
                        By {release.author}
                      </span>
                    )}
                    <Link
                      href={`/press-releases/${release.id}`}
                      className="inline-flex items-center text-[#DD8D00] hover:text-[#DD8D00]/80 font-medium transition-colors"
                    >
                      Read More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#222222] mb-4">
              Media Inquiries
            </h3>
            <p className="text-[#3E5E17] mb-6">
              For press inquiries, or additional information, please contact our media team.
            </p>
            <a
              href="mailto:press@brilliantperspectives.com?subject=MEDIA INQUIRY"
              className="inline-flex items-center px-6 py-3 bg-[#DD8D00] hover:bg-[#DD8D00]/90 text-white rounded-lg transition-colors font-medium"
            >
              Contact Media Team
              <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
} 