'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { TeamMember } from '@/types';
import { teamMembersApi } from '@/lib/api';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  ArrowLeft, 
  ExternalLink, 
  Book, 
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
  Facebook,
  Youtube
} from 'lucide-react';

// Social platform icon mapping
const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  facebook: Facebook,
  youtube: Youtube,
  email: Mail,
  website: Globe,
  default: ExternalLink,
};

export default function TeamMemberPage() {
  const params = useParams();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTeamMember(params.id as string);
    }
  }, [params.id]);

  async function fetchTeamMember(id: string) {
    try {
      setLoading(true);
      const memberData = await teamMembersApi.getById(id);
      setMember(memberData);
    } catch (err) {
      setError('Team member not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getSocialIcon(platform: string) {
    const platformLower = platform.toLowerCase();
    const IconComponent = socialIcons[platformLower] || socialIcons.default;
    return IconComponent;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4F1] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-[#F8F4F1]">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-[#222222] mb-4">Team Member Not Found</h1>
            <p className="text-[#3E5E17] mb-8">The team member you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-[#DD8D00] text-white rounded-lg hover:bg-[#DD8D00]/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Team
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4F1]">
      <Header />
      
      <main className="min-h-screen">
        {/* Back Button - Positioned over the layout */}
        <div className="absolute top-20 left-4 z-10 sm:left-6 lg:left-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-[#3E5E17] hover:text-[#222222] transition-colors rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
        </div>

        {/* Full Width Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left Side - Large Image */}
          <div className="relative bg-[#E3DDC9] min-h-[50vh] lg:min-h-screen">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#E3DDC9] to-[#74A78E] flex items-center justify-center">
                <div className="w-32 h-32 bg-[#74A78E] rounded-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-[#222222]">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Content */}
          <div className="bg-white p-8 lg:p-16 flex flex-col justify-center min-h-[50vh] lg:min-h-screen">
            {/* Eyebrow Text */}
            <div className="text-sm font-medium text-[#74A78E] uppercase tracking-wider mb-4">
              About {member.name.split(' ')[0]}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-[#222222] mb-8 leading-tight">
              {member.name}
            </h1>

            {/* Bio Content */}
            <div className="prose prose-lg text-[#3E5E17] mb-12">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {member.bio}
              </p>
            </div>

            {/* Social Links and Email - Combined Connect Section */}
            {(member.socialLinks && member.socialLinks.length > 0) || member.connectEmail ? (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#222222] mb-6">Connect</h3>
                <div className="flex flex-wrap gap-4">
                  {/* Social Links */}
                  {member.socialLinks && member.socialLinks.map((social, index) => {
                    const IconComponent = getSocialIcon(social.platform);
                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-[#F8F4F1] hover:bg-[#E3DDC9] rounded-lg transition-colors group"
                      >
                        <IconComponent className="w-5 h-5 text-[#3E5E17] group-hover:text-[#222222] mr-3" />
                        <span className="text-base font-medium text-[#3E5E17] group-hover:text-[#222222] capitalize">
                          {social.platform}
                        </span>
                      </a>
                    );
                  })}
                  
                  {/* Email Button */}
                  {member.connectEmail && (
                    <a
                      href={`mailto:${member.connectEmail}`}
                      className="inline-flex items-center px-6 py-3 bg-[#DD8D00] hover:bg-[#DD8D00]/90 text-white rounded-lg transition-colors group"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      <span className="text-base font-medium">
                        Send Email
                      </span>
                    </a>
                  )}
                </div>
              </div>
            ) : null}

            {/* Books Section - Enhanced with Covers */}
            {member.bookLinks && member.bookLinks.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-semibold text-[#222222] mb-6 flex items-center">
                  <Book className="w-6 h-6 mr-3" />
                  Published Works
                </h3>
                <div className="space-y-6">
                  {member.bookLinks.map((book, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-[#F8F4F1] rounded-lg hover:bg-[#E3DDC9] transition-colors">
                      {/* Book Cover */}
                      {book.coverImageUrl && (
                        <div className="flex-shrink-0">
                          <Image
                            src={book.coverImageUrl}
                            alt={`${book.title} cover`}
                            width={80}
                            height={120}
                            className="rounded shadow-md object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Book Details */}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#222222] mb-2">
                          {book.title}
                        </h4>
                        {book.description && (
                          <p className="text-base text-[#3E5E17] mb-3">
                            {book.description}
                          </p>
                        )}
                        <a
                          href={book.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#DD8D00] hover:text-[#DD8D00]/80 text-base font-medium"
                        >
                          View Book
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="pt-8 border-t border-[#E3DDC9]">
              <Link
                href="/"
                className="inline-flex items-center text-[#3E5E17] hover:text-[#222222] font-medium text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                View All Team Members
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 