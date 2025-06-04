'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PressRelease } from '@/types';
import { getPressRelease } from '@/lib/firestore';
import { Calendar, ArrowLeft, Download, Share2, Tag, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PressReleaseDetailPage() {
  const params = useParams();
  const [pressRelease, setPressRelease] = useState<PressRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPressRelease(params.id as string);
    }
  }, [params.id]);

  async function fetchPressRelease(id: string) {
    try {
      setLoading(true);
      const release = await getPressRelease(id);
      
      if (release && release.isPublished) {
        setPressRelease(release);
      } else {
        setError('Press release not found or not published');
      }
    } catch (err) {
      setError('Failed to load press release');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  function handleShare() {
    if (navigator.share && pressRelease) {
      navigator.share({
        title: pressRelease.title,
        text: pressRelease.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !pressRelease) {
    return (
      <div className="min-h-screen bg-[#F8F4F1]">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-[#222222] mb-4">Press Release Not Found</h1>
            <p className="text-[#3E5E17] mb-8">The press release you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/press-releases"
              className="inline-flex items-center px-4 py-2 bg-[#DD8D00] text-white rounded-lg hover:bg-[#DD8D00]/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Press Releases
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4F1]">
      <Header />
      
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/press-releases"
            className="inline-flex items-center text-[#3E5E17] hover:text-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Press Releases
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {pressRelease.featuredImageUrl && (
            <div className="aspect-video relative">
              <Image
                src={pressRelease.featuredImageUrl}
                alt={pressRelease.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 lg:p-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {pressRelease.category && (
                <span className="inline-flex items-center px-3 py-1 bg-[#74A78E]/10 text-[#74A78E] text-sm font-medium rounded-full">
                  <Tag className="w-3 h-3 mr-1" />
                  {pressRelease.category}
                </span>
              )}
              <div className="flex items-center text-sm text-[#3E5E17]">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(pressRelease.publishDate)}
              </div>
              {pressRelease.author && (
                <span className="text-sm text-[#3E5E17]">
                  By {pressRelease.author}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-[#222222] mb-4 leading-tight">
              {pressRelease.title}
            </h1>

            {/* Subtitle */}
            {pressRelease.subtitle && (
              <h2 className="text-xl lg:text-2xl font-medium text-[#3E5E17] mb-8">
                {pressRelease.subtitle}
              </h2>
            )}

            {/* Share Button */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#E3DDC9]">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-4 py-2 bg-[#F8F4F1] hover:bg-[#E3DDC9] text-[#3E5E17] rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-[#3E5E17] leading-relaxed"
                style={{ whiteSpace: 'pre-line' }}
              >
                <div 
                  className="text-[#3E5E17] leading-relaxed"
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {pressRelease.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-bold text-[#222222] mt-8 mb-4">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl font-semibold text-[#222222] mt-6 mb-3">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- **')) {
                      return (
                        <li key={index} className="mb-2">
                          <strong>{paragraph.match(/\*\*(.*?)\*\*/)?.[1]}:</strong>
                          {paragraph.replace(/- \*\*(.*?)\*\*:/, '')}
                        </li>
                      );
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tags */}
            {pressRelease.tags && pressRelease.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-[#E3DDC9]">
                <h3 className="text-sm font-medium text-[#3E5E17] mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {pressRelease.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#E3DDC9] text-[#3E5E17] text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-[#222222] mb-4">
            Media Contact
          </h3>
          <p className="text-[#3E5E17] mb-6">
            For additional information about this press release, or to schedule interviews, please contact our media team.
          </p>
          <a
            href="mailto:press@brilliantperspectives.com?subject=MEDIA INQUIRY - Press Release"
            className="inline-flex items-center px-6 py-3 bg-[#DD8D00] hover:bg-[#DD8D00]/90 text-white rounded-lg transition-colors font-medium"
          >
            Contact Media Team
            <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        </div>
      </main>
    </div>
  );
} 